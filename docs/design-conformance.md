# Design conformance record

This record maps each design area of ALT-AI to what is actually implemented in
the codebase, with the concrete evidence and its verification method. It is
deliberately conservative: features are recorded as **Conditional**, **Partially
aligned** or **Roadmap** wherever the code gates them, stubs them, or scopes them
to a subset — rather than claiming completeness the code does not have.

**Status legend**

- **Aligned** — implemented and matches the design.
- **Partially aligned** — implemented for a subset; design implies broader scope.
- **Conditional** — implemented but active only under configuration / an optional
  dependency / an edition flag.
- **Roadmap** — designed/scaffolded but not functionally implemented.

Evidence paths are relative to the repository root. "Code inspection" means the
cited source was read directly; "Executed" means the check was run for this record.

| Design area | Documented location | Implementation evidence | Verification | Status | Limitation |
| --- | --- | --- | --- | --- | --- |
| Service topology | `docs/architecture.md` §Runtime components | `docker-compose.yml` (postgres, redis, api, worker, frontend, mailpit); `Dockerfile`, `Dockerfile.worker`, `Dockerfile.frontend` | `docker compose config` — Executed, exit 0; Code inspection | Aligned | Nginx/TLS service is a commented-out example only. |
| Bootstrap & RBAC seeding | `docs/architecture.md` §Auth boundary; `README` | `scripts/seed_rbac.py`, `scripts/create_initial_admin.py`; `Makefile` `docker-bootstrap`; `src/affectlog/auth/rbac.py`, `auth/permissions.py` | Code inspection | Aligned | Bootstrap is an explicit init step, not automatic on stack start. |
| Password-pepper boundary | `docs/architecture.md` §Auth boundary | `src/affectlog/auth/password.py` `_peppered()` (Argon2id + `settings.password_pepper`); `config.py` pepper default empty; compose sets dev value | Code inspection | Conditional | Pepper defaults empty; hash is bound to the runtime DB+pepper — the root cause this change fixes. |
| Database initialization | `docs/architecture.md` §Runtime | `src/affectlog/db/models.py` (full async SQLAlchemy models); seed/admin scripts create tables | Code inspection | Aligned | Tables are created by seed/admin scripts; run `docker-bootstrap` before first login. |
| Session authentication | `docs/architecture.md` §Auth boundary | `src/affectlog/auth/sessions.py` (DB-backed, SHA-256 token), HttpOnly `affectlog_session` cookie in `routers/auth.py::login` | Code inspection | Aligned | Cookie `Secure` flag is off by default (`AFFECTLOG_COOKIE_SECURE=false`) for local dev. |
| Authorization (RBAC) | `docs/architecture.md` §Auth boundary | `auth/dependencies.py` `require_permission` / `require_superadmin`; `auth/permissions.py` role→permission matrix; `GET /api/auth/me` returns roles/permissions | Code inspection | Aligned | Super Admin bypasses permission checks by design. |
| Multi-factor auth | `docs/design-document.md` | `POST /api/auth/mfa/setup` returns a TOTP secret; docstring: "Full TOTP not yet enforced in this release" | Code inspection | Roadmap | Scaffold only; not enforced. |
| Input ingestion | `docs/architecture.md` §Pipeline | `api/routers/datasets.py` `POST /v1/datasets/ingest` (registers a `file_path`); readers `ingest/csv_reader.py`, `large_file.py` (Polars lazy); wizard URL fetch with SSRF guard | Code inspection | Partially aligned | Path/URL-based only; **no browser file-upload endpoint** exists. |
| Format validation | `docs/architecture.md` §Pipeline | `ingest/validators.py::validate_schema` (`KNOWN_SCHEMAS = maskott_csv_v1`) | Code inspection | Partially aligned | Only Maskott CSV headers validated; other formats return "not yet implemented". |
| PII detection | `docs/privacy-and-security.md` | `privacy/pii_detector.py` (regex field/value patterns); wired into `schema_profiler.py` | Code inspection | Aligned | Heuristic/regex, not ML-based. |
| HMAC pseudonymisation | `docs/privacy-and-security.md` | `privacy/pseudonymizer.py::Pseudonymizer.hash` (HMAC-SHA256 truncated); used in transform + `recipes/runner.py` | Code inspection | Conditional | Falls back to plain SHA-256 if `AFFECTLOG_HASH_SECRET` is unset; set it in production. |
| Transformations / xAPI | `docs/architecture.md` §Pipeline | `transform/maskott_csv_to_xapi.py` (streaming xAPI build); `verb_mapper.py`, `becomino_template.py` | Code inspection | Aligned | Scoped to Maskott/Tactileo CSV → xAPI; generic `normalizer.py` raises for unknown formats. |
| Profiling | `docs/architecture.md` §Pipeline | `profiling/` (schema, descriptive, temporal, sparsity, drift, entropy, long_tail); `POST /v1/datasets/{id}/profile` | Code inspection | Aligned | — |
| Fairness & representation metrics | `docs/architecture.md` §Pipeline | `metrics/fairness.py::compute_fairness` (representation over activity categories); `representation.py`, `coverage.py`, `concentration.py`, `quality.py` | Code inspection | Conditional | Sensitive-attribute fairness deliberately not computed — gated on approved metadata/consent. |
| Model explainability | `docs/design-document.md` §Architecture | `explanations/generator.py` (`shap.Explainer` with permutation fallback); `shap_adapter.py` returns error if SHAP absent | Code inspection | Conditional | SHAP is an optional dependency; degrades to permutation importance when absent. |
| Recipe orchestration | `docs/recipes.md`, `docs/architecture.md` | `recipes/runner.py::run_audit` (~13 stages); `configs/recipes/*.yaml` | Code inspection | Aligned | Core pipeline. |
| Guided Assessment Wizard | `docs/guided-analysis-wizard.md` | `wizard/` (inspector, recommender, validator, executor, output_contract); `api/routers/wizard.py`; 22 frontend components | Code inspection | Aligned | Run state is an in-memory dict reconstructed from disk after restart; not DB-backed. |
| Compliance exports | `docs/compliance-mapping.md` | `compliance/` (`ai_act_annex_iv.py`, `data_card.py`, `gdpr.py`, `jsonld.py`, `sop.py`, `model_card.py`, `odrl.py`); DB `ComplianceExport` | Code inspection | Aligned | Template-driven document generation (Annex IV = boilerplate populated with run metadata), not per-model risk analysis. |
| PDC integration | `docs/architecture.md` §Component map | `pdc/client.py::PDCClient` (`mock=True` default; real `httpx` branch when `AFFECTLOG_PDC_URL` set); `pdc/mock_server.py`; router labelled "(mock)" | Code inspection | Conditional | Mock/stub by default; live connector present but config-gated and not exercised. Managed-PDC flag off in both editions. |
| Persistence / output boundaries | `docs/data-governance.md` | DB models in `db/models.py`; pipeline uses `_dataset_registry`, `_run_status`, `_WIZARD_RUNS` + filesystem `runs_dir`; path-traversal guards in `core/paths.py`; `raw_exports_enabled=False` | Code inspection | Partially aligned | DB layer fully models datasets/runs but the pipeline routers persist to filesystem + in-memory; DB is wired for auth/RBAC. |
| Edition / feature flags | `docs/licensing-and-editions.md`, `docs/community-vs-managed.md` | `editions/features.py` (14 flags, community/managed defaults), `base.py::get_deployment_mode`, `gates.py::requires_feature` | `make check-editions` available; Code inspection | Conditional | Per-tenant gate injection not yet wired; `BILLING` flag is an inactive placeholder. |
| Background worker | `docs/saas-architecture.md` | `jobs/worker.py::main` (sleep-poll stub); real async work uses FastAPI `BackgroundTasks` + `threading.Thread` | Code inspection | Roadmap | Compose runs the stub; no Celery app consumes the configured broker. `DEDICATED_WORKER_POOL` flag off. |
| Compose deployment (self-hosted) | `docs/architecture.md` §Deployment model; `README` | `docker-compose.yml`; fail-fast on `POSTGRES_PASSWORD`; pseudonymisation on; raw exports off | `docker compose config` — Executed, exit 0 | Aligned | Baseline only — **not** a complete production-hardening spec (see below). |
| Production release controls | `docs/architecture.md` §Deployment model | Not present in the reference stack (TLS, secret manager, image pinning, backups, rate limiting are deployment-time concerns) | Code inspection | Roadmap | Documented as required for production; not provided by the reference Compose stack. |
| Repository promotion | `docs/architecture.md` §Repository promotion model | Three-repo path; no automated push to consortium `main`; upstream via reviewed PR | Process (documented) | Aligned | Consortium repo is a source of record, not a deployment source. |
| Repository privacy guard | `.github/workflows/deploy.yml` (hygiene job) | `scripts/check_repository_hygiene.py`; blocking CI job gating build/publish; denylist supplied out-of-band | `check_repository_hygiene.py` — Executed, exit 0 | Aligned | Scans for private identifiers / correspondence markers; product terminology (ALT-AI, EU AI Act) is not flagged. |

## Summary

The **assessment pipeline** (ingest → privacy → transform → profiling → metrics →
compliance → recipe orchestration → wizard → API → dashboard) and the
**authentication/RBAC** stack are implemented and align with the design, with the
scoping noted above (Maskott-CSV-first ingestion; no browser upload; representation
rather than sensitive-attribute fairness; SHAP optional).

The main **partial/roadmap** areas, recorded honestly here so the design document
does not over-claim:

- **No browser file-upload endpoint** — ingestion is file-path/URL based.
- **Core pipeline persistence is filesystem + in-memory**, while the (complete) DB
  models are wired into auth/RBAC rather than the dataset/run/wizard routers.
- **PDC and CARiSMA/LOLA interoperability** are mock/stub by default; schema export
  is real, live service integration is config-gated.
- **The Celery/Redis worker is a stub**; asynchronous work runs in-process via
  FastAPI background tasks and threads.
- **Production hardening** (TLS, external secrets, image pinning, backups, rate
  limiting, deployment approval) is a deployment-time responsibility, not part of
  the reference Compose stack.
