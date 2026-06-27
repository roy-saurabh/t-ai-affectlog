"""
Public API routes — registration, password reset, activation, config.
No authentication required.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.onboarding import activate_account
from affectlog.auth.registration import create_pending_registration
from affectlog.auth.tokens import generate_token, hash_token, is_expired, password_reset_expiry
from affectlog.config import get_settings
from affectlog.core.email import (
    send_password_reset,
    send_registration_received,
)
from affectlog.db.models import PasswordResetToken, User
from affectlog.db.session import get_db
from affectlog.schemas.auth import (
    ActivateRequest,
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
    RegisterRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/config")
async def public_config() -> dict[str, Any]:
    settings = get_settings()
    return {
        "public_registration_enabled": settings.public_registration_enabled,
        "admin_approval_required": settings.admin_approval_required,
        "app_name": "AffectLog Trustworthy AI Assessment",
        "version": "1.0.0",
    }


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    responses={403: {"description": "Public registration is currently closed."}},
)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    settings = get_settings()
    if not settings.public_registration_enabled:
        raise HTTPException(status_code=403, detail="Public registration is currently closed.")

    ip = request.client.host if request.client else None
    reg = await create_pending_registration(
        db,
        full_name=body.full_name,
        email=body.email,
        organization=body.organization,
        role_description=body.role_description,
        requested_access_profile=body.requested_access_profile,
        reason_for_access=body.reason_for_access,
        agreed_to_coc=body.agreed_to_coc,
        agreed_to_data_governance=body.agreed_to_data_governance,
        ip_address=ip,
    )

    await send_registration_received(body.email, body.full_name)
    return {
        "status": "pending",
        "message": "Your registration has been received. An administrator will review your request.",
        "registration_id": str(reg.id),
    }


@router.post("/activate")
async def activate(
    body: ActivateRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    await activate_account(db, token_plain=body.token, new_password=body.new_password)
    return {"status": "activated", "message": "Account activated. You can now log in."}


@router.post("/password-reset/request")
async def password_reset_request(
    body: PasswordResetRequestIn,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(
        select(User).where(User.email == body.email, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()

    if user is not None:
        plain, digest = generate_token()
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=digest,
                expires_at=password_reset_expiry(),
            )
        )
        await db.flush()
        await send_password_reset(user.email, user.full_name, plain)

    # Always return 200 to avoid user enumeration
    return {"status": "ok", "message": "If that email exists, a password reset link has been sent."}


@router.post(
    "/password-reset/confirm",
    responses={400: {"description": "Invalid or expired reset token."}},
)
async def password_reset_confirm(
    body: PasswordResetConfirmIn,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    digest = hash_token(body.token)
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == digest,
            PasswordResetToken.used_at.is_(None),
        )
    )
    token = result.scalar_one_or_none()
    if token is None or is_expired(token.expires_at):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user_result = await db.execute(
        select(User).where(User.id == token.user_id, User.is_active == True)  # noqa: E712
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid token.")

    from affectlog.auth.password import hash_password

    user.hashed_password = hash_password(body.new_password)
    user.must_change_password = False
    token.used_at = datetime.now(UTC)
    await db.flush()
    return {"status": "ok", "message": "Password updated. You can now log in."}
