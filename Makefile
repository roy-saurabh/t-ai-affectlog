.PHONY: install test test-slow lint typecheck security docs api frontend docker-up demo synthetic-1m benchmark clean

PYTHON := python3
UV := uv
PIP := pip

install:
	$(UV) pip install -e ".[dev]" || $(PIP) install -e ".[dev]"

test:
	pytest -m "not slow" --cov=src/affectlog --cov-report=term-missing

test-slow:
	pytest -m slow -v

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

docs:
	mkdocs build --strict

api:
	affectlog serve --host 0.0.0.0 --port 8000

frontend:
	cd src/affectlog/frontend && npm install && npm run build

docker-up:
	docker compose up --build

demo: synthetic-1m
	affectlog validate-csv --input data/samples/maskott_small.csv --schema maskott_csv_v1
	affectlog convert-csv \
		--input data/samples/maskott_small.csv \
		--recipe configs/recipes/maskott_tactileo.yaml \
		--output runs/demo_small/maskott.normalized.jsonl \
		--format jsonl --chunk-size 10000
	affectlog audit \
		--input runs/demo_small/maskott.normalized.jsonl \
		--recipe configs/recipes/maskott_tactileo.yaml \
		--output runs/demo_small
	affectlog compliance-export \
		--run runs/demo_small \
		--format jsonld \
		--output runs/demo_small/compliance_graph.jsonld
	affectlog sop \
		--run runs/demo_small \
		--output runs/demo_small/SOP.md

synthetic-1m:
	affectlog generate-synthetic --rows 1000000 --output data/samples/maskott_1m.csv

benchmark:
	bash scripts/benchmark_million_rows.sh

clean:
	rm -rf runs/ data/processed/ data/samples/maskott_1m.csv
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
