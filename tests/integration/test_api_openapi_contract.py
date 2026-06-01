"""Integration tests: FastAPI OpenAPI contract."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    from affectlog.api.main import app
    return TestClient(app)


def test_healthz(client):
    resp = client.get("/healthz")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_readyz(client):
    resp = client.get("/readyz")
    assert resp.status_code == 200


def test_openapi_json(client):
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    spec = resp.json()
    assert spec["openapi"].startswith("3.")
    assert "paths" in spec
    assert "/healthz" in spec["paths"]


def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "version" in data


def test_validate_missing_file(client):
    resp = client.post("/v1/datasets/validate", json={
        "file_path": "/nonexistent/file.csv",
        "schema_name": "maskott_csv_v1",
    })
    # Should return 200 with valid=False or error
    assert resp.status_code in (200, 400, 500)


def test_pdc_mock_evaluate(client):
    resp = client.post("/v1/pdc/mock/policies/evaluate", json={
        "policy_id": "test-policy-001",
        "asset_id": "test-asset",
        "consent_token": "",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is True


def test_register_dummy_model(client):
    resp = client.post("/v1/models/register", json={
        "model_path": "",
        "adapter_type": "dummy",
        "feature_names": ["f1", "f2", "f3"],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "model_id" in data
    return data["model_id"]


def test_predict_with_dummy_model(client):
    # Register first
    reg = client.post("/v1/models/register", json={
        "model_path": "",
        "adapter_type": "dummy",
        "feature_names": ["f1", "f2"],
    })
    model_id = reg.json()["model_id"]
    # Predict
    resp = client.post(f"/v1/models/{model_id}/predict", json={
        "instances": [[1.0, 2.0], [3.0, 4.0]],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["predictions"]) == 2
