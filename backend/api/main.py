from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os
import uvicorn
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

app = FastAPI(title="Wheatify API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
MODEL_PATH = os.path.join(os.getcwd(), "saved_models", "wheat_disease_model.keras")

MODEL = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]



INSURANCE_SCHEMES = [
    {
        "id": 1,
        "name": "PMFBY",
        "coverage": "Natural Calamities & Crop Diseases",
        "premium_percent": 2,
        "eligible_diseases": [
            "BlackPoint",
            "FusariumFootRot",
            "LeafBlight",
            "WheatBlast"
        ]
    },
    {
        "id": 2,
        "name": "AIC Insurance",
        "coverage": "Severe Fungal & Major Diseases",
        "premium_percent": 2.5,
        "eligible_diseases": [
            "WheatBlast",
            "FusariumFootRot"
        ]
    }
]

SEVERITY_MAP = {
    "BlackPoint": "Moderate",
    "LeafBlight": "Moderate",
    "FusariumFootRot": "Severe",
    "WheatBlast": "Severe",
    "HealthyLeaf": "None"
}

def get_insurance_recommendation(disease):
    if disease == "HealthyLeaf":
        return {
            "eligible": False,
            "message": "Crop is healthy. Insurance claim not required.",
            "severity": "None"
        }

    eligible_schemes = []

    for scheme in INSURANCE_SCHEMES:
        if disease in scheme["eligible_diseases"]:
            eligible_schemes.append(scheme)

    return {
        "eligible": len(eligible_schemes) > 0,
        "severity": SEVERITY_MAP.get(disease, "Unknown"),
        "recommended_schemes": eligible_schemes
    }

# ---------------- WEATHER CONFIG ----------------

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# ---------------- GEMINI CONFIG ----------------

GEMINI_API_KEY = os.getenv("GEMINI_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None
    print("WARNING: GEMINI_KEY not found in .env file.")

# ---------------- CONTEXT STORAGE ----------------

latest_prediction = {
    "disease": "None",
    "confidence": 0,
    "severity": "None",
    "weather_risk": "Low"
}

# ---------------- BASIC ROUTES ----------------

@app.get("/ping")
async def ping():
    return {"message": "Wheatify API running (Model + Weather + Insurance + Gemini AI)"}

def read_file_as_image(data):
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image).astype(np.float32)
    image = preprocess_input(image)
    return image

# ---------------- PREDICTION ROUTE ----------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, 0)

        predictions = MODEL.predict(img_batch, verbose=0)[0]

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

# ---------------- WEATHER ANALYSIS ----------------

@app.post("/weather-analysis")
async def weather_analysis(data: dict):
    try:

        lat = data.get("latitude")
        lon = data.get("longitude")

        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
        
        response = requests.get(weather_url)
        weather = response.json()
        
        # Log coordinates for debugging
        print(f"DEBUG WEATHER: Lat {lat}, Lon {lon} -> {weather.get('name')}")

        temperature = weather["main"]["temp"]
        humidity = weather["main"]["humidity"]
        wind_speed = weather.get("wind", {}).get("speed", 0)
        
        # Extract rain (1h preferred, then 3h)
        rain_data = weather.get("rain", {})
        rain = rain_data.get("1h", rain_data.get("3h", 0))

        # Improved Risk Assessment Logic
        if humidity > 80 and (20 < temperature < 30):
            risk = "High risk of fungal diseases (Blast/Blight)"
            level = "High"
        elif humidity > 60 or rain > 0:
            risk = "Moderate risk - monitor for moisture-related issues"
            level = "Medium"
        elif temperature > 35:
            risk = "High temperature stress"
            level = "Medium"
        else:
            risk = "Weather conditions normal for wheat"
            level = "Low"

        latest_prediction["weather_risk"] = level

        return {
            "success": True,
            "location": f"{weather.get('name', 'Unknown')}, {weather.get('sys', {}).get('country', '')}",
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rain": rain,
            "risk_level": level,
            "analysis": risk
        }

    except Exception as e:
        return {"success": False, "message": str(e)}

# ---------------- INSURANCE ROUTES ----------------

@app.get("/insurance")
async def get_all_insurance():
    return INSURANCE_SCHEMES

@app.get("/insurance/recommend/{disease}")
async def recommend_insurance(disease: str):
    return get_insurance_recommendation(disease)

# ---------------- CHATBOT ----------------

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "English"
    context: Optional[dict] = None

@app.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    try:
        ctx = request.context or latest_prediction

        # Dynamic Gemini Initialization
        key = os.getenv("GEMINI_KEY")
        if not key:
            return {"success": False, "message": "Gemini API key not configured in .env"}
        
        genai.configure(api_key=key)
        # Using gemini-flash-latest for best compatibility with various keys
        model = genai.GenerativeModel("gemini-flash-latest")

        prompt = f"""
You are Wheatify AI, an expert wheat agricultural scientist.

Context:
Disease: {ctx.get('disease')}
Severity: {ctx.get('severity')}
Confidence: {ctx.get('confidence')}%
Weather Risk: {ctx.get('weather_risk')}

Instructions:
Respond in {request.language}.
Explain treatment.
Give prevention tips.
Mention fungicides and dosage if needed.
Add safety disclaimer.

Farmer question:
{request.message}
"""

        response = model.generate_content(prompt)

        return {
            "success": True,
            "response": response.text
        }

    except Exception as e:
        error_msg = str(e)
        print(f"DEBUG CHAT ERROR: {error_msg}")
        
        if "429" in error_msg or "quota" in error_msg.lower():
            friendly_msg = "Gemini AI Free Tier limit reached. Please wait a minute and try again!"
        else:
            friendly_msg = "AI Assistant is briefly taking a break. Please try again in a moment."
            
        return {
            "success": False,
            "message": friendly_msg,
            "error": error_msg
        }

# ---------------- MAIN ----------------

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)