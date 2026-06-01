# Architecture

ALT-AI is composed of the following layers:

```
CSV / JSON / JSONL / Parquet
        ↓
   [Ingest Layer]           ← Polars lazy scanning, streaming chunks
        ↓
   [SecurityLayer]          ← PII detection, HMAC-SHA256 pseudonymisation
        ↓
   [Transform Layer]        ← CSV→xAPI JSONL, Becomino template inference
        ↓
   [Profiling Layer]        ← Schema, descriptive, temporal, sparsity, entropy
        ↓
   [Metrics Layer]          ← Gini, Coverage@K, fairness, representation
        ↓
   [Compliance Layer]       ← JSON-LD, Data Card, Model Card, SOP, GDPR inventory
        ↓
   [Recipe Runner]          ← YAML-driven pipeline orchestration
        ↓
   [FastAPI Backend]        ← OpenAPI 3.1 REST API
        ↓
   [React Dashboard]        ← Vite + TypeScript frontend
```

### Key Design Decisions

1. **Streaming-first**: Never load full 1M+ datasets into memory. Polars lazy scanning + chunked iteration.
2. **Privacy-by-default**: Raw personal identifiers never appear in output artifacts.
3. **Dataset-only mode**: Model adapters are optional — audits run without any ML model.
4. **Recipe-driven**: All pipeline behaviour is configured via YAML recipes, not hardcoded logic.
5. **Reproducible**: Every run produces a `config_hash`, `audit_manifest.json`, and deterministic IDs.

### Component Map

| Component | Module | Purpose |
|---|---|---|
| `ModelAdapter` | `src/affectlog/models/` | Standardized ML model interface |
| `ExplanationGenerator` | `src/affectlog/explanations/` | SHAP + permutation importance |
| `ResultsProcessor` | `src/affectlog/reports/` | Dashboard payload, markdown, CSV |
| `SecurityLayer` | `src/affectlog/privacy/` | PII detection + pseudonymisation |
| `PDCClient` | `src/affectlog/pdc/` | Prometheus-X connector (mock + real) |

See `docs/diagrams/classDiagram-v1.1.png` and `sequenceDiagram-v1.1.png` for UML diagrams.
