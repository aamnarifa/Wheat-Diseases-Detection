import sys
import traceback

with open('test_out.txt', 'w') as f:
    try:
        from fastapi.testclient import TestClient
        from api.main import app
        client = TestClient(app)
        response = client.post("/auth/register", json={"username": "test_user", "password": "password"})
        f.write("Status code:" + str(response.status_code) + "\n")
        f.write("Response body:" + str(response.text) + "\n")
    except Exception as e:
        f.write("Exception caught!\n")
        traceback.print_exc(file=f)
