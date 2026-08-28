# Tour-Weave — AI Travel Intelligence for India

Tour-Weave is a full-stack travel platform that predicts **when a place will
be crowded**, forecasts weather for it, and turns both into a "plan my
trip" flow — all served by one FastAPI backend and one React/Vite
frontend that talk to each other over a clean REST API.

```
tour-weave/
├── backend/    FastAPI + LightGBM crowd model + XGBoost weather forecaster
├── frontend/   React + Vite + TypeScript UI (all data live from backend)
├── run.sh      One-click setup + run (macOS / Linux / WSL / Git Bash)
└── run.bat     One-click setup + run (Windows, double-click to launch)
```

| Model | Tech | What it predicts |
|---|---|---|
| **Crowd Prediction** | LightGBM | Monthly crowd level (Low / Medium / High) for 1,100+ Indian tourist places, learned **per-place** relative to that place's own seasonal pattern — not a raw visitor-count cutoff |
| **Place Recommendation** | Ranking + fuzzy search | Popularity-ranked, typo-tolerant place search across every place in the dataset |
| **Weather Forecasting** | XGBoost ×3 | Multi-day max/min temperature + rain probability for 20 India-wide cities, trained on 10 years of NASA POWER data |

Plus a **live weather layer** (Open-Meteo, no API key needed) for
real-time "what's it like there right now" conditions.

---

## System Architecture

```
                             ┌──────────────────────────────┐                             
                             │           Browser            │                             
                             │     Tour-Weave Frontend      │                             
                             │  React + Vite + TypeScript   │                             
                             │       (localhost:5173)       │                             
                             └──────────────────────────────┘                             
                            JSON over HTTP  |  VITE_API_BASE_URL                          
                                            ▼                                             
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    Tour-Weave Backend  ·  FastAPI (localhost:8000)                     │
│             Rate limit  ->  CORS  ->  Routes  ->  In-memory / Redis Cache              │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                          │                                             
             ┌────────────────────────────┴────────────────────────────┐                  
             ▼                            ▼                            ▼                  
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│      CrowdPredictor      │   │     PlaceRecommender     │   │    Weather ML Engine     │
│         LightGBM         │   │  ranking + fuzzy search  │   │        XGBoost x3        │
│ /predict, /predict/year  │   │  /places/*, /trip/plan   │   │        /weather/*        │
└──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
             ▼                            ▼                            ▼                  
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│    crowd_model.joblib    │   │   data/processed/*.csv   │   │ weather_ml_models/*.pkl  │
└──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘

┌────────────────────────┐           ┌────────────────────────┐
│   Tour-Weave Backend   │           │     Open-Meteo API     │
│  /weather/live route   │  HTTPS →  │external · no key needed│
└────────────────────────┘           └────────────────────────┘
```

**Why decoupled?** The frontend is a pure client of the backend's JSON
API (`src/api/client.ts`) — it never runs Python, and the backend never
serves HTML. This is the standard, production-ready shape for a
React + FastAPI product: deploy them independently, scale them
independently, and swap either one out without touching the other.

---

## Quick Start (one command)

**macOS / Linux / WSL / Git Bash:**
```bash
git clone <your-repo-url> tour-weave && cd tour-weave
./run.sh
```

**Windows:** double-click `run.bat`, or run it from PowerShell:
```powershell
.\run.bat
```

Either script will, in order: create a Python virtual environment,
install backend dependencies, train the crowd model if it isn't already
trained, start the backend API, install frontend dependencies, and start
the frontend dev server — then print you the URLs. No manual `cd`-ing,
no running two terminals yourself.

Once it's running, open **http://localhost:5173**.

---

## Manual Setup (step by step)

If you'd rather run things yourself, or the one-click script doesn't fit
your environment, here's the exact sequence — copy/paste as one block:

```bash
# 1. Backend: virtual environment + dependencies
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. Backend: train the model (skip if models/crowd_model.joblib already exists)
python preprocess_data.py
python train_model.py

# 3. Backend: start the API (keep this terminal open)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Then, in a **second terminal**, from the repo root:

```bash
# 4. Frontend: install + run
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the frontend will be pulling live
predictions from the backend on `http://localhost:8000`.

### Environment variables

- **Backend** (`backend/.env`, copy from `.env.example`): set
  `CORS_ORIGINS=http://localhost:5173` to restrict which origins may
  call the API (defaults to `*`, fine for local dev).
- **Frontend** (`frontend/.env`, copy from `.env.example`):
  `VITE_API_BASE_URL="http://localhost:8000"` — change this if your
  backend runs somewhere else (e.g. a deployed URL).

---

## What's wired to the real backend

Every number the frontend shows about crowds, model accuracy, place
counts, and destination search is fetched live — nothing is hardcoded
or randomized:

| Frontend piece | Backend endpoint | Notes |
|---|---|---|
| Destination search dropdown | `GET /places/top` | Full live place list (100+ real places), filterable by typing — not a hardcoded shortlist |
| Model accuracy / place-count stat pills | `GET /model/info` | Real holdout accuracy from the last training run (e.g. 98.1%), not marketing copy |
| "AI Insights Hub" crowd gauge + histogram | `GET /predict` | Real LightGBM monthly prediction. The hourly shape is a labeled visual heuristic scaled by the real monthly score — see comments in `frontend/src/api/adapters.ts` |
| Live weather panel, 5-day forecast | `GET /weather/live` | Real HTTPS call to Open-Meteo. Degrades to "unavailable" if the network call fails — never breaks the crowd panel next to it |
| "Explore" recommended-places carousel | `GET /places/top` + `GET /predict` per place | Falls back to a small bundled sample only if the backend is completely unreachable |
| Destination price / rating | *derived* | The backend has no pricing model, so price and rating are computed with a **deterministic** formula from real backend fields (category + popularity percentile) — same place always yields the same number, never random |
| "AI Weather Forecast Lab" | `GET /weather/forecast/locations`, `GET /weather/forecast` | Real XGBoost multi-day forecast for 20 trained cities |

**Still static by design:** testimonials, the "Journal of Bharat" blog,
and destination photography (Unsplash category images) — these are
editorial/marketing content, not model output, so there's nothing for a
backend to model.

---

## API Reference (summary)

Full interactive docs (Swagger) are always available at
`http://localhost:8000/docs` once the backend is running.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/predict?place=&month=` | Crowd level for one place + month |
| `GET` | `/predict/year?place=` | Full 12-month crowd outlook for a place |
| `GET` | `/places/top?n=&category=&state=` | Top N places, optionally filtered |
| `GET` | `/places/search?q=` | Fuzzy/typo-tolerant place search |
| `GET` | `/places/all` | Every place in the dataset |
| `GET` | `/places/categories` / `/places/states` | Filter facets |
| `GET` | `/weather/live?place=` | Real-time conditions (Open-Meteo) |
| `GET` | `/weather/forecast?location=&days=` | Multi-day XGBoost weather forecast |
| `POST` | `/trip/plan` | Prediction + year outlook + low-crowd alternatives |
| `GET` | `/model/info` | Trained model metrics (accuracy, F1, place count) |
| `GET` | `/health` | Liveness/readiness probe |

---

## Tech Stack

**Backend:** Python, FastAPI, uvicorn, scikit-learn / LightGBM, XGBoost,
pandas, joblib

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
(`motion`), lucide-react

---

## Deploying

Backend and frontend deploy **independently**:

- **Backend** — any Python host that can run `uvicorn app.main:app`
  (Render, Railway, Fly.io, a VM, Docker). Set `CORS_ORIGINS` to your
  deployed frontend's URL.
- **Frontend** — `npm run build` in `frontend/` produces a static
  `frontend/dist/` you can deploy to any static host (Vercel, Netlify,
  Cloudflare Pages, S3 + CDN). Set `VITE_API_BASE_URL` to your deployed
  backend's URL at build time.

---

## Security / Hardening Notes

Reviewed for a hackathon-to-production jump. Nothing here is a working
exploit today, but these are worth fixing before this sits on the open
internet unattended:

| Area | Issue | Fix before prod |
|---|---|---|
| CORS | `CORS_ORIGINS` defaults to `*` **and** `allow_credentials=True` in `app/main.py` — that combination lets any origin make credentialed requests | Set `CORS_ORIGINS` to your real frontend URL(s) in `.env`, or drop `allow_credentials` since no cookie/session auth exists yet |
| Ops endpoints | `POST /cache/clear`, `GET /metrics`, `GET /cache/stats` have no auth — anyone can wipe the cache (forces every request to recompute) or read internal latency/error stats | Put these behind a simple bearer token / admin header, or don't expose them past an internal network |
| Rate limiter | `RateLimitMiddleware` keys on `request.client.host`. Behind a reverse proxy (Render/Railway/Fly all sit behind one) every request can arrive from the *same* proxy IP, silently turning a per-user limit into one shared global limit | Read `X-Forwarded-For` (trusting only your own proxy) instead of `request.client.host` |
| Rate limiter | The IP→window dict in `monitoring.py` never evicts entries, and each uvicorn **worker** keeps its own copy — the real limit becomes `RATE_LIMIT_PER_MINUTE × workers`, and memory grows slowly over uptime | Fine for a hackathon demo; for longer-running prod use a shared store (Redis) with TTL, same as the cache already does |
| Dependencies | `requirements.txt` pins only lower bounds (`>=`) | Before your demo, freeze exact versions (`pip freeze > requirements.lock`) so a new release upstream can't break the build the morning of judging |
| Secrets | ✅ Checked — no hardcoded keys anywhere, `.env` is gitignored, `OPENWEATHERMAP_API_KEY` is read server-side only and never reaches the frontend bundle | No action needed |

None of these block a demo or a normal deploy — they're the standard
punch-list for "student project" → "thing strangers can hit."

---

## License

MIT — see `backend/LICENSE`.
