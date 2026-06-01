"""PDC / Prometheus-X connector endpoints (mock)."""

from __future__ import annotations

from fastapi import APIRouter

from affectlog.schemas.api import PDCPolicyRequest, PDCPolicyResponse

router = APIRouter(prefix="/v1/pdc", tags=["PDC"])


@router.post("/request-model-artifacts", summary="Request model artifacts via PDC (mock)")
async def request_model_artifacts(req: PDCPolicyRequest) -> dict:  # type: ignore[type-arg]
    return {
        "status": "mock_response",
        "policy_id": req.policy_id,
        "message": "PDC integration mock — configure AFFECTLOG_PDC_URL for real connector.",
        "artifacts": [],
    }


@router.post("/mock/policies/evaluate", response_model=PDCPolicyResponse, summary="Evaluate ODRL policy (mock)")
async def evaluate_policy(req: PDCPolicyRequest) -> PDCPolicyResponse:
    return PDCPolicyResponse(
        allowed=True,
        policy_id=req.policy_id,
        reason="Mock evaluation — always allows in test mode.",
    )
