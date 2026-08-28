"""
Routes for the ML weather-forecasting layer (merged in from the
TourIntel weather package -- see backend/weather_ml/).

This is deliberately a *separate* router from the crowd-prediction routes
in main.py: it has its own model family (XGBoost, not LightGBM), its own
location registry (20 India-wide cities, not the ~300-place tourism
dataset), and its own startup/health story. Keeping it isolated means a
missing weather_ml model file degrades only these endpoints (503), never
the crowd-prediction or trip-planning endpoints the rest of the app
depends on.

Mounted in main.py with:
    from app.weather_ml_routes import router as weather_ml_router
    app.include_router(weather_ml_router)
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app import config
from app.cache import cache
from app.schemas import (
    WeatherMLPrediction,
    WeatherMLForecastResponse,
    WeatherMLForecastDay,
    WeatherMLLocationsResponse,
)
from weather_ml import config as weather_ml_config
from weather_ml.inference import InferenceEngine

router = APIRouter(prefix="/weather/forecast", tags=["weather-ml"])

_engine: InferenceEngine | None = None
_load_error: str | None = None


def load_weather_ml_engine() -> None:
    """Called once from main.py's startup event. Failure here never
    raises past this function -- these endpoints will 503 with a clear
    message instead of taking down the whole API."""
    global _engine, _load_error
    try:
        _engine = InferenceEngine.load()
        print(f"[startup] weather_ml engine loaded -- {len(_engine.locations)} trained locations.")
    except FileNotFoundError as e:
        _load_error = str(e)
        print(
            f"[startup] weather_ml models not found ({e}). "
            f"Run `python train_weather_pipeline.py` to train them. "
            f"/weather/forecast/* will return 503 until then.",
        )


def _require_engine() -> InferenceEngine:
    if _engine is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Weather forecast model not loaded. Run "
                "`python train_weather_pipeline.py` (from backend/) to train "
                "and save it, then restart the API."
                + (f" Last load error: {_load_error}" if _load_error else "")
            ),
        )
    return _engine


@cache.cached(ttl_seconds=config.WEATHER_ML_CACHE_TTL_SECONDS, prefix="weather_ml_predict")
def _cached_predict(location: str, date: str) -> dict:
    return _engine.predict_weather(location, date)


@cache.cached(ttl_seconds=config.WEATHER_ML_CACHE_TTL_SECONDS, prefix="weather_ml_forecast")
def _cached_forecast(location: str, days: int) -> list[dict]:
    df = _engine.forecast_forward(location, days)
    df = df.copy()
    df["date"] = df["date"].astype(str)
    return df.to_dict(orient="records")


@cache.cached(ttl_seconds=config.WEATHER_ML_CACHE_TTL_SECONDS, prefix="weather_ml_odisha")
def _cached_odisha_forecast(date: str) -> list[dict]:
    df = _engine.odisha_forecast(date)
    return df.to_dict(orient="records")


@router.get("/locations", response_model=WeatherMLLocationsResponse)
def weather_ml_locations():
    """Which locations this trained-model layer supports -- distinct from
    (and much smaller than) the ~300-place crowd-prediction dataset."""
    engine_locations = sorted(_engine.locations) if _engine is not None else sorted(weather_ml_config.LOCATIONS)
    return WeatherMLLocationsResponse(
        trained_locations=engine_locations,
        odisha_locations=sorted(weather_ml_config.ODISHA_LOCATIONS),
    )


@router.get("/predict", response_model=WeatherMLPrediction)
def weather_ml_predict(
    location: str = Query(..., description="One of the 20 trained weather_ml locations, e.g. 'Goa'"),
    date: str = Query(..., description="YYYY-MM-DD, past/present/near-future"),
):
    """Single-date next-day-style ML prediction (max/min temp, rain
    probability) -- trained on 10 years of NASA POWER data, distinct from
    the live Open-Meteo conditions served at /weather/live."""
    engine = _require_engine()
    if location not in engine.locations:
        raise HTTPException(
            status_code=404,
            detail=f"'{location}' isn't a trained weather_ml location. Supported: {sorted(engine.locations)}",
        )
    try:
        return _cached_predict(location, date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=WeatherMLForecastResponse)
def weather_ml_forecast(
    location: str = Query(..., description="One of the 20 trained weather_ml locations"),
    days: int = Query(7, ge=1, le=30, description="How many days ahead to recursively forecast"),
):
    """Multi-day recursive forecast: each day's prediction feeds the next
    day's lag/rolling features, so uncertainty compounds with horizon --
    treat day 1 as far more reliable than day 30."""
    engine = _require_engine()
    if location not in engine.locations:
        raise HTTPException(
            status_code=404,
            detail=f"'{location}' isn't a trained weather_ml location. Supported: {sorted(engine.locations)}",
        )
    try:
        days_out = _cached_forecast(location, days)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return WeatherMLForecastResponse(
        location=location,
        days=[WeatherMLForecastDay(**d) for d in days_out],
    )


@router.get("/odisha", response_model=list[WeatherMLPrediction])
def weather_ml_odisha_forecast(date: str = Query(..., description="YYYY-MM-DD")):
    """Odisha special-focus convenience: predict_weather() for all six
    Odisha destinations on the same date, ranked by rainfall probability."""
    _require_engine()
    try:
        rows = _cached_odisha_forecast(date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return [WeatherMLPrediction(**r) for r in rows]
