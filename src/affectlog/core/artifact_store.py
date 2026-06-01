"""Simple local artifact store: write and locate run outputs."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any


class ArtifactStore:
    def __init__(self, run_dir: Path) -> None:
        self.run_dir = run_dir
        self.run_dir.mkdir(parents=True, exist_ok=True)

    def path(self, filename: str) -> Path:
        return self.run_dir / filename

    def write_json(self, filename: str, data: Any, indent: int = 2) -> Path:
        p = self.path(filename)
        p.write_text(json.dumps(data, indent=indent, default=str))
        return p

    def write_text(self, filename: str, content: str) -> Path:
        p = self.path(filename)
        p.write_text(content, encoding="utf-8")
        return p

    def copy_file(self, src: Path, dest_name: str) -> Path:
        dest = self.path(dest_name)
        shutil.copy2(src, dest)
        return dest

    def list_artifacts(self) -> list[str]:
        return sorted(str(p.name) for p in self.run_dir.iterdir() if p.is_file())
