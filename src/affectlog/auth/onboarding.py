"""
Admin-approval onboarding — approve/reject registrations, create active users,
generate activation tokens.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.audit_log import log_event
from affectlog.auth.password import hash_password
from affectlog.auth.tokens import activation_expiry, generate_token
from affectlog.db.models import (
    ActivationToken,
    PendingRegistration,
    Role,
    User,
    UserRole,
    Workspace,
    WorkspaceMembership,
)

logger = logging.getLogger(__name__)


async def approve_registration(
    db: AsyncSession,
    *,
    registration_id: uuid.UUID,
    approver: User,
    role_name: str = "Viewer",
    workspace_slug: str = "default",
    access_expires_at: datetime | None = None,
    admin_notes: str | None = None,
) -> tuple[User, str]:
    """
    Approve a pending registration.

    Returns (new_user, activation_token_plaintext).
    The plaintext token must be emailed or shown in dev mode only once.
    """
    reg_result = await db.execute(
        select(PendingRegistration).where(
            PendingRegistration.id == registration_id,
            PendingRegistration.status == "pending",
        )
    )
    reg = reg_result.scalar_one_or_none()
    if reg is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404, detail="Pending registration not found or already processed."
        )

    # Create user (inactive until token activation)
    new_user = User(
        id=uuid.uuid4(),
        email=reg.email,
        full_name=reg.full_name,
        organization=reg.organization,
        hashed_password=hash_password(uuid.uuid4().hex + uuid.uuid4().hex),  # unusable until reset
        is_active=False,
        is_superadmin=False,
        must_change_password=True,
    )
    db.add(new_user)
    await db.flush()

    # Assign role
    role_result = await db.execute(select(Role).where(Role.name == role_name))
    role = role_result.scalar_one_or_none()
    if role:
        db.add(UserRole(user_id=new_user.id, role_id=role.id))

    # Assign workspace
    ws_result = await db.execute(select(Workspace).where(Workspace.slug == workspace_slug))
    ws = ws_result.scalar_one_or_none()
    if ws:
        db.add(WorkspaceMembership(user_id=new_user.id, workspace_id=ws.id))

    # Create activation token
    plain, digest = generate_token()
    db.add(
        ActivationToken(
            user_id=new_user.id,
            token_hash=digest,
            expires_at=activation_expiry(),
        )
    )

    # Update registration record
    reg.status = "approved"
    reg.reviewed_by_id = approver.id
    reg.reviewed_at = datetime.now(UTC)
    reg.admin_notes = admin_notes
    reg.access_expires_at = access_expires_at

    await db.flush()
    await log_event(
        db,
        "registration.approved",
        actor_id=approver.id,
        actor_email=approver.email,
        resource_type="pending_registration",
        resource_id=str(registration_id),
        detail=f"Assigned role={role_name}, workspace={workspace_slug}",
    )
    logger.info(
        "Registration %s approved → user %s created",
        str(registration_id).replace("\n", "\\n"),
        new_user.id,
    )
    return new_user, plain


async def reject_registration(
    db: AsyncSession,
    *,
    registration_id: uuid.UUID,
    approver: User,
    admin_notes: str | None = None,
) -> None:
    reg_result = await db.execute(
        select(PendingRegistration).where(
            PendingRegistration.id == registration_id,
            PendingRegistration.status == "pending",
        )
    )
    reg = reg_result.scalar_one_or_none()
    if reg is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Pending registration not found.")

    reg.status = "rejected"
    reg.reviewed_by_id = approver.id
    reg.reviewed_at = datetime.now(UTC)
    reg.admin_notes = admin_notes
    await db.flush()
    await log_event(
        db,
        "registration.rejected",
        actor_id=approver.id,
        actor_email=approver.email,
        resource_type="pending_registration",
        resource_id=str(registration_id),
    )


async def activate_account(
    db: AsyncSession,
    *,
    token_plain: str,
    new_password: str,
) -> User:
    """
    Activate account via one-time token, set password.
    Token is consumed (marked used) and user is activated.
    """
    from affectlog.auth.tokens import hash_token, is_expired

    digest = hash_token(token_plain)
    token_result = await db.execute(
        select(ActivationToken).where(
            ActivationToken.token_hash == digest,
            ActivationToken.used_at.is_(None),
        )
    )
    token = token_result.scalar_one_or_none()
    if token is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Invalid or already used activation token.")
    if is_expired(token.expires_at):
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Activation token has expired.")

    user_result = await db.execute(select(User).where(User.id == token.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="User not found.")

    from affectlog.auth.password import hash_password

    user.hashed_password = hash_password(new_password)
    user.is_active = True
    user.must_change_password = False
    token.used_at = datetime.now(UTC)
    await db.flush()
    await log_event(
        db,
        "account.activated",
        actor_id=user.id,
        actor_email=user.email,
        resource_type="user",
        resource_id=str(user.id),
    )
    return user


async def resend_activation(
    db: AsyncSession,
    *,
    user: User,
    admin: User,
) -> str:
    """Invalidate old tokens and generate a new activation token. Returns plaintext."""
    from sqlalchemy import update

    await db.execute(
        update(ActivationToken)
        .where(ActivationToken.user_id == user.id, ActivationToken.used_at.is_(None))
        .values(used_at=datetime.now(UTC))
    )
    plain, digest = generate_token()
    db.add(
        ActivationToken(
            user_id=user.id,
            token_hash=digest,
            expires_at=activation_expiry(),
        )
    )
    await db.flush()
    await log_event(
        db,
        "activation.resent",
        actor_id=admin.id,
        actor_email=admin.email,
        resource_type="user",
        resource_id=str(user.id),
    )
    return plain
