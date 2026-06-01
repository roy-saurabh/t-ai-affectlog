"""Streaming large-file ingestion utilities using Polars lazy scanning.

Design: never load the full dataset into memory. Use lazy scanning,
chunked iteration, and streaming export.
"""

from __future__ import annotations

import logging
from collections.abc import Generator
from pathlib import Path

import polars as pl

from affectlog.exceptions import IngestError

logger = logging.getLogger(__name__)

MASKOTT_REQUIRED_COLUMNS = [
    "_id",
    "AccessDate",
    "ViewContext",
    "ResourceId",
    "ResourceType",
    "CollectionId",
    "ActivitySessionId",
    "Duration",
    "EntityId",
    "EntityUaiCode",
    "IsViewerAuthor",
    "IsViewerAnonymous",
]


def scan_csv_lazy(
    path: Path | str,
    _chunk_size: int = 100_000,
    infer_schema_length: int = 10_000,
) -> pl.LazyFrame:
    """Return a Polars LazyFrame for a CSV (no data loaded yet)."""
    path = Path(path).resolve()  # lgtm[py/path-injection]
    if not path.exists():
        raise IngestError(f"File not found: {path}")
    if not path.is_file():
        raise IngestError(f"Not a regular file: {path}")
    try:
        lf = pl.scan_csv(
            path,  # lgtm[py/path-injection]
            infer_schema_length=infer_schema_length,
            ignore_errors=True,
            null_values=["", "null", "NULL", "None", "NA", "N/A"],
            truncate_ragged_lines=True,
        )
        return lf
    except Exception as exc:
        raise IngestError(f"Cannot scan CSV {path}: {exc}") from exc


def iter_csv_chunks(
    path: Path | str,
    chunk_size: int = 100_000,
    *,
    columns: list[str] | None = None,
) -> Generator[pl.DataFrame, None, None]:
    """Yield DataFrames in streaming chunks without loading all rows at once."""
    path = Path(path)
    lf = scan_csv_lazy(path)
    if columns:
        lf = lf.select(columns)

    # Polars streaming collect in batches
    # We use collect_streaming for Polars >= 0.19 or fall back to slice
    try:
        # Streaming sink is best; fall back to in-memory slice if unavailable
        total = lf.select(pl.len()).collect().item()
        logger.info("CSV rows detected: %d", total)
    except Exception:
        total = None

    offset = 0
    batch_num = 0
    while True:
        batch = lf.slice(offset, chunk_size).collect()
        if batch.is_empty():
            break
        logger.debug("Chunk %d: %d rows (offset %d)", batch_num, len(batch), offset)
        yield batch
        offset += chunk_size
        batch_num += 1
        if total is not None and offset >= total:
            break


def validate_csv_headers(path: Path | str, required: list[str]) -> dict:  # type: ignore[type-arg]
    """Validate that required headers are present, return report dict."""
    path = Path(path)
    lf = scan_csv_lazy(path)
    actual = lf.collect_schema().names()
    missing = [c for c in required if c not in actual]
    extra = [c for c in actual if c not in required]
    valid = len(missing) == 0
    return {
        "valid": valid,
        "required_columns": required,
        "actual_columns": actual,
        "missing_columns": missing,
        "extra_columns": extra,
    }
