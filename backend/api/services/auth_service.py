import bcrypt
from jose import jwt
import os
from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL", "")

# Initialize MongoDB client
try:
    if MONGO_URL:
        client = MongoClient(MONGO_URL)
        db = client.get_default_database(default="wheatify")
        users_collection = db["users"]
    else:
        users_collection = None
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    users_collection = None

SECRET_KEY = os.getenv("SECRET_KEY", "secret123")
ALGORITHM = "HS256"

def get_user(username: str):
    if users_collection is not None:
        return users_collection.find_one({"username": username})
    return None

def create_user(username: str, hashed_password: str):
    if users_collection is not None:
        users_collection.insert_one({"username": username, "password": hashed_password})

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_token(username: str) -> str:
    return jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload["sub"]
