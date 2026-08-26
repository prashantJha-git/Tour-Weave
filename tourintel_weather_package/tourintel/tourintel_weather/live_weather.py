"""
Live Weather Layer (Open-Meteo) — TourIntel Extension.

Modular by design: `WEATHER_PROVIDER` selects the backend. Only
`"open_meteo"` is implemented (no API key needed). A second provider
(e.g. OpenWeather) can be added later by implementing
`_fetch_openweather_raw()` and switching the flag — it would need
`OPENWEATHER_API_KEY` in the environment (see `.env.example`).

This module does NOT touch, retrain, or replace any of the XGBoost
models, FEATURE_COLS, LOCATIONS, or predict_weather() from the ML layer.
It is a completely separate real-time data source; the two are only
combined (without modifying either) in `integration.py`.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta

import pandas as pd
import requests

# ---- Provider configuration (modular — swap providers without touching callers) ----
WEATHER_PROVIDER = os.getenv("WEATHER_PROVIDER", "open_meteo")  # future options: "openweather", etc.
CACHE_TTL_MINUTES = int(os.getenv("WEATHER_CACHE_TTL_MINUTES", "12"))  # 10-15 min cache window per spec

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

OPEN_METEO_CURRENT_VARS = (
    "temperature_2m,relative_humidity_2m,apparent_temperature,"
    "precipitation,rain,wind_speed_10m,weather_code"
)
OPEN_METEO_DAILY_VARS = (
    "weather_code,temperature_2m_max,temperature_2m_min,"
    "precipitation_probability_max,wind_speed_10m_max"
)

# WMO weather_code -> short human-readable condition (Open-Meteo uses the WMO table)
WMO_WEATHER_CODE_MAP = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall", 77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
}


def _describe_weather_code(code):
    if code is None or (isinstance(code, float) and pd.isna(code)):
        return "Unknown"
    try:
        return WMO_WEATHER_CODE_MAP.get(int(code), f"Unknown (code {code})")
    except (TypeError, ValueError):
        return "Unknown"


class LiveWeatherProvider:
    """In-process cache + provider dispatch, per (lat, lon).

    A module-level default instance (`default_provider`) is exported for
    convenience, but you can construct your own e.g. for testing.
    """

    def __init__(self, provider: str = WEATHER_PROVIDER, cache_ttl_minutes: int = CACHE_TTL_MINUTES):
        self.provider = provider
        self.cache_ttl_minutes = cache_ttl_minutes
        self._cache: dict[tuple[float, float], dict] = {}

    @staticmethod
    def _cache_key(lat: float, lon: float) -> tuple[float, float]:
        return (round(float(lat), 3), round(float(lon), 3))

    def _fetch_open_meteo_raw(self, lat: float, lon: float, timeout: int = 10) -> dict:
        """Single call that returns BOTH current conditions and a 5-day daily forecast."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": OPEN_METEO_CURRENT_VARS,
            "daily": OPEN_METEO_DAILY_VARS,
            "timezone": "auto",
            "forecast_days": 5,
        }
        r = requests.get(OPEN_METEO_URL, params=params, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def _fetch_openweather_raw(self, lat: float, lon: float, timeout: int = 10) -> dict:
        """Future extension point — NOT implemented in this prototype.
        Would require OPENWEATHER_API_KEY from the environment (see
        .env.example)."""
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENWEATHER_API_KEY is not set. Add it to your environment / .env file "
                "(see .env.example) before switching WEATHER_PROVIDER to 'openweather'."
            )
        raise NotImplementedError("OpenWeather provider is a future extension point, not implemented here.")

    def _fetch_provider_raw(self, lat: float, lon: float) -> dict:
        if self.provider == "open_meteo":
            return self._fetch_open_meteo_raw(lat, lon)
        elif self.provider == "openweather":
            return self._fetch_openweather_raw(lat, lon)
        else:
            raise ValueError(f"Unknown WEATHER_PROVIDER: {self.provider!r}")

    def _get_weather_payload(self, lat: float, lon: float) -> tuple[dict | None, str]:
        """Returns (payload_or_None, source_label). source_label is one of:
        'live', 'cache_fresh', 'cache_stale_fallback (...)', 'unavailable'."""
        key = self._cache_key(lat, lon)
        cached = self._cache.get(key)
        now = datetime.utcnow()

        if cached and (now - cached["fetched_at"]) < timedelta(minutes=self.cache_ttl_minutes):
            return cached["payload"], "cache_fresh"

        try:
            payload = self._fetch_provider_raw(lat, lon)
            self._cache[key] = {"payload": payload, "fetched_at": now}
            return payload, "live"
        except Exception as e:
            if cached is not None:
                return cached["payload"], f"cache_stale_fallback ({type(e).__name__})"
            return None, "unavailable"

    def get_live_weather(self, latitude: float, longitude: float) -> dict:
        """Reusable live-weather function (per spec).

        Returns a dict: temperature, apparent_temperature, humidity,
        precipitation, rain, wind_speed, weather_code, weather_condition,
        timestamp, data_source. Never fabricates values — if the provider
        and cache both fail, numeric fields are None and
        data_source == 'unavailable'.
        """
        payload, source = self._get_weather_payload(latitude, longitude)
        if payload is None:
            return {
                "temperature": None, "apparent_temperature": None, "humidity": None,
                "precipitation": None, "rain": None, "wind_speed": None,
                "weather_code": None, "weather_condition": None,
                "timestamp": None, "data_source": "unavailable",
                "message": "Live weather temporarily unavailable.",
            }
        cur = payload.get("current", {})
        return {
            "temperature": cur.get("temperature_2m"),
            "apparent_temperature": cur.get("apparent_temperature"),
            "humidity": cur.get("relative_humidity_2m"),
            "precipitation": cur.get("precipitation"),
            "rain": cur.get("rain"),
            "wind_speed": cur.get("wind_speed_10m"),
            "weather_code": cur.get("weather_code"),
            "weather_condition": _describe_weather_code(cur.get("weather_code")),
            "timestamp": cur.get("time"),
            "data_source": source,
        }

    def get_live_forecast(self, latitude: float, longitude: float, days: int = 5) -> list[dict]:
        """Open-Meteo's own daily forecast (kept SEPARATE from the ML
        prediction). Returns a list of dicts: date, temperature_max,
        temperature_min, rain_probability_pct, weather_code,
        weather_condition, wind_speed_max."""
        payload, source = self._get_weather_payload(latitude, longitude)
        if payload is None:
            return []
        daily = payload.get("daily", {})
        dates = daily.get("time", [])[:days]
        n = len(dates)

        def col(name):
            vals = daily.get(name, [None] * n)
            return vals[:n]

        tmax = col("temperature_2m_max")
        tmin = col("temperature_2m_min")
        rain_p = col("precipitation_probability_max")
        wcode = col("weather_code")
        wind = col("wind_speed_10m_max")

        out = []
        for i, d in enumerate(dates):
            out.append({
                "date": d,
                "temperature_max": tmax[i] if i < len(tmax) else None,
                "temperature_min": tmin[i] if i < len(tmin) else None,
                "rain_probability_pct": rain_p[i] if i < len(rain_p) else None,
                "weather_code": wcode[i] if i < len(wcode) else None,
                "weather_condition": _describe_weather_code(wcode[i] if i < len(wcode) else None),
                "wind_speed_max": wind[i] if i < len(wind) else None,
                "data_source": source,
            })
        return out


def normalize_live_record(raw: dict | None) -> dict | None:
    """No-op unit conversion (Open-Meteo defaults already match: °C, mm,
    km/h) — kept as an explicit named step so a future provider with
    different units/keys only needs a new normalizer, not changes to
    every caller."""
    if raw is None:
        return raw
    return {
        "temperature_c": raw.get("temperature"),
        "apparent_temperature_c": raw.get("apparent_temperature"),
        "humidity_pct": raw.get("humidity"),
        "precipitation_mm": raw.get("precipitation"),
        "rain_mm": raw.get("rain"),
        "wind_speed_kmh": raw.get("wind_speed"),
        "weather_condition": raw.get("weather_condition"),
        "timestamp": raw.get("timestamp"),
        "data_source": raw.get("data_source"),
    }


# Module-level default instance, shared across a process (mirrors the
# notebook's module-level cache).
default_provider = LiveWeatherProvider()
