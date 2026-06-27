#!/usr/bin/env python3
"""
Seed RBAC roles, permissions, and default workspaces.

Usage:
    python scripts/seed_rbac.py
    # or via Makefile:
    make seed
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.permissions import ALL_PERMISSIONS, ROLE_DEFAULTS
from affectlog.db.base import Base
from affectlog.db.models import Permission, Role, RolePermission, Workspace
from affectlog.db.session import AsyncSessionLocal, engine

DEFAULT_WORKSPACES = [
    ("default", "Default Workspace", False),
    ("demo", "Demo Workspace", False),
    ("maskott-tactileo", "Maskott / Tactileo", False),
    ("inokufu-becomino", "Inokufu / Becomino", False),
    ("public-samples", "Public Samples", True),
]


async def _seed_permissions(db: AsyncSession) -> dict[str, Permission]:
    """Upsert all known permissions and return a name → Permission map."""
    perm_map: dict[str, Permission] = {}
    for name, description in ALL_PERMISSIONS:
        result = await db.execute(select(Permission).where(Permission.name == name))
        perm = result.scalar_one_or_none()
        if perm is None:
            perm = Permission(name=name, description=description)
            db.add(perm)
            await db.flush()
            print(f"  + permission: {name}")
        perm_map[name] = perm
    return perm_map


async def _get_or_create_role(db: AsyncSession, role_name: str) -> Role:
    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalar_one_or_none()
    if role is None:
        role = Role(name=role_name, is_system=True)
        db.add(role)
        await db.flush()
        print(f"  + role: {role_name}")
    return role


async def _link_role_permission(db: AsyncSession, role: Role, perm: Permission) -> None:
    exists = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role.id,
            RolePermission.permission_id == perm.id,
        )
    )
    if exists.scalar_one_or_none() is None:
        db.add(RolePermission(role_id=role.id, permission_id=perm.id))


async def _seed_roles(db: AsyncSession, perm_map: dict[str, Permission]) -> None:
    for role_name, perm_names in ROLE_DEFAULTS.items():
        role = await _get_or_create_role(db, role_name)
        for pname in perm_names:
            perm = perm_map.get(pname)
            if perm is not None:
                await _link_role_permission(db, role, perm)


async def _seed_workspaces(db: AsyncSession) -> None:
    for slug, name, is_public in DEFAULT_WORKSPACES:
        result = await db.execute(select(Workspace).where(Workspace.slug == slug))
        if result.scalar_one_or_none() is None:
            db.add(Workspace(slug=slug, name=name, is_public_samples=is_public))
            print(f"  + workspace: {slug}")


async def seed(db: AsyncSession) -> None:
    # ── Ensure tables exist ─────────────────────────────────────────────
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    perm_map = await _seed_permissions(db)
    await _seed_roles(db, perm_map)
    await _seed_workspaces(db)

    await db.commit()
    print("RBAC seed complete.")


async def main() -> None:
    print("Seeding RBAC roles, permissions, and workspaces…")
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(main())
