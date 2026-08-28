import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from tabulate import tabulate

from utils import geo_utils, festival_calendar, school_calendar, economic_data

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "crowd_model.joblib"
ENCODER_PATH = MODELS_DIR / "crowd_label_encoder.joblib"
FEATURES_PATH = MODELS_DIR / "crowd_model_features.joblib"
PLACE_STATS_PATH = MODELS_DIR / "place_visitor_stats.joblib"
DATA_PATH = BASE_DIR / "data" / "processed" / "crowd_prediction_dataset_clean.csv"

CAT_FEATURES = ["place_name", "category", "state", "city_tier", "season"]


class CrowdPredictor:
    def __init__(self):
        missing = [p for p in [MODEL_PATH, ENCODER_PATH, FEATURES_PATH, PLACE_STATS_PATH] if not p.exists()]
        if missing:
            print(
                f"error: missing model artifacts: {[str(p) for p in missing]}\n"
                f"run these first (in order):\n"
                f"    python preprocess_data.py\n"
                f"    python train_model.py",
                file=sys.stderr,
            )
            sys.exit(1)

        self.model = joblib.load(MODEL_PATH)
        self.label_encoder = joblib.load(ENCODER_PATH)
        self.features = joblib.load(FEATURES_PATH)

        place_stats_bundle = joblib.load(PLACE_STATS_PATH)
        self._place_avg_log_visitors = place_stats_bundle["place_stats"]
        self._place_avg_fallback = place_stats_bundle["fallback"]

        full_data = pd.read_csv(DATA_PATH)

        # Pin category dtypes to exactly what the model saw during training.
        # Bug this fixes: lightgbm stores categoricals as integer codes.
        # if we recompute `.astype("category")` on a single-row frame at
        # predict time, pandas assigns fresh codes (e.g. code 0) that have
        # no relation to the codes used during training -- the model would
        # silently read the wrong category, especially for less-common
        # places. we fix this by building a categoricaldtype from the full
        # training data once, and reusing it for every prediction.
        self._cat_dtypes = {
            c: pd.CategoricalDtype(categories=sorted(full_data[c].dropna().unique()))
            for c in CAT_FEATURES
        }

        # Used to look up a known place's static attributes (category,
        # state, lat/lon, city_tier, popularity) so the caller only has
        # to supply place_name + month.
        self._place_lookup = (
            full_data
            .sort_values("year")
            .drop_duplicates("place_name", keep="last")
            .set_index("place_name")
        )
        self._full_data = full_data
        # lets callers type a place name in any case ("taj mahal" as well
        # as "Taj Mahal") without failing the lookup.
        self._name_lookup = {name.lower(): name for name in self._place_lookup.index}

    def resolve_place_name(self, place_name: str) -> str:
        if place_name in self._place_lookup.index:
            return place_name
        exact_ci = self._name_lookup.get(place_name.strip().lower())
        if exact_ci:
            return exact_ci
        raise ValueError(
            f"'{place_name}' not found in training data. "
            f"see list_places() for valid names."
        )

    def _historical_log_visitors(self, place_name: str, month: int) -> float:
        hist = self._full_data[
            (self._full_data["place_name"] == place_name) & (self._full_data["month"] == month)
        ]
        if len(hist):
            return float(np.log1p(hist["total_visitors_est"]).mean())
        return float(self._place_avg_log_visitors.get(place_name, self._place_avg_fallback))

    def predict(self, place_name: str, month: int, year: int = None,
                avg_temp_c: float = None, avg_precip_mm: float = None) -> dict:
        place_name = self.resolve_place_name(place_name)
        row = self._place_lookup.loc[place_name]

        if year is None:
            year = int(self._full_data["year"].max()) + 1

        month_hist = self._full_data[
            (self._full_data["place_name"] == place_name) & (self._full_data["month"] == month)
        ]

        temp = avg_temp_c if avg_temp_c is not None else (
            month_hist["avg_temp_c"].mean() if len(month_hist) else row["avg_temp_c"]
        )
        precip = avg_precip_mm if avg_precip_mm is not None else (
            month_hist["avg_precip_mm"].mean() if len(month_hist) else row["avg_precip_mm"]
        )
        quarter = ((month - 1) // 3) + 1
        season = month_hist["season"].iloc[0] if len(month_hist) else row["season"]
        is_peak = month_hist["is_peak_season"].iloc[0] if len(month_hist) else row["is_peak_season"]
        place_avg_log_visitors = self._place_avg_log_visitors.get(place_name, self._place_avg_fallback)

        # Deterministic features -- computed the exact same way
        # preprocess_data.py computes them for training rows, using the
        # same utils/ modules, so a live prediction never drifts from
        # what the model actually learned.
        distance_to_airport_km = geo_utils.distance_to_nearest_airport_km(row["latitude"], row["longitude"])
        festival_day_count = festival_calendar.festival_day_count(year, month)
        is_festival_month = int(festival_day_count > 0)
        school_vacation_intensity = school_calendar.vacation_intensity(month)
        usd_inr_rate = economic_data.usd_inr_rate(year)

        # Lag features -- see predict_crowd.py's _historical_log_visitors()
        # docstring: this is a live-feed-free proxy, not the exact
        # train_model.py computation (which has real prior-month actuals
        # to shift from). Swap this for a real analytics feed in production.
        prev_month = 12 if month == 1 else month - 1
        prev_month_log_visitors = self._historical_log_visitors(place_name, prev_month)
        yoy_log_visitors = self._historical_log_visitors(place_name, month)

        record = pd.DataFrame([{
            "place_name": place_name,
            "category": row["category"],
            "state": row["state"],
            "city_tier": row["city_tier"],
            "season": season,
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "month_sin": np.sin(2 * np.pi * month / 12),
            "month_cos": np.cos(2 * np.pi * month / 12),
            "quarter": quarter,
            "is_peak_season": is_peak,
            "avg_temp_c": temp,
            "avg_precip_mm": precip,
            "popularity_percentile": row["popularity_percentile"],
            "place_avg_log_visitors": place_avg_log_visitors,
            "distance_to_airport_km": distance_to_airport_km,
            "festival_day_count": festival_day_count,
            "is_festival_month": is_festival_month,
            "school_vacation_intensity": school_vacation_intensity,
            "usd_inr_rate": usd_inr_rate,
            "prev_month_log_visitors": prev_month_log_visitors,
            "yoy_log_visitors": yoy_log_visitors,
        }])

        for c in CAT_FEATURES:
            record[c] = record[c].astype(self._cat_dtypes[c])

        record = record[self.features]

        pred_idx = self.model.predict(record)[0]
        proba = self.model.predict_proba(record)[0]
        pred_label = self.label_encoder.inverse_transform([pred_idx])[0]

        return {
            "place_name": place_name,
            "state": row["state"],
            "category": row["category"],
            "month": month,
            "predicted_crowd_level": pred_label,
            "probabilities": dict(zip(self.label_encoder.classes_, proba.round(3).tolist())),
        }

    def list_places(self) -> list:
        return sorted(self._place_lookup.index.tolist())

    def get_coordinates(self, place_name: str) -> tuple:
        """(latitude, longitude) for a known place -- used by the live
        weather lookup (utils/live_weather.py)."""
        place_name = self.resolve_place_name(place_name)
        row = self._place_lookup.loc[place_name]
        return float(row["latitude"]), float(row["longitude"])

    def predict_year(self, place_name: str, year: int = None) -> list:
        place_name = self.resolve_place_name(place_name)
        return [self.predict(place_name, m, year=year) for m in range(1, 13)]


# ----------------------------------------------------------------------
# Human-readable output helpers.
#
# A raw number like 0.42 means nothing to a non-technical user booking a
# trip. Everything below turns model output into plain language: a
# confidence word instead of a decimal, a one-line takeaway instead of a
# probability table. The exact numbers are still available (pass
# technical=True) for anyone who wants to see the model's actual math --
# useful for a hackathon demo/judging Q&A.
# ----------------------------------------------------------------------

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

CROWD_DESCRIPTIONS = {
    "Low": "quiet, with a relaxed, less crowded visit",
    "Medium": "moderately busy, with a fair number of other visitors",
    "High": "busy, so expect large crowds and plan for extra time",
}

CROWD_ICON = {"Low": "[LOW]", "Medium": "[MED]", "High": "[HIGH]"}


def confidence_word(probability: float) -> str:
    if probability >= 0.70:
        return "very confident"
    elif probability >= 0.50:
        return "fairly confident"
    elif probability >= 0.35:
        return "somewhat confident"
    else:
        return "not very confident"


def print_human_summary(result: dict):
    level = result["predicted_crowd_level"]
    month_name = MONTH_NAMES[result["month"] - 1]
    top_probability = max(result["probabilities"].values())

    print(f"\n{result['place_name']} ({result['state']}) in {month_name}")
    print(
        f"expected crowd level: {level} -- likely {CROWD_DESCRIPTIONS[level]}\n"
        f"(the model is {confidence_word(top_probability)} about this prediction)"
    )

    table = [["expected crowd level", f"{CROWD_ICON[level]} {level}"]]
    print(tabulate(table, tablefmt="github"))


def print_technical_table(result: dict):
    prob_rows = sorted(result["probabilities"].items(), key=lambda kv: -kv[1])
    prob_rows = [[level, f"{p * 100:.1f}%"] for level, p in prob_rows]
    print(tabulate(prob_rows, headers=["crowd level", "model confidence"], tablefmt="github"))


def print_prediction_table(result: dict, technical: bool = False):
    print_human_summary(result)
    if technical:
        print()
        print_technical_table(result)


def print_year_outlook(year_results: list):
    place_name = year_results[0]["place_name"]
    state = year_results[0]["state"]
    print(f"\nfull-year crowd outlook for {place_name} ({state}):")

    rows = [
        [MONTH_NAMES[r["month"] - 1], f"{CROWD_ICON[r['predicted_crowd_level']]} {r['predicted_crowd_level']}"]
        for r in year_results
    ]
    print(tabulate(rows, headers=["month", "expected crowd"], tablefmt="github"))

    low_months = [MONTH_NAMES[r["month"] - 1] for r in year_results if r["predicted_crowd_level"] == "Low"]
    high_months = [MONTH_NAMES[r["month"] - 1] for r in year_results if r["predicted_crowd_level"] == "High"]

    if low_months:
        print(f"\nquietest months to visit: {', '.join(low_months)}")
    if high_months:
        print(f"busiest months (expect crowds): {', '.join(high_months)}")


if __name__ == "__main__":
    predictor = CrowdPredictor()

    demo_place = predictor._place_lookup.index[0]
    print(f"demo prediction for '{demo_place}':")
    for m in [1, 6, 12]:
        result = predictor.predict(demo_place, m)
        print_prediction_table(result, technical=True)
