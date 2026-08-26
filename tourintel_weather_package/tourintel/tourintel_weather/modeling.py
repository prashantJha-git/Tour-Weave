"""
Time-series train/val/test split (chronological, no shuffling) and
XGBoost model training + evaluation.

Because every location shares the same overall date range, we pick
global date cutoffs at the 70th and 85th percentile of the date range and
split every location's rows by those same cutoffs — this keeps the split
strictly chronological (nothing from the future leaks into training) and
avoids picking a different cutoff for each city.

Models (exactly as in the source notebook):
  - XGBRegressor  -> next-day Tmax
  - XGBRegressor  -> next-day Tmin
  - XGBClassifier -> next-day rain / no-rain

The validation set is used for early stopping so each model stops
training once it stops improving on unseen future dates.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from xgboost import XGBClassifier, XGBRegressor

from . import config

logger = logging.getLogger(__name__)


@dataclass
class SplitResult:
    train: pd.DataFrame
    val: pd.DataFrame
    test: pd.DataFrame
    X_train: pd.DataFrame
    X_val: pd.DataFrame
    X_test: pd.DataFrame
    y_train_tmax: pd.Series
    y_val_tmax: pd.Series
    y_test_tmax: pd.Series
    y_train_tmin: pd.Series
    y_val_tmin: pd.Series
    y_test_tmin: pd.Series
    y_train_rain: pd.Series
    y_val_rain: pd.Series
    y_test_rain: pd.Series


def chronological_split(model_df: pd.DataFrame, feature_cols: list[str]) -> SplitResult:
    dates_sorted = np.sort(model_df["date"].unique())
    train_cut = dates_sorted[int(len(dates_sorted) * 0.70)]
    val_cut = dates_sorted[int(len(dates_sorted) * 0.85)]

    train = model_df[model_df["date"] <= train_cut]
    val = model_df[(model_df["date"] > train_cut) & (model_df["date"] <= val_cut)]
    test = model_df[model_df["date"] > val_cut]

    logger.info(
        "Train cutoff: %s | Val cutoff: %s", pd.Timestamp(train_cut).date(), pd.Timestamp(val_cut).date()
    )
    logger.info("Train: %d rows, Val: %d rows, Test: %d rows", len(train), len(val), len(test))

    return SplitResult(
        train=train, val=val, test=test,
        X_train=train[feature_cols], X_val=val[feature_cols], X_test=test[feature_cols],
        y_train_tmax=train["target_tmax"], y_val_tmax=val["target_tmax"], y_test_tmax=test["target_tmax"],
        y_train_tmin=train["target_tmin"], y_val_tmin=val["target_tmin"], y_test_tmin=test["target_tmin"],
        y_train_rain=train["target_rain"], y_val_rain=val["target_rain"], y_test_rain=test["target_rain"],
    )


@dataclass
class TrainedModels:
    tmax_model: XGBRegressor
    tmin_model: XGBRegressor
    rain_model: XGBClassifier


def train_models(split: SplitResult) -> TrainedModels:
    xgb_common = dict(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=config.RANDOM_STATE,
        n_jobs=-1,
    )

    tmax_model = XGBRegressor(**xgb_common, eval_metric="mae", early_stopping_rounds=30)
    tmax_model.fit(split.X_train, split.y_train_tmax, eval_set=[(split.X_val, split.y_val_tmax)], verbose=False)

    tmin_model = XGBRegressor(**xgb_common, eval_metric="mae", early_stopping_rounds=30)
    tmin_model.fit(split.X_train, split.y_train_tmin, eval_set=[(split.X_val, split.y_val_tmin)], verbose=False)

    rain_model = XGBClassifier(**xgb_common, eval_metric="logloss", early_stopping_rounds=30)
    rain_model.fit(split.X_train, split.y_train_rain, eval_set=[(split.X_val, split.y_val_rain)], verbose=False)

    logger.info("Tmax model best iteration: %s", tmax_model.best_iteration)
    logger.info("Tmin model best iteration: %s", tmin_model.best_iteration)
    logger.info("Rain model best iteration: %s", rain_model.best_iteration)

    return TrainedModels(tmax_model=tmax_model, tmin_model=tmin_model, rain_model=rain_model)


# --------------------------------------------------------------------------
# Evaluation
# --------------------------------------------------------------------------


def eval_regression(name: str, y_true, y_pred) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    logger.info("%18s | MAE=%6.3f °C | RMSE=%6.3f °C | R²=%6.3f", name, mae, rmse, r2)
    return dict(model=name, MAE=mae, RMSE=rmse, R2=r2)


def eval_classification(name: str, y_true, y_pred) -> dict:
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    logger.info("%18s | Accuracy=%5.3f | Precision=%5.3f | Recall=%5.3f | F1=%5.3f", name, acc, prec, rec, f1)
    return dict(model=name, Accuracy=acc, Precision=prec, Recall=rec, F1=f1)


@dataclass
class EvaluationResult:
    tmax_metrics: dict
    tmin_metrics: dict
    rain_metrics: dict
    pred_test_tmax: np.ndarray
    pred_test_tmin: np.ndarray
    pred_test_rain: np.ndarray
    proba_test_rain: np.ndarray
    confusion: np.ndarray


def evaluate_models(models: TrainedModels, split: SplitResult) -> EvaluationResult:
    pred_val_tmax = models.tmax_model.predict(split.X_val)
    pred_test_tmax = models.tmax_model.predict(split.X_test)
    pred_val_tmin = models.tmin_model.predict(split.X_val)
    pred_test_tmin = models.tmin_model.predict(split.X_test)

    eval_regression("Tmax (val)", split.y_val_tmax, pred_val_tmax)
    eval_regression("Tmin (val)", split.y_val_tmin, pred_val_tmin)
    tmax_metrics = eval_regression("Tmax (test)", split.y_test_tmax, pred_test_tmax)
    tmin_metrics = eval_regression("Tmin (test)", split.y_test_tmin, pred_test_tmin)

    pred_val_rain = models.rain_model.predict(split.X_val)
    pred_test_rain = models.rain_model.predict(split.X_test)
    proba_test_rain = models.rain_model.predict_proba(split.X_test)[:, 1]

    eval_classification("Rain (val)", split.y_val_rain, pred_val_rain)
    rain_metrics = eval_classification("Rain (test)", split.y_test_rain, pred_test_rain)

    cm = confusion_matrix(split.y_test_rain, pred_test_rain)

    return EvaluationResult(
        tmax_metrics=tmax_metrics,
        tmin_metrics=tmin_metrics,
        rain_metrics=rain_metrics,
        pred_test_tmax=pred_test_tmax,
        pred_test_tmin=pred_test_tmin,
        pred_test_rain=pred_test_rain,
        proba_test_rain=proba_test_rain,
        confusion=cm,
    )
