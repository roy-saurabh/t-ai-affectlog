"""
Tenant quota enforcement.

Checks usage records against tenant quotas before allowing operations.
Community Edition has no quota enforcement; quotas only apply in managed mode.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.editions.base import get_deployment_mode


async def check_audit_run_quota(tenant_id: uuid.UUID, db: AsyncSession) -> None:
    """Raise 429 if the tenant has exhausted their monthly audit run quota."""
    if get_deployment_mode() == "community":
        return

    try:
        from affectlog.tenancy.models import TenantQuota, UsageRecord

        period = datetime.now(UTC).strftime("%Y-%m")

        quota_res = await db.execute(select(TenantQuota).where(TenantQuota.tenant_id == tenant_id))
        quota = quota_res.scalar_one_or_none()
        if not quota:
            return

        usage_res = await db.execute(
            select(UsageRecord)
            .where(UsageRecord.tenant_id == tenant_id)
            .where(UsageRecord.period_month == period)
        )
        usage = usage_res.scalar_one_or_none()
        if usage and usage.audit_runs >= quota.max_audit_runs_per_month:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Monthly audit run quota exceeded ({quota.max_audit_runs_per_month}).",
            )
    except HTTPException:
        raise
    except Exception:
        pass


async def increment_usage(
    tenant_id: uuid.UUID,
    db: AsyncSession,
    *,
    audit_runs: int = 0,
    rows_processed: int = 0,
    jobs_run: int = 0,
    exports_generated: int = 0,
    model_explanation_runs: int = 0,
    api_calls: int = 0,
) -> None:
    """Increment usage counters for the current period."""
    if get_deployment_mode() == "community":
        return

    try:
        from sqlalchemy.dialects.postgresql import insert as pg_insert

        from affectlog.tenancy.models import UsageRecord

        period = datetime.now(UTC).strftime("%Y-%m")
        stmt = (
            pg_insert(UsageRecord)
            .values(
                tenant_id=tenant_id,
                period_month=period,
                audit_runs=audit_runs,
                rows_processed=rows_processed,
                jobs_run=jobs_run,
                exports_generated=exports_generated,
                model_explanation_runs=model_explanation_runs,
                api_calls=api_calls,
            )
            .on_conflict_do_update(
                index_elements=["tenant_id", "period_month"],
                set_={
                    "audit_runs": UsageRecord.audit_runs + audit_runs,
                    "rows_processed": UsageRecord.rows_processed + rows_processed,
                    "jobs_run": UsageRecord.jobs_run + jobs_run,
                    "exports_generated": UsageRecord.exports_generated + exports_generated,
                    "model_explanation_runs": UsageRecord.model_explanation_runs
                    + model_explanation_runs,
                    "api_calls": UsageRecord.api_calls + api_calls,
                },
            )
        )
        await db.execute(stmt)
        await db.flush()
    except Exception:
        pass
