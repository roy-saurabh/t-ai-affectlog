# ADR 0002 — Polars Lazy Scanning for Large Dataset Processing

**Status:** Accepted

## Context

The Maskott CSV contains 1,091,624 rows. Loading the full dataset into memory with pandas would require ~1–2 GB RAM and is not suitable for partner-controlled laptops.

## Decision

Use Polars lazy scanning (`pl.scan_csv`) for all CSV ingestion, with chunked iteration via `.slice(offset, chunk_size).collect()`. Output is streamed to JSONL line-by-line. Pandas may be used only for small outputs and test fixtures.

## Consequences

- Memory usage scales with chunk size, not total rows.
- Target: < 2 GB RAM for 1M-row processing with chunk_size=100,000.
- JSONL is the mandatory streaming output format for large datasets.
- JSON array export is optional and guarded by a size limit.
