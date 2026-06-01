"""Build dashboard payload for frontend consumption."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_dashboard_payload(run_dir: Path | str) -> dict[str, Any]:
    path = Path(run_dir) / "dashboard_payload.json"
    if not path.exists():
        return {"error": "dashboard_payload.json not found"}
    return json.loads(path.read_text())
