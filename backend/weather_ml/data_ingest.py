"""
Dataset download / loading for the ML training layer.

`fetch_nasa_power()` calls the real NASA POWER Daily Point API for a given
location. If that call fails for any reason (no internet, blocked
firewall, API outage, mostly-empty response), `build_raw_dataset()` falls
back to `generate_synthetic_weather()` — a seasonal climate simulator
calibrated per-city (temperature ranges + monsoon timing). The synthetic
path is clearly labelled (`data_source == "SYNTHETIC_DEMO"`) and exists
only so the pipeline is fully reproducible offline; it is not a forecast
product.
"""
from __future__ import annotations

import logging

import numpy as np
import pandas as pd
import requests

from . import config

logger = logging.getLogger(__name__)

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# ---------------------------------------------------------------------------
# Real data — NASA POWER
# ---------------------------------------------------------------------------


def fetch_nasa_power(
    location: str,
    lat: float,
    lon: float,
    start: str = config.START_DATE,
    end: str = config.END_DATE,
    timeout: int = 20,
) -> pd.DataFrame:
    """Fetch real daily T2M_MAX, T2M_MIN, PRECTOTCORR, CLOUD_AMT from NASA POWER.

    Returns a tidy DataFrame or raises on failure (caught by the caller).
    """
    params = {
        "parameters": "T2M_MAX,T2M_MIN,PRECTOTCORR,CLOUD_AMT",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start.replace("-", ""),
        "end": end.replace("-", ""),
        "format": "JSON",
    }
    r = requests.get(POWER_URL, params=params, timeout=timeout)
    r.raise_for_status()
    payload = r.json()["properties"]["parameter"]

    dates = sorted(payload["T2M_MAX"].keys())
    rows = []
    for d in dates:
        rows.append({
            "date": pd.to_datetime(d, format="%Y%m%d"),
            "location": location,
            "latitude": lat,
            "longitude": lon,
            "tmax": payload.get("T2M_MAX", {}).get(d, np.nan),
            "tmin": payload.get("T2M_MIN", {}).get(d, np.nan),
            "rainfall_mm": payload.get("PRECTOTCORR", {}).get(d, np.nan),
            "cloud_amt": payload.get("CLOUD_AMT", {}).get(d, np.nan),
            "data_source": "NASA_POWER",
        })
    df = pd.DataFrame(rows)
    # POWER uses -999 as a fill value for missing data
    df.replace(-999, np.nan, inplace=True)
    return df


# ---------------------------------------------------------------------------
# Synthetic fallback (clearly labelled DEMO data)
# ---------------------------------------------------------------------------

CLIMATE_PARAMS: dict[str, dict] = {
    #                tmax_mean, tmax_amp, tmin_mean, tmin_amp, monsoon_months, rain_p_mon, rain_p_dry
    "Agartala":   dict(tmax_mean=30, tmax_amp=6,  tmin_mean=21, tmin_amp=7,  monsoon=[5, 6, 7, 8, 9], p_mon=0.65, p_dry=0.15),
    "Shillong":   dict(tmax_mean=22, tmax_amp=6,  tmin_mean=13, tmin_amp=7,  monsoon=[5, 6, 7, 8, 9], p_mon=0.75, p_dry=0.20),
    "Guwahati":   dict(tmax_mean=29, tmax_amp=7,  tmin_mean=19, tmin_amp=8,  monsoon=[5, 6, 7, 8, 9], p_mon=0.60, p_dry=0.15),
    "Tawang":     dict(tmax_mean=12, tmax_amp=8,  tmin_mean=2,  tmin_amp=9,  monsoon=[6, 7, 8, 9],    p_mon=0.50, p_dry=0.15),
    "Gangtok":    dict(tmax_mean=18, tmax_amp=7,  tmin_mean=10, tmin_amp=7,  monsoon=[5, 6, 7, 8, 9], p_mon=0.65, p_dry=0.20),
    "Darjeeling": dict(tmax_mean=15, tmax_amp=7,  tmin_mean=8,  tmin_amp=7,  monsoon=[5, 6, 7, 8, 9], p_mon=0.60, p_dry=0.20),
    "Delhi":      dict(tmax_mean=31, tmax_amp=10, tmin_mean=18, tmin_amp=10, monsoon=[6, 7, 8, 9],    p_mon=0.40, p_dry=0.05),
    "Jaipur":     dict(tmax_mean=33, tmax_amp=9,  tmin_mean=19, tmin_amp=9,  monsoon=[6, 7, 8, 9],    p_mon=0.35, p_dry=0.04),
    "Agra":       dict(tmax_mean=32, tmax_amp=10, tmin_mean=18, tmin_amp=10, monsoon=[6, 7, 8, 9],    p_mon=0.40, p_dry=0.05),
    "Goa":        dict(tmax_mean=31, tmax_amp=3,  tmin_mean=24, tmin_amp=3,  monsoon=[6, 7, 8, 9],    p_mon=0.80, p_dry=0.05),
    "Mumbai":     dict(tmax_mean=32, tmax_amp=3,  tmin_mean=24, tmin_amp=3,  monsoon=[6, 7, 8, 9],    p_mon=0.75, p_dry=0.03),
    "Kochi":      dict(tmax_mean=31, tmax_amp=2,  tmin_mean=24, tmin_amp=2,  monsoon=[6, 7, 8, 9],    p_mon=0.70, p_dry=0.25),
    "Varanasi":   dict(tmax_mean=31, tmax_amp=10, tmin_mean=19, tmin_amp=10, monsoon=[6, 7, 8, 9],    p_mon=0.45, p_dry=0.06),
    "Srinagar":   dict(tmax_mean=19, tmax_amp=11, tmin_mean=6,  tmin_amp=10, monsoon=[],              p_mon=0.30, p_dry=0.25),
    # ---- Odisha (hot, humid, coastal-moderated East Coast climate; monsoon Jun-Sep,
    #      plus a secondary Oct-Nov cyclone/depression rain risk on the coast) ----
    "Bhubaneswar": dict(tmax_mean=33, tmax_amp=6, tmin_mean=22, tmin_amp=6, monsoon=[6, 7, 8, 9], p_mon=0.55, p_dry=0.08),
    "Puri":        dict(tmax_mean=31, tmax_amp=4, tmin_mean=23, tmin_amp=4, monsoon=[6, 7, 8, 9], p_mon=0.55, p_dry=0.10),
    "Konark":      dict(tmax_mean=31, tmax_amp=4, tmin_mean=23, tmin_amp=4, monsoon=[6, 7, 8, 9], p_mon=0.55, p_dry=0.10),
    "Chilika":     dict(tmax_mean=31, tmax_amp=4, tmin_mean=23, tmin_amp=4, monsoon=[6, 7, 8, 9], p_mon=0.55, p_dry=0.10),
    "Gopalpur":    dict(tmax_mean=30, tmax_amp=4, tmin_mean=23, tmin_amp=4, monsoon=[6, 7, 8, 9], p_mon=0.55, p_dry=0.10),
    "Similipal":   dict(tmax_mean=33, tmax_amp=7, tmin_mean=21, tmin_amp=8, monsoon=[6, 7, 8, 9], p_mon=0.60, p_dry=0.10),
}


def generate_synthetic_weather(
    location: str,
    lat: float,
    lon: float,
    start: str = config.START_DATE,
    end: str = config.END_DATE,
    seed: int = 0,
) -> pd.DataFrame:
    """Calibrated, per-city, seasonal climate simulator. NOT a forecast
    product — used only when the live NASA POWER call fails."""
    logger.info(
        "[SYNTHETIC DATA IN USE] %s: generating demo climate series (API unavailable).",
        location,
    )
    rng = np.random.default_rng(seed)
    params = CLIMATE_PARAMS[location]
    dates = pd.date_range(start, end, freq="D")
    doy = dates.dayofyear.values
    year_idx = (dates.year - dates.year.min()).values

    phase = np.cos(2 * np.pi * (doy - 200) / 365.25)
    tmax = (params["tmax_mean"] + params["tmax_amp"] * phase
            + 0.02 * year_idx + rng.normal(0, 1.3, len(dates)))
    tmin = (params["tmin_mean"] + params["tmin_amp"] * phase
            + 0.02 * year_idx + rng.normal(0, 1.3, len(dates)))
    tmin = np.minimum(tmin, tmax - 1.0)  # physical consistency

    months = dates.month.values
    is_monsoon = np.isin(months, params["monsoon"])
    rain_prob = np.where(is_monsoon, params["p_mon"], params["p_dry"])

    # Odisha coastal locations: bump rain probability in the Oct-Nov
    # cyclone/depression season on top of the base monsoon/dry split.
    if location in config.ODISHA_COASTAL:
        is_cyclone_season = np.isin(months, config.ODISHA_CYCLONE_MONTHS)
        rain_prob = np.where(is_cyclone_season, np.maximum(rain_prob, 0.35), rain_prob)

    rain_occurs = rng.random(len(dates)) < rain_prob
    rain_amount = np.where(rain_occurs, rng.gamma(shape=2.0, scale=8.0, size=len(dates)), 0.0)

    cloud_amt = np.where(
        rain_occurs, rng.uniform(70, 100, len(dates)),
        np.where(is_monsoon, rng.uniform(40, 80, len(dates)), rng.uniform(0, 50, len(dates)))
    )

    return pd.DataFrame({
        "date": dates, "location": location, "latitude": lat, "longitude": lon,
        "tmax": tmax, "tmin": tmin, "rainfall_mm": rain_amount, "cloud_amt": cloud_amt,
        "data_source": "SYNTHETIC_DEMO",
    })


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def build_raw_dataset(save: bool = True) -> pd.DataFrame:
    """Build the full India-only dataset: try the real API per location,
    fall back to the synthetic simulator on failure. Mirrors the
    notebook's Section 2 exactly."""
    loc_df = config.locations_dataframe()
    frames = []
    for i, (loc, (lat, lon, state, region)) in enumerate(config.LOCATIONS.items()):
        try:
            f = fetch_nasa_power(loc, lat, lon)
            if f["tmax"].isna().mean() > 0.5:  # mostly empty -> treat as failure
                raise ValueError("Too many missing values from API")
            logger.info("[REAL DATA]      %s: fetched %d days from NASA POWER.", loc, len(f))
        except Exception:
            f = generate_synthetic_weather(loc, lat, lon, seed=i)
        frames.append(f)

    df_raw = pd.concat(frames, ignore_index=True)
    df_raw = df_raw.merge(loc_df[["location", "state", "region"]], on="location", how="left")

    if save:
        config.ensure_dirs()
        df_raw.to_csv(config.RAW_CSV, index=False)

    return df_raw
