from fastapi import APIRouter
import requests
import os
from ..shared import latest_prediction

router = APIRouter()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

@router.post("/weather-analysis")
async def weather_analysis(data: dict):
    try:
        lat = data.get("latitude")
        lon = data.get("longitude")
        
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(weather_url)
        weather = response.json()
        
        print(f"DEBUG WEATHER: Lat {lat}, Lon {lon} -> {weather.get('name')}")

        temperature = weather["main"]["temp"]
        humidity = weather["main"]["humidity"]
        wind_speed = weather.get("wind", {}).get("speed", 0)
        
        rain_data = weather.get("rain", {})
        rain = rain_data.get("1h", rain_data.get("3h", 0))

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
