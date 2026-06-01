"""Integration tests: Mock PDC client."""

import pytest
from affectlog.pdc.client import PDCClient


def test_mock_pdc_request_artifacts():
    client = PDCClient(mock=True)
    result = client.request_model_artifacts(
        policy_id="policy-001",
        consent_token="token-abc",
        artifact_ref="model/artifact.onnx",
    )
    assert result["status"] == "mock"
    assert result["policy_id"] == "policy-001"


def test_mock_pdc_evaluate_policy():
    client = PDCClient(mock=True)
    from affectlog.compliance.odrl import build_odrl_policy
    policy = build_odrl_policy("pol-001", "asset-001")
    result = client.evaluate_policy(policy, {"requestor": "affectlog"})
    assert result["allowed"] is True


def test_mock_pdc_server():
    from affectlog.pdc.mock_server import get_mock_pdc_client
    tc = get_mock_pdc_client()
    resp = tc.post("/policies/evaluate", json={"policy": {}, "context": {}})
    assert resp.status_code == 200
    assert resp.json()["allowed"] is True
