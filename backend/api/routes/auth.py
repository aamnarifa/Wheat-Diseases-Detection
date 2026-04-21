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
        username = auth_service.decode_token(token)
        if auth_service.get_user(username) is None:
            raise HTTPException(status_code=401, detail="User not found")
        return username
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register(user: User):
    if auth_service.users_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    existing_user = auth_service.get_user(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="User exists")

    hashed_password = auth_service.hash_password(user.password)
    auth_service.create_user(user.username, hashed_password)
    return {"message": "Registered", "success": True}

@router.post("/login")
def login(user: User):
    if auth_service.users_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")

    db_user = auth_service.get_user(user.username)
    if db_user is None:
        raise HTTPException(status_code=400, detail="User not found")

    if not auth_service.verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = auth_service.create_token(user.username)
    return {"access_token": token, "success": True}

@router.get("/profile")
def profile(current_user: str = Depends(get_current_user_from_token)):
    return {"user": current_user, "success": True}