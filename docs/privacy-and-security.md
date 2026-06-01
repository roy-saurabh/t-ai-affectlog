# Privacy and Security

## Pseudonymisation

ALT-AI applies HMAC-SHA256 pseudonymisation to all personal identifiers by default:

- `_id` — statement ID
- `EntityId` — learner/teacher identifier
- `EntityUaiCode` — institution code
- `ActivitySessionId` — session identifier

The hash is keyed with `AFFECTLOG_HASH_SECRET` (set in `.env`).

## Never Exposing Raw Identifiers

- `allow_raw_identifiers` defaults to `false` in all recipes and configs.
- The dashboard truncates all IDs to prevent accidental display.
- Audit artifacts contain hashed identifiers only.

## Security Scanning

The CI pipeline runs:
- `bandit` — Python static security analysis
- `pip-audit` — dependency vulnerability scanning
- `codeql` — GitHub Advanced Security

## Secrets Management

- `AFFECTLOG_HASH_SECRET` — must be set in production; never logged or exported.
- PDC token — `AFFECTLOG_PDC_TOKEN` — never logged.
- `.env` file is git-ignored.

## Residual Risk

Pseudonymisation does not guarantee anonymisation. For small datasets or datasets with rare attribute combinations:
- Apply k-anonymity checks before sharing aggregates.
- Review `privacy_report.json` risk score before publication.
- Use temporal aggregation (day-level) rather than millisecond timestamps when sharing.
