import base64
import io
import json
import os
from typing import Any, Dict, Optional

from fastapi import HTTPException
from openai import OpenAI
from PIL import Image

# ---------------------------------------------------------------------
# AI / Vision Gates Configurations
# ---------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_POD_GATE_MODEL = os.getenv("OPENAI_POD_GATE_MODEL", "gpt-4o-mini").strip()
OPENAI_LEAF_GATE_MODEL = os.getenv("OPENAI_LEAF_GATE_MODEL", "gpt-4o-mini").strip()
_openai_client: Optional[OpenAI] = None

# Leaf-only guidance for the AI leaf gate (not shared with pod gate).
LEAF_AI_ACCEPT_HINTS = (
    "cardamom leaf",
    "elettaria cardamomum leaf",
    "long lanceolate leaf",
    "parallel veins",
    "midrib",
    "leaf blight lesions",
    "phyllosticta spots",
    "chlorotic mottling on cardamom foliage",
)
LEAF_AI_REJECT_HINTS = (
    "cardamom pod or capsule only",
    "mango leaf",
    "banana leaf",
    "tea leaf",
    "tomato leaf",
    "corn or maize leaf",
    "other crop foliage",
    "people",
    "animals",
    "furniture",
    "vehicles",
    "random objects",
)


def get_openai_client() -> OpenAI:
    global _openai_client
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured on the server.",
        )
    if _openai_client is None:
        _openai_client = OpenAI(api_key=OPENAI_API_KEY)
    return _openai_client


def _image_bytes_to_data_url(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        fmt = (image.format or "JPEG").upper()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}",
        )

    mime = {
        "JPEG": "image/jpeg",
        "JPG": "image/jpeg",
        "PNG": "image/png",
        "WEBP": "image/webp",
        "GIF": "image/gif",
    }.get(fmt, "image/jpeg")

    b64 = base64.b64encode(image_bytes).decode("ascii")
    return f"data:{mime};base64,{b64}"


def validate_cardamom_pod_ai(image_bytes: bytes) -> Dict[str, Any]:
    """
    Use AI vision to decide if the image shows a cardamom pod.
    Local disease model runs only when this returns valid=True.
    """
    client = get_openai_client()
    data_url = _image_bytes_to_data_url(image_bytes)

    prompt = (
        "Look at this image carefully. "
        "Decide whether it primarily shows a cardamom pod "
        "(also called cardamom capsule / Elettaria cardamomum fruit). "
        "Accept clear photos of one or more cardamom pods, including "
        "green, pale, or slightly browned pods, even from the internet. "
        "Reject mangoes, other fruits, leaves-only photos, animals, "
        "people, furniture, vehicles, and unrelated objects. "
        "Return JSON only with keys: "
        "is_cardamom_pod (boolean), confidence (number 0-100), "
        "reason (short string)."
    )

    try:
        response = client.chat.completions.create(
            model=OPENAI_POD_GATE_MODEL,
            temperature=0,
            max_tokens=200,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict visual classifier for cardamom pods. "
                        "Respond with valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url},
                        },
                    ],
                },
            ],
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI pod gate failed: {str(e)}",
        )

    raw = (response.choices[0].message.content or "").strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="AI pod gate returned invalid JSON.",
        )

    is_pod = bool(parsed.get("is_cardamom_pod", False))
    confidence = float(parsed.get("confidence", 0) or 0)
    confidence = max(0.0, min(100.0, confidence))
    reason = str(parsed.get("reason", "") or "").strip()

    if is_pod:
        return {
            "valid": True,
            "confidence": round(confidence, 2),
            "probabilities": {
                "ai_is_cardamom_pod": True,
                "ai_confidence": round(confidence, 2),
            },
            "message": reason or "Cardamom pod detected by AI gate.",
        }

    return {
        "valid": False,
        "confidence": round(confidence, 2),
        "probabilities": {
            "ai_is_cardamom_pod": False,
            "ai_confidence": round(confidence, 2),
        },
        "message": reason or (
            "This image was not identified as a cardamom pod."
        ),
    }


def validate_cardamom_leaf_ai(image_bytes: bytes) -> Dict[str, Any]:
    """
    Separate AI vision gate for leaf disease only.
    Does not reuse pod prompts or pod response keys.
    Local leaf disease model runs only when this returns valid=True.
    """
    client = get_openai_client()
    data_url = _image_bytes_to_data_url(image_bytes)

    accept_list = ", ".join(LEAF_AI_ACCEPT_HINTS)
    reject_list = ", ".join(LEAF_AI_REJECT_HINTS)

    prompt = (
        "Look at this image carefully. "
        "Decide whether it primarily shows a CARDAMOM LEAF "
        "(Elettaria cardamomum foliage), not a pod/capsule. "
        "Cardamom leaves are typically long, lanceolate, with a clear midrib "
        "and parallel side veins. "
        "ACCEPT: close-ups or field photos of one or more cardamom leaves, "
        "including healthy leaves and diseased leaves with blight, leaf spots, "
        "yellow mottling, tears, or necrosis. "
        f"Positive cues include: {accept_list}. "
        "REJECT: cardamom pods/capsules alone, other crop leaves "
        "(mango, banana, tea, tomato, maize/corn, etc.), whole landscapes "
        "with no clear leaf subject, and non-plant content. "
        f"Negative cues include: {reject_list}. "
        "Return JSON only with keys: "
        "is_cardamom_leaf (boolean), confidence (number 0-100), "
        "reason (short string)."
    )

    try:
        response = client.chat.completions.create(
            model=OPENAI_LEAF_GATE_MODEL,
            temperature=0,
            max_tokens=220,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict visual classifier for cardamom leaves only. "
                        "Never treat pods, fruits, or other crop foliage as cardamom leaves. "
                        "Respond with valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url},
                        },
                    ],
                },
            ],
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI leaf gate failed: {str(e)}",
        )

    raw = (response.choices[0].message.content or "").strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="AI leaf gate returned invalid JSON.",
        )

    is_leaf = bool(parsed.get("is_cardamom_leaf", False))
    confidence = float(parsed.get("confidence", 0) or 0)
    confidence = max(0.0, min(100.0, confidence))
    reason = str(parsed.get("reason", "") or "").strip()

    if is_leaf:
        return {
            "valid": True,
            "confidence": round(confidence, 2),
            "probabilities": {
                "ai_is_cardamom_leaf": True,
                "ai_confidence": round(confidence, 2),
            },
            "message": reason or "Cardamom leaf detected by AI leaf gate.",
        }

    return {
        "valid": False,
        "confidence": round(confidence, 2),
        "probabilities": {
            "ai_is_cardamom_leaf": False,
            "ai_confidence": round(confidence, 2),
        },
        "message": reason or (
            "This image was not identified as a cardamom leaf."
        ),
    }
