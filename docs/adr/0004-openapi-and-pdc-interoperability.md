# ADR 0004 — OpenAPI 3.1 + Mock PDC for Prometheus-X Interoperability

**Status:** Accepted

## Context

ALT-AI must be interoperable with the Prometheus-X Data Space Connector (PDC) and expose a standard API. Real PDC credentials are not available during development.

## Decision

1. FastAPI generates OpenAPI 3.1 spec automatically from Pydantic schemas.
2. PDC integration is implemented as a mock client (`PDCClient(mock=True)`) that mirrors the real API contract.
3. Mock PDC server (`pdc/mock_server.py`) is used for integration tests.
4. Real PDC integration is activated by setting `AFFECTLOG_PDC_URL` and `AFFECTLOG_PDC_TOKEN`.
5. PDC workflows retrieve model artifacts only — never raw personal data.

## Consequences

- All PDC-dependent features can be tested without real credentials.
- When real PDC URL is configured, the same code paths execute.
- ODRL policy evaluation is mocked and documented for integration with real PDC.
