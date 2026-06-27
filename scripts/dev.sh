#!/usr/bin/env bash
# dev.sh — one-command local development launcher
# Starts the ALT-AI FastAPI backend + Vite frontend concurrently.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT/src/affectlog/frontend"
ENV_FILE="$ROOT/.env"

# ── Colour helpers ────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RESET='\033[0m'

echo -e "${BLUE}▶ ALT-AI local development${RESET}"
echo -e "  Root: $ROOT"

# ── .env setup ────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${YELLOW}⚠  .env not found — copying from .env.example${RESET}"
  cp "$ROOT/.env.example" "$ENV_FILE"
  echo -e "${YELLOW}   Edit $ENV_FILE to set AFFECTLOG_HASH_SECRET${RESET}"
fi

# ── Python install check ──────────────────────────────────────────────
if ! python3 -c "import affectlog" &>/dev/null; then
  echo -e "${YELLOW}⚠  affectlog not installed — running: pip install -e \".[dev]\"${RESET}"
  cd "$ROOT" && pip3 install -e ".[dev]" --quiet
fi

# ── Node install check ────────────────────────────────────────────────
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo -e "${YELLOW}⚠  node_modules missing — running: npm install${RESET}"
  cd "$FRONTEND_DIR" && npm install --silent
fi

# ── Ensure data dirs exist ────────────────────────────────────────────
mkdir -p "$ROOT/runs" "$ROOT/data/samples" "$ROOT/data/raw" "$ROOT/data/processed"

# ── Launch ────────────────────────────────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}Shutting down…${RESET}"
  kill "$API_PID" "$FE_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$ROOT"
echo -e "${GREEN}▶ Starting API  → http://localhost:8000${RESET}  (Swagger: http://localhost:8000/docs)"
AFFECTLOG_LOG_FORMAT=text affectlog serve --host 127.0.0.1 --port 8000 &
API_PID=$!

# Wait a moment for the API to bind
sleep 2

echo -e "${GREEN}▶ Starting UI   → http://localhost:5173${RESET}"
cd "$FRONTEND_DIR" && npm run dev -- --host 127.0.0.1 &
FE_PID=$!

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  Dashboard  →  ${GREEN}http://localhost:5173${RESET}"
echo -e "  API Docs   →  ${GREEN}http://localhost:8000/docs${RESET}"
echo -e "  Health     →  ${GREEN}http://localhost:8000/healthz${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  Press Ctrl-C to stop."
echo ""

wait
