# Design conformance record

This record is the **traceability index** between the EDGE-Skills WP3 **D3.7**
deliverable, the authoritative [design document](design-document.md), and what is
actually implemented in this codebase — with the evidence and the verification
method for each row.

It is a companion to the design document, not a second design narrative: the design
document states *what the system is*, this record states *where each claim is
evidenced and how far it holds*.

It is deliberately conservative. Rows are recorded as **Conditional**,
**Mock-validated**, **Interface specified**, **Roadmap** or **Not evidenced**
wherever the code gates, stubs or scopes a capability — rather than claiming
completeness the code does not have. A documentation set is fully aligned when every
status is accurate and consistently stated, **not** when every row reads *Implemented*.

**Status vocabulary** (shared with the design document):

| Status | Meaning |
| --- | --- |
| **Implemented** | Code exists, is reachable, and is exercised by tests |
| **Implemented with qualification** | Implemented for a defined subset; a broader reading is not supported |
| **Optional** | Requires an optional dependency; degrades gracefully when absent |
| **Conditional** | Active only under configuration or an edition flag |
| **Mock-validated** | Exercised against a mock/stub, not a live external service |
| **Interface specified** | Schema/contract published; no live counterparty exercised |
| **Configuration pending** | Implemented but inert until deployment configuration is supplied |
| **Externally dependent** | Blocked on a third party or partner endpoint |
| **Roadmap** | Designed or scaffolded, not functionally implemented |
| **Not evidenced** | Claimed somewhere but without supporting implementation |

**D3.7 source** references the submitted deliverable
(`docs/D3.7-final-BB-Trustworthy AI.docx`; text rendering
`docs/D3.7-final-BB-Trustworthy AI.docx.md`). **D3.7 is submitted and authoritative
and is not modified by this repository.** "Code inspection" means the cited source was
read directly; "Executed" means the check was run for this record.

Implementation paths are given relative to `src/affectlog/` unless they begin with a
top-level directory (`docs/`, `scripts/`, `tests/`, `configs/`). All cited paths,
links and anchors in this file are verified by `scripts/check_doc_references.py`.

## Requirements

| Design area | D3.7 source | Design-document section | Implementation | Verification | Status | Qualification/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| **R1** — ML framework interoperability | Annex A R1 | [Requirements → R1](design-document.md#r1--ml-framework-interoperability) | `models/` adapters + `models/registry.py` | `tests/unit/test_model_adapters.py` | Implemented with qualification | ONNX/PyTorch/TensorFlow are **optional extras**, exercised through the adapter contract only; not validated against production-trained partner models. |
| **R2** — Explanations, importance, comparison | Annex A R2 | [Requirements → R2](design-document.md#r2--explanations-feature-importance-and-model-comparison) | `explanations/generator.py`, `feature_importance.py`, `permutation.py`, `comparison.py`; routers `api/routers/explanations.py`, `api/routers/models.py` | `tests/unit/test_explanations.py` | Implemented | **Requires a registered model**; no dataset-only mode. SHAP is optional (see below). |
| **R3** — Privacy and security | Annex A R3 | [Requirements → R3](design-document.md#r3--privacy-and-security) | `privacy/`, `auth/`, `core/paths.py` | `tests/unit/test_pii_detection.py`, `tests/unit/test_pseudonymizer.py` | Implemented with qualification | Satisfied **for explanation generation**. ALT-AI *does* read raw source datasets to detect and pseudonymise identifiers; output is pseudonymised, **not anonymised**. |
| **R4** — Scalability | Annex A R4 | [Requirements → R4](design-document.md#r4--scalability) | `ingest/large_file.py` (Polars lazy scan) | `tests/performance/test_synthetic_million_rows.py` | Implemented with qualification | Slow test deselected from the default gate; execution is in-process, not queue-backed. |

## Assessment pipeline

| Design area | D3.7 source | Design-document section | Implementation | Verification | Status | Qualification/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| Dataset ingestion | §5.2 dynamic schema parser | [Input / Output Data](design-document.md#input--output-data) | `ingest/csv_reader.py`, `json_reader.py`, `jsonl_reader.py`, `parquet_reader.py`, `large_file.py` | Code inspection; `tests/integration/test_cli_audit_pipeline.py` | Implemented with qualification | Path/URL-based only — **no browser file-upload endpoint** exists. |
| Schema validation | §5.2 dynamic schema parser | [Input / Output Data](design-document.md#input--output-data) | `ingest/validators.py::validate_schema` (`KNOWN_SCHEMAS = maskott_csv_v1`) | `tests/unit/test_maskott_csv_schema.py` | Implemented with qualification | Only Maskott CSV headers validated; other formats return "not yet implemented" but remain readable/profileable. |
| Schema inference | §5.2 nested JSON + CSV | [Features](design-document.md#featuresmain-functionalities) | `ingest/schema_infer.py`, `profiling/schema_profiler.py` | `tests/unit/test_becomino_template_inference.py` | Implemented | — |
| PII detection | §5.3 PII Scrubber | [Requirements → R3](design-document.md#r3--privacy-and-security) | `privacy/pii_detector.py` | `tests/unit/test_pii_detection.py` | Implemented | Regex/heuristic, **not** ML-based. |
| Pseudonymisation | §5.2 SHA-256 + salt variants | [Requirements → R3](design-document.md#r3--privacy-and-security) | `privacy/pseudonymizer.py` (HMAC-SHA256 / salted SHA-256, truncated to 32 chars) | `tests/unit/test_pseudonymizer.py` | Implemented with qualification | Falls back to unkeyed salted SHA-256 when `AFFECTLOG_HASH_SECRET` is unset. **Reversible variant: Not evidenced** — no reverse mapping exists in `src/`. |
| xAPI transformation | §5.3 xAPI Normalizer | [Integrations](design-document.md#integrations) | `transform/maskott_csv_to_xapi.py`, `transform/verb_mapper.py` | `tests/unit/test_csv_to_xapi_transform.py` | Implemented | Scoped to Maskott/Tactileo CSV → xAPI; generic `transform/normalizer.py` raises for unknown formats. |
| Becomino transformation | §2.2 Inokufu use case | [Integrations](design-document.md#partner-data-integrations) | `transform/becomino_template.py` | `tests/unit/test_becomino_template_inference.py` | Implemented | Template-inference based. |
| Statistical profiling | §5.3 Data Profiler | [Architecture](design-document.md#architecture) | `profiling/` (schema, descriptive, temporal, sparsity, drift, entropy, long_tail) | Code inspection | Implemented | — |
| Concentration metrics | §5.2 Gini | [Features](design-document.md#featuresmain-functionalities) | `metrics/concentration.py::gini_index` | `tests/unit/test_metrics_concentration.py` | Implemented | Gini ∈ [0,1] asserted. D3.7's reported Gini = 0.68 is a **dataset finding**, not a software assertion. |
| Coverage@K | §5.2 Coverage@K | [Features](design-document.md#featuresmain-functionalities) | `metrics/coverage.py::compute_coverage` | `tests/unit/test_metrics_coverage.py` | Implemented | Monotonicity in K asserted. |
| Representation index | §5.2 Representation Index | [Features](design-document.md#featuresmain-functionalities) | `metrics/representation.py::representation_index` | `tests/unit/test_metrics_fairness.py` | Implemented | — |
| nDCG / recommender metrics | §5.2 nDCG | [Features](design-document.md#featuresmain-functionalities) | `metrics/recommender.py::ndcg_at_k`, `precision_at_k`, `recall_at_k` | Code inspection | Implemented with qualification | **Not a dataset-only metric** — requires a recommendation list and relevance judgements; not produced by a plain profile run. |
| Fairness metrics | §5.3 Fairness Auditor | [Features](design-document.md#featuresmain-functionalities) | `metrics/fairness.py::compute_fairness`, `metrics/quality.py` | `tests/unit/test_metrics_fairness.py` | Conditional | Representation over observed activity categories only. **Sensitive-attribute fairness deliberately not computed** — gated on approved metadata and lawful basis. |
| Model adapters | Annex A R1 | [Supported Model Types](design-document.md#supported-model-types) | `models/sklearn_adapter.py`, `onnx_adapter.py`, `torch_adapter.py`, `tensorflow_adapter.py`, `http_adapter.py`, `dummy_adapter.py` | `tests/unit/test_model_adapters.py` | Implemented / Optional | sklearn, HTTP and dummy are core; ONNX/PyTorch/TensorFlow require extras. |
| Model explainability (SHAP) | Annex A R2 | [Requirements → R2](design-document.md#r2--explanations-feature-importance-and-model-comparison) | `explanations/generator.py::_shap_importance`, `explanations/shap_adapter.py` | `tests/unit/test_explanations.py` | Optional | SHAP is an optional dependency; degrades to permutation importance, which requires labels `y`. |
| Recipe orchestration | §5.2 multi-stage audit workflow | [Features](design-document.md#featuresmain-functionalities) | `recipes/runner.py::run_audit`, `configs/recipes/*.yaml` | `tests/unit/test_recipes.py`, `tests/integration/test_cli_audit_pipeline.py` | Implemented | Core pipeline; reproducible `config_hash`. |
| Guided assessment workflow | §5.3 technical scenarios | [Architecture](design-document.md#architecture) | `wizard/` (inspector, recommender, validator, executor, output_contract); `api/routers/wizard.py` | `tests/integration/test_wizard_api.py`, `tests/unit/test_wizard_inspector.py`, `tests/unit/test_wizard_validator.py` | Implemented with qualification | Run state is an in-memory dict reconstructed from disk after restart; not DB-backed. |

## Compliance and interoperability

| Design area | D3.7 source | Design-document section | Implementation | Verification | Status | Qualification/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| Compliance exports | §5.2 Annex IV exporter; §5.3 Compliance Mapper | [Input / Output Data](design-document.md#input--output-data) | `compliance/ai_act_annex_iv.py`, `data_card.py`, `gdpr.py`, `jsonld.py`, `sop.py`, `model_card.py`, `odrl.py`, `provenance.py` | `tests/unit/test_jsonld_export.py` | Implemented | Template-driven generation: Annex IV is boilerplate populated with run metadata — **evidence for** a submission, not a per-model risk analysis. |
| OpenAPI contract | Annex A OpenAPI | [OpenAPI Specification](design-document.md#openapi-specification) | `docs/openapi.yaml` (26 paths, v1 assessment API); live spec at `/openapi.json` | `tests/integration/test_api_openapi_contract.py`; `scripts/validate_openapi.sh` | Implemented with qualification | The committed file covers the **v1 assessment API only**; auth/admin/wizard/editions/capabilities/interoperability routers appear only in the live spec. The contract test does **not** diff live vs committed. |
| PDC integration | §5 PDC / connector | [Integrations via Connector](design-document.md#integrations-via-connector) | `pdc/client.py` (`mock=True` default), `pdc/mock_server.py`, `api/routers/pdc.py` | `tests/integration/test_pdc_mock.py` | Mock-validated; live branch Configuration pending / Externally dependent | Real `httpx` branch activates only when `AFFECTLOG_PDC_URL` is set; never exercised against a live connector here. `MANAGED_PDC` flag off in both editions. |
| ODRL policy artefacts | §5 ODRL | [Relevant Standards](design-document.md#relevant-standards) | `compliance/odrl.py` | `tests/integration/test_pdc_mock.py` | Mock-validated | Evaluated against the mock connector only. |
| CARiSMA interoperability | §1 BB toolbox; §6.2 planned improvements | [Direct Integrations with Other BBs](design-document.md#direct-integrations-with-other-bbs) | `interoperability/carisma.py` (JSON Schema + export builder) | `tests/integration/test_carisma_lola_metadata.py` | Interface specified / export-only | **No live integration.** ALT-AI's own exchange schema and worked examples only. |
| LOLA interoperability | §1 BB toolbox; §6.2 planned improvements | [Direct Integrations with Other BBs](design-document.md#direct-integrations-with-other-bbs) | `interoperability/lola.py`, `interoperability/metadata_exchange.py` | `tests/integration/test_carisma_lola_metadata.py` | Interface specified / export-only | **No live integration.** |
| Decentralized AI Training BB | Annex A integrations | [Direct Integrations with Other BBs](design-document.md#direct-integrations-with-other-bbs) | — | — | Externally dependent / Roadmap | Not implemented in RP1; no PDC-mediated model retrieval performed. |
| Live LRS ingestion | §2.2 Maskott outcome | [Integrations via Connector](design-document.md#integrations-via-connector) | — | — | Roadmap | D3.7 records that deeper LRS/connector coupling was not performed in RP1. |

## Platform, security and deployment

| Design area | D3.7 source | Design-document section | Implementation | Verification | Status | Qualification/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| Service topology | §5.3 architecture | [Architecture](design-document.md#architecture) | `docker-compose.yml` (postgres, redis, api, worker, frontend, mailpit); `Dockerfile`, `Dockerfile.worker`, `Dockerfile.frontend` | `docker compose config` — Executed, exit 0 | Implemented | Nginx/TLS service is a commented-out example only. |
| Bootstrap & RBAC seeding | §5.3 deployment | [Configuration and Deployment Settings](design-document.md#configuration-and-deployment-settings) | `scripts/seed_rbac.py`, `scripts/create_initial_admin.py`; `Makefile` `docker-bootstrap`; `auth/rbac.py`, `auth/permissions.py` | Code inspection | Implemented | Explicit init step, not automatic on stack start. |
| Password-pepper boundary | — (implementation constraint) | [Architecture → auth boundary](design-document.md#architecture) | `auth/password.py` `_peppered()` (Argon2id + `settings.password_pepper`) | `tests/unit/test_auth_passwords.py` | Conditional | Pepper defaults empty; hash is bound to the runtime DB **and** pepper. Rotating the pepper invalidates every existing hash. |
| Session authentication | — | [Architecture](design-document.md#architecture) | `auth/sessions.py` (DB-backed, SHA-256 token); HttpOnly `affectlog_session` cookie in `api/routers/auth.py` | `tests/unit/test_auth_tokens.py` | Implemented | Cookie `Secure` flag off by default (`AFFECTLOG_COOKIE_SECURE=false`) for local dev. |
| Authorization (RBAC) | — | [Architecture](design-document.md#architecture) | `auth/dependencies.py` `require_permission` / `require_superadmin`; `auth/permissions.py`; `GET /api/auth/me` | `tests/unit/test_rbac_permissions.py` | Implemented | Super Admin bypasses permission checks by design. |
| Account onboarding | — | [Architecture](design-document.md#architecture) | `auth/onboarding.py::activate_account`, `auth/tokens.py` | `tests/unit/test_registration_approval.py` | Implemented | Admin-approved registration; TTL-bound single-use tokens. |
| Multi-factor auth | — | [Architecture](design-document.md#architecture) | `POST /api/auth/mfa/setup` returns a TOTP secret | Code inspection | Roadmap | Scaffold only; **not enforced**. |
| Workspace / tenancy scoping | — | [Architecture](design-document.md#architecture) | `tenancy/` | Code inspection | Implemented with qualification | Models and scoping exist; per-tenant edition-gate injection not yet wired. |
| Database persistence | — | [Input / Output Data](design-document.md#input--output-data) | `db/models.py` (async SQLAlchemy) | Code inspection | Implemented with qualification | DB serves auth/RBAC/tenancy/compliance records; **pipeline routers do not persist to it**. |
| Filesystem artefacts | §2.2 SOP outputs | [Input / Output Data](design-document.md#input--output-data) | `runs_dir`; path-traversal guards in `core/paths.py`; `raw_exports_enabled=False` | Code inspection | Implemented | Pipeline state is filesystem + in-memory. |
| Background worker | — | [Requirements → R4](design-document.md#r4--scalability) | `jobs/worker.py::main` (sleep-poll stub) | Code inspection | Roadmap | Compose runs the stub; **no Celery app consumes the configured broker**. `DEDICATED_WORKER_POOL` flag off. |
| Edition / feature flags | §6.3 extension possibilities | [Configuration and Deployment Settings](design-document.md#configuration-and-deployment-settings) | `editions/features.py` (14 flags), `editions/base.py`, `editions/gates.py` | `make check-editions`; Code inspection | Conditional | Per-tenant gate injection not wired; `BILLING` is an inactive placeholder. |
| Self-hosted deployment | §2.2 containerised execution | [Configuration and Deployment Settings](design-document.md#configuration-and-deployment-settings) | `docker-compose.yml`; fail-fast on `POSTGRES_PASSWORD`; pseudonymisation on; raw exports off | `docker compose config` — Executed, exit 0 | Implemented | Baseline only — **not** a complete production-hardening specification. |
| Production deployment controls | §6.2 planned improvements | [Configuration and Deployment Settings](design-document.md#configuration-and-deployment-settings) | Not present in the reference stack (TLS, secret manager, image pinning, backups, rate limiting) | Code inspection | Roadmap / deployment-time | Documented as required for production; not provided by the reference stack. No production tag or deployment has been made. |
| Repository promotion | — | [Configuration and Deployment Settings](design-document.md#configuration-and-deployment-settings) | Three-repository path; upstream via reviewed PR | Process (documented) | Implemented | Consortium repo is a source of record, not a deployment source. |
| Repository privacy guard | — | [Architecture](design-document.md#architecture) | `scripts/check_repository_hygiene.py`; blocking CI job gating build/publish | `check_repository_hygiene.py` — Executed, exit 0 | Implemented | Denylist supplied out-of-band; product terminology (ALT-AI, EU AI Act) is not flagged. |
| Documentation reference validation | — | [Document status](design-document.md) | `scripts/check_doc_references.py` | Executed, exit 0 | Implemented | Validates cited paths, relative links, in-page and cross-file anchors, and `make` targets for the three traceability documents. |
| Documentation site build | §5.1 design-document link | — | Markdown set under `docs/`; `Makefile` `docs:` target runs `mkdocs build --strict` | Executed — **no MkDocs configuration file (mkdocs.yml) is present in the repository** | Roadmap | The Markdown documentation set is complete and reference-validated, but the MkDocs site configuration is absent, so `make docs` cannot run as-is. Previously recorded as complete in `ROADMAP.md`; corrected. |

## Evidence and maturity

| Design area | D3.7 source | Design-document section | Implementation | Verification | Status | Qualification/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 M-row evidence | Annex A R4 | [Requirements → R4](design-document.md#r4--scalability) | `ingest/large_file.py`; `scripts/benchmark_million_rows.sh` | `tests/performance/test_synthetic_million_rows.py` (`@pytest.mark.slow`) | Implemented with qualification | **Deselected from the default CI gate.** Throughput/memory figures come from `make benchmark` on a specific host and are not reproduced by standard CI. |
| TRL assessment | §6.1 implemented service | [D3.7 Alignment](design-document.md#d37-alignment) | `docs/trl-assessment.md` | Code inspection + test suite | Implemented with qualification | Assessed **TRL 5**. TRL 5 → 6 requires a live PDC counterparty, queue-backed worker, DB-backed pipeline state, production hardening and a live use-case deployment. |
| Version metadata | — | [Implementation Details](design-document.md#implementation-details) | `src/affectlog/version.py` (`0.1.0`), `pyproject.toml` (`1.0.0`), frontend package (`1.1.0`) | Code inspection | Not evidenced (inconsistent) | Three different versions are declared. Reconciling them is a release-management action, not a documentation change. |

## Summary

The **assessment pipeline** (ingest → privacy → transform → profiling → metrics →
compliance → recipe orchestration → guided workflow → API → dashboard) and the
**authentication/RBAC** stack are implemented and align with the design, subject to
the scoping recorded above (Maskott-CSV-first validation; no browser upload;
representation rather than sensitive-attribute fairness; SHAP optional).

The principal **conditional, mock-only and roadmap** areas, recorded here so the
design document does not over-claim:

- **No browser file-upload endpoint** — ingestion is file-path/URL based.
- **Core pipeline persistence is filesystem + in-memory**, while the (complete) DB
  models are wired into auth/RBAC/tenancy/compliance rather than the pipeline routers.
- **PDC is mock-validated**; **CARiSMA/LOLA are export/schema-only** — no live
  integration with either tool.
- **The Celery/Redis worker is a stub**; asynchronous work runs in-process.
- **Reversible pseudonymisation is not implemented**, and unkeyed hashing is the
  fallback when `AFFECTLOG_HASH_SECRET` is unset.
- **nDCG requires relevance judgements** and is not part of a dataset-only profile.
- **MFA is scaffolded, not enforced.**
- **Production hardening** (TLS, external secrets, image pinning, backups, rate
  limiting, deployment approval) is a deployment-time responsibility, not part of the
  reference Compose stack.
