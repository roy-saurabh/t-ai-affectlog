"""Path safety: containment checks and identifier validation."""

from __future__ import annotations

import re
from pathlib import Path

_RUN_ID_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$")


def resolve_safe_path(base: Path, untrusted: str | Path) -> Path:
    """Return resolved (base / untrusted), raising ValueError if it escapes base.

    Prevents path-traversal attacks such as run_id='../../etc/passwd'.
    """
    resolved_base = base.resolve()
    candidate = (base / untrusted).resolve()
    if not candidate.is_relative_to(resolved_base):
        raise ValueError(f"Path traversal detected: '{untrusted}' is outside '{resolved_base}'")
    return candidate


def validate_run_id(run_id: str) -> None:
    """Raise ValueError if run_id contains characters that allow path traversal.

    Permits only alphanumeric characters, hyphens, and underscores.
    """
    if not _RUN_ID_RE.match(run_id):
        raise ValueError(
            f"Invalid run_id '{run_id}': must be alphanumeric with hyphens/underscores only"
        )
