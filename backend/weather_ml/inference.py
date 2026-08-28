"""
`predict_weather(location, date)` — the single function TourIntel needs.

Give it a location name (one of the trained cities) and a date
(`"YYYY-MM-DD"`, past/present/near-future) and it returns next-day-style
predictions for that date, built from the trained XGBoost models.

This module is the inference-time counterpart of the notebook's Sections
11 & 13. Unlike the notebook (which closed over module-level globals
like `feat`, `tmax_model`, etc.), everything here is bundled into an
`InferenceEngine` so a FastAPI process can load it once at startup and
reuse it safely across requests.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import config
from .features import classify_weather, season_of
from .persistence import LoadedArtifacts


def build_feature_row(hist_sorted: pd.DataFrame, target_date: pd.Timestamp,
                       lat: float, lon: float, location_code: int,
                       season_encoder: dict) -> dict:
    """Build the FEATURE_COLS feature row needed to predict `target_date`,
    using only rows in `hist_sorted` with date < target_date."""
    past = hist_sorted[hist_sorted["date"] < target_date].sort_values("date")
    if len(past) < 7:
        raise ValueError("Not enough history to build lag/rolling features.")

    row = {
        "latitude": lat, "longitude": lon,
        "month": target_date.month,
        "day_of_year": target_date.dayofyear,
        "day_of_week": target_date.dayofweek,
        "season_code": season_encoder[season_of(target_date.month)],
        "location_code": location_code,
        "is_cyclone_season": int(target_date.month in config.ODISHA_CYCLONE_MONTHS),
    }
    for col, prefix in [("tmax", "tmax"), ("tmin", "tmin"), ("rainfall_mm", "rain")]:
        series = past[col].values
        for lag in (1, 3, 7):
            row[f"lag_{lag}_{prefix}"] = series[-lag]
        for win in (3, 7):
            row[f"roll_{win}_{prefix}"] = series[-win:].mean()
    return row


class InferenceEngine:
    """Stateless-per-request wrapper around trained models + history.

    Construct once (e.g. at FastAPI startup) via `InferenceEngine.load()`
    or `InferenceEngine.from_artifacts(...)`, then call `.predict_weather()`
    / `.forecast_forward()` / `.odisha_forecast()` freely.
    """

    def __init__(self, artifacts: LoadedArtifacts):
        self.artifacts = artifacts
        self.locations = artifacts.locations
        self.location_encoder = artifacts.location_encoder
        self.season_encoder = artifacts.season_encoder
        self.feature_cols = artifacts.feature_cols
        self.history = artifacts.recent_history

    @classmethod
    def load(cls) -> "InferenceEngine":
        from .persistence import load_artifacts
        return cls(load_artifacts())

    def _history_for(self, location: str) -> pd.DataFrame:
        return (
            self.history[self.history.location == location]
            [["date", "tmax", "tmin", "rainfall_mm", "cloud_amt"]]
            .dropna(subset=["tmax", "tmin", "rainfall_mm"])
            .sort_values("date")
            .reset_index(drop=True)
        )

    def forecast_forward(self, location: str, n_days: int) -> pd.DataFrame:
        """Recursively forecast `n_days` ahead from the last available date
        for `location`. Returns a DataFrame with predicted
        tmax/tmin/rain_probability/weather_category."""
        if location not in self.locations:
            raise ValueError(f"Unsupported location '{location}'. Supported: {sorted(self.locations)}")

        lat, lon, _, _ = self.locations[location]
        loc_code = self.location_encoder[location]

        hist = self._history_for(location)
        if hist.empty:
            raise ValueError(f"No recent history available for '{location}'.")

        last_date = hist["date"].max()
        results = []
        for step in range(1, n_days + 1):
            target_date = last_date + pd.Timedelta(days=step)
            feat_row = build_feature_row(hist, target_date, lat, lon, loc_code, self.season_encoder)
            X_row = pd.DataFrame([feat_row])[self.feature_cols]

            p_tmax = float(self.artifacts.tmax_model.predict(X_row)[0])
            p_tmin = float(min(self.artifacts.tmin_model.predict(X_row)[0], p_tmax - 0.5))
            p_rain_prob = float(self.artifacts.rain_model.predict_proba(X_row)[0, 1])
            p_rain_flag = int(p_rain_prob >= 0.5)
            p_rain_mm = 6.0 if p_rain_flag else 0.0  # simple proxy amount for recursive feature continuity
            category = classify_weather(p_rain_mm, np.nan, p_tmax, p_tmin)

            results.append(dict(
                date=target_date, location=location, predicted_tmax=round(p_tmax, 1),
                predicted_tmin=round(p_tmin, 1), rainfall_probability=round(p_rain_prob, 3),
                weather_category=category,
            ))

            # append predicted row so the NEXT day's lag/rolling features can use it
            hist = pd.concat([hist, pd.DataFrame([{
                "date": target_date, "tmax": p_tmax, "tmin": p_tmin,
                "rainfall_mm": p_rain_mm, "cloud_amt": np.nan,
            }])], ignore_index=True)

        return pd.DataFrame(results)

    def predict_weather(self, location: str, date: str) -> dict:
        """Predict weather for `location` (str) on `date` (str
        'YYYY-MM-DD' or datetime-like).

        Returns a dict: location, date, predicted_max_temperature,
        predicted_min_temperature, rainfall_probability, weather_category.
        """
        if location not in self.locations:
            raise ValueError(f"Unsupported location '{location}'. Supported: {sorted(self.locations)}")

        target_date = pd.Timestamp(date)
        lat, lon, _, _ = self.locations[location]
        loc_code = self.location_encoder[location]

        hist = self._history_for(location)
        if hist.empty:
            raise ValueError(f"No recent history available for '{location}'.")

        if target_date <= hist["date"].max():
            # date is within (or at the edge of) known history -> use real lag features directly
            feat_row = build_feature_row(hist, target_date, lat, lon, loc_code, self.season_encoder)
        else:
            # date is beyond known history -> recursively forecast forward to reach it
            n_days = (target_date - hist["date"].max()).days
            fc = self.forecast_forward(location, n_days)
            last = fc.iloc[-1]
            return {
                "location": location,
                "date": str(target_date.date()),
                "predicted_max_temperature": round(float(last["predicted_tmax"]), 1),
                "predicted_min_temperature": round(float(last["predicted_tmin"]), 1),
                "rainfall_probability": round(float(last["rainfall_probability"]), 3),
                "weather_category": last["weather_category"],
            }

        X_row = pd.DataFrame([feat_row])[self.feature_cols]
        p_tmax = float(self.artifacts.tmax_model.predict(X_row)[0])
        p_tmin = float(min(self.artifacts.tmin_model.predict(X_row)[0], p_tmax - 0.5))
        p_rain_prob = float(self.artifacts.rain_model.predict_proba(X_row)[0, 1])
        p_rain_mm = 6.0 if p_rain_prob >= 0.5 else 0.0
        category = classify_weather(p_rain_mm, np.nan, p_tmax, p_tmin)

        return {
            "location": location,
            "date": str(target_date.date()),
            "predicted_max_temperature": round(p_tmax, 1),
            "predicted_min_temperature": round(p_tmin, 1),
            "rainfall_probability": round(p_rain_prob, 3),
            "weather_category": category,
        }

    def odisha_forecast(self, date: str) -> pd.DataFrame:
        """Odisha-focus convenience wrapper: returns predict_weather() for
        all six Odisha destinations on the same date, as a tidy DataFrame
        — handy for a TourIntel "Odisha travel weather" page that shows
        every destination at once."""
        rows = [self.predict_weather(loc, date) for loc in config.ODISHA_LOCATIONS]
        out = pd.DataFrame(rows)
        return out.sort_values("rainfall_probability", ascending=False).reset_index(drop=True)
