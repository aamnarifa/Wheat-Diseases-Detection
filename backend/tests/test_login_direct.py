import traceback

def test():
    try:
        from api.auth import login, User
        res = login(User(username="aamnarifa@gmail.com", password="password"))
        print("Success:", res)
    except Exception as e:
        traceback.print_exc()

test()
