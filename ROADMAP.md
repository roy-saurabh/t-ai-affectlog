# AffectLog Roadmap

This roadmap outlines the planned development trajectory for the AffectLog Trustworthy AI Assessment platform.

## v1.0 — Current release (June 2026)

- [x] Full-stack platform (FastAPI + React)
- [x] Admin-approved registration and onboarding
- [x] RBAC (9 roles, 34 permissions, workspace tenancy)
- [x] Gmail SMTP email with 7 templates
- [x] Dataset audit pipeline (12+ stages)
- [x] 1M+ row CSV processing (Polars/DuckDB)
- [x] CSV-to-xAPI transformation (Maskott/Tactileo mapping)
- [x] Becomino template inference
- [x] Privacy profiling (PII, pseudonymisation, risk scoring)
- [x] Statistical profiling (entropy, sparsity, temporal, long-tail)
- [x] Fairness and concentration metrics (Gini, Coverage@K)
- [x] Model adapters (sklearn, ONNX, PyTorch, TF, HTTP, dummy)
- [x] SHAP-based explanation adapter
- [x] JSON-LD compliance graph (W3C PROV)
- [x] GDPR and EU AI Act Annex IV mapping
- [x] Data cards and model cards
- [x] CARiSMA metadata interoperability (export/import)
- [x] LOLA metadata interoperability (shared metrics vocabulary)
- [x] OpenAPI 3.1 documentation
- [x] Docker Compose deployment
- [x] MkDocs documentation site
- [x] Comprehensive test suite
- [x] Open-source contribution workflow

## v1.1 — Planned (Q3 2026)

- [ ] Alembic migration scripts for production schema management
- [ ] S3/MinIO object storage backend for uploaded datasets
- [ ] Mandatory MFA for admin and superadmin accounts
- [ ] Playwright E2E test suite (CI-integrated)
- [ ] TOTP MFA full enforcement
- [ ] Workspace management UI in admin panel
- [ ] Role builder UI in admin panel
- [ ] Celery task monitoring in admin system health page
- [ ] Pagination for audit log and user list
- [ ] Dataset comparison across audit runs

## v1.2 — Planned (Q4 2026)

- [ ] xAPI LRS connector for direct statement ingestion
- [ ] Real-time audit progress streaming (SSE or WebSocket)
- [ ] Recipe builder wizard in frontend
- [ ] Model card template contribution pathway
- [ ] Enhanced SHAP visualisation in dashboard
- [ ] Drift detection across multiple audit runs
- [ ] Fairness comparison across dataset versions
- [ ] Data-space connector reference implementation (Prometheus-X PDC)

## v2.0 — Research track (2027)

- [ ] Federated SHAP computation (privacy-preserving distributed explanations)
- [ ] Live CARiSMA service integration (pending endpoint availability)
- [ ] Live LOLA service integration (pending endpoint availability)
- [ ] Cross-institutional anonymisation benchmarking
- [ ] Differential privacy budget tracking
- [ ] Multi-language frontend (FR, DE, NL)
- [ ] Dataset reproducibility certificates

---

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and [GitHub Issues](https://github.com/Prometheus-X-association/t-ai-affectlog/issues).
