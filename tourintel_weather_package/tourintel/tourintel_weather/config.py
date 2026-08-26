"""
Central configuration for the TourIntel ML weather layer.

Everything here is a pure constant (no I/O, no computation that could
fail) so every other module can import it safely.
"""
from __future__ import annotations

import os
import pandas as pd

# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

RAW_CSV = os.path.join(DATA_DIR, "india_weather_raw.csv")
CLEAN_CSV = os.path.join(DATA_DIR, "india_weather_clean.csv")

TMAX_MODEL_PATH = os.path.join(MODELS_DIR, "india_tmax_model.pkl")
TMIN_MODEL_PATH = os.path.join(MODELS_DIR, "india_tmin_model.pkl")
RAIN_MODEL_PATH = os.path.join(MODELS_DIR, "india_rain_model.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")
RECENT_HISTORY_PATH = os.path.join(MODELS_DIR, "recent_history.csv")


def ensure_dirs() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)


# --------------------------------------------------------------------------
# TourIntel India-only tourist locations (ML training set)
# name -> (latitude, longitude, state, region)
# --------------------------------------------------------------------------
LOCATIONS: dict[str, tuple[float, float, str, str]] = {
    "Agartala":   (23.8315, 91.2868, "Tripura",            "Northeast"),
    "Shillong":   (25.5788, 91.8933, "Meghalaya",           "Northeast"),
    "Guwahati":   (26.1445, 91.7362, "Assam",               "Northeast"),
    "Tawang":     (27.5859, 91.8594, "Arunachal Pradesh",   "Northeast (Himalayan)"),
    "Gangtok":    (27.3389, 88.6065, "Sikkim",              "Northeast (Himalayan)"),
    "Darjeeling": (27.0410, 88.2663, "West Bengal",         "East (Himalayan)"),
    "Delhi":      (28.6139, 77.2090, "Delhi",               "North"),
    "Jaipur":     (26.9124, 75.7873, "Rajasthan",           "North (Arid)"),
    "Agra":       (27.1767, 78.0081, "Uttar Pradesh",       "North"),
    "Goa":        (15.4909, 73.8278, "Goa",                 "West Coast"),
    "Mumbai":     (19.0760, 72.8777, "Maharashtra",         "West Coast"),
    "Kochi":      (9.9312,  76.2673, "Kerala",              "South Coast"),
    "Varanasi":   (25.3176, 82.9739, "Uttar Pradesh",       "North / Gangetic Plain"),
    "Srinagar":   (34.0837, 74.7973, "Jammu & Kashmir",     "North (Himalayan)"),
    # ---- Odisha tourist destinations (special focus state) ----
    "Bhubaneswar": (20.2961, 85.8245, "Odisha", "Odisha (Temple City)"),
    "Puri":        (19.8135, 85.8312, "Odisha", "Odisha (East Coast)"),
    "Konark":      (19.8876, 86.0945, "Odisha", "Odisha (East Coast)"),
    "Chilika":     (19.6470, 85.4519, "Odisha", "Odisha (Lagoon/East Coast)"),
    "Gopalpur":    (19.2647, 84.9006, "Odisha", "Odisha (East Coast)"),
    "Similipal":   (21.9347, 86.7333, "Odisha", "Odisha (Inland Forest)"),
}

# Odisha is treated as a special-focus state for TourIntel: a dedicated EDA
# sub-section, cyclone-season awareness feature, and an `odisha_forecast()`
# convenience wrapper.
ODISHA_LOCATIONS = [name for name, v in LOCATIONS.items() if v[2] == "Odisha"]

START_DATE = "2015-01-01"
END_DATE = "2024-12-31"

RANDOM_STATE = 42

# Odisha's coast is prone to a secondary Oct-Nov cyclone/depression rain
# season on top of the Jun-Sep monsoon.
ODISHA_CYCLONE_MONTHS = [10, 11]
ODISHA_COASTAL = ["Bhubaneswar", "Puri", "Konark", "Chilika", "Gopalpur"]

RAIN_THRESHOLD_MM = 2.5

SEASON_CATEGORIES = ["Winter", "Summer", "Monsoon", "Post-Monsoon"]


def locations_dataframe() -> pd.DataFrame:
    """Tidy DataFrame view of LOCATIONS, matching the notebook's `loc_df`."""
    return pd.DataFrame(
        [(k, *v) for k, v in LOCATIONS.items()],
        columns=["location", "latitude", "longitude", "state", "region"],
    )
