"""Job status tracking."""

from __future__ import annotations

from typing import Any


_job_statuses: dict[str, dict[str, Any]] = {}


def set_status(job_id: str, status: str, **extra: Any) -> None:
    _job_statuses[job_id] = {"job_id": job_id, "status": status, **extra}


def get_status(job_id: str) -> dict[str, Any]:
    return _job_statuses.get(job_id, {"job_id": job_id, "status": "not_found"})
