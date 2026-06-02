"""
Feature gate enforcement for FastAPI routes.

Usage:
    from affectlog.editions.gates import requires_feature
    from affectlog.editions.features import Feature

    @router.get("/platform/tenants")
    async def list_tenants(
        _: None = Depends(requires_feature(Feature.MULTI_TENANT)),
    ):
        ...
"""
from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status

from affectlog.editions.base import get_feature


class FeatureGate:
    """Synchronous feature check (for use outside FastAPI dependency injection)."""

    def __init__(self, feature: str, tenant_overrides: dict[str, bool] | None = None) -> None:
        self.feature = feature
        self.tenant_overrides = tenant_overrides

    def is_enabled(self) -> bool:
        return get_feature(self.feature, self.tenant_overrides)

    def require(self) -> None:
        if not self.is_enabled():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{self.feature}' is not enabled in this deployment.",
            )


def requires_feature(feature: str) -> Any:
    """
    FastAPI dependency that raises 403 if the named feature is not enabled.
    Tenant-level override resolution is not yet wired here (future: inject tenant context).
    """
    def _dep() -> None:
        if not get_feature(feature):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature}' is not available in this edition.",
            )
    return Depends(_dep)
