"""Run context: deterministic IDs, artifact store references, stage tracking."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from affectlog.core.ids import new_run_id
from affectlog.core.time import now_iso, now_utc


@dataclass
class StageResult:
    name: str
    status: str = "pending"  # "ok" | "warning" | "error" | "skipped" | "pending"
    start: str = field(default_factory=now_iso)
    end: Optional[str] = None
    duration_s: float = 0.0
    input_artifact: Optional[str] = None
    output_artifact: Optional[str] = None
    record_count_in: int = 0
    record_count_out: int = 0
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    config_hash: Optional[str] = None
    meta: dict[str, Any] = field(default_factory=dict)

    def finish(self, status: str = "ok") -> None:
        self.end = now_iso()
        end_dt = datetime.fromisoformat(self.end)
        start_dt = datetime.fromisoformat(self.start)
        self.duration_s = (end_dt - start_dt).total_seconds()
        self.status = status

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "start": self.start,
            "end": self.end,
            "duration_s": self.duration_s,
            "input_artifact": self.input_artifact,
            "output_artifact": self.output_artifact,
            "record_count_in": self.record_count_in,
            "record_count_out": self.record_count_out,
            "warnings": self.warnings,
            "errors": self.errors,
            "config_hash": self.config_hash,
            "meta": self.meta,
        }


@dataclass
class RunContext:
    run_id: str = field(default_factory=new_run_id)
    run_dir: Path = field(default=Path("runs/default"))
    recipe_name: str = "unknown"
    input_path: str = ""
    created_at: str = field(default_factory=now_iso)
    stages: list[StageResult] = field(default_factory=list)
    artifacts: dict[str, str] = field(default_factory=dict)
    config: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.run_dir = Path(str(self.run_dir).replace("default", self.run_id))
        self.run_dir.mkdir(parents=True, exist_ok=True)

    def new_stage(self, name: str) -> StageResult:
        s = StageResult(name=name)
        self.stages.append(s)
        return s

    def add_artifact(self, key: str, path: str | Path) -> None:
        self.artifacts[key] = str(path)

    def save_manifest(self) -> Path:
        manifest: dict[str, Any] = {
            "run_id": self.run_id,
            "recipe": self.recipe_name,
            "input": self.input_path,
            "created_at": self.created_at,
            "stages": [s.to_dict() for s in self.stages],
            "artifacts": self.artifacts,
        }
        out = self.run_dir / "audit_manifest.json"
        out.write_text(json.dumps(manifest, indent=2))
        return out
