from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import bcrypt
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import os

router = APIRouter()

SECRET_KEY = "secret123"
ALGORITHM = "HS256"

security = HTTPBearer()

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users_db.json")

def load_users():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}

def save_users(db):
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=4)

users_db = load_users()

class User(BaseModel):
    username: str
    password: str

# 🔐 hash password
def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# 🔐 verify password
def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# 🔐 create token
def create_token(username):
    return jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)

# 🔐 verify token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ REGISTER
@router.post("/register")
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User exists")

    users_db[user.username] = hash_password(user.password)
    save_users(users_db)
    return {"message": "Registered", "success": True}

# ✅ LOGIN
@router.post("/login")
def login(user: User):
    if user.username not in users_db:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, users_db[user.username]):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = create_token(user.username)
    return {"access_token": token, "success": True}

# 🔒 PROTECTED ROUTE
@router.get("/profile")
def profile(current_user: str = Depends(get_current_user)):
    return {"user": current_user, "success": True}