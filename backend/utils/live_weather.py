"""
Live network call: real-time weather via Open-Meteo (free, no API key).

Everything else in this project is offline-first -- the ML models run on
historical CSVs. This module is the one place that calls out to a real
external API: place -> lat/lon (from our dataset) -> HTTPS request to
open-meteo.com -> current conditions + 16-day forecast.

Not used as a model feature: the crowd model predicts months ahead using
historical seasonal averages, which is the right signal that far out. A
16-day forecast can't feed that. Instead this powers a separate "what's
it like there right now" panel, shown alongside the historical forecast.

Every call is wrapped and short-timeout; failures return None rather than
raising, so callers just fall back to historical data.
"""

from __future__ import annotations

import os
from datetime import date
from typing import Optional

import requests

WEATHER_PROVIDER = os.environ.get("WEATHER_PROVIDER", "open-meteo")
OWM_API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "")
REQUEST_TIMEOUT_SECONDS = float(os.environ.get("WEATHER_TIMEOUT_SECONDS", 4.0))

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OWM_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"

# Open-Meteo's WMO weather codes, condensed into the handful of labels
# the frontend actually needs to show a nice little icon for.
_WMO_LABELS: dict[int, str] = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm",
}

def _weather_label(code: Optional[int]) -> str:
    if code is None:
        return "Unknown"
    return _WMO_LABELS.get(int(code), "Mixed conditions")

def get_live_conditions(latitude: float, longitude: float) -> Optional[dict]:
    """
    Right-now conditions + a 16-day daily forecast for one lat/lon,
    fetched live over HTTPS. Returns None (never raises) if the network
    call fails for any reason -- callers fall back to the historical
    seasonal averages already baked into the dataset.
    """
    if WEATHER_PROVIDER == "openweathermap" and OWM_API_KEY:
        return _get_from_openweathermap(latitude, longitude)
    return _get_from_open_meteo(latitude, longitude)

def _get_from_open_meteo(latitude: float, longitude: float) -> Optional[dict]:
    try:
        resp = requests.get(
            OPEN_METEO_FORECAST_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,precipitation,weather_code,relative_humidity_2m",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
                "forecast_days": 16,
                "timezone": "auto",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        payload = resp.json()
    except (requests.RequestException, ValueError):
        return None

    current = payload.get("current", {})
    daily = payload.get("daily", {})

    forecast = []
    dates = daily.get("time", [])
    for i, day in enumerate(dates):
        forecast.append({
            "date": day,
            "temp_max_c": daily.get("temperature_2m_max", [None] * len(dates))[i],
            "temp_min_c": daily.get("temperature_2m_min", [None] * len(dates))[i],
            "precip_mm": daily.get("precipitation_sum", [None] * len(dates))[i],
            "condition": _weather_label(daily.get("weather_code", [None] * len(dates))[i]),
        })

    return {
        "provider": "open-meteo",
        "current": {
            "temp_c": current.get("temperature_2m"),
            "precip_mm": current.get("precipitation"),
            "humidity_pct": current.get("relative_humidity_2m"),
            "condition": _weather_label(current.get("weather_code")),
        },
        "forecast": forecast,  # up to 16 days out, empty list if unavailable
    }

def _get_from_openweathermap(latitude: float, longitude: float) -> Optional[dict]:
    """Optional alternate path for anyone who already has an OpenWeatherMap
    key -- same return shape as _get_from_open_meteo() so nothing else in
    the app needs to know which provider answered."""
    try:
        resp = requests.get(
            OWM_CURRENT_URL,
            params={
                "lat": latitude, "lon": longitude,
                "appid": OWM_API_KEY, "units": "metric",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        payload = resp.json()
    except (requests.RequestException, ValueError):
        return None

    return {
        "provider": "openweathermap",
        "current": {
            "temp_c": payload.get("main", {}).get("temp"),
            "precip_mm": payload.get("rain", {}).get("1h", 0.0),
            "humidity_pct": payload.get("main", {}).get("humidity"),
            "condition": (payload.get("weather") or [{}])[0].get("description", "Unknown").title(),
        },
        "forecast": [],  # current-weather endpoint only; /forecast could be added the same way
    }

def days_until(month: int, year: Optional[int] = None) -> int:
    """Rough day-count from today to the 1st of the requested month, used
    to decide whether a live 16-day forecast can possibly cover the
    trip -- if it's months away, don't even attempt the call."""
    today = date.today()
    target_year = year or (today.year if month >= today.month else today.year + 1)
    try:
        target = date(target_year, month, 1)
    except ValueError:
        return 9999
    return (target - today).days
