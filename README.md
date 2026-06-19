
# 🧠 Brain Tumor MRI Classifier

AI-powered brain tumor detection from MRI scans using EfficientNetB0.

## Features
- Detects Glioma, Meningioma, Pituitary Tumor, No Tumor
- 96-99% confidence scores
- Grad-CAM heatmap visualization
- Downloadable diagnostic reports
- Patient information management

## Tech Stack
- TensorFlow + EfficientNetB0
- FastAPI + React
- OpenCV + Grad-CAM

## How to Run
cd brain-tumor-backend
pip install -r requirements.txt
uvicorn main:app --port 8000