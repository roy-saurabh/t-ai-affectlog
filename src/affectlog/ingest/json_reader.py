"""JSON / JSONL readers."""

from __future__ import annotations

import json
from collections.abc import Generator
from pathlib import Path
from typing import Any


def iter_jsonl(
    path: Path | str, chunk_size: int = 10_000
) -> Generator[list[dict[str, Any]], None, None]:
    """Yield lists of dicts from a JSONL file in chunks."""
    path = Path(path)
    chunk: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as f:
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


def iter_jsonl_records(path: Path | str, limit: int = 0) -> Generator[dict[str, Any], None, None]:
    """Yield records from a JSONL file one at a time, skipping blank and malformed lines.

    *limit* = 0 means read all records.
    """
    count = 0
    with Path(path).open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            count += 1
            if limit and count > limit:
                return
            yield record


def read_json(path: Path | str) -> Any:
    with Path(path).open(encoding="utf-8") as f:
        return json.load(f)
