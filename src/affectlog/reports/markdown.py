"""Markdown report helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any


def metrics_to_markdown(metrics: dict[str, Any]) -> str:
    lines = ["# ALT-AI Metrics Report\n"]
    for k, v in metrics.items():
        if isinstance(v, (int, float, str, bool)):
            lines.append(f"- **{k}**: {v}")
        elif isinstance(v, dict):
            lines.append(f"\n## {k}")
            for kk, vv in v.items():
                lines.append(f"  - **{kk}**: {vv}")
    return "\n".join(lines)
