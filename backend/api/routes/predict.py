from fastapi import APIRouter, File, UploadFile, Form
import numpy as np
from io import BytesIO
from PIL import Image
import os
import json
import uuid

from ..shared import latest_prediction
from ..services.insurance_service import get_insurance_recommendation, SEVERITY_MAP

router = APIRouter()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
MODEL_PATH = os.path.join(BACKEND_DIR, "saved_models", "wheat_disease_model.keras")
SCANS_DB_PATH = os.path.join(CURRENT_DIR, "..", "data", "scans_db.json")

# Lazy Loading Model to save memory on Render deployments
MODEL = None

def get_model():
    global MODEL
    if MODEL is None:
        import tensorflow as tf
        MODEL = tf.keras.models.load_model(MODEL_PATH)
    return MODEL

CLASS_NAMES = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]

def load_scans():
    if not os.path.exists(SCANS_DB_PATH):
        return []
    with open(SCANS_DB_PATH, "r") as f:
        try:
            return json.load(f)
        except:
            return []

def save_scan(scan_data):
    scans = load_scans()
    scans.append(scan_data)
    with open(SCANS_DB_PATH, "w") as f:
        json.dump(scans, f, indent=4)

def read_file_as_image(data):
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image).astype(np.float32)
    
    # Lazy import preprocess_input to save RAM
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    image = preprocess_input(image)
    return image

@router.get("/scans")
async def get_scans():
    return load_scans()

@router.post("/predict")
async def predict(
    file: UploadFile = File(...), 
    latitude: float = Form(None), 
    longitude: float = Form(None)
):
    try:
        model = get_model()
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, 0)

        predictions = model.predict(img_batch, verbose=0)[0]
        predicted_class = CLASS_NAMES[np.argmax(predictions)]
        confidence = float(np.max(predictions)) * 100

        if confidence < 70:
            return {
                "success": False,
                "status": "rejected",
                "message": f"Low confidence ({round(confidence,1)}%). Upload clearer wheat leaf image.",
                "confidence": round(confidence, 2)
            }

        insurance_data = get_insurance_recommendation(predicted_class)

        # Log to pseudo DB if coords present
        if latitude is not None and longitude is not None:
            scan_id = str(uuid.uuid4())
            scan_record = {
                "id": scan_id,
                "latitude": latitude,
                "longitude": longitude,
                "disease": predicted_class,
                "confidence": round(confidence, 2),
                "severity": SEVERITY_MAP.get(predicted_class, "Unknown")
            }
            save_scan(scan_record)

        latest_prediction["disease"] = predicted_class
        latest_prediction["confidence"] = round(confidence, 1)
        latest_prediction["severity"] = SEVERITY_MAP.get(predicted_class, "Unknown")

        return {
            "success": True,
            "status": "success",
            "class": predicted_class,
            "confidence": round(confidence, 2),
            "severity": SEVERITY_MAP.get(predicted_class, "Unknown"),
            "insurance": insurance_data,
            "bbox": {
                "x": 0.2,
                "y": 0.2,
                "width": 0.6,
                "height": 0.6
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
