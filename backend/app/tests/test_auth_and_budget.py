import pytest
from fastapi.testclient import TestClient
from app.main import app


# Δοκιμή 1: Ανάκτηση δημοσίων προφίλ οικογένειας
def test_get_profiles_success() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/auth/profiles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


# Δοκιμή 2 (Edge Case): Σύνδεση Admin χωρίς 4-ψηφιο PIN (αποτυγχάνει με 401)
def test_admin_login_without_pin_fails() -> None:
    with TestClient(app) as client:
        profiles_res = client.get("/api/v1/auth/profiles")
        profiles = profiles_res.json()
        admin_profile = next((p for p in profiles if p.get("role") == "admin"), None)

        if admin_profile:
            # Προσπάθεια σύνδεσης Admin χωρίς PIN
            login_res = client.post("/api/v1/auth/login-pin", json={"user_id": admin_profile["id"]})
            assert login_res.status_code == 401
            assert "PIN" in login_res.json()["detail"]


# Δοκιμή 3: Σύνδεση Admin με σωστό 4-ψηφιο PIN ("1234")
def test_admin_login_with_correct_pin_succeeds() -> None:
    with TestClient(app) as client:
        profiles_res = client.get("/api/v1/auth/profiles")
        profiles = profiles_res.json()
        admin_profile = next((p for p in profiles if p.get("role") == "admin"), None)

        if admin_profile:
            login_res = client.post("/api/v1/auth/login-pin", json={"user_id": admin_profile["id"], "pin": "1234"})
            assert login_res.status_code == 200
            token_data = login_res.json()
            assert "access_token" in token_data
            assert token_data["token_type"] == "bearer"


# Δοκιμή 4: Σύνδεση απλού χρήστη (Ελεύθερη είσοδος χωρίς PIN)
def test_regular_user_free_entry_succeeds() -> None:
    with TestClient(app) as client:
        profiles_res = client.get("/api/v1/auth/profiles")
        profiles = profiles_res.json()
        user_profile = next((p for p in profiles if p.get("role") == "user"), None)

        if user_profile:
            login_res = client.post("/api/v1/auth/login-pin", json={"user_id": user_profile["id"]})
            assert login_res.status_code == 200
            token_data = login_res.json()
            assert "access_token" in token_data

