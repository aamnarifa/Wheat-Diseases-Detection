import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env before importing services so databases connect properly
load_dotenv()

from api.routes.auth import router as auth_router
from api.routes.predict import router as predict_router
from api.routes.weather import router as weather_router
from api.routes.insurance import router as insurance_router
from api.routes.chat import router as chat_router

app = FastAPI(title="Wheatify API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def ping():
    return {"message": "Wheatify API running 🚀"}

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(predict_router, prefix="", tags=["Prediction"])
app.include_router(weather_router, prefix="", tags=["Weather"])
app.include_router(insurance_router, prefix="/insurance", tags=["Insurance"])
app.include_router(chat_router, prefix="", tags=["AI Assistant"])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
