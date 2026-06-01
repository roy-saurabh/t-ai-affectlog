"""Timezone-aware timestamp utilities."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


def parse_iso(ts: str) -> Optional[datetime]:
    """Parse an ISO-8601 timestamp string, return None if unparseable."""
    for fmt in [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ]:
        try:
            dt = datetime.strptime(ts, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def to_iso8601_duration(seconds: float) -> str:
    """Convert seconds to ISO 8601 duration string."""
    seconds = max(0.0, seconds)
    total = int(seconds)
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    frac = seconds - total
    if hours:
        return f"PT{hours}H{minutes}M{secs + frac:.3f}S".rstrip("0").rstrip(".")+"S" if frac else f"PT{hours}H{minutes}M{secs}S"
    if minutes:
        return f"PT{minutes}M{secs}S"
    return f"PT{secs}S"
