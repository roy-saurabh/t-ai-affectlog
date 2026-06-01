"""Duration conversion utilities."""

from __future__ import annotations

import re
from typing import Optional

from affectlog.core.time import to_iso8601_duration


def duration_to_iso8601(value: object) -> Optional[str]:
    """Convert various duration representations to ISO 8601 duration string."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if value >= 0:
            return to_iso8601_duration(float(value))
        return None
    s = str(value).strip()
    if not s or s.lower() in ("null", "none", "na", "nan"):
        return None
    # Already ISO 8601?
    if s.startswith("PT") or s.startswith("P"):
        return s
    # Numeric string
    try:
        return to_iso8601_duration(float(s))
    except ValueError:
        pass
    # HH:MM:SS
    m = re.match(r"^(\d+):(\d{2}):(\d{2})$", s)
    if m:
        h, mi, sec = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return to_iso8601_duration(float(h * 3600 + mi * 60 + sec))
    return None
