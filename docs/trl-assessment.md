# ALT-AI Technology Readiness Level Assessment

**Project:** EDGE-Skills / WP3 / D3.7 — Prometheus-X Association  
**Component:** AffectLog Trustworthy AI (ALT-AI)  
**Assessment date:** 2024-12-20 (aligned with v0.1.0 release)  
**Assessed TRL:** **5 — Technology validated in relevant environment**

---

## 1. TRL Scale Reference (EC/NASA-adapted)

| TRL | Definition |
|-----|-----------|
| 1 | Basic principles observed and reported |
| 2 | Technology concept and/or application formulated |
| 3 | Analytical and experimental critical function and/or characteristic proof of concept |
| 4 | Component and/or breadboard validation in laboratory environment |
| 5 | Component and/or breadboard validation in relevant environment |
| 6 | System/subsystem model or prototype demonstration in operational environment |
| 7 | System prototype demonstrated in operational environment |
| 8 | System complete and qualified |
| 9 | Actual system proven in operational environment |

---

## 2. TRL Progression Evidence

### TRL 1–2 (Concept): Design Document Phase

The ALT-AI concept was formalised in [docs/design-document.md](design-document.md), which defines:

- The four core functionalities: model explanation, feature importance, model comparison, fairness analysis.
- Four binding requirements (R1–R4): ML framework interoperability, explanation APIs, privacy-by-default, scalability.
- Integration scope: Prometheus-X PDC, EU AI Act Annex IV, GDPR, Model Cards (Mitchell 2019), Data Cards (Gebru 2018).

This document constitutes the TRL 1–2 conceptual baseline. It is committed at `docs/design-document.md`.

### TRL 3–4 (Proof of Concept / Lab Validation)

An exploratory prototype was developed using the UCI Census Adult dataset and the `interpret-core` ExplainableBoostingClassifier to validate the global/local explanation concept at minimal scale. That prototype established the feasibility of the explanation pipeline (R2) and the model adapter abstraction (R1) in a controlled laboratory environment.

**Note:** That prototype is not present in this repository; it served as internal validation only. The current repository represents the validated, production-scoped implementation that supersedes it.

### TRL 5 (Relevant-Environment Validation): This Repository (v0.1.0)

TRL 5 is evidenced by the full-stack implementation operating on real partner datasets under the data-sharing agreements of the EDGE-Skills project:

| Evidence | Location |
|----------|---------|
| Working recipe pipeline on Maskott/Tactileo CSV (real data) | `configs/recipes/maskott_tactileo.yaml` |
| Working recipe pipeline on Inokufu/Becomino JSON (real data) | `configs/recipes/inokufu_becomino.yaml` |
| HMAC-SHA256 pseudonymisation applied to production identifiers | `src/affectlog/privacy/` |
| Compliance exports (JSON-LD, Data Card, Model Card, SOP, GDPR, EU AI Act) generated from real runs | `src/affectlog/compliance/` |
| 1 M-row synthetic throughput benchmark (Polars lazy scanning, no OOM) | `tests/performance/test_synthetic_million_rows.py` |
| CI/CD pipeline (lint, format, unit, integration, security) | `.github/workflows/deploy.yml` |
| OpenAPI 3.1 contract tested in CI | `tests/integration/test_api_openapi_contract.py` (validates the spec against a live server) |
| Prometheus-X PDC connector — mock server + client (specified; live activation by config) | `src/affectlog/pdc/` |

---

## 3. TRL 5 → TRL 6 Gap

**The gap is environmental, not functional.** No interface change is required:
the API, data model and message schemas are stable, and the remaining work is
*activation* of already-specified connectors against a live source —
configuration, not a schema change. TRL 6 (system/subsystem prototype in
operational environment) requires:

1. Deployment on project-partner infrastructure (Maskott or Inokufu production systems) with real-time ingestion.
2. Activation of the specified Prometheus-X PDC connector in a live data-space transaction (ODRL policy enforcement, not just the mock server).
3. Activation of xAPI LRS ingestion against a live statement feed.
4. Demonstrated SLA: audit pipeline completes within defined latency bounds on partner hardware.

These items are out of scope for D3.7 and depend on a live use case (data source
or model) being made available under a lawful data-sharing / PDC arrangement —
i.e. on master-product / consortium use-case maturity, not on additional
AffectLog component development.

---

## 4. D3.7 Requirements Traceability Matrix

Each row traces one design-document requirement through the D3.7 deliverable scope to the implementation and its verification.

### R1 — ML Framework Interoperability

> MUST support integration with scikit-learn, TensorFlow, PyTorch via wrappers; also numpy/pandas for data handling, onnxruntime for ONNX models.

| Attribute | Detail |
|-----------|--------|
| D3.7 scope | Section on AffectLog operation-time assessment; model adapter layer |
| Implementation | `src/affectlog/models/` — `sklearn_adapter.py`, `onnx_adapter.py`, `torch_adapter.py`, `tensorflow_adapter.py`, `http_adapter.py`, `base.py` (abstract), `registry.py` |
| Verification | `tests/unit/test_model_adapters.py` — exercises each adapter with dummy inputs; `tests/integration/test_api_dataset_transform.py` |
| Verification command | `pytest tests/unit/test_model_adapters.py -v` |
| Notes | HTTP adapter covers black-box model services. Polars replaces pandas for streaming; pandas interop preserved via `to_pandas()` when adapters require it. |

### R2 — APIs for Explanations, Feature Importance, Model Comparison

> MUST provide APIs for generating explanations, feature importance scores, and model comparisons.

| Attribute | Detail |
|-----------|--------|
| D3.7 scope | ALT-AI operation-time assessment; explainability layer; FastAPI OpenAPI 3.1 backend |
| Implementation | `src/affectlog/explanations/` — `generator.py`, `feature_importance.py`, `permutation.py`, `shap_adapter.py`, `comparison.py`; REST endpoints at `src/affectlog/api/routers/explanations.py`, `models.py`; OpenAPI spec at `docs/openapi.yaml` |
| Verification | `tests/unit/test_explanations.py`; `tests/integration/test_api_openapi_contract.py` (validates spec against live server); `make typecheck` |
| Verification command | `pytest tests/unit/test_explanations.py tests/integration/test_api_openapi_contract.py -v` |
| Notes | SHAP integration optional (`pip install affectlog[shap]`). Permutation importance works on any adapter without SHAP. |

### R3 — Privacy-by-Default, No Raw Personal Data Exposure

> MUST ensure data privacy and security; MUST NOT require access to raw personal data for explanation generation.

| Attribute | Detail |
|-----------|--------|
| D3.7 scope | D3.7 §5 privacy requirements; GDPR Article 32 pseudonymisation; EU AI Act risk documentation |
| Implementation | `src/affectlog/privacy/` — `pii_detector.py` (regex field-name + value scan), `pseudonymizer.py` (HMAC-SHA256, keyed), `redaction.py`, `risk_scoring.py`, `security_layer.py`; GDPR inventory at `src/affectlog/compliance/gdpr.py`; config at `configs/mappings/pii_patterns.yaml` |
| Verification | `tests/unit/test_pii_detection.py`; `tests/unit/test_pseudonymizer.py`; `make security` (bandit static analysis + pip-audit) |
| Verification command | `pytest tests/unit/test_pii_detection.py tests/unit/test_pseudonymizer.py -v && make security` |
| Notes | `allow_raw_identifiers` defaults to `false`. Dashboard truncates pseudonymised IDs. Raw identifiers (`_id`, `EntityId`, `ActivitySessionId`, `EntityUaiCode`) are hashed before any profile statistic is computed. See [docs/privacy-and-security.md](privacy-and-security.md). |

### R4 — Scalability for Large Datasets

> SHOULD handle large datasets and complex models efficiently.

| Attribute | Detail |
|-----------|--------|
| D3.7 scope | D3.7 §4 scalability; Maskott partner use case (production dataset scale) |
| Implementation | `src/affectlog/ingest/large_file.py` (chunk iterator, configurable chunk-size); `src/affectlog/ingest/csv_reader.py` (Polars lazy scanning); `src/affectlog/ingest/parquet_reader.py`; all profiling/metrics modules stream JSONL line-by-line without loading into memory |
| Verification | `tests/performance/test_synthetic_million_rows.py` (marked `@pytest.mark.slow`; generates 1 M rows synthetic, processes end-to-end within time bound) |
| Verification command | `pytest -m slow -v` (or `make test-slow`) |
| Benchmark | `make benchmark` — runs `scripts/benchmark_million_rows.sh`, reports throughput in rows/second |
| Notes | Memory profile: 1 M-row CSV processed in <2 GB RSS on a 16 GB dev machine. ADR 0002 documents the Polars lazy-scan decision. See [docs/adr/0002-large-dataset-processing.md](adr/0002-large-dataset-processing.md). |

---

## 5. D3.7 Deliverable Scope Checklist

The D3.7 deliverable for the AffectLog component specifies the following capabilities. Each is implemented and verifiable in this repository.

| D3.7 Capability | Implementation Module | Test Coverage | Status |
|-----------------|----------------------|---------------|--------|
| Dataset profiling (schema, descriptive, temporal, sparsity, entropy) | `src/affectlog/profiling/` | `tests/unit/` | ✓ |
| Fairness / representation metrics (Gini, Coverage@K, balance ratio) | `src/affectlog/metrics/` | `tests/unit/test_metrics_concentration.py`, `test_metrics_fairness.py`, `test_metrics_coverage.py` | ✓ |
| Privacy-preserving pseudonymisation (HMAC-SHA256) | `src/affectlog/privacy/pseudonymizer.py` | `tests/unit/test_pseudonymizer.py` | ✓ |
| PII detection (field-name + value scan) | `src/affectlog/privacy/pii_detector.py` | `tests/unit/test_pii_detection.py` | ✓ |
| xAPI normalisation (Maskott CSV → xAPI JSONL) | `src/affectlog/transform/maskott_csv_to_xapi.py` | `tests/unit/test_csv_to_xapi_transform.py`, `test_maskott_csv_schema.py` | ✓ |
| Becomino template inference | `src/affectlog/transform/becomino_template.py` | `tests/unit/test_becomino_template_inference.py` | ✓ |
| EU AI Act Annex IV compliance export | `src/affectlog/compliance/ai_act_annex_iv.py` | `tests/unit/test_jsonld_export.py` | ✓ |
| GDPR field inventory | `src/affectlog/compliance/gdpr.py` | covered by integration tests | ✓ |
| Data Card (Gebru 2018) | `src/affectlog/compliance/data_card.py` | covered by integration tests | ✓ |
| Model Card (Mitchell 2019) | `src/affectlog/compliance/model_card.py` | covered by integration tests | ✓ |
| JSON-LD compliance graph export | `src/affectlog/compliance/jsonld.py` | `tests/unit/test_jsonld_export.py` | ✓ |
| SOP markdown generation | `src/affectlog/compliance/sop.py` | `tests/integration/test_cli_audit_pipeline.py` | ✓ |
| Recipe-driven YAML audit pipeline | `src/affectlog/recipes/` | `tests/unit/test_recipes.py` | ✓ |
| Reproducible run hashing (config_hash) | `src/affectlog/core/hashing.py` | covered by recipe tests | ✓ |
| FastAPI OpenAPI 3.1 backend | `src/affectlog/api/` | `tests/integration/test_api_openapi_contract.py` | ✓ |
| Prometheus-X PDC connector (mock + real) | `src/affectlog/pdc/` | `tests/integration/test_pdc_mock.py` | ✓ |
| Multi-format model adapters (sklearn, ONNX, PyTorch, TF, HTTP) | `src/affectlog/models/` | `tests/unit/test_model_adapters.py` | ✓ |
| Model explainability (SHAP, permutation, comparison) | `src/affectlog/explanations/` | `tests/unit/test_explanations.py` | ✓ |
| 1 M-row throughput (Polars lazy scanning) | `src/affectlog/ingest/large_file.py` | `tests/performance/test_synthetic_million_rows.py` | ✓ |

---

## 6. Full Verification Procedure

Run the complete verification suite against a clean install:

```bash
# Install
pip install -e ".[dev]"

# Unit + integration tests (fast suite)
make test

# Performance benchmark (1 M rows)
make test-slow

# Static analysis + dependency audit
make security

# Type checking
make typecheck

# End-to-end demo pipeline (uses synthetic data)
make demo

# Validate OpenAPI specification
bash scripts/validate_openapi.sh
```

To verify against production datasets (requires data under `data/raw/`):

```bash
# Maskott/Tactileo
affectlog validate-csv \
  --input data/raw/maskott/EdgeSkills-MaskottRecom-Visualisations.csv \
  --schema maskott_csv_v1

affectlog convert-csv \
  --input data/raw/maskott/EdgeSkills-MaskottRecom-Visualisations.csv \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output data/processed/maskott.normalized.jsonl \
  --format jsonl --chunk-size 100000

affectlog audit \
  --input data/processed/maskott.normalized.jsonl \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output runs/maskott_production

affectlog compliance-export \
  --run runs/maskott_production \
  --format jsonld \
  --output runs/maskott_production/compliance_graph.jsonld

affectlog sop --run runs/maskott_production --output runs/maskott_production/SOP.md

# Inokufu/Becomino
affectlog audit \
  --input data/raw/becomino/ll.inokufu.json \
  --recipe configs/recipes/inokufu_becomino.yaml \
  --output runs/becomino_production
```

Expected outputs per run:

| Artifact | Path | Verifiable by |
|----------|------|---------------|
| Profiling statistics JSON | `runs/<name>/profile.json` | Schema: `src/affectlog/schemas/api.py` |
| Concentration + fairness metrics | `runs/<name>/metrics.json` | Non-negative floats; Gini ∈ [0,1] |
| Privacy report (PII scan + pseudonymisation log) | `runs/<name>/privacy_report.json` | No raw identifiers present |
| JSON-LD compliance graph | `runs/<name>/compliance_graph.jsonld` | Valid JSON-LD; `@type` includes `AISystem` |
| Data Card markdown | `runs/<name>/data_card.md` | Non-empty; includes dataset provenance |
| SOP markdown | `runs/<name>/SOP.md` | Non-empty; includes GDPR lawful basis |
| Audit run config hash | `runs/<name>/run_context.json` | `config_hash` field reproducible across identical inputs |

---

## 7. Known Limitations at TRL 5

1. **PDC integration in production:** The real PDC client (`src/affectlog/pdc/client.py`) is implemented but not exercised against a live Prometheus-X data-space node in CI. The mock server (`src/affectlog/pdc/mock_server.py`) covers contract testing only.
2. **Sensitive-attribute fairness:** `compute_fairness` in `src/affectlog/metrics/fairness.py` operates on activity-category strata derived from xAPI `contextActivities`. Demographic parity (e.g., gender, age) requires explicit sensitive-attribute metadata not present in current partner datasets. The implementation is extensible; see the docstring.
3. **Frontend integration tests:** The React/Vite dashboard (`src/affectlog/frontend/`) is built and type-checked in CI but has no automated E2E browser tests at TRL 5. Dashboard payload correctness is covered by `src/affectlog/reports/dashboard_payload.py` unit tests.
4. **ONNX, PyTorch, TensorFlow adapters:** Validated with synthetic dummy models in unit tests. Not exercised against a partner-deployed production model at TRL 5 (no partner model artifact available under data-sharing agreement at time of v0.1.0 release).
