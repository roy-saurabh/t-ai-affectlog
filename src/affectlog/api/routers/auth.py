"""
Auth API routes — login, logout, me, change-password, MFA scaffold.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.audit_log import log_event
from affectlog.auth.dependencies import SESSION_COOKIE, get_current_user
from affectlog.auth.password import hash_password, needs_rehash, verify_password
from affectlog.auth.rbac import get_user_permissions, get_user_role_names
from affectlog.auth.sessions import create_session, revoke_session
from affectlog.config import get_settings
from affectlog.db.models import User, Workspace, WorkspaceMembership
from affectlog.db.session import get_db
from affectlog.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MeResponse,
    UserOut,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])

_RESP_401 = {status.HTTP_401_UNAUTHORIZED: {"description": "Invalid credentials."}}
_RESP_400 = {status.HTTP_400_BAD_REQUEST: {"description": "Bad request."}}


@router.post("/login", responses=_RESP_401)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, Any]:
    settings = get_settings()
    ip = request.client.host if request.client else None

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    async def fail(detail: str) -> None:
        if user:
            user.failed_login_count += 1
            if user.failed_login_count >= settings.max_failed_logins:
                from datetime import timedelta

                user.locked_until = datetime.now(UTC) + timedelta(seconds=settings.lockout_seconds)
            await db.flush()
            await log_event(
                db,
                "auth.login.failed",
                actor_email=body.email,
                resource_type="user",
                resource_id=str(user.id) if user else None,
                detail=detail,
                ip_address=ip,
                success=False,
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

    if user is None:
        await log_event(
            db, "auth.login.unknown_email", actor_email=body.email, ip_address=ip, success=False
        )
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not user.is_active:
        await fail("Account is not active.")

    if user.locked_until and user.locked_until > datetime.now(UTC):
        await fail("Account temporarily locked. Try again later.")

    if not verify_password(body.password, user.hashed_password):
        await fail("Invalid credentials.")

    if needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(body.password)

    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = datetime.now(UTC)
    token = await create_session(
        db, user, ip_address=ip, user_agent=request.headers.get("user-agent")
    )
    await db.flush()

    await log_event(
        db,
        "auth.login.success",
        actor_id=user.id,
        actor_email=user.email,
        resource_type="user",
        resource_id=str(user.id),
        ip_address=ip,
    )

    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=settings.cookie_httponly,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=settings.session_ttl_seconds,
    )
    roles = await get_user_role_names(db, user.id)
    return {
        "status": "ok",
        "must_change_password": user.must_change_password,
        "roles": roles,
    }


@router.post("/logout")
async def logout(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> dict[str, str]:
    if session_token:
        await revoke_session(db, session_token)
    response.delete_cookie(SESSION_COOKIE)
    return {"status": "ok"}


@router.get("/me", response_model=MeResponse)
async def me(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MeResponse:
    roles = await get_user_role_names(db, user.id)
    perms = await get_user_permissions(db, user.id)
    ws_result = await db.execute(
        select(Workspace)
        .join(WorkspaceMembership, Workspace.id == WorkspaceMembership.workspace_id)
        .where(WorkspaceMembership.user_id == user.id)
    )
    workspaces = [ws.slug for ws in ws_result.scalars().all()]

    return MeResponse(
        user=UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            organization=user.organization,
            is_active=user.is_active,
            is_superadmin=user.is_superadmin,
            must_change_password=user.must_change_password,
            mfa_enabled=user.mfa_enabled,
            roles=roles,
            permissions=perms,
        ),
        workspaces=workspaces,
    )


@router.post("/change-password", responses=_RESP_400)
async def change_password(
    body: ChangePasswordRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    user.hashed_password = hash_password(body.new_password)
    user.must_change_password = False
    await db.flush()
    await log_event(
        db,
        "auth.password.changed",
        actor_id=user.id,
        actor_email=user.email,
        resource_type="user",
        resource_id=str(user.id),
    )
    return {"status": "ok"}


@router.post("/mfa/setup")
async def mfa_setup(user: Annotated[User, Depends(get_current_user)]) -> dict[str, str]:
    """Scaffold: returns TOTP secret for setup. Full TOTP not yet enforced in this release."""
    import pyotp

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="AffectLog")
    return {"secret": secret, "provisioning_uri": provisioning_uri}


@router.post("/mfa/verify", responses=_RESP_400)
async def mfa_verify(
    code: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    if not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not set up.")
    import pyotp

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid MFA code.")
    user.mfa_enabled = True
    await db.flush()
    return {"status": "ok"}
