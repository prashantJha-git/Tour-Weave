"""
Cleaning & missing-value handling for the raw weather dataset.

Steps applied (per location, in chronological order so no future
information leaks into the past):

1. Drop exact duplicate (location, date) rows.
2. Enforce physical consistency: tmin must not exceed tmax (swap if it
   does — this can happen from raw provider quirks).
3. Clip rainfall/cloud cover to their valid physical ranges.
4. Linearly interpolate remaining missing values, per location, in time
   order (bidirectional so edge gaps are also filled).
"""
from __future__ import annotations

import logging

import pandas as pd

from . import config

logger = logging.getLogger(__name__)


def clean_weather_data(df_raw: pd.DataFrame, save: bool = True) -> pd.DataFrame:
    df = df_raw.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = (
        df.drop_duplicates(subset=["location", "date"])
        .sort_values(["location", "date"])
        .reset_index(drop=True)
    )

    before = len(df)

    # physical consistency: tmin should not exceed tmax
    swap_mask = df["tmin"] > df["tmax"]
    df.loc[swap_mask, ["tmin", "tmax"]] = df.loc[swap_mask, ["tmax", "tmin"]].values
    logger.info("Rows with tmin>tmax swapped: %d", swap_mask.sum())

    # rainfall / cloud cannot be negative
    df["rainfall_mm"] = df["rainfall_mm"].clip(lower=0)
    df["cloud_amt"] = df["cloud_amt"].clip(lower=0, upper=100)

    # interpolate missing values per-location, in time order
    df = df.sort_values(["location", "date"]).reset_index(drop=True)
    for col in ["tmax", "tmin", "rainfall_mm", "cloud_amt"]:
        df[col] = df.groupby("location")[col].transform(
            lambda s: s.interpolate(method="linear", limit_direction="both")
        )

    logger.info("Rows before: %d, after de-dup: %d", before, len(df))

    if save:
        config.ensure_dirs()
        df.to_csv(config.CLEAN_CSV, index=False)

    return df
