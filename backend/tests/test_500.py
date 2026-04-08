import requests
try:
    res = requests.post("http://127.0.0.1:8000/auth/register", json={"username": "test1", "password": "pw"})
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print(e)
