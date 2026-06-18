import base64
import io
import json
import re
import uuid
import warnings
import os
from dotenv import load_dotenv

load_dotenv()

import torch
import torch.nn.functional as F

from torchvision.models import (
    MobileNet_V3_Small_Weights,
    mobilenet_v3_small,
)
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

import cv2
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from services.ai_service import validate_cardamom_pod_ai, validate_cardamom_leaf_ai
from PIL import Image
from pydantic import BaseModel, Field

# Auth / DB
from database import create_tables, seed_data
from auth import deduct_credits
from routers.auth_router import router as auth_router
from routers.users_router import router as users_router
from routers.plans_router import router as plans_router
from routers.payments_router import router as payments_router
from routers.harvesting_router import router as harvesting_router
from routers.contact_router import router as contact_router

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent

# ---------------------------------------------------------------------
# Folder paths
# ---------------------------------------------------------------------
POD_MODEL_PATH = BASE_DIR / "models" / "pod_disease" / "cardamom_pod_disease_effnetb0_float32.tflite"
POD_CLASSES_PATH = BASE_DIR / "models" / "pod_disease" / "class_names.json"

LEAF_MODEL_PATH = BASE_DIR / "models" / "leaf_disease" / "cardamom_leaf_model.tflite"
LEAF_CLASSES_PATH = BASE_DIR / "models" / "leaf_disease" / "class_names.json"
LEAF_UPLOAD_DIR = BASE_DIR / "uploads" / "leaf"

LEAF_GATE_MODEL_PATH = (
    BASE_DIR / "models" / "leaf_gate" / "cardamom_leaf_gate_effnetb0_float32.tflite"
)
LEAF_GATE_CLASSES_PATH = BASE_DIR / "models" / "leaf_gate" / "class_names.json"
LEAF_GATE_RESULTS_PATH = BASE_DIR / "models" / "leaf_gate" / "training_results.json"

GRADE_MODEL_PATH = BASE_DIR / "models" / "grading" / "best_cardamom_grade_fixed.keras"
GRADE_CLASSES_PATH = BASE_DIR / "models" / "grading" / "class_names.json"
GRADE_CROP_PAD_RATIO = 0.25  # must match training (see models/grading/training_results.json)

MARKET_MODEL_PATH = BASE_DIR / "models" / "market" / "cardamom_dried_price_prediction_model.joblib"
MARKET_METADATA_PATH = BASE_DIR / "models" / "market" / "training_metadata.json"
MARKET_DATA_PATH = BASE_DIR / "data" / "market" / "cardamom_raw_market_dataset.csv"

LEAF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = (224, 224)
POD_CONFIDENCE_THRESHOLD = 0.60
GRADE_CONFIDENCE_THRESHOLD = 0.70
# Reject as non-cardamom when PlantVillage gate max-prob >= this.
LEAF_GATE_REJECT_THRESHOLD = 0.43

IMAGE_GATE_TOP_K = 10

# A matching ImageNet prediction must contribute at least this much.
PLANT_GATE_MIN_SCORE = 0.08

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

STATE: Dict[str, Dict[str, Any]] = {
    "image_gate": {"lock": Lock()},
    "pod": {"lock": Lock()},
    "leaf": {"lock": Lock()},
    "leaf_gate": {"lock": Lock()},
    "grade": {"lock": Lock()},
    "market": {},
}


LEAF_RELATED_KEYWORDS = {
    # Direct plant-related terms
    "leaf",
    "plant",
    "tree",
    "flower",
    "garden",
    "greenhouse",

    # ImageNet plant, crop and vegetation classes
    "banana",
    "fig",
    "orange",
    "lemon",
    "pineapple",
    "pomegranate",
    "acorn",
    "corn",
    "ear",
    "buckeye",
    "hip",
    "cardoon",
    "daisy",
    "rapeseed",

    # Green plant-like classes sometimes predicted for leaves
    "cabbage",
    "broccoli",
    "cauliflower",
    "zucchini",
    "cucumber",
    "mushroom",
    "hay",
}

POD_RELATED_KEYWORDS = {
    # Pod / fruit / seed / spice-like classes only.
    # Avoid ambiguous ImageNet labels like "ear" and "corn" — those
    # often fire on leaf midribs and wrongly pass leaf photos as pods.
    "pod",
    "seed",
    "fruit",
    "vegetable",
    "spice",
    "acorn",
    "buckeye",
    "hip",
    "cardoon",
    "banana",
    "fig",
    "orange",
    "lemon",
    "pineapple",
    "pomegranate",
    "cucumber",
    "zucchini",
    "bell pepper",
    "chili",
    "mushroom",
}

NON_PLANT_STRONG_KEYWORDS = {
    # Furniture and household objects
    "chair",
    "table",
    "desk",
    "sofa",
    "couch",
    "bed",
    "wardrobe",
    "bench",
    "stool",
    "cabinet",
    "bookcase",

    # Vehicles
    "car",
    "bus",
    "truck",
    "bicycle",
    "motorcycle",
    "airplane",
    "train",
    "boat",
    "ship",
    "scooter",

    # Electronics
    "keyboard",
    "mouse",
    "laptop",
    "monitor",
    "screen",
    "phone",
    "cellular telephone",
    "computer",
    "television",
    "remote control",

    # People and clothing
    "person",
    "man",
    "woman",
    "boy",
    "girl",
    "suit",
    "shirt",
    "jersey",
    "shoe",
    "sandal",

    # Animals
    "dog",
    "cat",
    "bird",
    "horse",
    "cow",
    "sheep",
    "monkey",
    "snake",
    "spider",
    "insect",

    # Buildings and miscellaneous objects
    "building",
    "house",
    "church",
    "castle",
    "street",
    "bridge",
    "bottle",
    "cup",
    "plate",
    "clock",
}


# ---------------------------------------------------------------------
# Common helpers
# ---------------------------------------------------------------------
def ensure_file(path: Path, label: str) -> None:
    if not path.exists():
        raise FileNotFoundError(f"{label} not found: {path}")


def load_json(path: Path) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_tflite_model(model_path: Path) -> Dict[str, Any]:
    interpreter = tf.lite.Interpreter(model_path=str(model_path))
    interpreter.allocate_tensors()
    return {
        "interpreter": interpreter,
        "input_details": interpreter.get_input_details(),
        "output_details": interpreter.get_output_details(),
    }



# ---------------------------------------------------------------------
# Startup model loading
# ---------------------------------------------------------------------
def load_all_models() -> None:
    # -------------------------------------------------------------
    # Pretrained ImageNet gate
    # -------------------------------------------------------------
    image_gate_weights = MobileNet_V3_Small_Weights.DEFAULT

    image_gate_model = mobilenet_v3_small(
        weights=image_gate_weights
    )

    image_gate_model.to(DEVICE)
    image_gate_model.eval()

    STATE["image_gate"].update({
        "model": image_gate_model,
        "transform": image_gate_weights.transforms(),
        "categories": image_gate_weights.meta["categories"],
        "device": DEVICE,
    })

    print(
        f"Pretrained image gate loaded on {DEVICE}."
    )

    
    # Pod disease
    ensure_file(POD_MODEL_PATH, "Pod disease TFLite model")
    ensure_file(POD_CLASSES_PATH, "Pod disease class names")
    pod_model = load_tflite_model(POD_MODEL_PATH)
    STATE["pod"].update(pod_model)
    STATE["pod"]["class_names"] = load_json(POD_CLASSES_PATH)

    # Leaf disease
    ensure_file(LEAF_MODEL_PATH, "Leaf disease TFLite model")
    ensure_file(LEAF_CLASSES_PATH, "Leaf disease class names")
    leaf_model = load_tflite_model(LEAF_MODEL_PATH)
    STATE["leaf"].update(leaf_model)
    STATE["leaf"]["class_names"] = load_json(LEAF_CLASSES_PATH)

    # PlantVillage other-leaf gate is intentionally not loaded / not used.

    # Grading
    ensure_file(GRADE_MODEL_PATH, "Grading Keras model")
    ensure_file(GRADE_CLASSES_PATH, "Grading class names")
    STATE["grade"]["model"] = tf.keras.models.load_model(GRADE_MODEL_PATH, compile=False)
    STATE["grade"]["class_names"] = load_json(GRADE_CLASSES_PATH)

    # Market / profit model
    ensure_file(MARKET_MODEL_PATH, "Market joblib model")
    ensure_file(MARKET_METADATA_PATH, "Market training metadata")
    ensure_file(MARKET_DATA_PATH, "Market CSV data")

    metadata = load_json(MARKET_METADATA_PATH)
    horizon_weeks = int(metadata.get("horizon_weeks", 4))
    target_col = metadata.get("target_col", f"target_dried_price_next_{horizon_weeks}w_lkr_per_kg")
    feature_cols = metadata.get("feature_cols", [])

    if not feature_cols:
        raise ValueError("feature_cols not found in training_metadata.json")

    STATE["market"].update({
        "model": joblib.load(MARKET_MODEL_PATH),
        "metadata": metadata,
        "feature_cols": feature_cols,
        "horizon_weeks": horizon_weeks,
        "target_col": target_col,
    })
    STATE["market"]["market_features"] = load_market_data()

    print("All cardamom AI models loaded successfully.")
    print("Pod disease classes:", STATE["pod"]["class_names"])
    print("Leaf disease classes:", STATE["leaf"]["class_names"])
    print("Grading classes:", STATE["grade"]["class_names"])
    print("Market rows:", len(STATE["market"]["market_features"]))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite DB + seed data
    create_tables()
    seed_data()
    # Load AI models
    load_all_models()
    yield


app = FastAPI(
    title="Cardamom Unified AI API",
    description="One FastAPI server for pod disease, leaf disease, grading, and market/profit prediction.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _contains_keyword(
    label: str,
    keywords: set[str],
) -> bool:
    """Match keywords as whole words/phrases, not raw substrings.

    Avoids false hits like keyword 'hip' matching label 'airship',
    or 'pod' matching 'isopod'.
    """
    normalized_label = label.lower().replace("_", " ")

    for keyword in keywords:
        pattern = r"(?:^|[^a-z0-9])" + re.escape(keyword.lower()) + r"(?:[^a-z0-9]|$)"
        if re.search(pattern, normalized_label):
            return True
    return False


def validate_cardamom_image(
    image_bytes: bytes,
    expected_type: str,
) -> Dict[str, Any]:
    """
    Uses pretrained ImageNet MobileNetV3 as an input gate.

    expected_type:
        "leaf" or "pod"
    """

    if expected_type not in {"leaf", "pod"}:
        raise ValueError(
            "expected_type must be either 'leaf' or 'pod'."
        )

    try:
        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}",
        )

    gate = STATE["image_gate"]

    model = gate["model"]
    transform = gate["transform"]
    categories = gate["categories"]
    device = gate["device"]

    input_tensor = transform(image).unsqueeze(0).to(device)

    with gate["lock"]:
        with torch.inference_mode():
            outputs = model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)

    top_k = min(
        IMAGE_GATE_TOP_K,
        probabilities.shape[1],
    )

    top_probs, top_indices = torch.topk(
        probabilities,
        top_k,
        dim=1,
    )

    top_predictions: List[Dict[str, Any]] = []

    expected_score = 0.0
    other_plant_score = 0.0
    non_plant_score = 0.0

    expected_keywords = (
        LEAF_RELATED_KEYWORDS
        if expected_type == "leaf"
        else POD_RELATED_KEYWORDS
    )

    other_keywords = (
        POD_RELATED_KEYWORDS
        if expected_type == "leaf"
        else LEAF_RELATED_KEYWORDS
    )

    for probability, index in zip(
        top_probs[0],
        top_indices[0],
    ):
        label = categories[index.item()]
        confidence = float(probability.item())

        top_predictions.append({
            "label": label,
            "confidence": round(
                confidence * 100,
                2,
            ),
        })

        if _contains_keyword(
            label,
            expected_keywords,
        ):
            expected_score += confidence

        if _contains_keyword(
            label,
            other_keywords,
        ):
            other_plant_score += confidence

        if _contains_keyword(
            label,
            NON_PLANT_STRONG_KEYWORDS,
        ):
            non_plant_score += confidence

    expected_score = min(expected_score, 1.0)
    other_plant_score = min(other_plant_score, 1.0)
    non_plant_score = min(non_plant_score, 1.0)

    score_block = {
        "expected_type_score": round(expected_score * 100, 2),
        "other_plant_score": round(other_plant_score * 100, 2),
        "non_plant_score": round(non_plant_score * 100, 2),
    }

    # -------------------------------------------------------------
    # Decision rules
    # -------------------------------------------------------------

    # Clear unrelated object such as chair, laptop, car or animal.
    if (
        non_plant_score >= PLANT_GATE_MIN_SCORE
        and non_plant_score > expected_score
    ):
        return {
            "valid": False,
            "predicted_type": "other",
            "confidence": round(non_plant_score * 100, 2),
            "probabilities": score_block,
            "message": (
                f"This image does not appear to contain a "
                f"cardamom {expected_type}. Please upload a "
                f"clear cardamom {expected_type} image."
            ),
            "top_predictions": top_predictions,
        }

    # Pod disease: only block obvious non-plant junk (dog/chair/car…).
    # Do not require ImageNet "pod-like" labels — real pod photos from
    # the internet often fail that check and never reach the disease model.
    if expected_type == "pod":
        return {
            "valid": True,
            "predicted_type": "pod",
            "confidence": round(
                max(expected_score, 1.0 - non_plant_score) * 100,
                2,
            ),
            "probabilities": score_block,
            "message": (
                "Image passed the non-plant filter; running pod disease prediction."
            ),
            "top_predictions": top_predictions,
        }

    # Leaf: keep stricter plant-type matching.
    if (
        expected_score >= PLANT_GATE_MIN_SCORE
        and expected_score > other_plant_score
    ):
        return {
            "valid": True,
            "predicted_type": expected_type,
            "confidence": round(expected_score * 100, 2),
            "probabilities": score_block,
            "message": (
                "Plant-like content matching a possible "
                f"{expected_type} was detected."
            ),
            "top_predictions": top_predictions,
        }

    if other_plant_score >= PLANT_GATE_MIN_SCORE:
        return {
            "valid": False,
            "predicted_type": "pod",
            "confidence": round(other_plant_score * 100, 2),
            "probabilities": score_block,
            "message": (
                "The image appears plant-related, but it was "
                "not confidently identified as a cardamom "
                f"{expected_type}. Please upload a clearer "
                f"{expected_type} image."
            ),
            "top_predictions": top_predictions,
        }

    return {
        "valid": False,
        "predicted_type": "unknown",
        "confidence": round(
            max(expected_score, other_plant_score, non_plant_score) * 100,
            2,
        ),
        "probabilities": score_block,
        "message": (
            f"The image could not be confidently identified "
            f"as a cardamom {expected_type}. Prediction was skipped."
        ),
        "top_predictions": top_predictions,
    }

# ---------------------------------------------------------------------
# Pod disease module
# ---------------------------------------------------------------------
pod_router = APIRouter(prefix="/api/pod-disease", tags=["Pod Disease"])


def pod_get_recommendation(predicted_class: str) -> dict:
    if predicted_class == "no_known_disease_detected":
        return {
            "issue": "No known pod disease detected",
            "risk_level": "Low",
            "farmer_action": (
                "No clear Capsule Borer or Cardamom Thrips symptoms were detected. "
                "Continue normal monitoring and capture another image if symptoms appear."
            ),
            "organic_solutions": [
                "Inspect panicles weekly during flowering and capsule formation for early bore holes or scarring.",
                "Spray diluted neem oil (3–5 ml per litre of water) every 15–20 days as a preventive measure.",
                "Install yellow sticky traps and light traps around the plantation to monitor pest activity.",
                "Apply neem cake (2–3 kg per plant per year) around the plant base to support plant health.",
                "Remove fallen pods, weeds, and crop debris that can harbour pests between seasons.",
            ],
            "note": "This does not guarantee the pod is fully healthy. The current model only checks Capsule Borer and Cardamom Thrips.",
        }

    if predicted_class == "capsule_borer":
        return {
            "issue": "Capsule Borer detected",
            "risk_level": "High",
            "farmer_action": (
                "Remove and safely discard heavily affected pods immediately. Monitor nearby pods for "
                "similar holes or internal damage, and avoid leaving infested capsules in the field."
            ),
            "organic_solutions": [
                "Collect and destroy all bored or damaged capsules by burning or deep burial to break the pest cycle.",
                "Spray neem oil (5 ml per litre of water) with a few drops of mild soap on panicles every 7–10 days.",
                "Apply garlic–chilli extract spray (50 g garlic + 25 g chilli in 1 litre water, strain, dilute 1:10 before spraying).",
                "Use pheromone traps or light traps to catch adult moths during peak flight periods.",
                "Release Trichogramma parasitoids (if available locally) during flowering to target eggs.",
                "Apply Beauveria bassiana biopesticide spray (as per label dose) on panicles in the early morning.",
                "Maintain clean cultivation by removing alternate host plants and old crop residues near the plantation.",
            ],
            "note": "Capsule borer damage spreads quickly during the capsule development stage. Repeat sprays after rain and seek DOA guidance for severe outbreaks.",
        }

    if predicted_class == "cardamom_thrips":
        return {
            "issue": "Cardamom Thrips damage detected",
            "risk_level": "Medium",
            "farmer_action": (
                "Inspect nearby pods and leaves for spreading silvery scars, brown patches, or deformed capsules. "
                "Separate badly affected pods and increase monitoring across the plantation."
            ),
            "organic_solutions": [
                "Spray neem oil (5 ml per litre of water) on panicles and young leaves every 7–10 days.",
                "Use garlic–chilli extract spray (diluted 1:10) every 7 days, targeting the underside of leaves and panicles.",
                "Install blue or yellow sticky traps between plant rows to monitor and reduce adult thrips.",
                "Apply cow urine solution (diluted 1:10 with water) as a foliar spray once a week in the early morning.",
                "Lightly irrigate during dry periods to reduce thrips pressure, avoiding waterlogging at the root zone.",
                "Apply Panchagavya or Jeevamrutha (3–5% solution) to improve plant vigour and recovery.",
                "Remove weeds and alternate host plants around the plantation that can harbour thrips.",
            ],
            "note": "Thrips multiply rapidly in hot, dry conditions. Combine spraying with traps and sanitation for best organic control.",
        }

    return {
        "issue": "Unknown",
        "risk_level": "Unknown",
        "farmer_action": "No recommendation available.",
        "organic_solutions": [],
        "note": "The current model supports only Capsule Borer and Cardamom Thrips.",
    }


def pod_preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(IMG_SIZE, Image.Resampling.NEAREST)
        image_array = np.asarray(image, dtype=np.float32)
        return np.expand_dims(image_array, axis=0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")


def pod_predict_tflite(image_batch: np.ndarray) -> np.ndarray:
    pod = STATE["pod"]
    interpreter = pod["interpreter"]
    input_details = pod["input_details"]
    output_details = pod["output_details"]

    input_index = input_details[0]["index"]
    output_index = output_details[0]["index"]
    input_dtype = input_details[0]["dtype"]

    input_data = image_batch.astype(np.float32 if input_dtype == np.float32 else input_dtype)

    with pod["lock"]:
        interpreter.set_tensor(input_index, input_data)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_index)[0]

    return predictions


@pod_router.get("/health")
def pod_health():
    return {
        "status": "ok",
        "model_loaded": STATE["pod"].get("interpreter") is not None,
        "classes": STATE["pod"].get("class_names", []),
    }


@pod_router.post("/predict")
async def pod_predict(file: UploadFile = File(...), _user: dict = Depends(deduct_credits)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file.",
        )

    image_bytes = await file.read()

    # OpenAI vision gate: is this a cardamom pod?
    validation = validate_cardamom_pod_ai(image_bytes)
    if not validation["valid"]:
        return {
            "success": True,
            "filename": file.filename,
            "disease_detected": False,
            "predicted_class": "not_a_cardamom_pod",
            "confidence_percent": validation["confidence"],
            "threshold_percent": 0,
            "all_probabilities_percent": validation["probabilities"],
            "message": validation["message"],
            "recommendation": {
                "issue": "Invalid pod image",
                "risk_level": "Unknown",
                "farmer_action": (
                    "Upload a clear image containing a cardamom pod. "
                    "Avoid images of other fruits, leaves, furniture, "
                    "people, animals, or unrelated objects."
                ),
                "organic_solutions": [],
                "note": (
                    "Disease prediction was not performed because the "
                    "image was not confirmed as a cardamom pod."
                ),
            },
        }

    image_batch = pod_preprocess_image(image_bytes)
    predictions = pod_predict_tflite(image_batch)
    class_names = STATE["pod"]["class_names"]

    predicted_index = int(np.argmax(predictions))
    top_class = class_names[predicted_index]
    top_confidence = float(predictions[predicted_index])

    probabilities = {
        class_names[i]: round(float(predictions[i]) * 100, 2)
        for i in range(len(class_names))
    }

    if top_confidence < POD_CONFIDENCE_THRESHOLD:
        final_class = "no_known_disease_detected"
        disease_detected = False
        final_confidence = round((1 - top_confidence) * 100, 2)

        message = (
            "No confident Capsule Borer or Cardamom Thrips disease "
            "pattern was detected. The image does not strongly match "
            "either trained disease class."
        )
    else:
        final_class = top_class
        disease_detected = True
        final_confidence = round(top_confidence * 100, 2)
        message = f"{top_class} detected with confident prediction."

    return {
        "success": True,
        "filename": file.filename,
        "disease_detected": disease_detected,
        "predicted_class": final_class,
        "confidence_percent": final_confidence,
        "threshold_percent": round(POD_CONFIDENCE_THRESHOLD * 100, 2),
        "all_probabilities_percent": probabilities,
        "message": message,
        "recommendation": pod_get_recommendation(final_class),
    }

# ---------------------------------------------------------------------
# Leaf disease module
# ---------------------------------------------------------------------
leaf_router = APIRouter(prefix="/api/leaf-disease", tags=["Leaf Disease"])


def leaf_get_recommendation(predicted_class: str) -> dict:
    if predicted_class == "healthy":
        return {
            "issue": "Healthy leaf",
            "risk_level": "Low",
            "farmer_action": (
                "No disease symptoms detected. Continue regular field monitoring and "
                "maintain preventive organic practices to keep plants healthy."
            ),
            "organic_solutions": [
                "Apply well-decomposed compost or vermicompost around the plant base every 2–3 months.",
                "Use neem cake (2–3 kg per plant per year) as a soil amendment to support plant immunity.",
                "Maintain proper shade, drainage, and spacing to reduce future fungal pressure.",
                "Spray diluted neem oil (3–5 ml per litre of water) once every 15–20 days as a preventive measure.",
            ],
            "note": "A healthy reading does not guarantee the entire plantation is disease-free. Re-check if new spots or yellowing appear.",
        }

    if predicted_class == "leaf_blight":
        return {
            "issue": "Leaf blight detected",
            "risk_level": "High",
            "farmer_action": (
                "Remove and destroy severely affected leaves immediately. Avoid working in the field "
                "when leaves are wet, and improve air circulation around infected plants."
            ),
            "organic_solutions": [
                "Spray neem oil (5 ml per litre of water) with a few drops of mild soap every 7–10 days.",
                "Apply Trichoderma viride (5–10 g per litre of water) as a foliar and soil drench every 10–14 days.",
                "Use garlic–chilli extract spray (crush 50 g garlic + 25 g chilli in 1 litre water, strain, dilute 1:10 before spraying).",
                "Spray 1% Bordeaux mixture or approved copper-based organic fungicide on affected leaves at 10-day intervals.",
                "Apply Panchagavya or Jeevamrutha (3–5% solution) to improve plant vigour and recovery.",
                "Mulch the base and avoid overhead irrigation to keep leaf surfaces dry.",
            ],
            "note": "Repeat organic sprays after rain. Severe or spreading infections should be confirmed with an agricultural officer.",
        }

    if predicted_class == "phyllosticta_leaf_spot":
        return {
            "issue": "Phyllosticta leaf spot detected",
            "risk_level": "Medium",
            "farmer_action": (
                "Collect and burn or bury infected leaves to stop spore spread. Sanitize tools after "
                "pruning and monitor neighbouring plants for new circular spots."
            ),
            "organic_solutions": [
                "Spray neem oil (5 ml per litre of water) every 7–10 days on both leaf surfaces.",
                "Apply baking soda spray (1 tsp baking soda + 1 litre water + 2–3 drops mild soap) every 7 days.",
                "Use Trichoderma viride foliar spray (5 g per litre) every 10–14 days.",
                "Spray 1% Bordeaux mixture on spotted leaves at 10-day intervals until new growth is clean.",
                "Apply cow urine solution (diluted 1:10 with water) as a foliar spray once a week in the early morning.",
                "Improve drainage and remove fallen leaf litter from the plantation floor.",
            ],
            "note": "Leaf spot spreads quickly in humid, crowded plantations. Combine spraying with sanitation for best results.",
        }

    return {
        "issue": "Unknown",
        "risk_level": "Unknown",
        "farmer_action": "No recommendation available.",
        "organic_solutions": [],
        "note": "The current model supports only healthy, leaf blight, and phyllosticta leaf spot classes.",
    }


def leaf_preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = np.array(image).astype("float32")
    return np.expand_dims(img_array, axis=0)


def leaf_gate_predict_image(image: Image.Image) -> Dict[str, Any]:
    """
    PlantVillage other-leaf gate.
    High max softmax => looks like a known non-cardamom crop leaf => reject.
    """
    gate = STATE["leaf_gate"]
    interpreter = gate["interpreter"]
    input_details = gate["input_details"]
    output_details = gate["output_details"]
    class_names = gate["class_names"]
    threshold = float(gate.get("reject_threshold", LEAF_GATE_REJECT_THRESHOLD))

    img_array = leaf_preprocess_image(image)
    input_index = input_details[0]["index"]
    output_index = output_details[0]["index"]
    input_dtype = input_details[0]["dtype"]

    if input_dtype == np.uint8:
        scale, zero_point = input_details[0]["quantization"]
        if scale == 0:
            scale = 1.0
        img_array = img_array / scale + zero_point
        img_array = img_array.astype(np.uint8)
    else:
        img_array = img_array.astype(np.float32)

    # Match export shape if model is fixed to batch=1, H, W, C
    expected_shape = input_details[0].get("shape")
    if expected_shape is not None and len(expected_shape) == 4:
        _, h, w, c = [int(x) for x in expected_shape]
        if h > 0 and w > 0 and (img_array.shape[1] != h or img_array.shape[2] != w):
            resized = image.convert("RGB").resize((w, h))
            img_array = np.expand_dims(np.array(resized).astype("float32"), axis=0)
            if input_dtype != np.uint8:
                img_array = img_array.astype(np.float32)

    with gate["lock"]:
        interpreter.set_tensor(input_index, img_array)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_index)[0]

    predicted_index = int(np.argmax(predictions))
    predicted_class = class_names[predicted_index]
    confidence = float(predictions[predicted_index])
    is_other_leaf = confidence >= threshold

    return {
        "is_other_leaf": is_other_leaf,
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
        "threshold": round(threshold * 100, 2),
        "message": (
            f"Image looks like a known non-cardamom leaf "
            f"({predicted_class.replace('___', ' / ')})."
            if is_other_leaf
            else "Not confidently matched to a known other crop leaf."
        ),
    }


def leaf_predict_image(image: Image.Image) -> Dict[str, Any]:
    leaf = STATE["leaf"]
    interpreter = leaf["interpreter"]
    input_details = leaf["input_details"]
    output_details = leaf["output_details"]
    class_names = leaf["class_names"]

    img_array = leaf_preprocess_image(image)

    input_index = input_details[0]["index"]
    output_index = output_details[0]["index"]
    input_dtype = input_details[0]["dtype"]

    if input_dtype == np.uint8:
        scale, zero_point = input_details[0]["quantization"]
        img_array = img_array / scale + zero_point
        img_array = img_array.astype(np.uint8)
    else:
        img_array = img_array.astype(np.float32)

    with leaf["lock"]:
        interpreter.set_tensor(input_index, img_array)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_index)[0]

    predicted_index = int(np.argmax(predictions))
    predicted_class = class_names[predicted_index]
    confidence = float(predictions[predicted_index])

    probabilities = {
        class_names[i]: round(float(predictions[i]) * 100, 2)
        for i in range(len(class_names))
    }

    disease_detected = predicted_class != "healthy"

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
        "probabilities": probabilities,
        "disease_detected": disease_detected,
        "recommendation": leaf_get_recommendation(predicted_class),
    }


@leaf_router.get("/health")
def leaf_health():
    return {
        "status": "ok",
        "model_loaded": STATE["leaf"].get("interpreter") is not None,
        "model_type": "tflite",
        "classes": STATE["leaf"].get("class_names", []),
        "model_path": str(LEAF_MODEL_PATH),
        "class_names_path": str(LEAF_CLASSES_PATH),
    }


@leaf_router.get("/classes")
def leaf_classes():
    return {"classes": STATE["leaf"].get("class_names", [])}


@leaf_router.post("/predict")
async def leaf_predict(file: UploadFile = File(...), _user: dict = Depends(deduct_credits)):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file type. Please upload JPG, JPEG, "
                "PNG, or WEBP image."
            ),
        )

    try:
        file_bytes = await file.read()

        # Stage 1: OpenAI leaf-only gate (separate from pod gate)
        validation = validate_cardamom_leaf_ai(file_bytes)

        file_extension = Path(file.filename or "").suffix.lower() or ".jpg"
        saved_filename = f"{uuid.uuid4()}{file_extension}"
        saved_path = LEAF_UPLOAD_DIR / saved_filename
        saved_path.write_bytes(file_bytes)

        if not validation["valid"]:
            result = {
                "predicted_class": "not_a_cardamom_leaf",
                "confidence": validation["confidence"],
                "probabilities": validation["probabilities"],
                "disease_detected": False,
                "recommendation": {
                    "issue": "Invalid leaf image",
                    "risk_level": "Unknown",
                    "farmer_action": (
                        "Upload a clear image of a cardamom leaf "
                        "(long lanceolate leaf with midrib). "
                        "Do not upload pods, other crop leaves, or unrelated objects."
                    ),
                    "organic_solutions": [],
                    "note": (
                        "Disease prediction was not performed because the "
                        "OpenAI leaf gate did not confirm a cardamom leaf."
                    ),
                },
                "filename": saved_filename,
                "message": validation["message"],
            }

            return {
                "success": True,
                "result": result,
            }

        image = Image.open(io.BytesIO(file_bytes))

        # Stage 2: local leaf disease model
        result = leaf_predict_image(image)
        result["filename"] = saved_filename
        result["leaf_gate"] = {
            "provider": "ai_service",
            "model": "ai_vision",
            "confidence": validation["confidence"],
            "message": validation["message"],
        }

        return {
            "success": True,
            "result": result,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )

# ---------------------------------------------------------------------
# Grading module
# ---------------------------------------------------------------------
grading_router = APIRouter(prefix="/api/grading", tags=["Grading"])

# Model class labels 
REAL_WORLD_GRADE_STANDARDS: Dict[str, Dict[str, Any]] = {
    "Cardmom Grade A": {
        "standard_code": "LG",
        "standard_name": "Lanka Green (LG)",
        "quality_rank": 1,
        "market_tier": "Premium export",
        "description": (
            "Highest commercial grade. Bold, uniformly green capsules suitable for "
            "premium export and top local auction lots."
        ),
        "typical_traits": [
            "Uniform bright green colour",
            "Bold, well-filled capsules",
            "Minimal blemishes, spots, or browning",
            "Good maturity and oil-rich appearance",
        ],
    },
    "Cardmom Grade B": {
        "standard_code": "LLG1",
        "standard_name": "Lanka Light Green Grade 1 (LLG1)",
        "quality_rank": 2,
        "market_tier": "Standard export / good local",
        "description": (
            "Good commercial grade with light-green tone and only minor visual defects. "
            "Widely accepted in export and wholesale markets."
        ),
        "typical_traits": [
            "Light to medium green colour",
            "Acceptable size with minor colour variation",
            "Few surface marks or slight uneven ripening",
            "Still suitable for drying and standard sale",
        ],
    },
    "Cardmom Grade C": {
        "standard_code": "LLG2",
        "standard_name": "Lanka Light Green Grade 2 (LLG2)",
        "quality_rank": 3,
        "market_tier": "Lower commercial / domestic",
        "description": (
            "Lower visual grade with paler colour, visible blemishes, or smaller capsules. "
            "May price closer to LLG2 or LB depending on drying outcome."
        ),
        "typical_traits": [
            "Pale green, yellowish, or uneven colour",
            "Visible spots, scarring, or browning",
            "Smaller or less uniform capsule size",
            "Better suited for domestic or lower-value lots",
        ],
    },
}

GRADE_CLASS_ALIASES = {
    "cardmom grade a": "Cardmom Grade A",
    "cardamom grade a": "Cardmom Grade A",
    "grade a": "Cardmom Grade A",
    "a": "Cardmom Grade A",
    "cardmom grade b": "Cardmom Grade B",
    "cardamom grade b": "Cardmom Grade B",
    "grade b": "Cardmom Grade B",
    "b": "Cardmom Grade B",
    "cardmom grade c": "Cardmom Grade C",
    "cardamom grade c": "Cardmom Grade C",
    "grade c": "Cardmom Grade C",
    "c": "Cardmom Grade C",
}


def normalize_grade_class(label: str) -> str:
    key = label.strip().lower()
    if key in GRADE_CLASS_ALIASES:
        return GRADE_CLASS_ALIASES[key]
    for model_label in REAL_WORLD_GRADE_STANDARDS:
        if model_label.lower() == key:
            return model_label
    return label


def get_real_world_grade_info(predicted_class: str) -> Dict[str, Any]:
    normalized = normalize_grade_class(predicted_class)
    standard = REAL_WORLD_GRADE_STANDARDS.get(normalized)
    if standard is None:
        return {
            "model_grade": predicted_class,
            "standard_code": "Unknown",
            "standard_name": "Unknown",
            "quality_rank": None,
            "market_tier": "Unknown",
            "description": "No standard mapping available for this model label.",
            "typical_traits": [],
        }
    return {
        "model_grade": normalized,
        **standard,
    }


def extract_pod_mask(img_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return gray < 245


def analyze_pod_visual_features(img_bgr: np.ndarray) -> Dict[str, Any]:
    mask = extract_pod_mask(img_bgr)
    if not np.any(mask):
        return {
            "pod_pixels": 0,
            "green_coverage_pct": 0.0,
            "brown_damage_pct": 0.0,
            "yellowish_pct": 0.0,
            "mean_saturation": 0.0,
            "mean_brightness": 0.0,
            "color_uniformity_score": 0.0,
            "size_score": 0.0,
            "fill_ratio_pct": 0.0,
        }

    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    pod_h = h[mask]
    pod_s = s[mask]
    pod_v = v[mask]

    green_mask = mask & (h >= 35) & (h <= 85) & (s >= 35)
    brown_mask = mask & (((h >= 8) & (h <= 25)) | ((h >= 160) & (h <= 180))) & (s >= 25) & (v <= 200)
    yellow_mask = mask & (h >= 20) & (h <= 34) & (s >= 30)

    pod_pixels = int(np.count_nonzero(mask))
    green_pct = round(float(np.count_nonzero(green_mask) / pod_pixels * 100), 2)
    brown_pct = round(float(np.count_nonzero(brown_mask) / pod_pixels * 100), 2)
    yellow_pct = round(float(np.count_nonzero(yellow_mask) / pod_pixels * 100), 2)

    hue_std = float(np.std(pod_h)) if pod_h.size else 0.0
    sat_std = float(np.std(pod_s)) if pod_s.size else 0.0
    uniformity = max(0.0, min(100.0, 100.0 - (hue_std * 0.6 + sat_std * 0.4)))

    total_pixels = img_bgr.shape[0] * img_bgr.shape[1]
    fill_ratio = round(float(pod_pixels / total_pixels * 100), 2)
    size_score = round(min(100.0, fill_ratio * 2.5), 2)

    return {
        "pod_pixels": pod_pixels,
        "green_coverage_pct": green_pct,
        "brown_damage_pct": brown_pct,
        "yellowish_pct": yellow_pct,
        "mean_saturation": round(float(np.mean(pod_s)), 2),
        "mean_brightness": round(float(np.mean(pod_v)), 2),
        "color_uniformity_score": round(uniformity, 2),
        "size_score": size_score,
        "fill_ratio_pct": fill_ratio,
    }


def _grade_feature_expectations(grade_class: str) -> Dict[str, tuple]:
    normalized = normalize_grade_class(grade_class)
    if normalized == "Cardmom Grade A":
        return {
            "green_coverage_pct": (65.0, 100.0),
            "brown_damage_pct": (0.0, 8.0),
            "color_uniformity_score": (70.0, 100.0),
            "size_score": (55.0, 100.0),
        }
    if normalized == "Cardmom Grade B":
        return {
            "green_coverage_pct": (45.0, 80.0),
            "brown_damage_pct": (0.0, 18.0),
            "color_uniformity_score": (50.0, 85.0),
            "size_score": (35.0, 80.0),
        }
    return {
        "green_coverage_pct": (0.0, 60.0),
        "brown_damage_pct": (5.0, 100.0),
        "color_uniformity_score": (0.0, 65.0),
        "size_score": (0.0, 55.0),
    }


def _feature_support_label(value: float, expected_range: tuple, higher_is_better: bool = True) -> str:
    low, high = expected_range
    if low <= value <= high:
        return "supports"
    if higher_is_better:
        return "supports" if value >= high else "weakens"
    return "supports" if value <= low else "weakens"


def explain_pod_grade(
    predicted_class: str,
    features: Dict[str, Any],
    all_probabilities: Dict[str, float],
    confidence: float,
) -> Dict[str, Any]:
    normalized = normalize_grade_class(predicted_class)
    standard = get_real_world_grade_info(normalized)
    expectations = _grade_feature_expectations(normalized)

    factor_defs = [
        {
            "factor": "Green colour coverage",
            "metric": "green_coverage_pct",
            "unit": "%",
            "higher_is_better": True,
            "detail_template": (
                "{value}% of the visible pod surface shows healthy green colour. "
                "Premium LG pods typically show strong, even green coverage."
            ),
        },
        {
            "factor": "Brown damage / blemishes",
            "metric": "brown_damage_pct",
            "unit": "%",
            "higher_is_better": False,
            "detail_template": (
                "{value}% of the pod surface shows brown or damaged areas. "
                "Lower damage is required for higher export grades."
            ),
        },
        {
            "factor": "Colour uniformity",
            "metric": "color_uniformity_score",
            "unit": "/100",
            "higher_is_better": True,
            "detail_template": (
                "Colour uniformity score is {value}/100. "
                "Even ripening and consistent tone support higher grading."
            ),
        },
        {
            "factor": "Capsule size / fill",
            "metric": "size_score",
            "unit": "/100",
            "higher_is_better": True,
            "detail_template": (
                "Capsule size/fill score is {value}/100 based on how much of the frame "
                "the pod occupies. Bolder capsules are preferred for LG and LLG1."
            ),
        },
        {
            "factor": "Yellowish / pale tone",
            "metric": "yellowish_pct",
            "unit": "%",
            "higher_is_better": False,
            "detail_template": (
                "{value}% of the surface appears yellowish or pale, which is more common "
                "in LLG2 and lower commercial lots."
            ),
        },
    ]

    key_factors: List[Dict[str, Any]] = []
    supporting = 0
    weakening = 0

    for item in factor_defs:
        metric = item["metric"]
        value = float(features.get(metric, 0.0))
        expected = expectations.get(metric, (0.0, 100.0))
        impact = _feature_support_label(value, expected, item["higher_is_better"])
        if impact == "supports":
            supporting += 1
        else:
            weakening += 1

        key_factors.append({
            "factor": item["factor"],
            "observed_value": value,
            "unit": item["unit"],
            "impact": impact,
            "detail": item["detail_template"].format(value=value),
        })

    sorted_probs = sorted(all_probabilities.items(), key=lambda x: x[1], reverse=True)
    runner_up = sorted_probs[1] if len(sorted_probs) > 1 else None

    summary = (
        f"This pod is classified as {standard['model_grade']} ({standard['standard_code']} – "
        f"{standard['standard_name']}) with {round(confidence * 100, 2)}% model confidence. "
        f"The image shows {features['green_coverage_pct']}% green coverage, "
        f"{features['brown_damage_pct']}% brown damage, and a colour uniformity score of "
        f"{features['color_uniformity_score']}/100. "
        f"{supporting} visual indicators support this grade and {weakening} suggest a lower grade."
    )

    model_reasoning = {
        "predicted_class": normalized,
        "confidence_percent": round(confidence * 100, 2),
        "class_probabilities_percent": all_probabilities,
        "runner_up_class": runner_up[0] if runner_up else None,
        "runner_up_probability_percent": runner_up[1] if runner_up else None,
    }

    if runner_up and runner_up[1] >= 25:
        model_reasoning["note"] = (
            f"{runner_up[0]} was the next closest class at {runner_up[1]}%. "
            "Capture the pod against a plain background in good light for a clearer grade."
        )
    else:
        model_reasoning["note"] = "The model shows a clear separation from other grade classes."

    return {
        "method": "Visual feature analysis + model probability explanation",
        "summary": summary,
        "key_factors": key_factors,
        "visual_metrics": features,
        "model_reasoning": model_reasoning,
        "standard_reference": {
            "best_grade": "LG – Lanka Green (premium export)",
            "grade_ladder": [
                "LG – Lanka Green (premium / best)",
                "LLG1 – Lanka Light Green Grade 1",
                "LLG2 – Lanka Light Green Grade 2",
                "LB – Lower / brown grade",
            ],
            "mapping_note": (
                "Model Grade A → LG, Grade B → LLG1, Grade C → LLG2. "
                "Severely brown or shrivelled dried pods are traded as LB after processing."
            ),
        },
    }


def detect_pod_crop_and_measure(img_bgr: np.ndarray):
    """
    Detects cardamom pod from plain background.
    Returns cropped image and size measurements.
    """
    if img_bgr is None:
        return None, None

    h_img, w_img = img_bgr.shape[:2]

    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv)

    # Detect pod against white/gray background
    mask = ((s > 25) & (v < 245)).astype(np.uint8) * 255

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    if not contours:
        return None, None

    contour = max(contours, key=cv2.contourArea)
    contour_area = cv2.contourArea(contour)

    min_area = max(200, h_img * w_img * 0.0002)

    if contour_area < min_area:
        return None, None

    # Rotated rectangle gives better pod length/width
    rect = cv2.minAreaRect(contour)
    (_cx, _cy), (rw, rh), _angle = rect

    length_px = float(max(rw, rh))
    width_px = float(min(rw, rh))

    length_ratio = length_px / max(h_img, w_img)
    area_ratio = contour_area / (h_img * w_img)

    # Normal crop
    x, y, w, h = cv2.boundingRect(contour)

    pad = int(max(w, h) * GRADE_CROP_PAD_RATIO) + 20

    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(w_img, x + w + pad)
    y2 = min(h_img, y + h + pad)

    crop = img_bgr[y1:y2, x1:x2]

    if crop.size == 0:
        return None, None

    ch, cw = crop.shape[:2]
    side = max(ch, cw)

    canvas = np.ones((side, side, 3), dtype=np.uint8) * 255

    y_offset = (side - ch) // 2
    x_offset = (side - cw) // 2

    canvas[y_offset:y_offset + ch, x_offset:x_offset + cw] = crop

    measurements = {
        "length_px": round(length_px, 2),
        "width_px": round(width_px, 2),
        "contour_area_px": round(float(contour_area), 2),
        "length_ratio": round(float(length_ratio), 4),
        "area_ratio": round(float(area_ratio), 6),
    }

    return canvas, measurements


def classify_pod_size(length_ratio: float) -> str:
    """
    Classifies pod size based on relative pod length.
    These thresholds should be adjusted after testing your dataset.
    """
    if length_ratio < 0.075:
        return "Small"
    elif length_ratio < 0.115:
        return "Medium"
    else:
        return "Large"


def predict_grade(image_bytes: bytes) -> Dict[str, Any]:
    # Same OpenAI vision gate as pod-disease: is this a cardamom pod?
    validation = validate_cardamom_pod_ai(image_bytes)
    if not validation["valid"]:
        return {
            "success": False,
            "grade": "not_a_cardamom_pod",
            "message": validation["message"],
            "confidence": validation["confidence"],
            "gate": {
                "predicted_type": "other",
                "probabilities": validation["probabilities"],
                "detail": validation["message"],
            },
        }

    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        return {
            "success": False,
            "message": "Invalid image file.",
        }

    cropped, measurements = detect_pod_crop_and_measure(img_bgr)

    if cropped is None or measurements is None:
        # Fall back to full image so real pods on tricky backgrounds still grade.
        cropped = img_bgr
        h_img, w_img = img_bgr.shape[:2]
        measurements = {
            "length_px": float(max(h_img, w_img)),
            "width_px": float(min(h_img, w_img)),
            "contour_area_px": float(h_img * w_img),
            "length_ratio": 1.0,
            "area_ratio": 1.0,
        }

    img_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(img_rgb, IMG_SIZE)

    input_array = np.expand_dims(resized.astype(np.float32), axis=0)

    grade = STATE["grade"]
    model = grade["model"]
    class_names = grade["class_names"]

    with grade["lock"]:
        predictions = model.predict(input_array, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))
    confidence = float(predictions[predicted_index])
    predicted_class = normalize_grade_class(class_names[predicted_index])

    all_probabilities = {
        normalize_grade_class(class_names[i]): round(float(predictions[i]) * 100, 2)
        for i in range(len(class_names))
    }

    visual_features = analyze_pod_visual_features(cropped)

    final_grade = predicted_class
    message = "Prediction completed successfully."
    standard_grade = get_real_world_grade_info(predicted_class)
    xai = explain_pod_grade(
        predicted_class=predicted_class,
        features=visual_features,
        all_probabilities=all_probabilities,
        confidence=confidence,
    )

    estimated_size = classify_pod_size(measurements["length_ratio"])

    return {
        "success": True,
        "message": message,
        "grade": final_grade,
        "raw_predicted_grade": predicted_class,
        "standard_grade": standard_grade,
        "estimated_size": estimated_size,
        "size_measurements": measurements,
        "confidence": round(confidence * 100, 2),
        "all_probabilities": all_probabilities,
        "xai": xai,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modules": {
            "image_gate": (
                STATE["image_gate"].get("model") is not None
            ),
            "pod_disease": (
                STATE["pod"].get("interpreter") is not None
            ),
            "leaf_disease": (
                STATE["leaf"].get("interpreter") is not None
            ),
            "grading": (
                STATE["grade"].get("model") is not None
            ),
            "market": (
                STATE["market"].get("model") is not None
            ),
        },
    }

@grading_router.get("/health")
def grading_health():
    return {
        "status": "ok",
        "model_loaded": STATE["grade"].get("model") is not None,
        "classes": STATE["grade"].get("class_names", []),
    }


@grading_router.post("/predict")
async def grading_predict(file: UploadFile = File(...), _user: dict = Depends(deduct_credits)):
    image_bytes = await file.read()
    return predict_grade(image_bytes)


# ---------------------------------------------------------------------
# Market prediction module
# ---------------------------------------------------------------------
market_router = APIRouter(prefix="/api/market", tags=["Market Prediction"])


class PricePredictionRequest(BaseModel):
    date: str = Field(..., example="2026-04-20")
    region: str = Field(..., example="Kandy")
    grade: str = Field(..., example="LG")


class ProfitRecommendationRequest(BaseModel):
    date: str = Field(..., example="2026-04-20")
    region: str = Field(..., example="Kandy")
    grade: str = Field(..., example="LG")

    harvest_fresh_kg: float = Field(..., example=120)
    current_fresh_price_lkr_per_kg: float = Field(..., example=1450)

    drying_cost_total_lkr: float = Field(..., example=18000)
    storage_cost_total_lkr: float = Field(0, example=6000)
    quality_loss_pct_est: float = Field(2.5, example=2.5)
    conversion_ratio: float = Field(4.0, example=4.0)


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
    )
    return df


def infer_season(month: int) -> str:
    if month in [9, 10, 11, 12, 1]:
        return "main_harvest"
    if month in [2, 8]:
        return "shoulder"
    return "off_season"


def add_time_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

    if "season" not in df.columns:
        df["season"] = df["month"].apply(infer_season)

    return df


def convert_possible_numeric_columns(df: pd.DataFrame, skip_cols: Optional[List[str]] = None) -> pd.DataFrame:
    df = df.copy()
    skip_cols = set(skip_cols or [])

    for col in df.columns:
        if col in skip_cols:
            continue

        if df[col].dtype == "object":
            converted = pd.to_numeric(df[col], errors="coerce")
            original_not_null = df[col].notna().sum()
            converted_not_null = converted.notna().sum()

            if original_not_null > 0 and converted_not_null / original_not_null > 0.80:
                df[col] = converted

    return df


def create_market_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    required_columns = ["date", "region", "grade", "dried_price_lkr_per_kg"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Market dataset must contain {col} column.")

    df = df.sort_values(["region", "grade", "date"]).reset_index(drop=True)

    group_keys = ["region", "grade"]
    price_col = "dried_price_lkr_per_kg"
    horizon_weeks = STATE["market"]["horizon_weeks"]
    target_col = STATE["market"]["target_col"]

    df[target_col] = df.groupby(group_keys)[price_col].shift(-horizon_weeks)
    df["target_available"] = df[target_col].notna()

    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    df["week_sin"] = np.sin(2 * np.pi * df["week_of_year"] / 52)
    df["week_cos"] = np.cos(2 * np.pi * df["week_of_year"] / 52)

    for lag in [1, 2, 4, 8, 12, 26, 52]:
        df[f"dried_price_lag_{lag}w"] = df.groupby(group_keys)[price_col].shift(lag)

    for window in [4, 8, 12, 26, 52]:
        df[f"dried_rollmean_{window}w"] = df.groupby(group_keys)[price_col].transform(
            lambda s: s.shift(1).rolling(window, min_periods=2).mean()
        )
        df[f"dried_rollstd_{window}w"] = df.groupby(group_keys)[price_col].transform(
            lambda s: s.shift(1).rolling(window, min_periods=2).std()
        )
        df[f"dried_rollmin_{window}w"] = df.groupby(group_keys)[price_col].transform(
            lambda s: s.shift(1).rolling(window, min_periods=2).min()
        )
        df[f"dried_rollmax_{window}w"] = df.groupby(group_keys)[price_col].transform(
            lambda s: s.shift(1).rolling(window, min_periods=2).max()
        )

    for period in [1, 4, 12, 26]:
        df[f"dried_pct_change_{period}w"] = (
            df.groupby(group_keys)[price_col].pct_change(periods=period) * 100
        )

    if "fresh_price_lkr_per_kg_est" in df.columns:
        df["dried_to_fresh_price_ratio"] = (
            df["dried_price_lkr_per_kg"] /
            df["fresh_price_lkr_per_kg_est"].replace(0, np.nan)
        )

    if "total_drying_cost_lkr_per_dried_kg_est" in df.columns:
        df["drying_cost_share_of_price_pct"] = (
            df["total_drying_cost_lkr_per_dried_kg_est"] /
            df["dried_price_lkr_per_kg"].replace(0, np.nan)
        ) * 100

    macro_cols = [
        "usd_lkr_rate_est",
        "diesel_price_lkr_litre_est",
        "kerosene_price_lkr_litre_est",
        "labour_cost_lkr_day_est",
        "production_supply_index_est",
        "global_export_demand_index_est",
    ]

    for col in macro_cols:
        if col in df.columns:
            df[f"{col}_lag_4w"] = df.groupby(group_keys)[col].shift(4)
            df[f"{col}_change_4w"] = df[col] - df[f"{col}_lag_4w"]

    return df


def load_market_data() -> pd.DataFrame:
    df = pd.read_csv(MARKET_DATA_PATH)
    df = clean_column_names(df)

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    if df["date"].isna().sum() > 0:
        raise ValueError("Some date values could not be parsed in market dataset.")

    df = add_time_columns(df)

    df = convert_possible_numeric_columns(
        df,
        skip_cols=[
            "date",
            "region",
            "production_zone",
            "grade",
            "grade_description",
            "season",
            "data_source_class",
        ],
    )

    df = create_market_features(df)
    return df


def prepare_features_for_model(row_df: pd.DataFrame) -> pd.DataFrame:
    row_df = row_df.copy()
    feature_cols = STATE["market"]["feature_cols"]

    for col in feature_cols:
        if col not in row_df.columns:
            row_df[col] = np.nan

    return row_df[feature_cols]


def get_latest_market_row(date: str, region: str, grade: str) -> pd.DataFrame:
    requested_date = pd.to_datetime(date, errors="coerce")

    if pd.isna(requested_date):
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    market_features = STATE["market"]["market_features"]
    region_clean = region.strip()
    grade_clean = grade.strip()

    subset = market_features[
        (market_features["region"].astype(str).str.lower() == region_clean.lower()) &
        (market_features["grade"].astype(str).str.lower() == grade_clean.lower()) &
        (market_features["date"] <= requested_date)
    ].sort_values("date")

    if subset.empty:
        available_regions = sorted(market_features["region"].dropna().astype(str).unique().tolist())
        available_grades = sorted(market_features["grade"].dropna().astype(str).unique().tolist())

        raise HTTPException(
            status_code=404,
            detail={
                "message": "No market data found for this region, grade, and date.",
                "available_regions": available_regions,
                "available_grades": available_grades,
            },
        )

    return subset.tail(1)


def predict_dried_price(date: str, region: str, grade: str) -> Dict[str, Any]:
    row_df = get_latest_market_row(date=date, region=region, grade=grade)

    X = prepare_features_for_model(row_df)
    predicted_price = float(STATE["market"]["model"].predict(X)[0])
    predicted_price = max(predicted_price, 0.0)

    row = row_df.iloc[0]
    horizon_weeks = STATE["market"]["horizon_weeks"]

    return {
        "input_date": str(pd.to_datetime(date).date()),
        "used_market_date": str(row["date"].date()),
        "region": str(row["region"]),
        "grade": str(row["grade"]),
        "current_dried_price_lkr_per_kg": float(row["dried_price_lkr_per_kg"]),
        "predicted_dried_price_next_4w_lkr_per_kg": round(predicted_price, 2),
        "horizon_weeks": horizon_weeks,
    }


def make_recommendation(diff_lkr: float, fresh_revenue_lkr: float, hold_pct: float = 0.08, min_hold_lkr: float = 3000) -> str:
    threshold = max(abs(fresh_revenue_lkr) * hold_pct, min_hold_lkr)

    if diff_lkr > threshold:
        return "DRY_AND_STORE"

    if diff_lkr < -threshold:
        return "SELL_FRESH"

    return "HOLD_MONITOR"


@market_router.get("/health")
def market_health():
    market_features = STATE["market"].get("market_features", pd.DataFrame())
    return {
        "status": "ok",
        "model_loaded": STATE["market"].get("model") is not None,
        "market_rows": int(len(market_features)),
        "horizon_weeks": STATE["market"].get("horizon_weeks", 4),
    }


@market_router.get("/market-options")
def market_options():
    market_features = STATE["market"]["market_features"]
    return {
        "regions": sorted(market_features["region"].dropna().astype(str).unique().tolist()),
        "grades": sorted(market_features["grade"].dropna().astype(str).unique().tolist()),
        "min_date": str(market_features["date"].min().date()),
        "max_date": str(market_features["date"].max().date()),
    }


@market_router.post("/predict-price")
def predict_price_api(payload: PricePredictionRequest):
    return predict_dried_price(
        date=payload.date,
        region=payload.region,
        grade=payload.grade,
    )


@market_router.post("/recommend")
def recommend_api(payload: ProfitRecommendationRequest, _user: dict = Depends(deduct_credits)):
    if payload.harvest_fresh_kg <= 0:
        raise HTTPException(status_code=400, detail="harvest_fresh_kg must be greater than 0.")

    if payload.current_fresh_price_lkr_per_kg <= 0:
        raise HTTPException(status_code=400, detail="current_fresh_price_lkr_per_kg must be greater than 0.")

    if payload.conversion_ratio <= 0:
        raise HTTPException(status_code=400, detail="conversion_ratio must be greater than 0.")

    price_result = predict_dried_price(
        date=payload.date,
        region=payload.region,
        grade=payload.grade,
    )

    predicted_dried_price = price_result["predicted_dried_price_next_4w_lkr_per_kg"]

    fresh_revenue = payload.harvest_fresh_kg * payload.current_fresh_price_lkr_per_kg
    expected_dried_quantity_kg = payload.harvest_fresh_kg / payload.conversion_ratio
    predicted_dried_gross_revenue = expected_dried_quantity_kg * predicted_dried_price
    quality_loss_cost = predicted_dried_gross_revenue * payload.quality_loss_pct_est / 100

    predicted_dried_net_profit = (
        predicted_dried_gross_revenue
        - payload.drying_cost_total_lkr
        - payload.storage_cost_total_lkr
        - quality_loss_cost
    )

    profit_difference = predicted_dried_net_profit - fresh_revenue

    recommendation = make_recommendation(
        diff_lkr=profit_difference,
        fresh_revenue_lkr=fresh_revenue,
    )

    return {
        "input": payload.model_dump(),
        "market_prediction": price_result,
        "profit_calculation": {
            "fresh_revenue_lkr": round(float(fresh_revenue), 2),
            "expected_dried_quantity_kg": round(float(expected_dried_quantity_kg), 3),
            "predicted_dried_gross_revenue_lkr": round(float(predicted_dried_gross_revenue), 2),
            "drying_cost_total_lkr": round(float(payload.drying_cost_total_lkr), 2),
            "storage_cost_total_lkr": round(float(payload.storage_cost_total_lkr), 2),
            "quality_loss_cost_lkr": round(float(quality_loss_cost), 2),
            "predicted_dried_net_profit_lkr": round(float(predicted_dried_net_profit), 2),
            "predicted_profit_difference_lkr": round(float(profit_difference), 2),
        },
        "recommendation": {
            "label": recommendation,
            "message": {
                "DRY_AND_STORE": "Drying and storing is predicted to give a better profit.",
                "SELL_FRESH": "Selling fresh is predicted to be better or safer.",
                "HOLD_MONITOR": "Profit difference is small or uncertain. Monitor the market before deciding.",
            }[recommendation],
        },
    }


# ---------------------------------------------------------------------
# Main routes
# ---------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Cardamom Unified AI API is running.",
        "docs": "/docs",
        "modules": {
            "pod_disease": "/api/pod-disease",
            "leaf_disease": "/api/leaf-disease",
            "grading": "/api/grading",
            "market": "/api/market",
        },
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modules": {
            "pod_disease": STATE["pod"].get("interpreter") is not None,
            "leaf_disease": STATE["leaf"].get("interpreter") is not None,
            "grading": STATE["grade"].get("model") is not None,
            "market": STATE["market"].get("model") is not None,
        },
    }


# AI model routers
app.include_router(pod_router)
app.include_router(leaf_router)
app.include_router(grading_router)
app.include_router(market_router)

# Auth + business logic routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(plans_router)
app.include_router(payments_router)
app.include_router(harvesting_router)
app.include_router(contact_router)
