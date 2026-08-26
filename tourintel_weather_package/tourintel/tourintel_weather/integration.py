"""
How the live-weather layer connects to the existing Odisha ML model.

Connection, in one sentence: the live layer and the ML model run side by
side and meet only inside `get_tourintel_weather()`, which calls the
*unmodified* `InferenceEngine.predict_weather()` and the *unmodified*
`LiveWeatherProvider.get_live_weather()` / `.get_live_forecast()`, then
merges their outputs into one response. Neither layer is changed by the
other.

Feature compatibility note: live readings (instant temperature,
humidity, wind, etc.) are NOT auto-injected into the ML model's
features. The model needs multi-day lag/rolling history
(`lag_1/3/7_tmax`, `roll_3/7_tmax`, ...), not a single live reading, so
`live_weather` and `ml_prediction` are reported side by side rather than
blended.
"""
from __future__ import annotations

from datetime import datetime

import pandas as pd

from .inference import InferenceEngine
from .live_weather import LiveWeatherProvider

# ---- Odisha tourist locations for the LIVE weather layer (lat, lon) ----
# Easy to extend: just add another "Name": (lat, lon) entry.
ODISHA_TOURIST_LOCATIONS: dict[str, tuple[float, float]] = {
    "Bhubaneswar": (20.2961, 85.8245),
    "Puri":        (19.8135, 85.8312),
    "Cuttack":     (20.4625, 85.8828),
    "Konark":      (19.8876, 86.0945),
    "Chilika":     (19.6470, 85.4519),
    "Gopalpur":    (19.2647, 84.9006),
    "Rourkela":    (22.2604, 84.8536),
    "Sambalpur":   (21.4669, 83.9756),
    "Baripada":    (21.9345, 86.7331),
    "Koraput":     (18.8120, 82.7100),
    "Daringbadi":  (19.9167, 84.1167),
    "Simlipal":    (21.9347, 86.7333),  # matches the ML model's "Similipal" coordinates
}

# ---- Adapter: live-location name -> trained ML model location name ----
# Only locations that exist in the model's own LOCATIONS/LOCATION_ENCODER
# can get an AI prediction without retraining.
ML_LOCATION_ALIASES: dict[str, str] = {
    "Bhubaneswar": "Bhubaneswar",
    "Puri":        "Puri",
    "Konark":      "Konark",
    "Chilika":     "Chilika",
    "Gopalpur":    "Gopalpur",
    "Simlipal":    "Similipal",  # spelling difference only
}


class TourIntelWeatherService:
    """Combines the trained ML models with the live Open-Meteo layer.

    Construct once (e.g. at FastAPI startup):
        service = TourIntelWeatherService(InferenceEngine.load())
    """

    def __init__(self, engine: InferenceEngine, live_provider: LiveWeatherProvider | None = None):
        self.engine = engine
        self.live = live_provider or LiveWeatherProvider()

    def get_weather_for_location(self, location: str) -> dict:
        """Look up an Odisha tourist location by name and return its LIVE
        weather. Raises KeyError (with the supported list) for an unknown
        name."""
        if location not in ODISHA_TOURIST_LOCATIONS:
            raise KeyError(f"Unknown location '{location}'. Supported: {sorted(ODISHA_TOURIST_LOCATIONS)}")
        lat, lon = ODISHA_TOURIST_LOCATIONS[location]
        return self.live.get_live_weather(lat, lon)

    def get_ml_prediction(self, location: str, date: str | None = None) -> dict:
        """Adapter around the EXISTING InferenceEngine.predict_weather() —
        that function is called completely unmodified. Resolves a
        live-location name to the model's trained location name via
        ML_LOCATION_ALIASES. Never fabricates a prediction: returns
        available=False with a reason if the location wasn't in the
        training set or if predict_weather() itself raises."""
        if date is None:
            date = pd.Timestamp.utcnow().normalize().date().isoformat()

        ml_name = ML_LOCATION_ALIASES.get(location)
        if ml_name is None:
            return {
                "available": False,
                "reason": (
                    f"'{location}' is not one of the trained model's locations "
                    f"({sorted(self.engine.locations)}). Would require retraining to add."
                ),
            }
        try:
            result = self.engine.predict_weather(ml_name, date)
            result["available"] = True
            result["ml_location_used"] = ml_name
            return result
        except Exception as e:
            return {"available": False, "reason": str(e)}

    def get_tourintel_weather(self, location: str, date: str | None = None) -> dict:
        """Final combined TourIntel function (per spec).

        Returns:
            {location, live_weather, ml_prediction, forecast, data_source, timestamp}
        """
        if location not in ODISHA_TOURIST_LOCATIONS:
            raise KeyError(f"Unknown location '{location}'. Supported: {sorted(ODISHA_TOURIST_LOCATIONS)}")
        lat, lon = ODISHA_TOURIST_LOCATIONS[location]

        live = self.live.get_live_weather(lat, lon)
        forecast = self.live.get_live_forecast(lat, lon, days=5)
        ml = self.get_ml_prediction(location, date)

        return {
            "location": location,
            "live_weather": live,
            "ml_prediction": ml,
            "forecast": forecast,
            "data_source": {
                "live": live.get("data_source"),
                "forecast": forecast[0]["data_source"] if forecast else "unavailable",
                "ml": "trained_xgboost_model" if ml.get("available") else "unavailable",
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
