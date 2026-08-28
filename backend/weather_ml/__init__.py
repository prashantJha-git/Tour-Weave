"""
TourIntel — India Weather Prediction
=====================================

A location-aware weather prediction package for the TourIntel tourism
platform, converted from the original research notebook
(`TourIntel_India_Weather_Prediction_LIVE.ipynb`) into a proper Python
package + FastAPI service.

Two independent layers, kept side by side:

1. **ML layer** (`data_ingest`, `data_clean`, `features`, `modeling`,
   `persistence`, `inference`) — trains and serves three XGBoost models
   (next-day Tmax, Tmin, rain/no-rain) for 14 India-wide tourist
   destinations (with an Odisha focus), using NASA POWER historical data
   (falling back to a clearly-labelled synthetic climate simulator when
   the API is unreachable).

2. **Live layer** (`live_weather`) — real-time conditions + 5-day forecast
   from the free Open-Meteo API, for a wider Odisha tourist-location
   registry. No API key required for the current provider.

`integration` glues the two together without modifying either
(`get_tourintel_weather`), and `app` exposes everything over FastAPI.
"""

__version__ = "1.0.0"
