
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
Backend:

cd brain-tumor-backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

Frontend:

cd brain-tumor-frontend
npm install
npm run dev

## Deployment
- Frontend: deploy `brain-tumor-frontend` to Vercel with `VITE_API_URL` pointing to the Render API URL.
- Backend: deploy `brain-tumor-backend` to Render using `render.yaml`.
- Backend env vars: set `MONGO_URL` if you want history persistence and `CORS_ORIGINS` to your Vercel domain.

## Windows npm workaround
If the local `npm` shim mis-resolves Node on Windows, run the CLI directly:

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install