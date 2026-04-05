import traceback

try:
    from passlib.context import CryptContext
    import bcrypt
    print("bcrypt imported successfully:", bcrypt.__version__)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("test")
    print("Hash success!!")
except Exception as e:
    with open("test_hash_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("FAILED")
