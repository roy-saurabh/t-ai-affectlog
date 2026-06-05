"""
Registration workflow — create PendingRegistration, emit notification.
"""

from __future__ import annotations

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.audit_log import log_event
from affectlog.db.models import PendingRegistration, User

logger = logging.getLogger(__name__)


async def create_pending_registration(
    db: AsyncSession,
    *,
    full_name: str,
    email: str,
    organization: str | None,
    role_description: str | None,
    requested_access_profile: str | None,
    reason_for_access: str | None,
    agreed_to_coc: bool,
    agreed_to_data_governance: bool,
    ip_address: str | None = None,
) -> PendingRegistration:
    existing = await db.execute(
        select(PendingRegistration).where(PendingRegistration.email == email)
    )
    if existing.scalar_one_or_none():
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A registration request with this email already exists.",
        )

    active_user = await db.execute(select(User).where(User.email == email))
    if active_user.scalar_one_or_none():
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    reg = PendingRegistration(
        id=uuid.uuid4(),
        full_name=full_name,
        email=email,
        organization=organization,
        role_description=role_description,
        requested_access_profile=requested_access_profile,
        reason_for_access=reason_for_access,
        agreed_to_coc=agreed_to_coc,
        agreed_to_data_governance=agreed_to_data_governance,
        status="pending",
        ip_address=ip_address,
    )
    db.add(reg)
    await db.flush()
    await log_event(
        db,
        "registration.submitted",
        actor_email=email,
        resource_type="pending_registration",
        resource_id=str(reg.id),
        ip_address=ip_address,
    )
    logger.info("New registration request from %s", email.replace("\n", "\\n").replace("\r", "\\r"))
    return reg
