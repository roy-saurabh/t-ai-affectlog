"""
PDCClient — mock/stub for Prometheus-X Data Space Connector integration.

In production, configure AFFECTLOG_PDC_URL and AFFECTLOG_PDC_TOKEN.
This implementation provides a fully functional mock for tests and demos.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from affectlog.compliance.odrl import build_odrl_policy

logger = logging.getLogger(__name__)


class PDCClient:
    """Prometheus-X Data Space Connector client."""

    def __init__(self, url: str = "", token: str = "", mock: bool = True) -> None:
        self._url = url
        self._token = token
        self._mock = mock or not url
        if self._mock:
            logger.info("PDCClient running in MOCK mode.")

    def request_model_artifacts(
        self,
        policy_id: str,
        consent_token: str,
        artifact_ref: str,
    ) -> dict[str, Any]:
        """Request model artifacts from the PDC (data-minimized — no raw personal data)."""
        if self._mock:
            return {
                "status": "mock",
                "policy_id": policy_id,
                "artifact_ref": artifact_ref,
                "artifacts": [],
                "note": "Configure AFFECTLOG_PDC_URL for real connector.",
            }
        try:
            import httpx
            resp = httpx.post(
                f"{self._url}/artifacts/request",
                headers={"Authorization": f"Bearer {self._token}"},
                json={"policy_id": policy_id, "consent_token": consent_token, "artifact_ref": artifact_ref},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            from affectlog.exceptions import PDCError
            raise PDCError(f"PDC artifact request failed: {exc}") from exc

    def evaluate_policy(self, odrl_policy: dict[str, Any], request_context: dict[str, Any]) -> dict[str, Any]:
        """Evaluate an ODRL policy against a request context."""
        if self._mock:
            return {"allowed": True, "reason": "Mock evaluation"}
        try:
            import httpx
            resp = httpx.post(
                f"{self._url}/policies/evaluate",
                headers={"Authorization": f"Bearer {self._token}"},
                json={"policy": odrl_policy, "context": request_context},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            from affectlog.exceptions import PDCError
            raise PDCError(f"Policy evaluation failed: {exc}") from exc
