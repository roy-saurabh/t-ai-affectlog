# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email: security@affectlog.eu (or open a private advisory via GitHub Security tab)

We aim to respond within 72 hours and issue a fix within 14 days for confirmed vulnerabilities.

## Privacy and Data

- This tool is designed to *reduce* privacy risk. Raw personal identifiers are never exported by default.
- If you find a configuration path that exposes raw identifiers in default mode, report it immediately.
- Secrets (`AFFECTLOG_HASH_SECRET`, API keys) must never appear in logs or output artifacts.
