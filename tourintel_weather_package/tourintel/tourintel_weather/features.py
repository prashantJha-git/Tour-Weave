"""
Feature engineering.

Features built for every (location, date) row (all computed **only from
information available up to and including that date** — no leakage from
the future):

- Calendar features: month, day_of_year, day_of_week, season_code,
  is_cyclone_season (Odisha Oct-Nov secondary rain season, 0 elsewhere)
- Location features: latitude, longitude, location_code
- Lag features: lag_{1,3,7} for tmax, tmin, rainfall
- Rolling features: roll_{3,7} means for tmax, tmin, rainfall

Targets are shifted one day forward per location (next-day prediction).
"""
from __future__ import annotations

import pandas as pd

from . import config

# --------------------------------------------------------------------------
# Rule-based helpers
# --------------------------------------------------------------------------


def season_of(month: int) -> str:
    if month in (12, 1, 2):
        return "Winter"
    elif month in (3, 4, 5):
        return "Summer"
    elif month in (6, 7, 8, 9):
        return "Monsoon"
    else:
        return "Post-Monsoon"


def classify_weather(precip_mm: float, cloud_amt: float, tmax: float, tmin: float) -> str:
    """Rule-based weather category, derived transparently from rainfall +
    cloud cover (falls back to diurnal temperature range if cloud cover is
    unavailable)."""
    if precip_mm >= 35:
        return "Heavy Rain"
    if precip_mm >= 2.5:
        return "Rainy"
    if pd.notna(cloud_amt):
        if cloud_amt >= 70:
            return "Cloudy"
        elif cloud_amt >= 35:
            return "Partly Cloudy"
        else:
            return "Sunny"
    diurnal = tmax - tmin
    if precip_mm > 0.1:
        return "Cloudy"
    return "Sunny" if diurnal >= 10 else "Partly Cloudy"


# --------------------------------------------------------------------------
# Feature columns (fixed, order matters — must match trained models)
# --------------------------------------------------------------------------

FEATURE_COLS = (
    ["latitude", "longitude", "month", "day_of_year", "day_of_week",
     "season_code", "location_code", "is_cyclone_season"]
    + [f"lag_{l}_{p}" for p in ["tmax", "tmin", "rain"] for l in (1, 3, 7)]
    + [f"roll_{w}_{p}" for p in ["tmax", "tmin", "rain"] for w in (3, 7)]
)


class FeatureBuildResult:
    """Container bundling everything downstream modules need."""

    __slots__ = ("feat", "model_df", "location_encoder", "season_encoder", "feature_cols")

    def __init__(self, feat, model_df, location_encoder, season_encoder, feature_cols):
        self.feat = feat
        self.model_df = model_df
        self.location_encoder = location_encoder
        self.season_encoder = season_encoder
        self.feature_cols = feature_cols


def build_features(df: pd.DataFrame) -> FeatureBuildResult:
    feat = df.sort_values(["location", "date"]).copy()
    feat["month"] = feat["date"].dt.month
    feat["day_of_year"] = feat["date"].dt.dayofyear
    feat["day_of_week"] = feat["date"].dt.dayofweek
    feat["season"] = feat["month"].apply(season_of)

    feat["is_cyclone_season"] = feat["month"].isin(config.ODISHA_CYCLONE_MONTHS).astype(int)

    feat["weather_category"] = feat.apply(
        lambda r: classify_weather(r["rainfall_mm"], r["cloud_amt"], r["tmax"], r["tmin"]), axis=1
    )

    # categorical encodings (mappings saved for later use by predict_weather / FastAPI)
    location_categories = sorted(feat["location"].unique())
    season_categories = config.SEASON_CATEGORIES
    location_encoder = {name: i for i, name in enumerate(location_categories)}
    season_encoder = {name: i for i, name in enumerate(season_categories)}

    feat["location_code"] = feat["location"].map(location_encoder)
    feat["season_code"] = feat["season"].map(season_encoder)

    # ---- lag & rolling features, computed strictly within each location ----
    feat = feat.sort_values(["location", "date"]).reset_index(drop=True)
    for col, prefix in [("tmax", "tmax"), ("tmin", "tmin"), ("rainfall_mm", "rain")]:
        g = feat.groupby("location")[col]
        for lag in (1, 3, 7):
            feat[f"lag_{lag}_{prefix}"] = g.shift(lag)
        for win in (3, 7):
            feat[f"roll_{win}_{prefix}"] = g.transform(lambda s: s.shift(1).rolling(win).mean())

    # ---- next-day targets ----
    feat = feat.sort_values(["location", "date"])
    feat["target_tmax"] = feat.groupby("location")["tmax"].shift(-1)
    feat["target_tmin"] = feat.groupby("location")["tmin"].shift(-1)
    feat["target_rain"] = (
        feat.groupby("location")["rainfall_mm"].shift(-1) >= config.RAIN_THRESHOLD_MM
    ).astype("Int64")
    feat["target_category"] = feat.groupby("location")["weather_category"].shift(-1)

    model_df = feat.dropna(
        subset=FEATURE_COLS + ["target_tmax", "target_tmin", "target_rain"]
    ).copy()
    model_df["target_rain"] = model_df["target_rain"].astype(int)

    return FeatureBuildResult(
        feat=feat,
        model_df=model_df,
        location_encoder=location_encoder,
        season_encoder=season_encoder,
        feature_cols=FEATURE_COLS,
    )
