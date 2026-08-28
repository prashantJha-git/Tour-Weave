# Crowd Almanac — Tourism Crowd Prediction & Place Recommendation

A two-model ML system that helps travelers plan visits to Indian tourist attractions: it predicts monthly crowd levels, recommends places to go, and turns both into a single "plan my trip" flow, served behind a FastAPI backend with a lightweight web dashboard.

---

# System Architecture

```
                                              ┌───────────────────────────────┐
                                              │         CROWD ALMANAC         │
                                              │  Tourism Prediction Platform  │
                                              └───────────────────────────────┘
                                                              │
                   ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                   │                                          │                                          │
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│               MODEL 1               │    │               MODEL 2               │    │             TRIP PLANNER            │
│     Crowd Prediction (LightGBM)     │    │    Place Recommendation (ranking)   │    │             plan_trip.py            │
│                                     │    │                                     │    │                                     │
│           predict_crowd.py          │    │         recommend_places.py         │    │   (ties both models into one flow)  │
│            train_model.py           │    └─────────────────────────────────────┘    └─────────────────────────────────────┘
└─────────────────────────────────────┘
                   │                                          │                                          │
                   └──────────────────────────────────────────┴──────────────────────────────────────────┘
                                                              │
                                      ┌───────────────────────────────────────────────┐
                                      │  FEATURE ENGINEERING   (preprocess_data.py)   │
                                      │  -------------------------------------------  │
                                      │  - Cyclical month encoding                    │
                                      │  - Lag features (leak-safe)                   │
                                      │  - Festival calendar                          │
                                      │  - School vacation index                      │
                                      │  - Airport distance                           │
                                      │  - USD/INR exchange rate                      │
                                      └───────────────────────────────────────────────┘
                                                              │
                                     ┌─────────────────────────────────────────────────┐
                                     │                    DATA LAYER                   │
                                     │            data/raw · data/processed            │
                                     │  1,100+ Indian attractions, monthly, 2015-2024  │
                                     └─────────────────────────────────────────────────┘
                                                              │
                                    ┌───────────────────────────────────────────────────┐
                                    │  API + SERVING LAYER   (app/main.py -- FastAPI)   │
                                    │  -----------------------------------------------  │
                                    │  cache.py        -> TTL cache                     │
                                    │  monitoring.py   -> rate limit + metrics          │
                                    │  schemas.py      -> request/response models       │
                                    │  config.py       -> env-driven settings           │
                                    └───────────────────────────────────────────────────┘
                                                              │
                                                ┌───────────────────────────┐
                                                │          FRONTEND         │
                                                │    frontend/index.html    │
                                                │   (vanilla JS dashboard)  │
                                                └───────────────────────────┘
```

| Layer | Technology | Capability |
|---|---|---|
| **Crowd Prediction** | LightGBM (gradient-boosted trees) | Low / Medium / High forecast, per place + month |
| **Place Recommendation** | Popularity-percentile ranking + fuzzy search | Top places, filter by category/state, typo-tolerant search |
| **Feature Engineering** | pandas, deterministic calendar/geo/economic features | Leak-safe, reproducible, offline |
| **Backend** | FastAPI + Uvicorn | REST API, auto-generated Swagger/ReDoc docs |
| **Caching** | In-memory TTL cache (Redis-ready) | <5ms cache-hit latency, zero external deps by default |
| **Monitoring** | Custom middleware | Rate limiting, request metrics, health checks |
| **Frontend** | Vanilla HTML/CSS/JS | Search, place cards, year-outlook chips, status board |

---

# Why This Matters

```
┌────────────────────────────────────────────────────────────┐
│  MODEL CHOICE                                              │
│    - LightGBM handles categorical features natively, no    │
│      lossy one-hot encoding, wins on tabular data at this  │
│      scale vs. deep neural nets                            │
│    - Neural nets were evaluated but need far more data to  │
│      outperform gradient boosting here                     │
│                                                            │
│  TIME-AWARE VALIDATION                                     │
│    - Train: 2021-2022    Test: 2023-2024                   │
│    - Prevents data leakage -> true real-world accuracy     │
│                                                            │
│  FEATURE ENGINEERING                                       │
│    - Cyclical encoding (seasons wrap around)               │
│    - Lag features (strictly leak-safe, via shift(1))       │
│    - Deterministic context (festivals, school, economy)    │
│    - Geographic + weather signals                          │
│                                                            │
│  VERIFIED ACCURACY                                         │
│    - ~98% honest holdout accuracy (2023-2024, unseen)      │
│    - Confirmed by 5-fold CV across the full dataset        │
│    - Driven by legitimate, leak-safe lag features (last    │
│      month / same month last year -- strong persistence)   │
│                                                            │
│  PRODUCTION-GRADE                                          │
│    - 24h prediction caching (< 5ms cache-hit latency)      │
│    - Rate limiting (configurable, per IP)                  │
│    - Health checks + metrics endpoints                     │
│    - Environment-driven config, Docker-ready               │
└────────────────────────────────────────────────────────────┘
```

---

# Installation & Run

## Prerequisites

```
┌────────────────────────────────────────┐
│ [x] Python 3.9+                        │
│ [x] pip (included with Python)         │
│ [x] ~1GB free disk (for data + models) │
└────────────────────────────────────────┘
```

## One-Command Setup

```bash
cd tourism_crowd_predictor

# Install → Preprocess → Train
python setup_and_run.py all

# Then start the server
python setup_and_run.py serve
```

```
setup_and_run.py all
├─ Install dependencies
├─ Preprocess raw data (CSV → features)
├─ Train model (5-fold CV + hyperparameter tuning)
├─ Evaluate on holdout test set
└─ Save all artifacts to models/
```

## Manual Setup (Step by Step)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Preprocess data
python preprocess_data.py

# 3. Train model
python train_model.py
```

```
Outputs created in models/:
├─ crowd_model.joblib           [The trained LightGBM classifier]
├─ crowd_label_encoder.joblib   [Label ↔ Low/Medium/High]
├─ crowd_model_features.joblib  [Feature names & order]
├─ place_visitor_stats.joblib   [Leak-safe place-level averages]
├─ crowd_model_metrics.json     [Accuracy, F1, hyperparams]
├─ confusion_matrix.png         [Per-class performance]
└─ feature_importance.png       [Which features matter]
```

**Note:** the weather-forecasting layer (`weather_ml/`) ships with its
XGBoost models already trained, in `weather_ml_models/` — no separate
step needed unless you want to retrain on fresh data:

```bash
python train_weather_pipeline.py
```

## Start the Server

```bash
# Development mode (auto-reload)
python setup_and_run.py serve

# Or manually with uvicorn
uvicorn app.main:app --reload --port 8000
```

```
┌────────────────────────────────┐
│ Dashboard                      │
│   http://localhost:8000        │
│                                │
│ Interactive API Docs (Swagger) │
│   http://localhost:8000/docs   │
│                                │
│ Alternative Docs (ReDoc)       │
│   http://localhost:8000/redoc  │
└────────────────────────────────┘
```

---

# Project Structure

```
tourism_crowd_predictor/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── setup_and_run.py             # One-command install/train/serve
│
├── preprocess_data.py           # Data cleaning & feature engineering
├── train_model.py               # MODEL 1 — training & evaluation
├── predict_crowd.py             # MODEL 1 — inference wrapper
├── recommend_places.py          # MODEL 2 — search & ranking
├── plan_trip.py                 # Interactive CLI, ties both models together
│
├── app/                         # FastAPI backend
│   ├── main.py                  # API routes & server
│   ├── config.py                # Environment-driven configuration
│   ├── schemas.py                # Request/response models (Pydantic)
│   ├── cache.py                  # TTL prediction cache (Redis-ready)
│   ├── monitoring.py             # Rate limiting & metrics
│   ├── weather_ml_routes.py      # MODEL 3 — merged-in ML weather forecast routes
│   └── __init__.py
│
├── frontend/
│   └── index.html                # Vanilla-JS web dashboard
│
├── data/
│   ├── raw/crowd_prediction_dataset.csv
│   └── processed/crowd_prediction_dataset_clean.csv
│
├── models/                       # Trained artifacts (created after training)
│
├── weather_ml/                   # MODEL 3 — merged-in TourIntel weather package
│   ├── config.py                 # Locations, paths, constants
│   ├── data_ingest.py             # NASA POWER fetch + synthetic fallback
│   ├── data_clean.py               # De-dup, physical-consistency fixes
│   ├── features.py                  # Calendar/lag/rolling features
│   ├── modeling.py                   # XGBoost training + evaluation
│   ├── persistence.py                 # Save/load trained models
│   ├── inference.py                    # predict_weather() / forecast_forward()
│   ├── live_weather.py                  # Odisha-registry Open-Meteo provider
│   ├── integration.py                    # Combines ML + live layers
│   └── eda.py                             # Optional plotting functions
├── weather_ml_data/               # Raw + cleaned weather CSVs
├── weather_ml_models/              # Trained .pkl weather models + metadata
├── train_weather_pipeline.py       # MODEL 3 — end-to-end training script
├── predict_weather_cli.py          # MODEL 3 — command-line predictions
│
└── utils/                         # Deterministic feature-engineering helpers
    ├── festival_calendar.py      # Indian festival dates, exact-date by year
    ├── school_calendar.py        # School vacation intensity (0-3 score)
    ├── economic_data.py          # USD/INR annual exchange rate
    ├── geo_utils.py               # Distance-to-nearest-major-airport
    ├── live_weather.py            # Open-Meteo provider for /weather/live
    └── __init__.py
```

---

# Model 1: Crowd Prediction

### Algorithm — LightGBM (gradient-boosted trees)

For structured/tabular data like this — a mix of categorical (place, category, state) and numeric (weather, coordinates) features with under ~10k rows — gradient-boosted trees consistently beat deep neural nets, which need far more data to win on tabular problems this size. LightGBM handles categorical features **natively** — no lossy one-hot encoding required.

### Features

| Group | Fields |
|---|---|
| **Categorical** | `place_name`, `category`, `state`, `city_tier`, `season` |
| **Temporal (cyclical)** | `month_sin`, `month_cos`, `quarter`, `is_peak_season` |
| **Geographic** | `latitude`, `longitude`, `distance_to_airport_km` |
| **Weather** | `avg_temp_c`, `avg_precip_mm` |
| **Calendar context** | `festival_day_count`, `is_festival_month`, `school_vacation_intensity` |
| **Economic** | `usd_inr_rate` |
| **Popularity** | `popularity_percentile` |
| **Lag (leak-safe)** | `prev_month_log_visitors`, `yoy_log_visitors` |
| **Place-level (train-only)** | `place_avg_log_visitors` |

### Validation Strategy

```
┌────────────────────────────────────────────────┐
│ Train:  2021 - 2022                            │
│ Test:   2023 - 2024   (unseen, honest holdout) │
└────────────────────────────────────────────────┘
```

Time-based split, not random — this avoids data leakage. The model never sees a place+month combination at training time and gets tested on the same combination; it's forced to generalize across years, a true measure of real-world predictive power.

### Verified Accuracy

**~98%** holdout accuracy on 2023–2024 data (macro-F1 ≈ 98%), confirmed by 5-fold cross-validation across the full dataset — every fold lands in the same range, so this isn't a lucky split.

`crowd_level` is approximately a global tercile split of `total_visitors_est` (Low/Medium/High), and `total_visitors_est` itself can't be used as an input feature — it's what we're predicting. What pushes accuracy this high is `prev_month_log_visitors` and `yoy_log_visitors` (this place's actual visitor count last month / same month last year): in this dataset, a place's visitor volume is highly persistent month-to-month and season-to-season, so recent history is a strong, legitimate predictor of what comes next. Those lag features are computed leak-safely (`shift(1)`, train-only fallbacks — see `train_model.py`), so this number reflects real predictive power, not a leaked target.

If you retrain on a different or noisier dataset, re-run `cross_validate_full_report()` rather than assuming this number holds by default.

---

# Model 2: Place Recommendation

Ranks places by `popularity_percentile`, with optional filters and typo-tolerant search:

```python
from recommend_places import PlaceRecommender

recommender = PlaceRecommender()
recommender.top(n=15)                       # top 15 overall
recommender.top(n=15, category="Monument")  # filtered by category
recommender.top(n=15, state="Uttar Pradesh")# filtered by state
recommender.search("tajmahal")              # fuzzy match, handles typos
recommender.all_places()                    # browse everything
```

Substring matches are returned first (usually what the user meant), then fuzzy matches as a fallback for typos — de-duplicated and capped at the requested limit.

---

# Model 3: Weather Forecasting (merged in from TourIntel)

Three XGBoost models — trained on 10 years (2015-2024) of NASA POWER historical
daily data — predicting next-day-style max temperature, min temperature, and
rain probability for 20 India-wide tourist destinations (14 general + 6
Odisha special-focus). Falls back to a clearly-labelled synthetic climate
simulator if NASA POWER is unreachable at training time.

This is a genuinely different signal from `utils/live_weather.py`
(today's real conditions from Open-Meteo) and from Model 1 above (a
*typical month* crowd level): Model 3 predicts *tomorrow's* (and further
out) temperature/rain from a trained model, using lag/rolling features
built from recent history — a multi-day-ahead forecast, not a live
reading or a historical average.

```python
from weather_ml.inference import InferenceEngine

engine = InferenceEngine.load()
engine.predict_weather("Goa", "2026-09-15")   # single-date prediction
engine.forecast_forward("Goa", 7)             # 7-day recursive forecast
engine.odisha_forecast("2026-09-15")          # all 6 Odisha destinations, one date
```

Train it (only needed if `weather_ml_models/*.pkl` aren't already present):

```bash
python train_weather_pipeline.py
```

Or predict from the command line, no server required:

```bash
python predict_weather_cli.py --location Goa --date 2026-09-15
python predict_weather_cli.py --location Gangtok --forecast-days 7
python predict_weather_cli.py --odisha --date 2026-09-15
```

Note: this forecast is recursive beyond the last known history date —
each predicted day feeds the next day's lag/rolling features, so
uncertainty compounds with horizon. Treat a 1-day-out prediction as far
more reliable than a 30-day-out one.

---

# API Reference

## Predictions

```
┌─ Single Prediction ────────────────────────────────────┐
│ GET /predict?place=Taj+Mahal&month=3                   │
│                                                        │
│ Returns:                                               │
│ {                                                      │
│   "predicted_crowd_level": "High",                     │
│   "confidence": 0.78,                                  │
│   "probabilities": {                                   │
│     "Low": 0.12, "Medium": 0.10, "High": 0.78          │
│   },                                                   │
│   "summary": "Taj Mahal is expected to be high..."     │
│ }                                                      │
└────────────────────────────────────────────────────────┘

┌─ Year Outlook (All 12 Months) ─────────────────────────┐
│ GET /predict/year?place=Taj+Mahal                      │
│                                                        │
│ Returns month-by-month predictions with quiet/         │
│ busiest month summaries                                │
└────────────────────────────────────────────────────────┘
```

## Search & Discovery

```
┌─ Top Places by Popularity ─────────────────────────────┐
│ GET /places/top?n=20&category=Monument                 │
│ GET /places/top?n=20&state=Uttar+Pradesh               │
└────────────────────────────────────────────────────────┘

┌─ Autocomplete Search ──────────────────────────────────┐
│ GET /places/search?q=temple&limit=10                   │
└────────────────────────────────────────────────────────┘

┌─ All Places / Metadata ────────────────────────────────┐
│ GET /places/all                                        │
│ GET /places/categories                                 │
│ GET /places/states                                     │
└────────────────────────────────────────────────────────┘
```

## Trip Planning (Full Product)

```
┌─ Complete Trip Forecast ───────────────────────────────┐
│ POST /trip/plan                                        │
│ Content-Type: application/json                         │
│                                                        │
│ Request:                                               │
│ { "place_name": "Taj Mahal", "month": 3 }              │
│                                                        │
│ Response:                                              │
│   - prediction      [Crowd level + confidence]         │
│   - year_outlook    [All 12 months forecast]           │
│   - alternatives    [Low-crowd similar places]         │
└────────────────────────────────────────────────────────┘
```

## Weather Forecasting (Model 3, merged in from TourIntel)

```
┌─ Supported Locations ──────────────────────────────────┐
│ GET /weather/forecast/locations                        │
└────────────────────────────────────────────────────────┘

┌─ Single-Date ML Prediction ────────────────────────────┐
│ GET /weather/forecast/predict?location=Goa&date=2026-09-15 │
│                                                        │
│ Returns:                                               │
│ {                                                      │
│   "location": "Goa", "date": "2026-09-15",             │
│   "predicted_max_temperature": 31.4,                    │
│   "predicted_min_temperature": 23.6,                    │
│   "rainfall_probability": 0.12,                         │
│   "weather_category": "Partly Cloudy"                   │
│ }                                                       │
└────────────────────────────────────────────────────────┘

┌─ Multi-Day Recursive Forecast ─────────────────────────┐
│ GET /weather/forecast?location=Goa&days=7               │
└────────────────────────────────────────────────────────┘

┌─ Odisha Special-Focus Bundle ──────────────────────────┐
│ GET /weather/forecast/odisha?date=2026-09-15            │
│ Returns all 6 Odisha destinations, one date, ranked by │
│ rainfall probability                                   │
└────────────────────────────────────────────────────────┘
```

## Monitoring & Operations

```
┌─ Health / Model / Metrics / Cache ─────────────────────┐
│ GET  /health         -> status, model_loaded           │
│ GET  /model/info     -> accuracy, features, places     │
│ GET  /metrics        -> latency, errors, uptime        │
│ GET  /cache/stats    -> hit_rate, entries              │
│ POST /cache/clear    -> manual cache bust              │
└────────────────────────────────────────────────────────┘
```

---

# CLI Usage

```bash
# Interactive trip planner
python plan_trip.py

# Non-interactive
python plan_trip.py --place "taj mahal" --month 12 --technical
```

```python
from predict_crowd import CrowdPredictor

predictor = CrowdPredictor()
result = predictor.predict("Taj Mahal", 3)
print(result["predicted_crowd_level"])   # "High"
```

---

# Configuration

Edit `app/config.py` (or set environment variables) to customize:

```bash
export CORS_ORIGINS="https://myapp.com"
export RATE_LIMIT_PER_MINUTE=100
export PREDICTION_CACHE_TTL_SECONDS=86400
export WEATHER_ML_CACHE_TTL_SECONDS=86400        # weather_ml forecast cache
export REDIS_URL="redis://localhost:6379/0"   # optional; in-memory cache if unset
```

See `.env.example` for the full list (also covers `utils/live_weather.py`'s provider settings).

---

# Error Handling

The API gracefully handles:
- Unknown place names → `404` with "did you mean" suggestions
- Invalid months → `400` validation error
- Model not loaded → `503` Service Unavailable
- Rate limit exceeded → `429` Too Many Requests

---

# Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Production checklist**
- [ ] Train model on the latest data
- [ ] Review `models/crowd_model_metrics.json` + confusion matrix
- [ ] Set `CORS_ORIGINS` to trusted domains only
- [ ] Point `REDIS_URL` at a real Redis instance for multi-replica caching
- [ ] Enable HTTPS/SSL and request logging

---

# License

MIT License — built with **LightGBM**, **scikit-learn**, **FastAPI**, and **pandas**.