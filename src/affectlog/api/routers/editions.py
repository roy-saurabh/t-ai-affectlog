"""
Editions and managed-access public API endpoints.
No authentication required.

  GET  /api/public/editions
  GET  /api/public/cloud
  POST /api/public/request-managed-access
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.config import get_settings
from affectlog.db.session import get_db
from affectlog.editions.base import get_deployment_mode, get_edition_defaults, get_tenant_mode
from affectlog.editions.features import Feature

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/public", tags=["public"])

_RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def _verify_recaptcha(token: str, remote_ip: str | None, action: str) -> None:
    """Raise HTTP 400 if reCAPTCHA token is invalid, low-score, or wrong action."""
    settings = get_settings()
    if not settings.recaptcha_enabled:
        return
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(
                _RECAPTCHA_VERIFY_URL,
                data={
                    "secret": settings.recaptcha_secret_key,
                    "response": token,
                    **({"remoteip": remote_ip} if remote_ip else {}),
                },
            )
        data = resp.json()
    except Exception as exc:
        logger.warning("reCAPTCHA verification request failed: %s", exc)
        raise HTTPException(status_code=503, detail="reCAPTCHA verification unavailable.") from None

    if not data.get("success"):
        raise HTTPException(status_code=400, detail="reCAPTCHA verification failed.")

    allowed = {h.strip() for h in settings.recaptcha_allowed_hostnames.split(",")}
    hostname = data.get("hostname", "")
    if allowed and hostname not in allowed:
        raise HTTPException(status_code=400, detail="reCAPTCHA hostname not allowed.")

    if data.get("action") != action:
        raise HTTPException(status_code=400, detail="reCAPTCHA action mismatch.")

    score = float(data.get("score", 0))
    if score < settings.recaptcha_min_score:
        raise HTTPException(status_code=400, detail="reCAPTCHA score too low.")


class ManagedAccessRequestIn(BaseModel):
    name: str
    email: EmailStr
    organization: str
    country: str
    sector: str
    intended_use: str
    expected_volume: str | None = None
    deployment_pref: str = "managed_cloud"
    compliance_needs: str | None = None
    message: str | None = None
    consent: bool
    recaptcha_token: str | None = None


@router.get("/editions")
async def editions_info() -> dict[str, Any]:
    mode = get_deployment_mode()
    tenant_mode = get_tenant_mode()
    defaults = get_edition_defaults()
    return {
        "deployment_mode": mode,
        "tenant_mode": tenant_mode,
        "edition": {
            "community": mode == "community",
            "managed": mode in ("managed", "enterprise_private"),
        },
        "features": {
            "multi_tenant": defaults.get(Feature.MULTI_TENANT, False),
            "managed_backups": defaults.get(Feature.MANAGED_BACKUPS, False),
            "support_access": defaults.get(Feature.SUPPORT_ACCESS, False),
            "enterprise_sso": defaults.get(Feature.ENTERPRISE_SSO, False),
        },
        "links": {
            "community_edition": "https://github.com/Prometheus-X-association/t-ai-affectlog",
            "managed_edition": "/cloud",
            "request_access": "/request-access",
            "prometheus_x": "https://prometheus-x.org/bb04-trustworthy-ai-assessment/",
        },
    }


@router.get("/cloud")
async def cloud_info() -> dict[str, Any]:
    return {
        "name": "AffectLog Managed Edition",
        "description": (
            "AffectLog-hosted and operated environment for organizations "
            "that want the same assessment workflows without managing infrastructure."
        ),
        "features": [
            "Multi-tenant workspace provisioning",
            "Admin-approved organization onboarding",
            "Managed backups and retention policies",
            "Platform monitoring and structured audit logs",
            "Managed email and notifications",
            "Usage metering and quota enforcement",
            "Support and upgrade path",
            "Optional private tenant deployment",
        ],
        "contact": "/request-access",
        "open_source_core": "https://github.com/Prometheus-X-association/t-ai-affectlog",
    }


@router.post(
    "/request-managed-access",
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {"description": "Validation or reCAPTCHA failure."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Consent is required."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Failed to save request."},
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "description": "reCAPTCHA verification unavailable."
        },
    },
)
async def request_managed_access(
    body: ManagedAccessRequestIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if not body.consent:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Consent is required.",
        )

    settings = get_settings()
    if settings.recaptcha_enabled:
        if not body.recaptcha_token:
            raise HTTPException(status_code=400, detail="reCAPTCHA token is required.")
        remote_ip = request.client.host if request.client else None
        await _verify_recaptcha(body.recaptcha_token, remote_ip, settings.recaptcha_contact_action)
    try:
        from affectlog.tenancy.models import ManagedAccessRequest

        req = ManagedAccessRequest(
            name=body.name,
            email=str(body.email),
            organization=body.organization,
            country=body.country,
            sector=body.sector,
            intended_use=body.intended_use,
            expected_volume=body.expected_volume,
            deployment_pref=body.deployment_pref,
            compliance_needs=body.compliance_needs,
            message=body.message,
            status="pending",
        )
        db.add(req)
        await db.flush()
        _email = str(body.email).replace("\n", "\\n").replace("\r", "\\r")
        _org = str(body.organization).replace("\n", "\\n").replace("\r", "\\r")
        logger.info("Managed access request from %s (%s)", _email, _org)
        return {
            "status": "received",
            "message": "Your request has been received. Our team will contact you within 2 business days.",
        }
    except Exception as exc:
        logger.exception("Failed to save access request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save request. Please try again.",
        ) from exc
