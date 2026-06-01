#!/usr/bin/env bash
# Benchmark: generate 1M synthetic rows and run full pipeline
set -e

echo "=== ALT-AI 1M-Row Benchmark ==="

START=$(date +%s)
echo "[1] Generating 1,000,000 synthetic rows..."
affectlog generate-synthetic --rows 1000000 --output data/samples/maskott_1m.csv

T1=$(date +%s); echo "  -> Generated in $((T1-START))s"

echo "[2] Validating schema..."
affectlog validate-csv --input data/samples/maskott_1m.csv --schema maskott_csv_v1
T2=$(date +%s); echo "  -> Validated in $((T2-T1))s"

echo "[3] Converting to xAPI JSONL (streaming, chunk-size=100000)..."
affectlog convert-csv \
  --input data/samples/maskott_1m.csv \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output runs/benchmark_1m/normalized.jsonl \
  --format jsonl --chunk-size 100000
T3=$(date +%s); echo "  -> Converted in $((T3-T2))s"

echo "[4] Running audit..."
affectlog audit \
  --input runs/benchmark_1m/normalized.jsonl \
  --recipe configs/recipes/maskott_tactileo.yaml \
  --output runs/benchmark_1m
T4=$(date +%s); echo "  -> Audit complete in $((T4-T3))s"

END=$(date +%s)
echo ""
echo "=== Total time: $((END-START))s ==="
echo "Artifacts: runs/benchmark_1m/"
ls -lah runs/benchmark_1m/
