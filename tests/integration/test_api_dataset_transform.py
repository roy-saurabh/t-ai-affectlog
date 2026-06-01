"""Integration tests: dataset validate + transform via API."""

import pytest
from pathlib import Path
from fastapi.testclient import TestClient

FIXTURE = str(Path(__file__).parent.parent / "fixtures" / "maskott_small.csv")


@pytest.fixture(scope="module")
def client():
    from affectlog.api.main import app
    return TestClient(app)


def test_validate_fixture_csv(client):
    resp = client.post("/v1/datasets/validate", json={
        "file_path": FIXTURE,
        "schema_name": "maskott_csv_v1",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["missing_columns"] == []


def test_ingest_then_get(client):
    resp = client.post("/v1/datasets/ingest", json={
        "file_path": FIXTURE,
        "schema_name": "maskott_csv_v1",
        "recipe": "maskott_tactileo",
    })
    assert resp.status_code == 200
    ds_id = resp.json()["dataset_id"]
    assert ds_id.startswith("ds_")

    resp2 = client.get(f"/v1/datasets/{ds_id}")
    assert resp2.status_code == 200
    assert resp2.json()["dataset_id"] == ds_id
