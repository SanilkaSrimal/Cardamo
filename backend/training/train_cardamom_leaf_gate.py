"""
Train an OTHER-LEAF gate (no cardamom images needed).

Idea
----
Your disease model already knows cardamom diseases.
This gate only learns "known non-cardamom crop leaves" from PlantVillage
(tomato, potato, apple, corn, grape, etc. — auto-downloaded).

At inference on the server:
  1) Run this gate.
  2) If max softmax >= threshold  -> reject as other_leaf
     (looks like a known PlantVillage crop, not cardamom).
  3) If max softmax < threshold   -> pass to your disease model
     (not confidently a known other crop; could be cardamom).

No cardamom dataset upload. Disease model stays unchanged.

Colab
-----
  !pip install -q huggingface_hub

  # Then run the file / call main()
  # Or:
  !python train_cardamom_leaf_gate.py --output-dir /content/models/leaf_gate

Outputs
-------
  cardamom_leaf_gate_effnetb0_float32.tflite
  class_names.json
  training_results.json   (includes suggested_threshold)
"""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import List, Tuple

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input


IMG_SIZE = 224

# Prefer Hugging Face zip (Mendeley often returns 403 from Colab).
HF_REPO_ID = "mohanty/PlantVillage"
HF_ZIP_NAME = "data.zip"

# Colab-friendly defaults (no cardamom_dir)
NOTEBOOK_CONFIG = {
    "output_dir": "/content/models/leaf_gate",
    "cache_dir": "/content/_plantvillage_cache",
    "epochs": 8,
    "finetune_epochs": 4,
    "batch_size": 32,
    "learning_rate": 1e-3,
    "finetune_lr": 1e-5,
    "max_samples": 12000,
    "val_split": 0.15,
    "seed": 42,
}


def set_seed(seed: int) -> None:
    np.random.seed(seed)
    tf.random.set_seed(seed)


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def _running_in_notebook() -> bool:
    import sys

    # Colab always injects this module when cells run.
    if "google.colab" in sys.modules:
        return True

    prog = Path(sys.argv[0]).name if sys.argv else ""
    if "colab_kernel_launcher" in prog or "ipykernel" in prog:
        return True

    # Jupyter/Colab pass: -f /path/to/kernel-....json
    if "-f" in sys.argv:
        return True

    try:
        from IPython import get_ipython

        shell = get_ipython()
        if shell is None:
            return False
        return shell.__class__.__name__ == "ZMQInteractiveShell"
    except Exception:
        return False


def _find_class_root(extracted_dir: Path) -> Path:
    """
    Locate the folder that directly contains class subfolders.

    Known layouts:
      - Plant_leave_diseases_dataset_without_augmentation/<class>/*.jpg
      - raw/color/<class>/*.jpg   (HF data.zip / GitHub PlantVillage)
      - color/<class>/*.jpg
    """
    extracted_dir = Path(extracted_dir)

    preferred = [
        extracted_dir / "Plant_leave_diseases_dataset_without_augmentation",
        extracted_dir / "raw" / "color",
        extracted_dir / "color",
        extracted_dir / "data" / "raw" / "color",
        extracted_dir / "PlantVillage" / "color",
    ]
    for known in preferred:
        if known.is_dir():
            subdirs = [p for p in known.iterdir() if p.is_dir()]
            if len(subdirs) >= 10:
                return known

    # Search for a directory whose children look like class folders.
    candidates: List[Tuple[int, Path]] = []
    for path in extracted_dir.rglob("*"):
        if not path.is_dir():
            continue
        # Strongly prefer "color" folders over grayscale/segmented
        name_bonus = 0
        if path.name.lower() == "color":
            name_bonus = -100
        elif path.name.lower() in {"grayscale", "grey", "segmented"}:
            continue

        subdirs = [p for p in path.iterdir() if p.is_dir()]
        if len(subdirs) < 10:
            continue
        sample = subdirs[0]
        images = (
            list(sample.glob("*.jpg"))
            + list(sample.glob("*.JPG"))
            + list(sample.glob("*.png"))
            + list(sample.glob("*.jpeg"))
        )
        if images:
            candidates.append((name_bonus + len(path.parts), path))

    if not candidates:
        raise RuntimeError(
            f"Could not find PlantVillage class folders under {extracted_dir}"
        )

    candidates.sort(key=lambda x: x[0])
    return candidates[0][1]


def _download_plantvillage_zip(cache_path: Path) -> Path:
    """
    Download PlantVillage images zip from Hugging Face hub.
    """
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:
        raise ImportError(
            "Missing huggingface_hub. In Colab run:\n"
            "  !pip install -q huggingface_hub"
        ) from exc

    print(f"[data] Downloading {HF_ZIP_NAME} from Hugging Face ({HF_REPO_ID})...")
    print("        (first run can take several minutes)")

    archive = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=HF_ZIP_NAME,
        repo_type="dataset",
        local_dir=str(cache_path / "hf"),
        local_dir_use_symlinks=False,
    )
    return Path(archive)


def load_plant_village(
    max_samples: int,
    val_split: float,
    seed: int,
    cache_dir: str = "/content/_plantvillage_cache",
) -> Tuple[tf.data.Dataset, tf.data.Dataset, List[str]]:
    """
    Auto-download PlantVillage zip from Hugging Face and build tf.data pipelines.
    """
    cache_path = ensure_dir(Path(cache_dir))
    archive = _download_plantvillage_zip(cache_path)

    extract_root = cache_path / "extracted"
    marker = extract_root / "_EXTRACT_OK"
    if not marker.exists():
        if extract_root.exists():
            shutil.rmtree(extract_root)
        extract_root.mkdir(parents=True, exist_ok=True)
        print("[data] Extracting archive...")
        shutil.unpack_archive(str(archive), extract_root)
        marker.write_text("ok", encoding="utf-8")
    else:
        print("[data] Using cached extracted PlantVillage.")

    class_root = _find_class_root(extract_root)
    class_names = sorted([p.name for p in class_root.iterdir() if p.is_dir()])
    if len(class_names) < 5:
        raise RuntimeError(f"Too few class folders found in {class_root}")

    print(f"[data] Root: {class_root}")
    print(f"[data] Classes: {len(class_names)}")
    for name in class_names:
        print(f"  - {name}")

    train_ds = keras.utils.image_dataset_from_directory(
        class_root,
        labels="inferred",
        label_mode="int",
        class_names=class_names,
        validation_split=val_split,
        subset="training",
        seed=seed,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=32,
        shuffle=True,
    )
    val_ds = keras.utils.image_dataset_from_directory(
        class_root,
        labels="inferred",
        label_mode="int",
        class_names=class_names,
        validation_split=val_split,
        subset="validation",
        seed=seed,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=32,
        shuffle=False,
    )

    if max_samples > 0:
        take_batches = max(1, max_samples // 32)
        train_ds = train_ds.take(take_batches)
        print(f"[data] Using ~{take_batches * 32} training images (capped).")

    return train_ds, val_ds, class_names


def make_pipelines(
    train_ds: tf.data.Dataset,
    val_ds: tf.data.Dataset,
    batch_size: int,
) -> Tuple[tf.data.Dataset, tf.data.Dataset]:
    # Datasets are already batched from image_dataset_from_directory.
    _ = batch_size  # kept for CLI compatibility

    augmentation = keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.12),
            layers.RandomZoom(0.12),
            layers.RandomContrast(0.08),
        ],
        name="augmentation",
    )

    def prep_train(images, labels):
        images = augmentation(images, training=True)
        images = preprocess_input(tf.cast(images, tf.float32))
        return images, labels

    def prep_val(images, labels):
        images = preprocess_input(tf.cast(images, tf.float32))
        return images, labels

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.map(prep_train, num_parallel_calls=autotune).prefetch(autotune)
    val_ds = val_ds.map(prep_val, num_parallel_calls=autotune).prefetch(autotune)
    return train_ds, val_ds


def build_model(num_classes: int, learning_rate: float) -> keras.Model:
    base = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    base.trainable = False

    inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="probs")(x)
    model = keras.Model(inputs, outputs, name="other_leaf_gate")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def unfreeze_for_finetune(model: keras.Model, learning_rate: float) -> None:
    base = model.get_layer("efficientnetb0")
    base.trainable = True
    for layer in base.layers[:-40]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )


def suggest_reject_threshold(
    model: keras.Model,
    val_ds: tf.data.Dataset,
) -> Tuple[float, float]:
    """
    On PlantVillage validation images, find a threshold where
    most true other-crop leaves are confidently detected.
    """
    max_probs = []
    correct = []

    for images, labels in val_ds:
        probs = model.predict(images, verbose=0)
        pred = np.argmax(probs, axis=1)
        conf = np.max(probs, axis=1)
        max_probs.extend(conf.tolist())
        correct.extend((pred == labels.numpy()).tolist())

    max_probs_arr = np.array(max_probs)
    correct_arr = np.array(correct)

    best_t, best_score = 0.60, -1.0
    for t in np.linspace(0.40, 0.95, 23):
        # Among images where model is confident (>= t), how often is it right?
        mask = max_probs_arr >= t
        if mask.sum() < 50:
            continue
        precision = float(correct_arr[mask].mean())
        coverage = float(mask.mean())
        # Prefer high precision with decent coverage
        score = precision * 0.7 + coverage * 0.3
        if score > best_score:
            best_score = score
            best_t = float(t)

    precision_at_best = float(
        correct_arr[max_probs_arr >= best_t].mean()
    ) if (max_probs_arr >= best_t).any() else 0.0

    return best_t, precision_at_best


def export_tflite(model: keras.Model, output_dir: Path) -> Path:
    export_dir = ensure_dir(output_dir / "saved_model")

    inputs = keras.Input(
        shape=(IMG_SIZE, IMG_SIZE, 3),
        batch_size=1,
        dtype=tf.float32,
        name="image",
    )
    x = preprocess_input(inputs)
    outputs = model(x, training=False)
    export_model = keras.Model(inputs, outputs, name="other_leaf_gate_export")
    export_model.export(str(export_dir))

    converter = tf.lite.TFLiteConverter.from_saved_model(str(export_dir))
    tflite_bytes = converter.convert()

    tflite_path = output_dir / "cardamom_leaf_gate_effnetb0_float32.tflite"
    tflite_path.write_bytes(tflite_bytes)
    return tflite_path


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train other-leaf gate from PlantVillage only (no cardamom data).",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=NOTEBOOK_CONFIG["output_dir"],
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default=NOTEBOOK_CONFIG["cache_dir"],
        help="Where PlantVillage zip/extract cache is stored.",
    )
    parser.add_argument("--epochs", type=int, default=NOTEBOOK_CONFIG["epochs"])
    parser.add_argument(
        "--finetune-epochs",
        type=int,
        default=NOTEBOOK_CONFIG["finetune_epochs"],
    )
    parser.add_argument("--batch-size", type=int, default=NOTEBOOK_CONFIG["batch_size"])
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=NOTEBOOK_CONFIG["learning_rate"],
    )
    parser.add_argument(
        "--finetune-lr",
        type=float,
        default=NOTEBOOK_CONFIG["finetune_lr"],
    )
    parser.add_argument(
        "--max-samples",
        type=int,
        default=NOTEBOOK_CONFIG["max_samples"],
        help="Cap training images for faster Colab runs (0 = use all).",
    )
    parser.add_argument("--val-split", type=float, default=NOTEBOOK_CONFIG["val_split"])
    parser.add_argument("--seed", type=int, default=NOTEBOOK_CONFIG["seed"])

    # Colab/IPython put kernel launcher flags in sys.argv (e.g. -f kernel.json).
    # Never feed those into argparse.
    if argv is None:
        argv = [] if _running_in_notebook() else None

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    set_seed(args.seed)
    output_dir = ensure_dir(Path(args.output_dir))

    print("=== Other-leaf gate training (PlantVillage only) ===")
    print("No cardamom images required.")
    print(f"Output: {output_dir}")

    raw_train, raw_val, class_names = load_plant_village(
        max_samples=args.max_samples,
        val_split=args.val_split,
        seed=args.seed,
        cache_dir=args.cache_dir,
    )
    train_ds, val_ds = make_pipelines(raw_train, raw_val, args.batch_size)

    model = build_model(len(class_names), args.learning_rate)
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            mode="max",
            patience=3,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
        ),
    ]

    print("\n[train] Phase 1: frozen backbone")
    hist1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks,
    )

    print("\n[train] Phase 2: light fine-tune")
    unfreeze_for_finetune(model, args.finetune_lr)
    hist2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.finetune_epochs,
        callbacks=callbacks,
    )

    threshold, precision = suggest_reject_threshold(model, val_ds)
    print(
        f"\n[eval] Suggested reject threshold = {threshold:.2f} "
        f"(precision on confident PlantVillage val ≈ {precision:.3f})"
    )
    print(
        "Server rule: if max_prob >= threshold -> OTHER leaf (reject). "
        "Else -> run cardamom disease model."
    )

    keras_path = output_dir / "cardamom_leaf_gate.keras"
    model.save(keras_path)
    tflite_path = export_tflite(model, output_dir)

    (output_dir / "class_names.json").write_text(
        json.dumps(class_names, indent=2),
        encoding="utf-8",
    )

    results = {
        "gate_type": "other_leaf_plantvillage",
        "class_names": class_names,
        "image_size": [IMG_SIZE, IMG_SIZE],
        "suggested_threshold": round(threshold, 2),
        "val_precision_at_threshold": round(precision, 4),
        "inference_rule": {
            "reject_as_other_leaf_when": "max(softmax) >= suggested_threshold",
            "pass_to_disease_model_when": "max(softmax) < suggested_threshold",
        },
        "history": {
            "phase1": {k: [float(x) for x in v] for k, v in hist1.history.items()},
            "phase2": {k: [float(x) for x in v] for k, v in hist2.history.items()},
        },
        "train_args": vars(args),
        "notes": [
            "This model does NOT classify cardamom.",
            "It only recognizes common non-cardamom crop leaves from PlantVillage.",
            "PlantVillage has no mango class; mango may still slip through until you add mango negatives later.",
            "Keep using your existing cardamom disease TFLite for diagnosis.",
        ],
    }
    results_path = output_dir / "training_results.json"
    results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print("\n=== Done ===")
    print(f"Keras   : {keras_path}")
    print(f"TFLite  : {tflite_path}")
    print(f"Classes : {output_dir / 'class_names.json'}")
    print(f"Results : {results_path}")


if __name__ == "__main__":
    main()
