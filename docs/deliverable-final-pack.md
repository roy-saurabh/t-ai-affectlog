# AffectLog – Trustworthy AI Assessment
## Final Deliverable Documentation Pack
### Prometheus-X BB04 / EDGE-Skills Building Block

> **For project reviewers and maintainers.**  
> This document provides a complete overview of the implemented AffectLog platform for reporting and deliverable purposes. The public-facing homepage and product surfaces do not repeat this internal framing.

---

## 1. Application Overview

**AffectLog – Trustworthy AI Assessment** is a production-grade, open-source full-stack application for privacy-preserving dataset and model audits in education and skills data spaces.

It is developed as the **AffectLog building block** within the Prometheus-X Trustworthy AI Assessment ecosystem (BB04), in the context of the **EDGE-Skills project** (Grant agreement ID: 101123471), co-funded by the European Union under the Digital Europe Programme.

**Repository:** https://github.com/Prometheus-X-association/t-ai-affectlog  
**License:** MIT  
**Version:** 1.0.0  
**Status:** Production-ready open-source release

---

## 2. Implemented Service Scope

The following capabilities have been fully implemented:

### 2.1 Platform infrastructure
- Full-stack application: FastAPI backend + React/TypeScript frontend
- PostgreSQL database with SQLAlchemy 2.0 async ORM and Alembic migrations
- Redis + Celery for background job processing
- Docker Compose deployment with Nginx reverse proxy example
- OpenAPI 3.1 documented REST API
- MkDocs Material documentation site

### 2.2 Authentication and authorisation
- Admin-approved user registration workflow
- One-time activation token (24h TTL, single-use, hashed)
- Email + password login with Argon2id hashing
- Session-based auth with HttpOnly cookies
- Account lockout after configurable failed attempts
- Password reset via 30-minute single-use token
- TOTP MFA scaffold
- Gmail SMTP email with App Password support
- 7 HTML email templates (registration, activation, rejection, reset, more-info, security alert, admin notification)
- Local dev email capture via Mailpit

### 2.3 RBAC
- 9 system roles: Super Admin, Admin, Project Maintainer, Auditor, Data Steward, Model Developer, Researcher, Viewer, Developer Contributor
- 34 granular permissions across users, roles, datasets, audits, models, compliance, recipes, PDC, system
- Policy-based permission checks (not role-name checks)
- DB-seeded, extensible role/permission model
- Workspace-aware authorisation (datasets/runs scoped to workspaces)
- 5 default workspaces: default, demo, maskott-tactileo, inokufu-becomino, public-samples

### 2.4 Dataset workflows
Processing pipeline with 12+ stages:
1. Ingest (CSV / JSON / JSONL / Parquet)
2. Schema validation
3. PII scan (name, email, phone, IP, ID patterns)
4. Pseudonymisation (HMAC-SHA256 with configurable secret)
5. xAPI normalisation (Maskott/Tactileo column mapping)
6. Becomino template inference (schema-agnostic)
7. Statistical profiling (missingness, completeness, entropy)
8. Temporal density analysis
9. Sparsity analysis
10. Concentration metrics (Gini, Coverage@K, dominance ratios)
11. Long-tail analysis
12. Fairness and representation metrics
13. Data card export
14. SOP export
15. JSON-LD compliance graph
16. Dashboard payload

### 2.5 Large-file processing (1M+ rows)
- Polars lazy evaluation for memory-safe chunked ingestion
- DuckDB for SQL analytics on large files
- Configurable chunk size (default 100,000 rows)
- Invalid row quarantine with count reporting
- Streaming JSONL output
- Progress logging per chunk
- CLI: `affectlog generate-synthetic --rows 1000000`
- CLI: `affectlog convert-csv --input maskott_1m.csv`

### 2.6 CSV-to-xAPI transformation
Exact column mapping for Maskott/Tactileo headers:
- `_id` → xAPI statement id
- `AccessDate` → timestamp (ISO 8601, UTC normalised)
- `ViewContext` → context category + verb mapping
- `ResourceId` → object.id
- `ResourceType` → object.definition.type
- `CollectionId` → context.contextActivities.grouping
- `ActivitySessionId` → context.registration / extension
- `Duration` → result.duration (ISO 8601) + extension durationRaw
- `EntityId` → actor account name (pseudonymised)
- `EntityUaiCode` → hashed institution extension or suppressed
- `IsViewerAuthor` → context extension
- `IsViewerAnonymous` → privacy flag, actor anonymity level

### 2.7 Model assessment
- scikit-learn, ONNX, PyTorch, TensorFlow/Keras, HTTP endpoint, and dummy adapters
- Model registration and model card generation
- Feature importance and permutation importance
- SHAP adapter (optional)
- Model comparison
- Dataset-model schema interface validation

### 2.8 Compliance exports
- GDPR article mapping (Art.5, Art.17, Art.25, Art.35)
- EU AI Act Annex IV checklist
- JSON-LD compliance graph (W3C PROV-compatible)
- ODRL policy scaffolds
- Data cards and model cards
- SOP (Standard Operating Procedure) documents
- Audit manifest

### 2.9 CARiSMA and LOLA interoperability
- Structured export schema for CARiSMA design-time risk analysis
- Structured export schema for LOLA algorithm evaluation scenarios
- Shared metrics vocabulary: Gini, Coverage@K, nDCG, precision, recall, hit rate, diversity, novelty, personalization, entropy, sparsity
- 6 interoperability API endpoints
- Full documentation and worked example in JSON

### 2.10 OpenAPI and PDC
- Full OpenAPI 3.1 specification generated automatically by FastAPI
- PDC client stub and ODRL policy evaluation mock
- 60+ documented API endpoints

---

## 3. Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Browser                                                    │
│  React + Vite + TypeScript + Tailwind CSS                  │
│  Public: homepage, auth pages                              │
│  App: dashboard, datasets, audits, compliance, models      │
│  Admin: registrations, users, roles, audit log             │
└────────────────┬───────────────────────────────────────────┘
                 │ HTTP (SPA) + Cookie-auth
┌────────────────▼───────────────────────────────────────────┐
│  Nginx (optional production reverse proxy)                 │
└────────────────┬───────────────────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────────────────┐
│  FastAPI (Python 3.11+)                                    │
│  OpenAPI 3.1 — 60+ endpoints                              │
│  CORS, rate limiting (slowapi), security headers          │
│  Auth: session cookies + RBAC permission guards           │
│                                                            │
│  Routers:                                                  │
│    /api/public    — registration, activation, reset       │
│    /api/auth      — login, logout, me, MFA                │
│    /api/admin     — approvals, users, audit log           │
│    /v1/datasets   — ingest, validate, transform, profile  │
│    /v1/audits     — run, artifacts, metrics               │
│    /v1/models     — register, explain, compare            │
│    /v1/compliance — JSON-LD, cards, SOP                   │
│    /v1/interoperability — CARiSMA, LOLA                   │
│    /v1/pdc        — PDC client + mock                     │
└────────────┬────────────────┬──────────────────────────────┘
             │                │
    ┌────────▼─────┐   ┌──────▼──────┐
    │  PostgreSQL  │   │   Redis     │
    │  (SQLAlchemy │   │  (sessions, │
    │   2.0 async) │   │   queue)    │
    └──────────────┘   └──────┬──────┘
                              │
                    ┌─────────▼─────────┐
                    │  Celery Worker    │
                    │  (large-file jobs)│
                    └───────────────────┘
```

---

## 4. Public Homepage and Documentation

The public homepage at `/` implements the following sections:
- **Hero** with primary/secondary/tertiary CTAs
- **Trust badges** (7 capability indicators)
- **Problem section** (education AI data risks)
- **Capabilities grid** (10 capability cards)
- **Workflow stepper** (9 pipeline steps)
- **Use-case cards** (8 real-world scenarios)
- **Ecosystem integrations** (CARiSMA, LOLA, AffectLog cards)
- **Developer CTA** (5 contribution action buttons)
- **Final CTA** (4 action buttons)
- **EU Funding Footer** (brand assets, acknowledgement, links)

The homepage does **not** mention D3.7, TRL levels, reporting period wording, or internal project identifiers. These appear only in maintainer documentation.

All homepage copy is centralised in `frontend/src/content/homepage.ts` for easy maintenance.

---

## 5. Authentication and Admin Approval

**Registration flow:**
1. User submits `/register` form (7 fields + 2 agreements)
2. `PendingRegistration` record created; no active account yet
3. Admin receives notification email
4. User sees `/awaiting-approval`

**Admin approval flow:**
1. Admin reviews `/admin/pending-registrations`
2. Assigns role and workspace
3. Approval creates active `User` + one-time `ActivationToken` (24h)
4. User receives email with activation link (or dev console shows token)

**Activation:**
1. User clicks activation link → `/activate?token=...`
2. Token validated (hash check, expiry check, single-use check)
3. User sets password (min 12 chars, Argon2id)
4. Account activated → redirect to login

**Security guarantees:**
- Tokens stored as SHA-256 hashes only
- Plaintext token emailed/shown exactly once
- Single-use enforcement
- Rate limiting on all auth endpoints
- Account lockout (configurable)
- Audit log for all auth events

---

## 6. RBAC Design

Permission resolution: User → UserRole → Role → RolePermission → Permission

All route guards use permission-string checks (not role-name checks):
```python
@router.post("/datasets/ingest")
async def ingest(user = Depends(require_permission(P.DATASETS_UPLOAD))):
    ...
```

Superadmins bypass permission checks (shortcut in `require_permission`).

---

## 7. Privacy and Security Controls

- **Default-deny raw identifiers** (`AFFECTLOG_ALLOW_RAW_IDENTIFIERS=false`)
- **HMAC-SHA256 pseudonymisation** with configurable pepper
- **PII detection** patterns for email, phone, IP, name, ID
- **Upload warnings** in the UI before dataset ingestion
- **Sensitivity labels** on all export downloads
- **Signed or permission-gated artifact downloads**
- **Path traversal prevention** on all file operations
- **MIME type validation** on uploads
- **Raw exports globally disableable** (`AFFECTLOG_RAW_EXPORTS_ENABLED=false`)
- **Audit log** for 15+ event categories
- **Bandit** static analysis in CI
- **pip-audit** dependency scanning
- **CodeQL** code scanning (`.github/workflows/codeql.yml`)
- **Dependency review** on PRs

---

## 8. Testing Evidence

| Category | Tests | Status |
|----------|-------|--------|
| Password hashing | 6 | ✓ |
| Token generation / expiry | 8 | ✓ |
| RBAC permissions | 8 | ✓ |
| Registration workflow | 3 | ✓ |
| Email templates | 7 | ✓ |
| CARiSMA metadata exchange | 9 | ✓ |
| LOLA metadata exchange | 7 | ✓ |
| CSV schema validation | 5 | ✓ |
| CSV-to-xAPI transform | 6 | ✓ |
| Becomino template inference | 4 | ✓ |
| PII detection | 5 | ✓ |
| Pseudonymisation | 4 | ✓ |
| Concentration metrics | 6 | ✓ |
| Coverage metrics | 5 | ✓ |
| Fairness metrics | 5 | ✓ |
| JSON-LD export | 4 | ✓ |
| Model adapters | 8 | ✓ |
| Explanations | 5 | ✓ |
| Recipes | 5 | ✓ |
| CLI audit pipeline | 3 | ✓ |
| OpenAPI contract | 2 | ✓ |
| PDC mock | 2 | ✓ |
| 1M-row synthetic CSV | 1 (slow) | ✓ |

Run: `make test`

---

## 9. Deployment Instructions

### Local development (Docker Compose)

```bash
cp .env.example .env
# Edit .env with secrets
docker compose up --build
# API: http://localhost:8000/docs
# Frontend: http://localhost:3000
# Mailpit: http://localhost:8025
```

### Initial setup

```bash
make install          # Install dependencies
make seed             # Seed RBAC roles/permissions/workspaces
make create-admin     # Create superadmin account
```

### Production checklist

1. Set strong random values for `AFFECTLOG_SECRET_KEY`, `AFFECTLOG_PASSWORD_PEPPER`, `AFFECTLOG_HASH_SECRET`
2. Set `AFFECTLOG_APP_ENV=production`
3. Set `AFFECTLOG_COOKIE_SECURE=true` (requires HTTPS)
4. Set `AFFECTLOG_DEV_SHOW_ACTIVATION_LINK=false`
5. Configure Gmail SMTP App Password or transactional email
6. Set `AFFECTLOG_EMAIL_SEND_ENABLED=true`
7. Use PostgreSQL (not SQLite)
8. Run behind Nginx with TLS
9. Configure `AFFECTLOG_CORS_ALLOWED_ORIGINS` to your domain
10. Disable `AFFECTLOG_PUBLIC_REGISTRATION_ENABLED` if needed
11. Mount `data/` on encrypted volume
12. Enable automated backups for PostgreSQL

---

## 10. Open-Source Contribution Pathway

- License: MIT
- Contributing guide: `CONTRIBUTING.md`
- Code of Conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Governance: `GOVERNANCE.md`
- Contribution areas:
  - Assessment recipes (`configs/recipes/`)
  - Model adapters (`src/affectlog/models/`)
  - Metrics (`src/affectlog/metrics/`)
  - xAPI verb mappings (`configs/mappings/`)
  - Compliance mappings (`configs/mappings/`)
  - Frontend visualisations
  - Documentation translations

---

## 11. Limitations and Future Extensions

### Current limitations
- Alembic auto-migration not fully wired (tables created via `create_all` in dev)
- MFA enforcement optional (TOTP scaffold implemented, not mandatory)
- Large-file uploads require local disk or mounted volume (object storage optional)
- LOLA and CARiSMA integration is metadata-exchange only (no live service calls)
- Frontend E2E tests require running stack

### Planned extensions
- Alembic migration set for production schema management
- S3/MinIO object storage backend for uploaded datasets
- Mandatory MFA for admin accounts
- Live CARiSMA service integration (when endpoint made available)
- Live LOLA service integration
- xAPI LRS integration for direct statement ingestion
- Federated SHAP computation for privacy-preserving distributed explanations
- REST API for recipe contribution from external tools

---

## 12. Appendix — Key Commands

```bash
# Install
make install

# Seed RBAC
make seed

# Create admin
make create-admin

# Run tests
make test

# Lint
make lint

# Type check
make typecheck

# Security scan
make security

# Build docs
make docs

# Build frontend
make frontend

# Start Docker stack
make docker-up

# Generate 1M-row CSV
make synthetic-1m

# Run benchmark
make benchmark

# Full local demo
make demo
```

### Key URLs (local dev)

| Service | URL |
|---------|-----|
| Homepage | http://localhost:3000 |
| Assessment console | http://localhost:3000/app |
| Admin panel | http://localhost:3000/admin |
| API | http://localhost:8000 |
| API docs (OpenAPI) | http://localhost:8000/docs |
| Mailpit (dev email) | http://localhost:8025 |
| Health check | http://localhost:8000/healthz |

---

## 13. Project References

- **Repository:** https://github.com/Prometheus-X-association/t-ai-affectlog
- **Prometheus-X BB04:** https://prometheus-x.org/bb04-trustworthy-ai-assessment/
- **Technical documentation:** https://prometheus-x-association.github.io/docs/t-ai/
- **EDGE-Skills EU project:** https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/883807838/project/101123471/program/43152860/details
- **Prometheus-X Association:** https://prometheus-x.org/

---

*This document is part of the AffectLog project deliverable documentation.*  
*Co-funded by the European Union under the Digital Europe Programme.*  
*Views expressed are those of the authors only.*
