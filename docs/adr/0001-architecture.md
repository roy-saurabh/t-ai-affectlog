# ADR 0001 — Layered Architecture with Recipe-Driven Pipeline

**Status:** Accepted

## Context

ALT-AI must support multiple dataset formats (CSV, JSON, JSONL, Parquet), multiple model backends, and multiple compliance export formats, while remaining extensible.

## Decision

Use a layered architecture with YAML-driven recipes as the primary configuration mechanism:
1. Ingest → 2. Privacy → 3. Transform → 4. Profiling → 5. Metrics → 6. Compliance → 7. Export

Recipes declare which stages to run and how to configure them.

## Consequences

- Adding a new dataset format requires a new ingest reader + recipe schema field.
- Privacy controls are consistently applied at the same layer for all formats.
- Pipeline stages are independently testable.
