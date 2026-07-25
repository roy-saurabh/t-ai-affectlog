# AffectLog SaaS Architecture

## Overview

AffectLog is distributed as two modes built from a single open-source codebase:

| Layer | Community Edition | Managed Edition |
|-------|------------------|-----------------|
| Core assessment engine | ✅ | ✅ |
| OpenAPI backend | ✅ | ✅ |
| RBAC + admin onboarding | ✅ | ✅ |
| Docker Compose deployment | ✅ | ✅ |
| Multi-tenant workspaces | ❌ (single-tenant) | ✅ |
| AffectLog-operated infrastructure | ❌ | ✅ |
| Managed backups | ❌ | ✅ |
| Platform monitoring | ❌ (local only) | ✅ |
| Managed email | ❌ (Gmail SMTP) | ✅ |
| Support access protocol | ❌ | ✅ |
| Usage metering + quotas | ❌ | ✅ |
| Private tenant option | ❌ | ✅ (opt-in) |
| Bring-your-own-cloud | ❌ | ✅ (opt-in) |

## Deployment Mode

Controlled by `AFFECTLOG_EDITION` environment variable:

```
AFFECTLOG_EDITION=community    # default
AFFECTLOG_EDITION=managed
AFFECTLOG_EDITION=enterprise_private
```

## Edition and Feature Gates

Feature flags are defined in `src/affectlog/editions/features.py`.

Gate a route:
```python
from affectlog.editions.gates import requires_feature
from affectlog.editions.features import Feature


@router.get("/platform/tenants")
async def list_tenants(
    _=Depends(requires_feature(Feature.MULTI_TENANT)),
): ...
```

## Tenant Isolation

In managed mode, every dataset, model, audit run, artifact, recipe, export,
user membership, and audit log is scoped by `tenant_id` at the database level.

Users cannot access other tenants by changing URL slugs. The `get_tenant_id`
FastAPI dependency resolves tenant context from the authenticated user's
`TenantMembership` record.

## Storage Abstraction

| Mode | Default | Optional |
|------|---------|----------|
| Community | Local filesystem (`runs/`, `data/`) | S3-compatible |
| Managed | S3-compatible with tenant-prefixed keys | — |

Tenant storage policy is configured in `TenantStoragePolicy`.

## Architecture Components

```
Public App (React + Vite)
    ↓
Nginx (TLS termination + static)
    ↓
FastAPI API (uvicorn)
    ├── Auth & RBAC
    ├── Dataset audit workflows
    ├── Metric computation (Celery)
    ├── Model adapter registry
    ├── JSON-LD compliance exporter
    ├── Interoperability (PDC, CARiSMA, LOLA)
    ├── Edition / Feature gate middleware
    ├── Tenant context resolution
    └── Platform admin routes (managed mode)
    ↓
PostgreSQL (primary store)
Redis (Celery broker, rate limiting)
S3-compatible store (artifacts, managed mode)
```

## Admin Roles

| Role | Scope |
|------|-------|
| Platform Super Admin | Full platform, all tenants |
| Platform Operator | Tenant management, feature flags |
| Support Engineer | Time-limited tenant access (managed mode) |
| Tenant Owner | Their workspace |
| Tenant Admin | Workspace users and settings |
| Tenant Auditor | Read-only audit access |
| Tenant Data Steward | Dataset and privacy management |
| Tenant Model Developer | Model adapter management |
| Tenant Researcher | Assessment runs |
| Tenant Viewer | Results only |

## Support Access

Support staff cannot have permanent access to tenant environments.
See `src/affectlog/tenancy/support_access.py` and `docs/managed-operations.md`.
