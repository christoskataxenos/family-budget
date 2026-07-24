import pytest
from fastapi.testclient import TestClient
from app.main import app


# Δοκιμαστικός πελάτης (TestClient) για κλήσεις στο API
client = TestClient(app)


# Δοκιμή 1 (Minimal Passing Test): Έλεγχος του Healthcheck Endpoint
def test_health_check_returns_200():
    with TestClient(app) as client:
        # Εκτέλεση αιτήματος στο /health
        response = client.get("/health")

        # Επαλήθευση ότι ο κωδικός απόκρισης είναι 200 OK
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


# Δοκιμή 2 (Failing Edge-Case Test): Προσπάθεια προσβάσεως σε προστατευμένες συναλλαγές χωρίς JWT token
def test_get_transactions_unauthorized_fails():
    with TestClient(app) as client:
        # Εκτέλεση αιτήματος στο /api/v1/transactions χωρίς επικεφαλίδα Authorization
        response = client.get("/api/v1/transactions")

        # Επαλήθευση ότι η πρόσβαση απορρίπτεται με 401 Unauthorized
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in str(data["detail"]) or "διαπιστευτηρίων" in str(data["detail"])



# Παράδειγμα τυπικής χρήσης (10-20 γραμμές) για επίδειξη κλήσης API
def example_typical_api_usage():
    # Παράδειγμα payload για προσθήκη εξόδου
    sample_expense = {
        "amount": -45.50,
        "category": "Groceries",
        "date": "2026-07-24",
        "description": "Weekly supermarket shopping",
        "is_shared": True
    }
    
    # Εκτύπωση δομής παραδείγματος
    print(f"Παράδειγμα αιτήματος δημιουργίας συναλλαγής: {sample_expense}")
    return sample_expense
