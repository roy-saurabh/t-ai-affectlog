# Architecture

ALT-AI (AffectLog's Trustworthy AI) is a dataset-first Trustworthy-AI assessment
platform. This document describes the **processing pipeline** (how a dataset flows
through the assessment) and the **deployed runtime** (the services that actually
run), and records how the two map onto each other. For the formal deliverable-level
design see [`design-document.md`](design-document.md); for the area-by-area
conformance record see [`design-conformance.md`](design-conformance.md).

## Processing pipeline

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

### Key design decisions

1. **Streaming-first**: Never load full 1M+ datasets into memory. Polars lazy scanning + chunked iteration.
2. **Privacy-by-default**: Raw personal identifiers never appear in output artifacts (`AFFECTLOG_ALLOW_RAW_IDENTIFIERS=false`, `AFFECTLOG_PSEUDONYMIZE=true`).
3. **Dataset-only mode**: Model adapters are optional — audits run without any ML model.
4. **Recipe-driven**: Pipeline behaviour is configured via YAML recipes, not hardcoded logic.
5. **Reproducible**: Every run produces a `config_hash`, `audit_manifest.json`, and deterministic IDs.

### Component map

| Component | Module | Purpose |
|---|---|---|
| `ModelAdapter` | `src/affectlog/models/` | Standardized ML model interface |
| `ExplanationGenerator` | `src/affectlog/explanations/` | SHAP + permutation importance |
| `ResultsProcessor` | `src/affectlog/reports/` | Dashboard payload, markdown, CSV |
| `SecurityLayer` | `src/affectlog/privacy/` | PII detection + pseudonymisation |
| `PDCClient` | `src/affectlog/pdc/` | Prometheus-X connector (mock + real) |

See [`classDiagram-v1.1.png`](classDiagram-v1.1.png) and
[`sequenceDiagram-v1.1.png`](sequenceDiagram-v1.1.png) for the UML class and
sequence diagrams (rendered PNGs; no editable source is currently tracked).

## Runtime components (deployed system)

The reference self-hosted deployment is defined in
[`docker-compose.yml`](../docker-compose.yml). The services that actually run:

| Service | Image / build | Exposed port | Internal | Health check | Persistence |
|---|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | `5432` | 5432 | `pg_isready` | volume `postgres_data` |
| `redis` | `redis:7-alpine` | — | 6379 | `redis-cli ping` | volume `redis_data` |
| `api` | build `Dockerfile` | `8000` | 8000 | `curl /healthz` | bind mounts `./data`, `./runs`, `./configs` |
| `worker` | build `Dockerfile.worker` | — | — | — (Celery) | bind mounts `./data`, `./runs`, `./configs` |
| `frontend` | build `Dockerfile.frontend` | `3000` → 80 | 80 | — | — |
| `mailpit` | `axllent/mailpit` | `8025` (UI), `1025` (SMTP) | — | — | — (dev email sink) |

Notes:

- **Dependency ordering**: `api` and `worker` start only after `postgres` and
  `redis` report healthy (`depends_on: condition: service_healthy`);
  `frontend` depends on `api`.
- **Worker**: a Celery worker (broker/result backend on Redis) for background
  execution. It is present in the reference Compose stack.
- **Mailpit** is a development email sink; `AFFECTLOG_EMAIL_SEND_ENABLED=false`
  by default. It is not a production mail service.
- **Nginx/TLS**: a reverse-proxy service is present only as a commented-out
  example. TLS termination is **not** part of the reference Compose stack — see
  [Deployment model](#deployment-model).
- **Named volumes** persist Postgres and Redis data; application `data/`, `runs/`
  and `configs/` are host bind mounts in the reference stack.

### Host-development vs Docker self-hosted mode

- **Host development**: run the API/worker directly from a single `.env`
  (`make dev`, `make seed`, `make create-admin`). The database URL and password
  pepper come from that one `.env`, so host and runtime always match.
- **Docker self-hosted**: the API runs *inside* the `api` container against the
  Compose Postgres, using the container's environment. Bootstrap (RBAC seed +
  admin creation) must therefore run **inside the `api` container**
  (`make docker-bootstrap`) — see the authentication boundary below.

## Authentication and authorization boundary

- **Administrator bootstrap is an explicit initialization step**, not an
  automatic side effect of starting the stack. RBAC seed data (roles,
  permissions, workspaces) and the initial administrator account must be created
  in the **API runtime's database**.
- **The password hash is bound to two runtime facts**: the database it is written
  to, and the configured password pepper (`AFFECTLOG_PASSWORD_PEPPER`) used to
  compute it. An authentication record created under a *different* database or a
  *different* pepper is **not portable** to the running API.
- **Consequence for Docker**: bootstrap runs inside the `api` container so it uses
  the same `AFFECTLOG_DATABASE_URL` and `AFFECTLOG_PASSWORD_PEPPER` as the server.
  Running it on the host — where those differ — is the classic cause of a
  "created admin but *Invalid credentials*" login failure.
- **Local host development** bootstrap remains a distinct workflow (`make seed`,
  `make create-admin`), correct because host and runtime share one `.env`.
- **Failed authentication returns a generic credential error** (it does not
  disclose whether the email exists or the password was wrong).
- **Secrets are configuration, not source**: peppers, secret keys and database
  passwords are supplied via `.env` (git-ignored) or an external secret manager;
  Compose fails fast if `POSTGRES_PASSWORD` is unset. Secrets must not be logged
  or committed.

## Deployment model

Four distinct deployment contexts, in increasing order of hardening:

1. **Local host development** — single `.env`, no containers required; fastest
   inner loop.
2. **Docker Compose self-hosting** — the reference stack in `docker-compose.yml`.
   It is a working, security-conscious *starting point* (fail-fast on missing DB
   password, pseudonymisation on, raw exports off, dev cookies), **but it is not by
   itself a complete production-hardening specification.**
3. **AffectLog-controlled production operation** — the managed edition, operated by
   AffectLog with production controls layered on top.
4. **Official Prometheus-X source publication** — the public Community-Edition
   source of record in the consortium organization.

A production deployment of the self-hosted stack must additionally address, as
applicable:

- TLS termination and HSTS; secure cookies (`AFFECTLOG_COOKIE_SECURE=true`) and a
  trusted-origin / CORS allow-list scoped to real hostnames;
- external secret management (not `.env` defaults) with rotation;
- immutable, digest-pinned container images;
- database migrations run as an explicit, ordered step;
- backup and restore for Postgres (and Redis if used as more than a cache);
- monitoring/alerting and log redaction (no secrets or raw identifiers in logs);
- container/service health checks and a defined rollback path;
- rate limiting on authentication and upload endpoints;
- a deployment-approval gate before release.

The reference Compose stack does **not** claim to provide all of the above; it
provides a reproducible baseline that a deploying institution hardens.

## Repository promotion model

Source flows through three stages, each with a distinct role. No stage
auto-pushes to the next.

```
roy-saurabh/edge_affectlog
        │  validated development promotion (reviewed PR)
        ▼
roy-saurabh/t-ai-affectlog                 ← AffectLog production / release repo
        │  reviewed public upstream promotion (cross-repo PR)
        ▼
Prometheus-X-association/t-ai-affectlog     ← official consortium source of record
```

- **Development validation, production release, and consortium publication are
  distinct stages.** A change is validated in development before it is promoted.
- **No direct automated push to the consortium `main` branch is permitted.**
  Official upstream changes arrive as a reviewable pull request.
- **Source commits and release artifacts remain traceable** across the promotion
  path (cherry-picks carry a source-commit provenance line).
- **Production deployment must not originate from the consortium record
  repository.** The consortium repo is a published source of record, not a
  production deployment source.
