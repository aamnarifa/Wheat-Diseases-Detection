from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai
from ..shared import latest_prediction

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "English"
    context: Optional[dict] = None

@router.post("")
async def chat_with_assistant(request: ChatRequest):
    try:
        ctx = request.context or latest_prediction

        key = os.getenv("GEMINI_KEY")
        if not key:
            return {"success": False, "message": "Gemini API key not configured in .env"}
        
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-1.5-flash")

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
