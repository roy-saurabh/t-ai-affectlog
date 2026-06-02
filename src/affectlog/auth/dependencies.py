"""
FastAPI dependency functions for auth / RBAC.

Usage:
    @router.get(...)
    async def endpoint(user = Depends(require_permission(P.DATASETS_UPLOAD))):
        ...
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from affectlog.auth.rbac import get_user_permissions
from affectlog.auth.sessions import get_session_user
from affectlog.db.models import User
from affectlog.db.session import get_db

SESSION_COOKIE = "affectlog_session"


async def get_optional_user(
    db: AsyncSession = Depends(get_db),
    session_token: str | None = Cookie(None, alias=SESSION_COOKIE),
) -> User | None:
    if session_token is None:
        return None
    return await get_session_user(db, session_token)


async def get_current_user(
    user: User | None = Depends(get_optional_user),
) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Cookie"},
        )
    return user


def require_permission(permission: str) -> Callable[..., Any]:
    async def _check(
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if user.is_superadmin:
            return user
        perms = await get_user_permissions(db, user.id)
        if permission not in perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}",
            )
        return user

    return _check


def require_any_permission(*permissions: str) -> Callable[..., Any]:
    async def _check(
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if user.is_superadmin:
            return user
        perms = await get_user_permissions(db, user.id)
        if not any(p in perms for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return user

    return _check


async def require_superadmin(user: User = Depends(get_current_user)) -> User:
    if not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required.",
        )
    return user
