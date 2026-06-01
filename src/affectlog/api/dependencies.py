"""FastAPI dependency injection."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Header, Request


def get_request_id(x_request_id: Annotated[str | None, Header()] = None) -> str:
    return x_request_id or uuid.uuid4().hex


async def get_settings_dep() -> "Settings":  # type: ignore[name-defined]
    from affectlog.config import get_settings
    return get_settings()
