import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

try:
    from .auth import router as auth_router
    from .routes.predict import router as predict_router
    from .routes.weather import router as weather_router
    from .routes.insurance import router as insurance_router
    from .routes.chat import router as chat_router
except ImportError:
    from api.auth import router as auth_router
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
app.include_router(predict_router, prefix="/predict", tags=["Prediction"])
app.include_router(weather_router, prefix="/weather", tags=["Weather"])
app.include_router(insurance_router, prefix="/insurance", tags=["Insurance"])
app.include_router(chat_router, prefix="/chat", tags=["AI Assistant"])