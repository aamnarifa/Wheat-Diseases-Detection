from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from io import BytesIO
from PIL import Image
import requests
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

endpoint = "http://127.0.0.1:8501/v1/models/wheat_model:predict"

CLASS_NAMES = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]

STRICT_CONFIDENCE = 0.999


@app.get("/ping")
async def ping():
    return {"message": "TF Serving API running"}


def read_file_as_image(data):
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image)
    image = preprocess_input(image)
    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, axis=0)

    json_data = {
        "instances": img_batch.tolist()
    }

    response = requests.post(endpoint, json=json_data, timeout=20)

    prediction = np.array(response.json()["predictions"][0])

    confidence = float(np.max(prediction))
    predicted_index = int(np.argmax(prediction))
    predicted_class = CLASS_NAMES[predicted_index]

    if confidence < STRICT_CONFIDENCE:
        return {
            "status": "rejected",
            "confidence": confidence
        }

    return {
        "status": "success",
        "prediction": predicted_class,
        "confidence": confidence
    }