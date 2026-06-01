#!/usr/bin/env bash
# Run local demo: generate synthetic data → validate → convert → audit → export
set -e

echo "=== AffectLog ALT-AI Local Demo ==="

echo "[1/6] Generate synthetic 10,000-row CSV..."
affectlog generate-synthetic --rows 10000 --output data/samples/maskott_small.csv

echo "[2/6] Validate schema..."
affectlog validate-csv --input data/samples/maskott_small.csv --schema maskott_csv_v1

echo "[3/6] Convert CSV to normalized xAPI JSONL..."
affectlog convert-csv \
  --input data/samples/maskott_small.csv \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output runs/demo_small/maskott.normalized.jsonl \
  --format jsonl --chunk-size 5000

echo "[4/6] Run audit pipeline..."
affectlog audit \
  --input runs/demo_small/maskott.normalized.jsonl \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output runs/demo_small

echo "[5/6] Export compliance graph..."
affectlog compliance-export \
  --run runs/demo_small \
  --format jsonld \
  --output runs/demo_small/compliance_graph.jsonld

echo "[6/6] Export SOP..."
affectlog sop --run runs/demo_small --output runs/demo_small/SOP.md

echo ""
echo "=== Demo complete! ==="
echo "Artifacts in: runs/demo_small/"
ls -la runs/demo_small/
