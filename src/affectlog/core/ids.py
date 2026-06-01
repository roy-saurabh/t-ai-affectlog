"""Deterministic and random ID generation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def new_run_id() -> str:
    """Generate a time-ordered run ID (ULID-style prefix + UUID suffix)."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    uid = uuid.uuid4().hex[:8]
    return f"run_{ts}_{uid}"


def new_dataset_id() -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    uid = uuid.uuid4().hex[:8]
    return f"ds_{ts}_{uid}"


def new_model_id() -> str:
    return f"model_{uuid.uuid4().hex[:12]}"


def new_request_id() -> str:
    return uuid.uuid4().hex
