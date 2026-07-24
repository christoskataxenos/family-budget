import pytest
from fastapi.testclient import TestClient
from app.main import app

# Δημιουργία δοκιμαστικού πελάτη (TestClient)
client = TestClient(app)


def test_export_unauthorized_fails() -> None:
    """
    Δοκιμή ασφαλείας: Έλεγχος ότι η πρόσβαση στα endpoints εξαγωγής χωρίς JWT token απορρίπτεται.
    """
    with TestClient(app) as test_client:
        # Δοκιμή εξαγωγής Excel χωρίς token
        response_excel = test_client.get("/api/v1/export/excel")
        assert response_excel.status_code == 401

        # Δοκιμή εξαγωγής PDF χωρίς token
        response_pdf = test_client.get("/api/v1/export/pdf")
        assert response_pdf.status_code == 401


def test_export_endpoints_structure() -> None:
    """
    Έλεγχος δομής και διαδρομών των δρομολογητών εξαγωγής.
    """
    routes = [route.path for route in app.routes]
    assert "/api/v1/export/excel" in routes
    assert "/api/v1/export/pdf" in routes
