"""JSON / JSONL readers."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Generator


def iter_jsonl(path: Path | str, chunk_size: int = 10_000) -> Generator[list[dict[str, Any]], None, None]:
    """Yield lists of dicts from a JSONL file in chunks."""
    path = Path(path)
    chunk: list[dict[str, Any]] = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                chunk.append(json.loads(line))
            except json.JSONDecodeError:
                continue
            if len(chunk) >= chunk_size:
                yield chunk
                chunk = []
    if chunk:
        yield chunk


def read_json(path: Path | str) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
