from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ┌── API METADATA ───────────────────────────────────────────────────┐
API_TITLE = "Tourism Crowd Prediction API"
API_VERSION = "1.0.0"
API_DESCRIPTION = (
    "Predicts monthly crowd levels for Indian tourist places, recommends "
    "places to visit, and plans trips around low-crowd windows."
)

# ┌── CORS ────────────────────────────────────────────────────────────┐
# Comma-separated list of allowed origins, e.g. "https://myapp.com,http://localhost:5173"
# Defaults to "*" for easy local development -- lock this down in production.
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",")]

# ┌── CACHING ─────────────────────────────────────────────────────────┐
PREDICTION_CACHE_TTL_SECONDS = int(os.environ.get("PREDICTION_CACHE_TTL_SECONDS", 3600))
RECOMMENDATION_CACHE_TTL_SECONDS = int(os.environ.get("RECOMMENDATION_CACHE_TTL_SECONDS", 3600))
REDIS_URL = os.environ.get("REDIS_URL")  # if unset, app/cache.py uses in-memory cache

# ┌── RATE LIMITING ───────────────────────────────────────────────────┐
RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", 120))

# ┌── LOGGING ─────────────────────────────────────────────────────────┐
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

# ┌── WEATHER ML (XGBoost next-day/forecast layer, see weather_ml/) ──┐
# Predictions are deterministic for a given (location, date) against the
# frozen recent_history.csv shipped with the trained models, so a longer
# TTL than the live-weather cache is safe.
WEATHER_ML_CACHE_TTL_SECONDS = int(os.environ.get("WEATHER_ML_CACHE_TTL_SECONDS", 3600))
