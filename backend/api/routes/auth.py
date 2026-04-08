from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..services import auth_service

router = APIRouter()
security = HTTPBearer()

class User(BaseModel):
    username: str
    password: str

def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        return auth_service.decode_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register(user: User):
    db = auth_service.load_users()
    if user.username in db:
        raise HTTPException(status_code=400, detail="User exists")

    db[user.username] = auth_service.hash_password(user.password)
    auth_service.save_users(db)
    return {"message": "Registered", "success": True}

@router.post("/login")
def login(user: User):
    db = auth_service.load_users()
    if user.username not in db:
        raise HTTPException(status_code=400, detail="User not found")

    if not auth_service.verify_password(user.password, db[user.username]):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = auth_service.create_token(user.username)
    return {"access_token": token, "success": True}

@router.get("/profile")
def profile(current_user: str = Depends(get_current_user_from_token)):
    return {"user": current_user, "success": True}