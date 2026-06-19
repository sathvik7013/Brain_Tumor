from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import numpy as np
import io, base64
import cv2
import tensorflow as tf
import traceback

model = tf.keras.models.load_model("model/brain_tumor_model.keras")
CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]
IMG_SIZE = (224, 224)
GRADCAM_LAYER = "top_conv"

print("Model loaded! Input shape:", model.input_shape)

router = APIRouter()


def generate_gradcam(img_array, class_idx):
    try:
        grad_model = tf.keras.Model(
            inputs=model.input,
            outputs=[model.get_layer(GRADCAM_LAYER).output, model.output]
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
async def predict(file: UploadFile = File(...)):
    try:
        print(f"Received: {file.filename}")
        contents = await file.read()
        original_img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = original_img.resize(IMG_SIZE)

        # RAW pixel values 0-255, NOT divided - model normalizes internally
        img_array = np.array(img).astype("float32")
        img_array = np.expand_dims(img_array, axis=0)

        print(f"Input range: {img_array.min():.1f} to {img_array.max():.1f}")

        predictions = model.predict(img_array)[0]
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

        return {
            "prediction": predicted_class,
            "confidence": round(confidence * 100, 2),
            "scores": scores,
            "gradcam": gradcam_b64
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history():
    return []
