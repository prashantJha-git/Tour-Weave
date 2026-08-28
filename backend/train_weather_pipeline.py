#!/usr/bin/env python3
"""
TourIntel — full ML training pipeline.

Runs the complete flow from the original notebook end to end and saves
the artifacts the FastAPI app needs:

    ingest -> clean -> feature-engineer -> chronological split
    -> train 3 XGBoost models -> evaluate -> save to models/

Usage:
    python train_pipeline.py
"""
from __future__ import annotations

import logging
import warnings

import numpy as np

from weather_ml import config, data_clean, data_ingest, features, modeling, persistence

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("train_pipeline")


def main() -> None:
    np.random.seed(config.RANDOM_STATE)
    config.ensure_dirs()

    logger.info("Step 1/6 — building raw dataset (NASA POWER, synthetic fallback per location)...")
    df_raw = data_ingest.build_raw_dataset(save=True)
    logger.info("Raw dataset shape: %s", df_raw.shape)

    logger.info("Step 2/6 — cleaning & interpolating missing values...")
    df_clean = data_clean.clean_weather_data(df_raw, save=True)

    logger.info("Step 3/6 — engineering calendar/lag/rolling features...")
    feat_result = features.build_features(df_clean)
    logger.info(
        "Feature columns: %d | Modelling rows after dropping warm-up/NaN rows: %d",
        len(feat_result.feature_cols), len(feat_result.model_df),
    )

    logger.info("Step 4/6 — chronological train/val/test split (70/15/15)...")
    split = modeling.chronological_split(feat_result.model_df, feat_result.feature_cols)

    logger.info("Step 5/6 — training XGBoost models (Tmax, Tmin, rain classifier)...")
    trained = modeling.train_models(split)

    logger.info("Evaluating on validation and held-out test sets...")
    evaluation = modeling.evaluate_models(trained, split)

    logger.info("Step 6/6 — saving models, metadata, and recent-history window...")
    persistence.save_artifacts(trained, feat_result, split, evaluation)

    logger.info("Done. Models saved under %s", config.MODELS_DIR)
    logger.info(
        "Test metrics — Tmax MAE=%.3f°C  Tmin MAE=%.3f°C  Rain F1=%.3f",
        evaluation.tmax_metrics["MAE"], evaluation.tmin_metrics["MAE"], evaluation.rain_metrics["F1"],
    )


if __name__ == "__main__":
    main()
