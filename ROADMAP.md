# AffectLog Roadmap & Delivery Status

This roadmap records the delivery status of the AffectLog Trustworthy AI (ALT-AI)
component and its planned trajectory. It is written to match the official D3.7
position: **the deliverable is complete and validated at TRL 5; the remaining
step to TRL 6 is environmental (operation on a live partner data source), not
further component development.**

- **Maintained by:** AffectLog SAS — roy@affectlog.com
- **Project:** EDGE-Skills / Prometheus-X, WP3 / D3.7 (BB04 — Trustworthy AI Assessment)
- **Managed Edition / use-case enquiries:** <https://trustworthyai.affectlog.com/request-access>

---

## Current status (D3.7, TRL 5)

ALT-AI is **delivered and validated at TRL 5** against the available partner
datasets (Maskott/Tactileo, Inokufu/Becomino) per D3.7, with a stable
OpenAPI 3.1 contract, four pre-built recipes and seven compliance artefacts.

**The significant gap is environmental, not functional.** The master products do
not yet expose a live/production data source or model to assess, so assessment
currently runs on exported data in a developer environment. Closing this is the
documented **TRL 5 → TRL 6** step (operation on partner infrastructure with live
ingestion), which depends on use-case maturity rather than on additional
component development. See [docs/trl-assessment.md](docs/trl-assessment.md) for
the formal evidence statement.

### No interface changes required

No interface change is required for the delivered D3.7 scope. The API, data model
and message schemas are stable; the pre-built recipes (Maskott CSV,
Inokufu/Becomino xAPI, generic xAPI, tabular + model) and the CARiSMA/LOLA
metadata-exchange endpoints are implemented. Any future live operation is the
**activation** of the already-specified PDC connector / LRS ingestion against the
existing OpenAPI 3.1 contract — **configuration, not a schema change.**

### Integration testing

ALT-AI is validated end-to-end on the actual use-case datasets at TRL 5, with a
stable OpenAPI 3.1 contract and standards-based, machine-readable outputs
(JSON-LD/PROV-O, Data Card, Model Card, GDPR field inventory, EU AI Act Annex IV,
SOP, ODRL) designed for downstream consumption. The repository includes worked
interoperability examples and documented import/export formats so its assessment
evidence can be ingested by other systems.

A **live service-chain test across BB04 components on real partner
infrastructure has not yet run** — it is the operational (TRL 5 → 6) step and
depends on a live use case being made available. The AffectLog component is
complete and conformant to its published interface and ready for that exchange
when one exists. (These statements reference only AffectLog's own published
interfaces and the worked examples in this repository; no joint test or alignment
with other BB04 tools is claimed.)

### Performance baseline

A **throughput baseline is established and enforced in CI**: 1,000,000+ rows
processed end-to-end via Polars lazy scanning without loading the full dataset
into memory (`make benchmark`, `make test-slow`). This is a throughput baseline
rather than a latency/SLA figure; defined latency bounds on partner hardware fall
under the operational (TRL 6) step, outside the delivered D3.7 scope.

### The one input that would most improve fitness for the use case

Access to one real, production-grade use case for either provider
(Inokufu/Maskott) — a live data source (e.g. an LRS / streaming feed) or a
partner production model — made available under a lawful data-sharing / PDC
arrangement. The component is ready; a real operational input is what would move
it from TRL 5 (validated on exported data) toward TRL 6 (prototype in an
operational environment). This depends on the master products / consortium use
cases, not on additional AffectLog development.

---

## Delivered — v1.0 (June 2026)

- [x] Full-stack platform (FastAPI + React)
- [x] Admin-approved registration and onboarding
- [x] RBAC (9 roles, 34 permissions, workspace tenancy)
- [x] Gmail SMTP email with 7 templates
- [x] Dataset audit pipeline (12+ stages)
- [x] 1M+ row CSV processing (Polars lazy scanning, no full-dataset load)
- [x] CSV-to-xAPI transformation (Maskott/Tactileo mapping)
- [x] Becomino template inference
- [x] Privacy profiling (PII, pseudonymisation, risk scoring)
- [x] Statistical profiling (entropy, sparsity, temporal, long-tail)
- [x] Fairness and concentration metrics (Gini, Coverage@K)
- [x] Model adapters (sklearn, ONNX, PyTorch, TF, HTTP, dummy)
- [x] SHAP-based explanation adapter
- [x] JSON-LD compliance graph (W3C PROV-O)
- [x] GDPR field inventory and EU AI Act Annex IV mapping
- [x] Data cards (Gebru 2018) and model cards (Mitchell 2019)
- [x] CARiSMA metadata-exchange endpoints (AffectLog export/import)
- [x] LOLA metadata-exchange endpoints (AffectLog shared-metrics vocabulary)
- [x] OpenAPI 3.1 contract
- [x] Pre-built recipes (Maskott CSV, Inokufu/Becomino xAPI, generic xAPI, tabular + model)
- [x] Prometheus-X PDC connector (specified; mock + client)
- [x] Docker Compose deployment
- [x] MkDocs documentation site
- [x] Comprehensive test suite
- [x] Open-source contribution workflow

> CARiSMA/LOLA support here means AffectLog's **own** metadata-exchange endpoints
> and standards-based export/import formats, plus worked examples — not a
> completed live integration with those tools.

---

## Operational activation (TRL 5 → 6) — dependent on a live use case

These items are **configuration / activation against an existing, stable
interface**, not new component development. They become possible once a partner
exposes a live data source or model under a data-sharing / PDC arrangement.

- [ ] Activate the specified Prometheus-X PDC connector in a live data-space
      transaction (ODRL policy enforcement, not just the mock server)
- [ ] Activate xAPI LRS ingestion against a live statement feed
- [ ] End-to-end service-chain test across BB04 components on partner infrastructure
- [ ] Latency / SLA characterisation on partner hardware

---

## Planned development

### v1.1 — Q3 2026

- [ ] Alembic migration scripts for production schema management
- [ ] S3/MinIO object storage backend for uploaded datasets
- [ ] Mandatory MFA (TOTP) for admin and superadmin accounts
- [ ] Playwright E2E test suite (CI-integrated)
- [ ] Workspace management UI in admin panel
- [ ] Role builder UI in admin panel
- [ ] Celery task monitoring in admin system-health page
- [ ] Pagination for audit log and user list
- [ ] Dataset comparison across audit runs

### v1.2 — Q4 2026

- [ ] Real-time audit progress streaming (SSE or WebSocket)
- [ ] Recipe builder wizard in frontend
- [ ] Model card template contribution pathway
- [ ] Enhanced SHAP visualisation in dashboard
- [ ] Drift detection across multiple audit runs
- [ ] Fairness comparison across dataset versions

### v2.0 — Research track (2027)

- [ ] Federated SHAP computation (privacy-preserving distributed explanations)
- [ ] Live CARiSMA service integration (pending external endpoint availability)
- [ ] Live LOLA service integration (pending external endpoint availability)
- [ ] Cross-institutional anonymisation benchmarking
- [ ] Differential privacy budget tracking
- [ ] Multi-language frontend (FR, DE, NL)
- [ ] Dataset reproducibility certificates

---

## Sustainability & post-project operation (after M36 — Dec 2026)

**A named organisation is committed to operating the service after M36: AffectLog SAS.**
Post-project operation is already viable as delivered — the Community Edition is
MIT-licensed, self-hostable and dependency-complete, so continuity needs no
further AffectLog work or funding.

- **Community Edition** — free and open source (MIT) **in perpetuity**, no licence
  fee. Permanently available and self-hostable from the public Prometheus-X
  repository.
- **Managed Edition** — commercially operated by AffectLog SAS: hosting,
  monitoring, support, and use-case-contextual Trustworthy-AI assessment for
  institutions that prefer an operated service.

AffectLog SAS is actively available to take on managed operation, use-case
onboarding, and related consulting for consortium partners and master products
beyond the project.

### What is needed to make use-case-specific operation viable

For a given master product, two contextual inputs are required (both on the
partner side):

1. Access to the real data source / model under a lawful data-sharing / PDC
   arrangement.
2. The use-case scope, infrastructure target, and SLA expectations.

AffectLog offers exactly this as a Managed Edition engagement — contextual
assessment scoping, infrastructure operation / hosting, onboarding, and
consulting — on commercial terms.

### Commercial model

A dual model with an open commercial offering:

- The **Community Edition is free and open source (MIT) in perpetuity** — no
  licence fee.
- The AffectLog-operated **Managed Edition** is offered on a tiered subscription
  (Starter / Professional / Enterprise) scaled by usage (audit runs, data volume,
  workspaces, support level), with use-case-contextual assessment, infrastructure
  operation / hosting, onboarding and consulting available as scoped add-ons
  (typically day-rate or fixed-scope).

Specific pricing is subject to commercial terms under negotiation. AffectLog
welcomes engagement with consortium partners and master products to scope these
per use case — <https://trustworthyai.affectlog.com/request-access>.

### Adaptation capacity

- **Remaining project period (to M36):** < 20 person-days — the D3.7 component is
  delivered and complete, so this in-project capacity covers maintenance only.
- **First six months after the project (H1 2027):** ~20 person-days, available as
  commercially scoped Managed Edition / consulting engagements (use-case
  adaptation, infrastructure integration, contextual assessment), sized to the
  specific engagement rather than as unfunded project effort.

---

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[GitHub Issues](https://github.com/Prometheus-X-association/t-ai-affectlog/issues).
