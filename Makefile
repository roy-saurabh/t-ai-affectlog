# AffectLog – Trustworthy AI Assessment
# Community Edition | Managed Edition
# Prometheus-X BB04 / EDGE-Skills · https://github.com/roy-saurabh/edge_affectlog
# Run 'make help' for available targets.

.PHONY: help install seed create-admin test test-e2e test-slow lint typecheck \
        security hygiene docs api frontend docker-up docker-down docker-seed \
        docker-create-admin docker-bootstrap demo synthetic-1m \
        benchmark clean dev format check-editions

PYTHON := python3
UV     := uv
PIP    := pip

help:
	@echo ""
	@echo "AffectLog — Trustworthy AI Assessment"
	@echo "Community Edition (self-hosted) | Managed Edition (AffectLog-operated)"
	@echo ""
	@echo "Setup (local / non-Docker):"
	@echo "  make install        — Install Python + frontend dependencies"
	@echo "  make seed           — Seed database (RBAC roles/permissions/workspaces)"
	@echo "  make create-admin   — Create initial superadmin account"
	@echo ""
	@echo "Setup (Docker — run AFTER 'docker compose up'):"
	@echo "  make docker-bootstrap    — Seed RBAC + create admin inside the api container"
	@echo "  make docker-seed         — Seed RBAC inside the api container"
	@echo "  make docker-create-admin — Create admin inside the api container"
	@echo ""
	@echo "Development:"
	@echo "  make dev            — Start API + worker in dev mode"
	@echo "  make frontend       — Build frontend (production)"
	@echo "  make docker-up      — Start full stack via Docker Compose"
	@echo "  make docker-down    — Stop Docker Compose stack"
	@echo ""
	@echo "Test data:"
	@echo "  make synthetic-1m   — Generate 1M-row synthetic CSV dataset"
	@echo "  make demo           — Run local pipeline demo on sample data"
	@echo "  make benchmark      — Run large-file performance benchmark"
	@echo ""
	@echo "Quality:"
	@echo "  make test           — Run unit + integration tests"
	@echo "  make test-e2e       — Run Playwright E2E tests"
	@echo "  make test-slow      — Run slow/large-scale tests"
	@echo "  make lint           — Ruff lint check"
	@echo "  make format         — Ruff auto-format"
	@echo "  make typecheck      — mypy type checking"
	@echo "  make security       — Bandit + pip-audit security scan"
	@echo "  make hygiene        — Repository authorship & privacy guard"
	@echo "  make check-editions — Verify edition/feature flag system"
	@echo ""
	@echo "Docs:"
	@echo "  make docs           — Build MkDocs documentation"
	@echo ""
	@echo "Edition:"
	@echo "  AFFECTLOG_EDITION=community (default) | managed | enterprise_private"
	@echo ""

install:
	$(UV) pip install -e ".[dev]" 2>/dev/null || $(PIP) install -e ".[dev]"
	cd src/affectlog/frontend && npm install

seed:
	$(PYTHON) scripts/seed_rbac.py

create-admin:
	$(PYTHON) scripts/create_initial_admin.py

dev:
	bash scripts/dev.sh

test:
	pytest -m "not slow and not e2e" --cov=src/affectlog --cov-report=term-missing

test-slow:
	pytest -m slow -v

test-e2e:
	cd src/affectlog/frontend && npx playwright test tests/e2e/

lint:
	ruff check src/ tests/ scripts/
	ruff format --check src/ tests/ scripts/

format:
	ruff format src/ tests/ scripts/

typecheck:
	mypy src/affectlog/

security:
	bandit -r src/affectlog/ -c pyproject.toml
	pip-audit --desc on
	$(PYTHON) scripts/check_frontend_security.py

hygiene:
	$(PYTHON) scripts/check_repository_hygiene.py

docs:
	mkdocs build --strict

api:
	affectlog serve --host 0.0.0.0 --port 8000

frontend:
	cd src/affectlog/frontend && npm install && npm run build

docker-up:
	docker compose up --build

docker-down:
	docker compose down

# ── Docker bootstrap ──────────────────────────────────────────────────────
# These run the seed/admin scripts INSIDE the running api container so they use
# the exact same DATABASE_URL and PASSWORD_PEPPER as the server. Running them on
# the host instead is the usual cause of a "created admin but Invalid credentials"
# login failure (host pepper/DB differ from the container's).
docker-seed:
	docker compose exec api python scripts/seed_rbac.py

docker-create-admin:
	docker compose exec api python scripts/create_initial_admin.py

docker-bootstrap: docker-seed docker-create-admin

demo:
	affectlog validate-csv --input data/samples/maskott_csv_sample.csv --schema maskott_csv_v1
	affectlog convert-csv \
		--input data/samples/maskott_csv_sample.csv \
		--recipe configs/recipes/maskott_tactileo.yaml \
		--output runs/demo_small/maskott.normalized.jsonl \
		--format jsonl --chunk-size 10000
	affectlog audit \
		--input runs/demo_small/maskott.normalized.jsonl \
		--recipe configs/recipes/maskott_tactileo.yaml \
		--output runs/demo_small

synthetic-1m:
	affectlog generate-synthetic --rows 1000000 --output data/samples/maskott_1m.csv

benchmark:
	bash scripts/benchmark_million_rows.sh

check-editions:
	$(PYTHON) -c "from affectlog.editions.base import get_deployment_mode, get_edition_defaults; print('Mode:', get_deployment_mode()); print('Defaults:', get_edition_defaults())"

clean:
	rm -rf runs/ data/processed/ data/samples/maskott_1m.csv
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
