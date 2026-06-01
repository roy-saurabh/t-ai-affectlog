# Contributing to ALT-AI

Thank you for your interest in contributing.

## Quick Start

```bash
git clone https://github.com/roy-saurabh/edge_affectlog.git
cd edge_affectlog
make install
make test
```

## Ground Rules

1. **No raw partner data** — never commit Maskott, Becomino, or Tactileo data files.
2. **Privacy first** — default outputs must never contain raw personal identifiers.
3. **Tests required** — new features need unit tests; new metrics need documented correctness properties.
4. **Type annotations** — all public functions must be fully typed (mypy strict).
5. **Lint clean** — `make lint` must pass before opening a PR.

## Branching

- `main` — stable, release-tagged
- `dev` — integration branch
- Feature branches: `feat/<short-name>`
- Bug fixes: `fix/<short-name>`

## Pull Request Checklist

- [ ] `make lint` passes
- [ ] `make typecheck` passes
- [ ] `make test` passes
- [ ] New tests added where relevant
- [ ] No raw data committed
- [ ] `CHANGELOG.md` entry added

## Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md).
