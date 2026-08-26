# TourIntel — India Weather Prediction

Python package + FastAPI service, converted from the original research
notebook (`TourIntel_India_Weather_Prediction_LIVE.ipynb`). Two independent
layers:

1. **ML layer** — three XGBoost models (next-day Tmax, Tmin, rain/no-rain)
   trained on NASA POWER historical daily data for 20 India-wide tourist
   destinations (14 general + 6 Odisha special-focus), with a clearly
   labelled synthetic fallback for offline reproducibility.
2. **Live layer** — real-time conditions + 5-day forecast from the free
   Open-Meteo API (no key required) for a wider 12-location Odisha
   registry.

The two layers are combined — without modifying either — in
`tourintel_weather/integration.py`.

## Project layout

```
tourintel/
├── app.py                     # FastAPI service (run this to serve predictions)
├── train_pipeline.py          # End-to-end training script (run this first)
├── predict_cli.py             # Command-line predictions without the API
├── requirements.txt
├── .env.example                # Copy to .env; only needed for a future key-based provider
├── data/                       # Raw + cleaned CSVs (created by train_pipeline.py)
├── models/                     # Saved .pkl models + metadata (created by train_pipeline.py)
└── tourintel_weather/           # The package
    ├── config.py                # Locations, date ranges, paths, constants
    ├── data_ingest.py            # NASA POWER fetch + synthetic fallback simulator
    ├── data_clean.py              # De-dup, physical-consistency fixes, interpolation
    ├── features.py                 # Calendar/lag/rolling features, season/weather rules
    ├── modeling.py                  # Chronological split, XGBoost training, evaluation
    ├── persistence.py                # Save/load trained models + metadata
    ├── inference.py                   # predict_weather() / forecast_forward() / odisha_forecast()
    ├── live_weather.py                 # Open-Meteo provider + caching
    ├── integration.py                   # Combines ML + live layers (TourIntelWeatherService)
    └── eda.py                            # Optional plotting functions (matplotlib/seaborn)
```

## Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 1. Train the models

```bash
python train_pipeline.py
```

This fetches (or synthesizes) 10 years of daily weather for all 20
locations, cleans it, engineers features, does a chronological 70/15/15
split, trains the three XGBoost models with early stopping, evaluates on
the held-out test set, and saves everything to `models/`:

- `india_tmax_model.pkl`, `india_tmin_model.pkl`, `india_rain_model.pkl`
- `model_metadata.json` (feature list, encoders, per-model test metrics)
- `recent_history.csv` (last 14 days per location, for inference-time
  lag/rolling features)

## 2. Serve predictions

```bash
uvicorn app:app --reload --port 8000
```

Key endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Model-loaded status + supported locations |
| GET | `/api/weather/predict?location=&date=` | Single-date ML prediction |
| GET | `/api/weather/forecast?location=&days=` | Recursive N-day-ahead ML forecast |
| GET | `/api/odisha/forecast?date=` | ML forecast for all 6 Odisha destinations |
| GET | `/api/live/weather?location=` | Live Open-Meteo conditions (Odisha registry) |
| GET | `/api/live/forecast?location=&days=` | Open-Meteo 5-day forecast |
| GET | `/api/tourintel/weather?location=&date=` | Combined live + ML response |
| GET | `/api/tourintel/locations` | Lists all supported location sets |

Interactive docs: `http://localhost:8000/docs`

Example:

```bash
curl "http://localhost:8000/api/weather/predict?location=Gangtok&date=2026-09-15"
curl "http://localhost:8000/api/tourintel/weather?location=Puri"
```

## 3. Or predict from the command line (no server)

```bash
python predict_cli.py --location Goa --date 2026-09-15
python predict_cli.py --location Gangtok --forecast-days 7
python predict_cli.py --odisha --date 2026-09-15
```

## Frontend example

```javascript
async function getWeatherForDestination(location, date) {
  const url = `http://localhost:8000/api/weather/predict?location=${encodeURIComponent(location)}&date=${date}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather prediction failed");
  return await res.json();
}
```

## Notes carried over from the notebook

- Live readings (instant temperature, humidity, wind) are **not**
  auto-injected into the ML model's features — the model needs
  multi-day lag/rolling history, not a single reading. `live_weather`
  and `ml_prediction` are reported side by side, never blended.
- The synthetic climate simulator (`data_ingest.generate_synthetic_weather`)
  is a demo-only fallback for when NASA POWER is unreachable — it is
  always labelled `data_source == "SYNTHETIC_DEMO"` and is not a forecast
  product.
- To add a key-based live provider (e.g. OpenWeather): implement
  `LiveWeatherProvider._fetch_openweather_raw` in `live_weather.py` and
  set `WEATHER_PROVIDER=openweather` in `.env`.

## Suggested production hardening (not implemented here)

- Retrain on a schedule (e.g. nightly) as new days of real IMD/NASA POWER
  data arrive.
- Add response caching (same location+date requested repeatedly by many
  tourists) — the live layer already has this; the ML layer doesn't.
- Add an explicit confidence/uncertainty band, especially for forecasts
  far beyond the last known day (recursive forecasting error compounds
  with horizon).
- Swap the NASA POWER fallback for official IMD gridded data once portal
  access is set up.
