"""
Community Edition runtime assertions and helpers.

Provides sanity-check utilities to confirm we are running in community mode
and to short-circuit managed-only code paths clearly.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

from affectlog.editions.base import get_deployment_mode


def is_community() -> bool:
    return get_deployment_mode() == "community"


def assert_community(message: str = "This operation is only available in Community Edition.") -> None:
    if not is_community():
        raise RuntimeError(message)


def community_only(fn: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator that raises RuntimeError if not in community mode."""
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        assert_community()
        return fn(*args, **kwargs)
    return wrapper
