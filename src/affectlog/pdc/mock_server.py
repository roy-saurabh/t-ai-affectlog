"""
Mock PDC server for integration tests.
Runs as a simple FastAPI app on a local port.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

mock_pdc = FastAPI(title="Mock PDC Server")


@mock_pdc.post("/artifacts/request")
async def mock_artifact_request(body: dict) -> dict:  # type: ignore[type-arg]
    return {"status": "mock", "artifacts": [], "policy_id": body.get("policy_id")}


@mock_pdc.post("/policies/evaluate")
async def mock_policy_eval(body: dict) -> dict:  # type: ignore[type-arg]
    return {"allowed": True, "reason": "mock_always_allow"}


def get_mock_pdc_client() -> TestClient:
    return TestClient(mock_pdc)
