# Tour-Weaver— AI Travel Intelligence for India

A full-stack travel platform for Indian tourism, combining three trained
ML models behind one FastAPI backend and a React dashboard:

```
Tour-Weaver/
├── backend/    FastAPI + LightGBM crowd prediction + XGBoost weather forecasting
└── frontend/   React + Vite dashboard (Tour-Weaver theme)
```

| Model | Tech | What it predicts |
|---|---|---|
| **Crowd Prediction** | LightGBM | Monthly crowd level (Low/Medium/High) for 1,100+ Indian tourist places |
| **Place Recommendation** | Ranking + fuzzy search | Popularity-ranked, typo-tolerant place search |
| **Weather Forecasting** *(merged in)* | XGBoost (×3) | Next-day-style max/min temperature + rain probability, multi-day recursive forecast, for 20 India-wide cities — trained on 10 years of NASA POWER data |

Plus a **live weather layer** (Open-Meteo, no API key needed) for
real-time "what's it like there right now" conditions, separate from all
three trained models above.

The dashboard's "Real-Time AI Crowd & Weather Intelligence" hub and
"AI Weather Forecast Lab" section call the real backend instead of mock
data. Everything else (marketing sections, itinerary builder,
testimonials, blog) is unchanged and still uses the bundled sample
content — see "What's real vs. mock" below.

## Run it

Two terminals, two dev servers — this is normal for a decoupled
frontend/backend setup.

**Terminal 1 — backend**
```bash
cd backend
pip install -r requirements.txt
python setup_and_run.py quickstart
# serves the API at http://localhost:8000 (ships with pre-trained models
# for BOTH the crowd predictor and the weather forecaster)
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
# opens at http://localhost:3000
```

That's it — open http://localhost:3000 and the dashboard will be pulling
live predictions from your backend.

### Environment variables

- **Backend**: copy `backend/.env.example` to `backend/.env`. Set
  `CORS_ORIGINS=http://localhost:3000` so the browser is allowed to call
  it (already the default assumption).
- **Frontend**: `frontend/.env` already has
  `VITE_API_BASE_URL="http://localhost:8000"` — change this if your backend
  runs somewhere else.

## What's wired up to the real backend

| Frontend piece | Backend endpoint | Notes |
|---|---|---|
| Dashboard ("AI Insights Hub") — crowd gauge, hourly histogram | `GET /predict` | Real LightGBM prediction (98.1% holdout accuracy). Hourly histogram is a visual heuristic shaped around the real monthly density score — see `src/api/adapters.ts` for the honest comment on this. |
| Dashboard — live weather panel, 5-day forecast | `GET /weather/live` | Real HTTPS call to Open-Meteo (no key needed). Degrades gracefully to "unavailable" if the network call fails — never breaks the crowd panel next to it. |
| Dashboard — place tabs | `GET /places/top` | Real top-6 most popular places from the dataset, fetched once on load. |
| "Explore" recommended-places carousel | `GET /places/top` + `GET /predict` per place | Falls back to bundled mock destinations only if the backend is unreachable. |
| **"AI Weather Forecast Lab"** *(merged in)* | `GET /weather/forecast/locations`, `GET /weather/forecast` | Real XGBoost multi-day forecast (temp + rain probability) for the 20 trained cities, selectable by day-count (3/5/7/14). Fails quiet (renders nothing) if the backend or model isn't up, so it never blocks the rest of the page. |

## What's still mock (by design, for this build)

- AQI and UV index (no data source wired up yet — shown as placeholders)
- The AI-generated day-by-day itinerary modal
- Testimonials and the "Journal of Bharat" blog
- Destination photos (Unsplash category placeholders, not per-place photography)

These are flagged, not hidden — see the comments at the top of
`frontend/src/api/adapters.ts` for exactly which fields are real model
output vs. derived/placeholder.

## Why the weather forecaster is a separate feature, not folded into crowd prediction

The crowd-prediction model's place list is ~1,100 monuments/attractions
(e.g. "Taj Mahal"). The weather model was trained on a much smaller,
distinct set of 20 city-level locations (e.g. "Agra"). Rather than
silently guessing a mapping between the two (and getting it wrong), the
merge keeps them as two honestly-labeled surfaces: pick a place for crowd
intelligence, pick a city for the multi-day weather forecast. See
`backend/app/weather_ml_routes.py` for the reasoning in code.

## Deploying

- **Together**: build the frontend (`npm run build` → `frontend/dist/`),
  copy `dist/` into `backend/frontend/`, and let the backend's existing
  static-file mount serve it — one URL, no CORS needed in production.
- **Separately**: deploy the backend (Docker: see `backend/README.md`
  for a sample Dockerfile) and the frontend build to any static host
  (Vercel/Netlify), pointing `VITE_API_BASE_URL` at the live backend URL.

## More detail

- `backend/README.md` — full architecture, all three models, complete
  API reference, training/CLI usage, configuration, deployment.
- `frontend/README.md` — frontend-specific notes.
