import sys
import traceback

try:
    from api.routes.chat import router as chat_router
    from api.routes.predict import router as predict_router
    from api.routes.weather import router as weather_router
    from api.main import app
    print("ALL ROUTES LOADED SUCCESSFULLY!")
except Exception as e:
    with open("test_import_err.txt", "w") as f:
        traceback.print_exc(file=f)
    print("FAILED TO LOAD ROUTES")
