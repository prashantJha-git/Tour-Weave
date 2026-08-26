import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

from utils import geo_utils, festival_calendar, school_calendar, economic_data

# ╔ ════════════════════════════════════════════════════════════ ╗
# ║  PATH RESOLUTION                                             ║
# ║  resolve all paths relative to this file, not cwd. prevents  ║
# ║  "file not found" errors when run from a different directory.║
# ╚ ════════════════════════════════════════════════════════════ ╝
BASE_DIR = Path(__file__).resolve().parent
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "crowd_prediction_dataset.csv"
CLEAN_DATA_PATH = BASE_DIR / "data" / "processed" / "crowd_prediction_dataset_clean.csv"

# Columns we expect. If new data is missing one of these, fail loudly
# instead of silently training on garbage.
REQUIRED_COLUMNS = [
    "place_type", "place_name", "category", "state", "city_tier",
    "latitude", "longitude", "year", "month", "quarter", "season",
    "is_peak_season", "avg_temp_c", "avg_precip_mm", "popularity_percentile",
    "total_visitors_est", "crowd_level",
]

VALID_CROWD_LEVELS = {"Low", "Medium", "High"}


def load_raw(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"input file is missing required columns: {missing}\n"
            f"fix the source data (or the column names) before re-running."
        )
    return df


def _fill_weather(df: pd.DataFrame) -> pd.DataFrame:
    for col in ["avg_temp_c", "avg_precip_mm"]:
        state_month_avg = df.groupby(["state", "month"])[col].transform("median")
        df[col] = df[col].fillna(state_month_avg)

        place_avg = df.groupby("place_name")[col].transform("median")
        df[col] = df[col].fillna(place_avg)

        df[col] = df[col].fillna(df[col].median())
    return df


def _fill_popularity(df: pd.DataFrame) -> pd.DataFrame:
    place_pop = df.groupby("place_name")["popularity_percentile"].transform("median")
    df["popularity_percentile"] = df["popularity_percentile"].fillna(place_pop)

    cat_state_pop = df.groupby(["category", "state"])["popularity_percentile"].transform("median")
    df["popularity_percentile"] = df["popularity_percentile"].fillna(cat_state_pop)

    df["popularity_percentile"] = df["popularity_percentile"].fillna(
        df["popularity_percentile"].median()
    )
    return df


def _add_accessibility_features(df: pd.DataFrame) -> pd.DataFrame:
    unique_coords = df[["latitude", "longitude"]].drop_duplicates()
    unique_coords["distance_to_airport_km"] = unique_coords.apply(
        lambda r: geo_utils.distance_to_nearest_airport_km(r["latitude"], r["longitude"]),
        axis=1,
    )
    df = df.merge(unique_coords, on=["latitude", "longitude"], how="left")
    return df


def _add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    df["festival_day_count"] = df.apply(
        lambda r: festival_calendar.festival_day_count(int(r["year"]), int(r["month"])), axis=1
    )
    df["is_festival_month"] = (df["festival_day_count"] > 0).astype(int)
    df["school_vacation_intensity"] = df["month"].apply(school_calendar.vacation_intensity)
    return df


def _add_economic_features(df: pd.DataFrame) -> pd.DataFrame:
    df["usd_inr_rate"] = df["year"].apply(lambda y: economic_data.usd_inr_rate(int(y)))
    return df


def clean(df: pd.DataFrame, verbose: bool = True) -> pd.DataFrame:
    n_start = len(df)
    df = df.copy()

    # 1. Scope: month-level crowd prediction only needs monument/attraction
    #    rows that actually have a month. State/national yearly aggregate
    #    rows (no month) are a different granularity -- drop them here.
    df = df[df["place_type"].isin(["Monument", "Attraction"])]
    df = df[df["month"].notna()]

    # 2. Drop rows with no target -- can't train/validate without a label
    before = len(df)
    df = df.dropna(subset=["crowd_level", "total_visitors_est"])
    if verbose and before != len(df):
        print(f"  dropped {before - len(df)} rows with missing target label")

    # 3. Validate target values are one of the 3 expected classes
    bad_labels = set(df["crowd_level"].unique()) - VALID_CROWD_LEVELS
    if bad_labels:
        raise ValueError(f"unexpected crowd_level values found: {bad_labels}")

    # 4. Fix dtypes
    df["month"] = df["month"].astype(int)
    df["year"] = df["year"].astype(int)
    df["quarter"] = df["quarter"].astype(int)
    df["is_peak_season"] = df["is_peak_season"].fillna(0).astype(int)

    # 5. Fill missing categoricals with an explicit "unknown" bucket
    #    (never silently drop rows just because e.g. city_tier is blank)
    for col in ["region", "city_tier", "season"]:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    # 6. Fill missing lat/lon per place (some rows for a known place may
    #    be missing coords even if other rows for the same place have them)
    for col in ["latitude", "longitude"]:
        df[col] = df.groupby("place_name")[col].transform(lambda s: s.fillna(s.median()))
    df = df.dropna(subset=["latitude", "longitude"])  # truly unknown place -> drop

    # 7. Fill weather + popularity using the smarter fallbacks above
    df = _fill_weather(df)
    df = _fill_popularity(df)

    # 8. Sanity filters: remove impossible values a scrape/typo could produce
    df = df[df["total_visitors_est"] > 0]
    df = df[(df["avg_temp_c"] > -10) & (df["avg_temp_c"] < 55)]
    df = df[df["avg_precip_mm"] >= 0]

    # 9. Drop exact duplicate rows (same place+year+month reported twice)
    dup_cols = ["place_name", "year", "month"]
    before = len(df)
    df = df.drop_duplicates(subset=dup_cols, keep="first")
    if verbose and before != len(df):
        print(f"  dropped {before - len(df)} duplicate place/year/month rows")

    df = df.reset_index(drop=True)

    # 10. Feature engineering -- deterministic features only (see module
    #     docstring for why lag features are excluded here on purpose).
    #
    # 10a. Cyclical month encoding: trees can't natively understand that
    #      month 12 and month 1 are "close" -- sin/cos encoding fixes
    #      that and reliably helps seasonal models.
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # 10b. Accessibility: distance to nearest major airport.
    df = _add_accessibility_features(df)

    # 10c. Calendar: exact festival-day count + school vacation intensity.
    df = _add_calendar_features(df)

    # 10d. Economic: that year's average USD/INR exchange rate.
    df = _add_economic_features(df)

    if verbose:
        n_end = len(df)
        print(f"  rows: {n_start} -> {n_end} ({n_start - n_end} removed)")
        remaining_nulls = df.isnull().sum()
        print(f"  remaining nulls:\n{remaining_nulls[remaining_nulls > 0]}")

    return df


def run(input_path: Path, output_path: Path):
    print(f"loading raw data from {input_path} ...")
    df = load_raw(input_path)
    print(f"loaded {len(df)} rows, {df.shape[1]} columns.")

    print("cleaning + engineering deterministic features...")
    clean_df = clean(df)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    clean_df.to_csv(output_path, index=False)
    print(f"saved cleaned data -> {output_path} ({len(clean_df)} rows, {clean_df.shape[1]} columns)")
    print("\ncrowd level distribution after cleaning:")
    print(clean_df["crowd_level"].value_counts())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean raw tourism crowd data.")
    parser.add_argument("--input", default=str(RAW_DATA_PATH),
                         help="path to raw csv")
    parser.add_argument("--output", default=str(CLEAN_DATA_PATH),
                         help="path to save cleaned csv")
    args = parser.parse_args()

    try:
        run(Path(args.input), Path(args.output))
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)
