"""High-level CSV reader: validate, normalise booleans/dates/duration, report bad rows."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Generator, Optional

import polars as pl

from affectlog.exceptions import IngestError, SchemaValidationError
from affectlog.ingest.large_file import (
    MASKOTT_REQUIRED_COLUMNS,
    iter_csv_chunks,
    scan_csv_lazy,
    validate_csv_headers,
)

logger = logging.getLogger(__name__)

BOOL_TRUE = {"true", "1", "yes", "y", "t"}
BOOL_FALSE = {"false", "0", "no", "n", "f"}


def _normalise_bool_col(series: pl.Series) -> pl.Series:
    return series.cast(pl.Utf8, strict=False).str.to_lowercase().map_elements(
        lambda v: True if v in BOOL_TRUE else (False if v in BOOL_FALSE else None),
        return_dtype=pl.Boolean,
    )


def _normalise_duration_col(series: pl.Series) -> pl.Series:
    """Attempt to cast duration to float seconds."""
    try:
        return series.cast(pl.Float64, strict=False)
    except Exception:
        return series.cast(pl.Utf8, strict=False)


def _normalise_chunk(df: pl.DataFrame) -> tuple[pl.DataFrame, pl.DataFrame]:
    """Normalise types within a chunk; split valid vs invalid rows."""
    # Boolean columns
    for col in ("IsViewerAuthor", "IsViewerAnonymous"):
        if col in df.columns:
            df = df.with_columns(_normalise_bool_col(df[col]).alias(col))

    # Duration
    if "Duration" in df.columns:
        df = df.with_columns(_normalise_duration_col(df["Duration"]).alias("Duration"))

    # AccessDate — keep as string; downstream transform parses it
    # Flag rows where _id or AccessDate is null as invalid
    required_non_null = ["_id", "AccessDate"]
    mask_invalid = pl.lit(False)
    for c in required_non_null:
        if c in df.columns:
            mask_invalid = mask_invalid | df[c].is_null()

    invalid = df.filter(mask_invalid)
    valid = df.filter(~mask_invalid)
    return valid, invalid


def read_maskott_csv(
    path: Path | str,
    chunk_size: int = 100_000,
    strict: bool = False,
    invalid_output: Optional[Path] = None,
) -> Generator[pl.DataFrame, None, None]:
    """
    Validate and stream-read a Maskott CSV.

    Yields normalised DataFrames one chunk at a time.
    Invalid rows are written to *invalid_output* (JSONL) if provided.
    Raises SchemaValidationError if required headers missing.
    """
    path = Path(path)
    report = validate_csv_headers(path, MASKOTT_REQUIRED_COLUMNS)
    if not report["valid"]:
        raise SchemaValidationError(
            f"Missing columns: {report['missing_columns']}"
        )
    if report["extra_columns"]:
        logger.warning("Extra columns detected (will be preserved): %s", report["extra_columns"])

    invalid_rows: list[dict[str, Any]] = []

    for chunk in iter_csv_chunks(path, chunk_size=chunk_size):
        valid, invalid = _normalise_chunk(chunk)
        if not invalid.is_empty():
            if strict:
                raise IngestError(
                    f"Found {len(invalid)} invalid rows in strict mode."
                )
            invalid_rows.extend(invalid.to_dicts())
            logger.warning("Skipping %d invalid rows in this chunk.", len(invalid))
        yield valid

    if invalid_output and invalid_rows:
        import json
        invalid_output.parent.mkdir(parents=True, exist_ok=True)
        with open(invalid_output, "w") as f:
            for row in invalid_rows:
                f.write(json.dumps(row, default=str) + "\n")
        logger.info("Wrote %d invalid rows to %s", len(invalid_rows), invalid_output)
