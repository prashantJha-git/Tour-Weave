#!/usr/bin/env python3
"""
TourIntel Weather Prediction API (FastAPI).

Loads the trained XGBoost models + metadata once at startup and exposes
both the ML prediction layer and the live Open-Meteo layer, plus the
combined "TourIntel" endpoint that reports them side by side.

Run with:
    uvicorn app:app --reload --port 8000

Requires models to already be trained — run `python train_pipeline.py`
first if `models/*.pkl` don't exist yet.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from tourintel_weather import config
from tourintel_weather.inference import InferenceEngine
from tourintel_weather.integration import (
    ML_LOCATION_ALIASES,
    ODISHA_TOURIST_LOCATIONS,
    TourIntelWeatherService,
)
from tourintel_weather.live_weather import LiveWeatherProvider

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("tourintel.app")

app = FastAPI(
    title="TourIntel Weather Prediction API",
    description=(
        "India-wide next-day weather prediction (XGBoost, NASA POWER trained) "
        "plus live conditions & 5-day forecast (Open-Meteo) for Odisha destinations."
    ),
    version="1.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ---- load once at startup ----
_engine: InferenceEngine | None = None
_service: TourIntelWeatherService | None = None


@app.on_event("startup")
def _load_models() -> None:
    global _engine, _service
    try:
        _engine = InferenceEngine.load()
        _service = TourIntelWeatherService(_engine, LiveWeatherProvider())
        logger.info("Loaded trained models from %s", config.MODELS_DIR)
    except FileNotFoundError as e:
        logger.error(
            "Model artifacts not found (%s). Run `python train_pipeline.py` first.", e
        )
        # Leave _engine/_service as None; endpoints will 503 until trained.


def _require_engine() -> InferenceEngine:
    if _engine is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train_pipeline.py` to train and save models, then restart the API.",
        )
    return _engine


def _require_service() -> TourIntelWeatherService:
    if _service is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train_pipeline.py` to train and save models, then restart the API.",
        )
    return _service


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------


class WeatherResponse(BaseModel):
    location: str
    date: str
    predicted_max_temperature: float
    predicted_min_temperature: float
    rainfall_probability: float
    weather_category: str


class LiveWeatherResponse(BaseModel):
    temperature: float | None
    apparent_temperature: float | None
    humidity: float | None
    precipitation: float | None
    rain: float | None
    wind_speed: float | None
    weather_code: int | None
    weather_condition: str | None
    timestamp: str | None
    data_source: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    supported_ml_locations: list[str]
    supported_odisha_live_locations: list[str]


# --------------------------------------------------------------------------
# Health
# --------------------------------------------------------------------------


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=_engine is not None,
        supported_ml_locations=sorted(config.LOCATIONS) if _engine is None else sorted(_engine.locations),
        supported_odisha_live_locations=sorted(ODISHA_TOURIST_LOCATIONS),
    )


# --------------------------------------------------------------------------
# ML prediction layer
# --------------------------------------------------------------------------


@app.get("/api/weather/predict", response_model=WeatherResponse)
def get_weather_prediction(
    location: str = Query(..., description="One of the 20 trained TourIntel locations"),
    date: str = Query(..., description="YYYY-MM-DD, past/present/near-future"),
) -> WeatherResponse:
    engine = _require_engine()
    if location not in engine.locations:
        raise HTTPException(status_code=400, detail=f"Unsupported location: {location}")
    try:
        result = engine.predict_weather(location, date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return WeatherResponse(**result)


@app.get("/api/weather/forecast")
def get_forecast(
    location: str = Query(...),
    days: int = Query(7, ge=1, le=30),
) -> list[dict]:
    """Recursive multi-day-ahead ML forecast (Section 11 of the notebook)."""
    engine = _require_engine()
    if location not in engine.locations:
        raise HTTPException(status_code=400, detail=f"Unsupported location: {location}")
    try:
        fc = engine.forecast_forward(location, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    fc = fc.copy()
    fc["date"] = fc["date"].astype(str)
    return fc.to_dict(orient="records")


@app.get("/api/odisha/forecast")
def get_odisha_forecast(date: str = Query(..., description="YYYY-MM-DD")) -> list[dict]:
    """predict_weather() for all six Odisha ML destinations on one date."""
    engine = _require_engine()
    try:
        df = engine.odisha_forecast(date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return df.to_dict(orient="records")


# --------------------------------------------------------------------------
# Live weather layer (Open-Meteo, Odisha registry)
# --------------------------------------------------------------------------


@app.get("/api/live/weather", response_model=LiveWeatherResponse)
def get_live_weather(location: str = Query(..., description="Odisha tourist location name")) -> LiveWeatherResponse:
    service = _require_service()
    if location not in ODISHA_TOURIST_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown location. Supported: {sorted(ODISHA_TOURIST_LOCATIONS)}")
    result = service.get_weather_for_location(location)
    return LiveWeatherResponse(**{k: result.get(k) for k in LiveWeatherResponse.model_fields})


@app.get("/api/live/forecast")
def get_live_forecast(
    location: str = Query(...),
    days: int = Query(5, ge=1, le=5),
) -> list[dict]:
    service = _require_service()
    if location not in ODISHA_TOURIST_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown location. Supported: {sorted(ODISHA_TOURIST_LOCATIONS)}")
    lat, lon = ODISHA_TOURIST_LOCATIONS[location]
    return service.live.get_live_forecast(lat, lon, days=days)


# --------------------------------------------------------------------------
# Combined TourIntel endpoint (live + ML side by side)
# --------------------------------------------------------------------------


@app.get("/api/tourintel/weather")
def get_tourintel_weather(
    location: str = Query(..., description="Odisha tourist location name"),
    date: str | None = Query(None, description="YYYY-MM-DD; defaults to today"),
) -> dict:
    service = _require_service()
    if location not in ODISHA_TOURIST_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown location. Supported: {sorted(ODISHA_TOURIST_LOCATIONS)}")
    return service.get_tourintel_weather(location, date)


@app.get("/api/tourintel/locations")
def list_locations() -> dict:
    return {
        "ml_trained_locations": sorted(config.LOCATIONS),
        "odisha_live_locations": sorted(ODISHA_TOURIST_LOCATIONS),
        "odisha_live_locations_with_ml": sorted(ML_LOCATION_ALIASES),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
