#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  Tour-Weave — one-click setup & run (backend + frontend, one command)
#  Usage:  ./run.sh
# ══════════════════════════════════════════════════════════════════════
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
step() { echo -e "${BLUE}➜ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }

PY=python3; command -v python3 >/dev/null 2>&1 || PY=python

echo -e "${GREEN}"
echo "════════════════════════════════════════════════"
echo "   Tour-Weave — AI Tourism Crowd Intelligence"
echo "════════════════════════════════════════════════"
echo -e "${NC}"

# ---- Backend: venv + deps + (train if needed) ----
step "Setting up backend virtual environment"
cd backend
if [ ! -d ".venv" ]; then
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate
ok "Virtual environment ready"

step "Installing backend dependencies (this can take a minute the first time)"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
ok "Backend dependencies installed"

if [ ! -f "models/crowd_model.joblib" ]; then
  step "No trained model found — training it now (one-time)"
  python preprocess_data.py
  python train_model.py
  ok "Model trained"
else
  ok "Pre-trained model found — skipping training"
fi

step "Starting backend API on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

cleanup() {
  echo ""
  step "Shutting down..."
  kill "$BACKEND_PID" 2>/dev/null || true
  kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for the backend to become healthy before starting the frontend
step "Waiting for backend to become healthy"
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    ok "Backend is up"
    break
  fi
  sleep 1
done

# ---- Frontend: npm install + dev server ----
step "Setting up frontend"
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
ok "Frontend dependencies installed"

step "Starting frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Tour-Weave is running!${NC}"
echo -e "  Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  API docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "${YELLOW}  Press Ctrl+C to stop both servers.${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"

wait
