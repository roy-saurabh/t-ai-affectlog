"""Parquet reader using PyArrow or Polars."""

from __future__ import annotations

from pathlib import Path
from typing import Generator

import polars as pl


def iter_parquet_chunks(path: Path | str, chunk_size: int = 100_000) -> Generator[pl.DataFrame, None, None]:
    path = Path(path)
    lf = pl.scan_parquet(path)
    total = lf.select(pl.len()).collect().item()
    offset = 0
    while offset < total:
        yield lf.slice(offset, chunk_size).collect()
        offset += chunk_size
