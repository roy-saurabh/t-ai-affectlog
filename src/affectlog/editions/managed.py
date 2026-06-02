"""
Managed Edition runtime assertions and helpers.

Provides guard utilities for code paths that are only valid when running
as a managed/multi-tenant deployment.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

from affectlog.editions.base import get_deployment_mode


def is_managed() -> bool:
    return get_deployment_mode() in ("managed", "enterprise_private")


def assert_managed(message: str = "This operation requires Managed Edition.") -> None:
    if not is_managed():
        raise RuntimeError(message)


def managed_only(fn: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator that raises RuntimeError if not in managed/enterprise mode."""
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        assert_managed()
        return fn(*args, **kwargs)
    return wrapper
