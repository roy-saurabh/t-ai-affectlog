"""
RBAC helpers — load user permissions from DB and check them.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from affectlog.db.models import Role, RolePermission, UserRole


async def get_user_permissions(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
    """Return the full set of permission strings for a user (via roles)."""
    result = await db.execute(
        select(UserRole)
        .where(UserRole.user_id == user_id)
        .options(
            selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
            .selectinload(RolePermission.permission)
        )
    )
    user_roles = result.scalars().all()
    perms: set[str] = set()
    for ur in user_roles:
        for rp in ur.role.role_permissions:
            perms.add(rp.permission.name)
    return perms


async def user_has_permission(db: AsyncSession, user_id: uuid.UUID, permission: str) -> bool:
    perms = await get_user_permissions(db, user_id)
    return permission in perms


async def get_user_role_names(db: AsyncSession, user_id: uuid.UUID) -> list[str]:
    result = await db.execute(
        select(UserRole).where(UserRole.user_id == user_id).options(selectinload(UserRole.role))
    )
    return [ur.role.name for ur in result.scalars().all()]
