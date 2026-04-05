import traceback
import sys

try:
    from api.auth import register, User
    res = register(User(username="another_user", password="123"))
    print("Success:", res)
except Exception as e:
    with open("test_direct_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("FAILED")
