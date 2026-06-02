"""
Admin API routes — pending registrations, user management, audit log, system health.
All routes require admin permissions.
"""
from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from affectlog.auth.audit_log import log_event
from affectlog.auth.dependencies import require_permission
from affectlog.auth.onboarding import (
    approve_registration,
    reject_registration,
    resend_activation,
)
from affectlog.auth.permissions import P
from affectlog.config import get_settings
from affectlog.core.email import send_email, send_registration_approved, send_registration_rejected
from affectlog.db.models import (
    AuditLogEntry,
    PendingRegistration,
    Role,
    User,
    UserRole,
    Workspace,
)
from affectlog.db.session import get_db
from affectlog.schemas.users import (
    AdminUserOut,
    ApproveRegistrationRequest,
    AssignRolesRequest,
    AuditLogEntryOut,
    PendingRegistrationOut,
    RejectRegistrationRequest,
    RequestMoreInfoRequest,
    WorkspaceOut,
)
from affectlog.version import __version__

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])

_require_approve = require_permission(P.USERS_APPROVE)
_require_user_manage = require_permission(P.USERS_UPDATE)
_require_audit_logs = require_permission(P.AUDIT_LOGS_READ)
_require_system = require_permission(P.SYSTEM_READ)


# ── Pending Registrations ────────────────────────────────────────────────

@router.get("/pending-registrations", response_model=list[PendingRegistrationOut])
async def list_pending_registrations(
    status_filter: str | None = Query("pending"),
    _actor: Any = Depends(_require_approve),
    db: AsyncSession = Depends(get_db),
) -> list[PendingRegistration]:
    q = select(PendingRegistration).order_by(PendingRegistration.created_at.desc())
    if status_filter:
        q = q.where(PendingRegistration.status == status_filter)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post("/pending-registrations/{reg_id}/approve", status_code=200)
async def approve(
    reg_id: UUID,
    body: ApproveRegistrationRequest,
    actor: Any = Depends(_require_approve),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    settings = get_settings()
    new_user, activation_token = await approve_registration(
        db,
        registration_id=reg_id,
        approver=actor,
        role_name=body.role_name,
        workspace_slug=body.workspace_slug,
        access_expires_at=body.access_expires_at,
        admin_notes=body.admin_notes,
    )

    await send_registration_approved(
        new_user.email,
        new_user.full_name,
        activation_token,
        body.role_name,
    )

    response: dict[str, Any] = {
        "status": "approved",
        "user_id": str(new_user.id),
    }
    if settings.dev_show_activation_link and not settings.is_production:
        response["dev_activation_token"] = activation_token
    return response


@router.post("/pending-registrations/{reg_id}/reject", status_code=200)
async def reject(
    reg_id: UUID,
    body: RejectRegistrationRequest,
    actor: Any = Depends(_require_approve),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    reg_result = await db.execute(select(PendingRegistration).where(PendingRegistration.id == reg_id))
    reg = reg_result.scalar_one_or_none()
    if reg is None:
        raise HTTPException(status_code=404, detail="Not found.")

    await reject_registration(db, registration_id=reg_id, approver=actor, admin_notes=body.admin_notes)
    await send_registration_rejected(reg.email, reg.full_name, body.admin_notes)
    return {"status": "rejected"}


@router.post("/pending-registrations/{reg_id}/request-info", status_code=200)
async def request_more_info(
    reg_id: UUID,
    body: RequestMoreInfoRequest,
    _actor: Any = Depends(_require_approve),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    reg_result = await db.execute(select(PendingRegistration).where(PendingRegistration.id == reg_id))
    reg = reg_result.scalar_one_or_none()
    if reg is None:
        raise HTTPException(status_code=404, detail="Not found.")

    reg.status = "more_info_requested"
    await db.flush()
    await send_email(
        to=reg.email,
        subject="AffectLog: Additional information required",
        template="request_more_information",
        context={
            "full_name": reg.full_name,
            "questions": body.questions,
            "app_base_url": get_settings().app_base_url,
        },
    )
    return {"status": "more_info_requested"}


# ── User Management ───────────────────────────────────────────────────────

@router.get("/users", response_model=list[AdminUserOut])
async def list_users(
    _actor: Any = Depends(_require_user_manage),
    db: AsyncSession = Depends(get_db),
) -> list[AdminUserOut]:
    result = await db.execute(
        select(User).options(selectinload(User.user_roles).selectinload(UserRole.role))
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    out = []
    for u in users:
        obj = AdminUserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            organization=u.organization,
            is_active=u.is_active,
            is_superadmin=u.is_superadmin,
            must_change_password=u.must_change_password,
            mfa_enabled=u.mfa_enabled,
            failed_login_count=u.failed_login_count,
            last_login_at=u.last_login_at,
            created_at=u.created_at,
            roles=[ur.role.name for ur in u.user_roles],
        )
        out.append(obj)
    return out


@router.post("/users/{user_id}/disable", status_code=200)
async def disable_user(
    user_id: UUID,
    actor: Any = Depends(require_permission(P.USERS_DISABLE)),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.is_superadmin and not actor.is_superadmin:
        raise HTTPException(status_code=403, detail="Cannot disable superadmin.")
    user.is_active = False
    await db.flush()
    await log_event(db, "admin.user.disabled", actor_id=actor.id, resource_type="user", resource_id=str(user_id))
    return {"status": "disabled"}


@router.post("/users/{user_id}/resend-activation", status_code=200)
async def resend_activation_email(
    user_id: UUID,
    actor: Any = Depends(_require_approve),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    plain = await resend_activation(db, user=user, admin=actor)
    await send_registration_approved(user.email, user.full_name, plain, "assigned role")
    resp: dict[str, Any] = {"status": "resent"}
    settings = get_settings()
    if settings.dev_show_activation_link and not settings.is_production:
        resp["dev_activation_token"] = plain
    return resp


@router.patch("/users/{user_id}/roles", status_code=200)
async def assign_roles(
    user_id: UUID,
    body: AssignRolesRequest,
    actor: Any = Depends(require_permission(P.USERS_ASSIGN_ROLES)),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    # Remove existing roles, add new
    existing = await db.execute(select(UserRole).where(UserRole.user_id == user_id))
    for ur in existing.scalars().all():
        await db.delete(ur)

    for rname in body.role_names:
        role_result = await db.execute(select(Role).where(Role.name == rname))
        role = role_result.scalar_one_or_none()
        if role:
            db.add(UserRole(user_id=user_id, role_id=role.id))

    await db.flush()
    await log_event(
        db, "admin.user.roles_assigned",
        actor_id=actor.id,
        resource_type="user",
        resource_id=str(user_id),
        detail=f"roles={body.role_names}",
    )
    return {"status": "ok"}


# ── Audit Log ─────────────────────────────────────────────────────────────

@router.get("/audit-log", response_model=list[AuditLogEntryOut])
async def get_audit_log(
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    _actor: Any = Depends(_require_audit_logs),
    db: AsyncSession = Depends(get_db),
) -> list[AuditLogEntry]:
    result = await db.execute(
        select(AuditLogEntry)
        .order_by(AuditLogEntry.logged_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


# ── Email / System ─────────────────────────────────────────────────────────

@router.get("/email/templates")
async def list_email_templates(
    _actor: Any = Depends(_require_system),
) -> list[str]:
    return [
        "registration_received",
        "registration_approved_activation",
        "registration_rejected",
        "request_more_information",
        "password_reset",
        "admin_new_registration_notification",
        "security_alert",
    ]


@router.post("/email/test")
async def test_email(
    to: str,
    template: str = "registration_received",
    _actor: Any = Depends(_require_system),
) -> dict[str, str]:
    from affectlog.core.email import send_email
    await send_email(
        to=to,
        subject="[TEST] AffectLog email test",
        template=template,
        context={"full_name": "Test User", "app_base_url": get_settings().app_base_url},
    )
    return {"status": "sent_or_logged"}


@router.get("/system/health")
async def system_health(
    _actor: Any = Depends(_require_system),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    user_count = await db.execute(select(func.count(User.id)))
    pending_count = await db.execute(
        select(func.count(PendingRegistration.id)).where(PendingRegistration.status == "pending")
    )
    return {
        "status": "ok",
        "version": __version__,
        "users": user_count.scalar(),
        "pending_registrations": pending_count.scalar(),
    }


# ── Workspaces ─────────────────────────────────────────────────────────────

@router.get("/workspaces", response_model=list[WorkspaceOut])
async def list_workspaces(
    _actor: Any = Depends(_require_user_manage),
    db: AsyncSession = Depends(get_db),
) -> list[Workspace]:
    result = await db.execute(select(Workspace).order_by(Workspace.slug))
    return list(result.scalars().all())
