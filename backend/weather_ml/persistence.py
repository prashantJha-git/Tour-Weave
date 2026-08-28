"""
Save trained models + the small amount of metadata (feature list,
location/season encoders, and each location's most recent historical
window) needed to reconstruct feature vectors later — e.g. from the
FastAPI backend, which doesn't want to keep the full training dataset
in memory.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass

import joblib
import pandas as pd

from . import config
from .features import FeatureBuildResult
from .modeling import EvaluationResult, SplitResult, TrainedModels

logger = logging.getLogger(__name__)


def save_artifacts(
    models: TrainedModels,
    features: FeatureBuildResult,
    split: SplitResult,
    evaluation: EvaluationResult,
) -> None:
    config.ensure_dirs()

    joblib.dump(models.tmax_model, config.TMAX_MODEL_PATH)
    joblib.dump(models.tmin_model, config.TMIN_MODEL_PATH)
    joblib.dump(models.rain_model, config.RAIN_MODEL_PATH)

    metadata = {
        "feature_cols": features.feature_cols,
        "location_encoder": features.location_encoder,
        "season_encoder": features.season_encoder,
        "locations": config.LOCATIONS,
        "rain_threshold_mm": config.RAIN_THRESHOLD_MM,
        "trained_on_rows": int(len(split.train)),
        "train_date_range": [
            str(split.train["date"].min().date()),
            str(split.train["date"].max().date()),
        ],
        "test_metrics": {
            "tmax": evaluation.tmax_metrics,
            "tmin": evaluation.tmin_metrics,
            "rain": evaluation.rain_metrics,
        },
    }
    with open(config.METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    # recent history window (last 14 days per location) — enough to build
    # lag_7 / roll_7 features at inference time
    recent_history = (
        features.feat[["date", "location", "tmax", "tmin", "rainfall_mm", "cloud_amt"]]
        .dropna(subset=["tmax", "tmin", "rainfall_mm"])
        .sort_values("date")
        .groupby("location")
        .tail(14)
    )
    recent_history.to_csv(config.RECENT_HISTORY_PATH, index=False)

    logger.info("Saved model artifacts to %s", config.MODELS_DIR)


@dataclass
class LoadedArtifacts:
    tmax_model: object
    tmin_model: object
    rain_model: object
    metadata: dict
    recent_history: pd.DataFrame
    feature_cols: list[str]
    location_encoder: dict[str, int]
    season_encoder: dict[str, int]
    locations: dict[str, tuple]


def load_artifacts() -> LoadedArtifacts:
    """Load everything a stateless inference process (e.g. the FastAPI
    app) needs, without touching the raw training dataset."""
    tmax_model = joblib.load(config.TMAX_MODEL_PATH)
    tmin_model = joblib.load(config.TMIN_MODEL_PATH)
    rain_model = joblib.load(config.RAIN_MODEL_PATH)

    with open(config.METADATA_PATH) as f:
        metadata = json.load(f)

    recent_history = pd.read_csv(config.RECENT_HISTORY_PATH, parse_dates=["date"])

    locations = {k: tuple(v) for k, v in metadata["locations"].items()}

    return LoadedArtifacts(
        tmax_model=tmax_model,
        tmin_model=tmin_model,
        rain_model=rain_model,
        metadata=metadata,
        recent_history=recent_history,
        feature_cols=metadata["feature_cols"],
        location_encoder=metadata["location_encoder"],
        season_encoder=metadata["season_encoder"],
        locations=locations,
    )
