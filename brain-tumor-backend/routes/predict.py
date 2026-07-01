from fastapi import APIRouter, File, UploadFile, HTTPException, Form
import io, base64, json
import traceback
from pathlib import Path
from datetime import datetime, timezone

from db.database import predictions_collection

MODEL_PATH = Path(__file__).resolve().parents[1] / "model" / "brain_tumor_model.keras"
CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]
IMG_SIZE = (224, 224)
GRADCAM_LAYER = "top_conv"

router = APIRouter()
model = None
tf = None
Image = None
np = None
cv2 = None


def load_ml_stack():
    global model, tf, Image, np, cv2

    if model is not None:
        return model

    try:
        from PIL import Image as pil_image
        import numpy as numpy
        import cv2 as open_cv
        import tensorflow as tensorflow

        tf = tensorflow
        Image = pil_image
        np = numpy
        cv2 = open_cv
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded! Input shape:", model.input_shape)
        return model
    except Exception as exc:
        raise RuntimeError(f"Model stack unavailable: {exc}") from exc


def parse_patient(patient_payload):
    if not patient_payload:
        return {}
    if isinstance(patient_payload, dict):
        return patient_payload
    try:
        return json.loads(patient_payload)
    except json.JSONDecodeError:
        return {}


async def save_prediction(record):
    if predictions_collection is None:
        return
    try:
        await predictions_collection.insert_one(record)
    except Exception as exc:
        print(f"Database save skipped: {exc}")


def generate_gradcam(img_array, class_idx):
    try:
        current_model = load_ml_stack()
        grad_model = tf.keras.Model(
            inputs=current_model.input,
            outputs=[current_model.get_layer(GRADCAM_LAYER).output, current_model.output]
        )
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, class_idx]
        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()
    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None


def overlay_gradcam(original_img, heatmap):
    try:
        heatmap_resized = cv2.resize(heatmap, IMG_SIZE)
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        original_array = np.array(original_img.resize(IMG_SIZE))
        overlay = cv2.addWeighted(original_array, 0.6, heatmap_colored, 0.4, 0)
        _, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        return base64.b64encode(buffer).decode("utf-8")
    except Exception as e:
        print(f"Overlay error: {e}")
        return None


@router.post("/predict")
async def predict(file: UploadFile = File(...), patient: str | None = Form(None)):
    try:
        print(f"Received: {file.filename}")
        patient_data = parse_patient(patient)
        current_model = load_ml_stack()
        contents = await file.read()
        original_img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = original_img.resize(IMG_SIZE)

        # RAW pixel values 0-255, NOT divided - model normalizes internally
        img_array = np.array(img).astype("float32")
        img_array = np.expand_dims(img_array, axis=0)

        print(f"Input range: {img_array.min():.1f} to {img_array.max():.1f}")

        predictions = current_model.predict(img_array)[0]
        print(f"Predictions: {predictions}")

        predicted_class = CLASS_NAMES[np.argmax(predictions)]
        confidence = float(np.max(predictions))

        scores = {
            CLASS_NAMES[i]: round(float(predictions[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

        print(f"Result: {predicted_class} {confidence*100:.2f}%")

        class_idx = int(np.argmax(predictions))
        heatmap = generate_gradcam(img_array, class_idx)
        gradcam_b64 = overlay_gradcam(original_img, heatmap) if heatmap is not None else None

        record = {
            "filename": file.filename,
            "patient": patient_data,
            "prediction": predicted_class,
            "confidence": round(confidence * 100, 2),
            "scores": scores,
            "timestamp": datetime.now(timezone.utc),
        }
        await save_prediction(record)

        return {
            "prediction": predicted_class,
            "confidence": round(confidence * 100, 2),
            "scores": scores,
            "gradcam": gradcam_b64,
            "patient": patient_data,
            "filename": file.filename,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/history")
async def get_history(limit: int = 20):
    try:
        if predictions_collection is None:
            return []
        cursor = predictions_collection.find(
            {},
            {"_id": 1, "filename": 1, "patient": 1, "prediction": 1, "confidence": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(limit)
        records = await cursor.to_list(length=limit)
        for record in records:
            if record.get("timestamp") is not None:
                record["timestamp"] = record["timestamp"].isoformat()
        return records
    except Exception as exc:
        print(f"History fetch failed: {exc}")
        return []
