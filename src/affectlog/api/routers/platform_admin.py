"""
Platform Admin API — tenant management, usage, feature flags, support access.

All routes require is_superadmin or Platform Operator role.
These routes are gated behind the MULTI_TENANT feature flag.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.dependencies import require_permission
from affectlog.auth.permissions import P
from affectlog.db.session import get_db
from affectlog.editions.features import Feature
from affectlog.editions.gates import requires_feature

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/platform", tags=["platform-admin"])

_require_superadmin = require_permission(P.SYSTEM_READ)

# ── Schemas ─────────────────────────────────────────────────────────────────


class TenantCreate(BaseModel):
    slug: str
    name: str
    plan: str = "managed_cloud"
    description: str | None = None


class TenantPatch(BaseModel):
    name: str | None = None
    description: str | None = None
    plan: str | None = None


class TenantOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    plan: str
    status: str
    is_active: bool
    created_at: datetime
    suspended_at: datetime | None = None

    class Config:
        from_attributes = True


class FeatureFlagPatch(BaseModel):
    feature: str
    enabled: bool


class SuspendTenantRequest(BaseModel):
    reason: str


class TenantFeatureFlagOut(BaseModel):
    feature: str
    enabled: bool
    set_by: str | None = None
    set_at: datetime

    class Config:
        from_attributes = True


# ── Tenant CRUD ──────────────────────────────────────────────────────────────


@router.get(
    "/tenants",
    response_model=list[TenantOut],
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def list_tenants(
    status_filter: str | None = Query(None),
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> list[Any]:
    from affectlog.tenancy.models import Tenant

    q = select(Tenant).order_by(Tenant.created_at.desc())
    if status_filter:
        q = q.where(Tenant.status == status_filter)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post(
    "/tenants",
    response_model=TenantOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def create_tenant(
    body: TenantCreate,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    from affectlog.tenancy.models import Tenant, TenantQuota, TenantSettings

    existing = await db.execute(select(Tenant).where(Tenant.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Tenant slug already exists.")

    tenant = Tenant(
        slug=body.slug,
        name=body.name,
        plan=body.plan,
        description=body.description,
        status="active",
        is_active=True,
    )
    db.add(tenant)
    await db.flush()

    db.add(TenantQuota(tenant_id=tenant.id))
    db.add(TenantSettings(tenant_id=tenant.id))
    await db.flush()

    logger.info(
        "Platform admin created tenant %s (slug=%s)",
        tenant.id,
        str(body.slug).replace("\n", "\\n").replace("\r", "\\r"),
    )
    return tenant


@router.get(
    "/tenants/{tenant_id}",
    response_model=TenantOut,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def get_tenant(
    tenant_id: uuid.UUID,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    from affectlog.tenancy.models import Tenant

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")
    return tenant


@router.patch(
    "/tenants/{tenant_id}",
    response_model=TenantOut,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def update_tenant(
    tenant_id: uuid.UUID,
    body: TenantPatch,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    from affectlog.tenancy.models import Tenant

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")
    if body.name is not None:
        tenant.name = body.name
    if body.description is not None:
        tenant.description = body.description
    if body.plan is not None:
        tenant.plan = body.plan
    await db.flush()
    return tenant


@router.post(
    "/tenants/{tenant_id}/suspend",
    status_code=200,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def suspend_tenant(
    tenant_id: uuid.UUID,
    body: SuspendTenantRequest,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    from affectlog.tenancy.models import Tenant

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")
    tenant.is_active = False
    tenant.status = "suspended"
    tenant.suspended_at = datetime.utcnow()
    tenant.suspended_reason = body.reason
    await db.flush()
    return {"status": "suspended"}


@router.post(
    "/tenants/{tenant_id}/activate",
    status_code=200,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def activate_tenant(
    tenant_id: uuid.UUID,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    from affectlog.tenancy.models import Tenant

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")
    tenant.is_active = True
    tenant.status = "active"
    tenant.suspended_at = None
    tenant.suspended_reason = None
    await db.flush()
    return {"status": "active"}


# ── Feature flags ─────────────────────────────────────────────────────────────


@router.get(
    "/tenants/{tenant_id}/feature-flags",
    response_model=list[TenantFeatureFlagOut],
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def list_tenant_feature_flags(
    tenant_id: uuid.UUID,
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> list[Any]:
    from affectlog.tenancy.models import TenantFeatureFlag

    result = await db.execute(
        select(TenantFeatureFlag).where(TenantFeatureFlag.tenant_id == tenant_id)
    )
    return list(result.scalars().all())


@router.patch(
    "/tenants/{tenant_id}/feature-flags",
    status_code=200,
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def set_tenant_feature_flag(
    tenant_id: uuid.UUID,
    body: FeatureFlagPatch,
    actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    from affectlog.tenancy.models import TenantFeatureFlag

    result = await db.execute(
        select(TenantFeatureFlag)
        .where(TenantFeatureFlag.tenant_id == tenant_id)
        .where(TenantFeatureFlag.feature == body.feature)
    )
    flag = result.scalar_one_or_none()
    if flag:
        flag.enabled = body.enabled
        flag.set_by = actor.email
        flag.set_at = datetime.utcnow()
    else:
        flag = TenantFeatureFlag(
            tenant_id=tenant_id,
            feature=body.feature,
            enabled=body.enabled,
            set_by=actor.email,
        )
        db.add(flag)
    await db.flush()
    return {"feature": body.feature, "enabled": body.enabled}


# ── Usage ─────────────────────────────────────────────────────────────────────


@router.get(
    "/usage",
    dependencies=[requires_feature(Feature.MULTI_TENANT)],
)
async def platform_usage(
    period: str | None = Query(None, description="YYYY-MM"),
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    from affectlog.tenancy.models import UsageRecord

    period_filter = period or datetime.utcnow().strftime("%Y-%m")
    result = await db.execute(select(UsageRecord).where(UsageRecord.period_month == period_filter))
    records = result.scalars().all()
    return {
        "period": period_filter,
        "tenant_count": len(records),
        "totals": {
            "audit_runs": sum(r.audit_runs for r in records),
            "rows_processed": sum(r.rows_processed for r in records),
            "exports_generated": sum(r.exports_generated for r in records),
            "api_calls": sum(r.api_calls for r in records),
        },
        "by_tenant": [
            {
                "tenant_id": str(r.tenant_id),
                "audit_runs": r.audit_runs,
                "rows_processed": r.rows_processed,
                "storage_bytes_used": r.storage_bytes_used,
            }
            for r in records
        ],
    }


# ── Managed access requests ───────────────────────────────────────────────────


@router.get("/access-requests")
async def list_access_requests(
    status_filter: str | None = Query("pending"),
    _actor: Any = Depends(_require_superadmin),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    from affectlog.tenancy.models import ManagedAccessRequest

    q = select(ManagedAccessRequest).order_by(ManagedAccessRequest.created_at.desc())
    if status_filter:
        q = q.where(ManagedAccessRequest.status == status_filter)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "email": r.email,
            "organization": r.organization,
            "country": r.country,
            "sector": r.sector,
            "deployment_pref": r.deployment_pref,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
