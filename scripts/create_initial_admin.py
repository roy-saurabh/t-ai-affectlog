#!/usr/bin/env python3
"""
Create the initial superadmin user.

Usage:
    python scripts/create_initial_admin.py
    # or via CLI:
    affectlog create-admin --email admin@example.org --name "Admin User"
    # or via Makefile:
    make create-admin

Environment:
    Set ADMIN_EMAIL and ADMIN_NAME env vars, or edit defaults below.
    Password will be prompted interactively.
"""

from __future__ import annotations

import asyncio
import getpass
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import select

from affectlog.auth.password import hash_password
from affectlog.db.base import Base
from affectlog.db.models import Role, User, UserRole, Workspace, WorkspaceMembership
from affectlog.db.session import AsyncSessionLocal, engine


async def create_admin(email: str, full_name: str, password: str) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"User {email} already exists. Skipping creation.")
            return

        user = User(
            id=uuid.uuid4(),
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            is_superadmin=True,
            must_change_password=False,
        )
        db.add(user)
        await db.flush()

        # Assign Super Admin role if it exists
        role_result = await db.execute(select(Role).where(Role.name == "Super Admin"))
        role = role_result.scalar_one_or_none()
        if role:
            db.add(UserRole(user_id=user.id, role_id=role.id))

        # Add to all workspaces
        ws_result = await db.execute(select(Workspace))
        for ws in ws_result.scalars().all():
            db.add(WorkspaceMembership(user_id=user.id, workspace_id=ws.id))

        await db.commit()
        print(f"✓ Superadmin created: {email}")
        print(f"  Full name: {full_name}")
        print(
            f"  Login at: {os.environ.get('AFFECTLOG_APP_BASE_URL', 'http://localhost:3000')}/login"
        )


async def main() -> None:
    # input() blocks the event loop; offload to a worker thread in this async context.
    email = (
        os.environ.get("ADMIN_EMAIL") or (await asyncio.to_thread(input, "Admin email: ")).strip()
    )
    full_name = (
        os.environ.get("ADMIN_NAME")
        or (await asyncio.to_thread(input, "Admin full name: ")).strip()
    )

    if not email or not full_name:
        print("Email and full name are required.")
        sys.exit(1)

    password = os.environ.get("ADMIN_PASSWORD") or ""
    if not password:
        password = getpass.getpass("Password (min 12 chars): ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match.")
            sys.exit(1)

    if len(password) < 12:
        print("Password must be at least 12 characters.")
        sys.exit(1)

    print(f"\nCreating superadmin: {email}…")
    await create_admin(email, full_name, password)


if __name__ == "__main__":
    asyncio.run(main())
