"""
Request-scoped tenant context.

In community (single-tenant) mode, tenant_id is always None.
In managed mode, tenant_id is resolved from the authenticated user's
TenantMembership and injected via FastAPI dependency.

Usage:
    from affectlog.tenancy.context import get_tenant_id, require_tenant

    @router.get("/datasets")
    async def list_datasets(
        tenant_id: uuid.UUID | None = Depends(get_tenant_id),
        db: AsyncSession = Depends(get_db),
    ):
        q = select(Dataset)
        if tenant_id:
            q = q.where(Dataset.tenant_id == tenant_id)
        ...
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.dependencies import get_current_user
from affectlog.db.session import get_db
from affectlog.editions.base import get_tenant_mode


async def get_tenant_id(
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID | None:
    """
    Resolve the tenant context for the authenticated user.
    Returns None in single-tenant / community mode.
    """
    if get_tenant_mode() == "single_tenant":
        return None

    # Lazy import to avoid circular deps when tenancy models aren't migrated
    try:
        from affectlog.tenancy.models import TenantMembership
        result = await db.execute(
            select(TenantMembership)
            .where(TenantMembership.user_id == current_user.id)
            .where(TenantMembership.is_active.is_(True))
            .limit(1)
        )
        membership = result.scalar_one_or_none()
        if membership:
            return membership.tenant_id
    except Exception:
        pass

    return None


async def require_tenant(
    tenant_id: uuid.UUID | None = Depends(get_tenant_id),
) -> uuid.UUID:
    """Dependency that requires a tenant context. Raises 403 if none resolved."""
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint requires a tenant context.",
        )
    return tenant_id
