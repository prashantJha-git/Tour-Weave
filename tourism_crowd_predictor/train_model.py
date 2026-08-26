import warnings
warnings.filterwarnings("ignore")

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # no display needed -- just save pngs. avoids
                        # "no display name" crashes on servers/ci.
import matplotlib.pyplot as plt
from tabulate import tabulate

from sklearn.model_selection import StratifiedKFold, RandomizedSearchCV, train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report,
    confusion_matrix, ConfusionMatrixDisplay, precision_recall_fscore_support,
)

import lightgbm as lgb

RANDOM_STATE = 42

# ╔════════════════════════════════════════════════════════════╗
# ║  PATH RESOLUTION                                           ║
# ║  resolve all paths relative to this file, not cwd.         ║
# ║  Prevents "file not found" errors when running from        ║
# ║  a different directory (same fix as preprocess_data.py).   ║
# ╚════════════════════════════════════════════════════════════╝
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "processed" / "crowd_prediction_dataset_clean.csv"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

CAT_FEATURES = ["place_name", "category", "state", "city_tier", "season"]
NUM_FEATURES = [
    "latitude", "longitude", "month_sin", "month_cos", "quarter",
    "is_peak_season", "avg_temp_c", "avg_precip_mm", "popularity_percentile",
    "place_avg_log_visitors",
    # Deterministic features engineered in preprocess_data.py (accessibility,
    # calendar, economic context -- see that file's module docstring).
    "distance_to_airport_km", "festival_day_count", "is_festival_month",
    "school_vacation_intensity", "usd_inr_rate",
    # Target-derived lag features -- computed HERE, not in preprocess_data.py,
    # specifically so the leak-safety boundary below (train_mask) is explicit
    # and enforced. See add_lag_features() docstring.
    "prev_month_log_visitors", "yoy_log_visitors",
]
FEATURES = CAT_FEATURES + NUM_FEATURES
TARGET = "crowd_level"


def load_data():
    df = pd.read_csv(DATA_PATH)
    for c in CAT_FEATURES:
        df[c] = df[c].astype("category")
    return df


def add_place_avg_feature(train_df: pd.DataFrame, apply_df: pd.DataFrame) -> pd.DataFrame:
    """Adds place_avg_log_visitors to apply_df, computed only from
    train_df. This is deliberately leak-safe: when evaluating on the
    holdout years, the average is computed only from the training years,
    so the test years never influence their own feature values."""
    stats = np.log1p(train_df.groupby("place_name")["total_visitors_est"].mean())
    stats.name = "place_avg_log_visitors"
    fallback = np.log1p(train_df["total_visitors_est"]).mean()

    out = apply_df.merge(stats, on="place_name", how="left")
    out["place_avg_log_visitors"] = out["place_avg_log_visitors"].fillna(fallback)
    return out, stats, fallback


def add_lag_features(df: pd.DataFrame, train_mask: pd.Series) -> pd.DataFrame:
    df = df.sort_values(["place_name", "year", "month"]).reset_index(drop=True).copy()
    df["_log_visitors"] = np.log1p(df["total_visitors_est"])

    df["prev_month_log_visitors"] = df.groupby("place_name")["_log_visitors"].shift(1)
    df["yoy_log_visitors"] = df.groupby(["place_name", "month"])["_log_visitors"].shift(1)

    train_only = df.loc[train_mask]
    place_fallback = train_only.groupby("place_name")["_log_visitors"].mean()
    global_fallback = train_only["_log_visitors"].mean()
    fallback = df["place_name"].map(place_fallback).fillna(global_fallback)

    df["prev_month_log_visitors"] = df["prev_month_log_visitors"].fillna(fallback)
    df["yoy_log_visitors"] = df["yoy_log_visitors"].fillna(fallback)

    return df.drop(columns=["_log_visitors"])


def time_based_split(df):
    """Train on 2021-2022, test on 2023+. This simulates the real task:
    predicting crowd levels for months the model has never seen."""
    train_df = df[df["year"] < 2023].reset_index(drop=True)
    test_df = df[df["year"] >= 2023].reset_index(drop=True)
    print(f"train rows: {len(train_df)} (years {sorted(train_df.year.unique())})")
    print(f"test rows:  {len(test_df)} (years {sorted(test_df.year.unique())})")
    return train_df, test_df


def tune_hyperparameters(X_train, y_train):
    """RandomizedSearchCV over the LightGBM params that matter most for a
    dataset this size. 5-fold stratified cv, scored on macro f1 so all
    three crowd levels are weighted equally (not just the majority class)."""
    param_dist = {
        "num_leaves": [7, 15, 31, 63],
        "max_depth": [-1, 4, 6, 8],
        "learning_rate": [0.01, 0.03, 0.05, 0.08, 0.1],
        "n_estimators": [200, 400, 600, 800],
        "min_child_samples": [5, 10, 20, 30],
        "subsample": [0.7, 0.8, 0.9, 1.0],
        "colsample_bytree": [0.6, 0.7, 0.8, 0.9, 1.0],
        "reg_alpha": [0, 0.01, 0.1, 0.5, 1.0],
        "reg_lambda": [0, 0.01, 0.1, 0.5, 1.0],
    }

    base_model = lgb.LGBMClassifier(
        objective="multiclass",
        random_state=RANDOM_STATE,
        verbose=-1,
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    search = RandomizedSearchCV(
        base_model,
        param_distributions=param_dist,
        n_iter=40,
        scoring="f1_macro",
        cv=cv,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=0,
    )
    search.fit(X_train, y_train, categorical_feature=CAT_FEATURES)

    print(f"\nbest cv macro-f1: {search.best_score_:.4f}")
    print(tabulate(search.best_params_.items(), headers=["param", "value"], tablefmt="github"))
    return search.best_params_


def train_final_model(X_train, y_train, best_params):
    X_fit, X_val, y_fit, y_val = train_test_split(
        X_train, y_train, test_size=0.15, stratify=y_train, random_state=RANDOM_STATE
    )

    model = lgb.LGBMClassifier(
        objective="multiclass",
        random_state=RANDOM_STATE,
        verbose=-1,
        n_estimators=2000,  # high ceiling; early stopping finds the real number
        **{k: v for k, v in best_params.items() if k != "n_estimators"},
    )

    model.fit(
        X_fit, y_fit,
        eval_set=[(X_val, y_val)],
        eval_metric="multi_logloss",
        categorical_feature=CAT_FEATURES,
        callbacks=[lgb.early_stopping(stopping_rounds=50, verbose=False)],
    )
    print(f"early stopping picked {model.best_iteration_} trees")
    return model


def evaluate(model, X_test, y_test, label_encoder):
    pred = model.predict(X_test)
    acc = accuracy_score(y_test, pred)
    f1 = f1_score(y_test, pred, average="macro")
    error_rate = 1 - acc

    print("\n===== holdout test results (unseen 2023-2024 months) =====")
    summary_table = [
        ["accuracy", f"{acc:.4f}"],
        ["error rate", f"{error_rate:.4f}"],
        ["macro f1", f"{f1:.4f}"],
    ]
    print(tabulate(summary_table, headers=["metric", "value"], tablefmt="github"))

    print("\nper-class report:")
    precision, recall, f1_per_class, support = precision_recall_fscore_support(
        y_test, pred, labels=range(len(label_encoder.classes_))
    )
    class_table = [
        [label_encoder.classes_[i], f"{precision[i]:.2f}", f"{recall[i]:.2f}",
         f"{f1_per_class[i]:.2f}", int(support[i])]
        for i in range(len(label_encoder.classes_))
    ]
    print(tabulate(class_table, headers=["class", "precision", "recall", "f1", "support"],
                    tablefmt="github"))

    cm = confusion_matrix(y_test, pred)
    disp = ConfusionMatrixDisplay(cm, display_labels=label_encoder.classes_)
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, cmap="Blues", colorbar=False)
    plt.title("Crowd prediction - confusion matrix (holdout test)")
    plt.tight_layout()
    plt.savefig(MODELS_DIR / "confusion_matrix.png", dpi=150)
    plt.close()
    print(f"\nsaved {MODELS_DIR / 'confusion_matrix.png'}")

    return {"accuracy": acc, "error_rate": error_rate, "macro_f1": f1}


def plot_feature_importance(model, feature_names):
    importances = model.feature_importances_
    order = np.argsort(importances)[::-1]
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.barh(
        [feature_names[i] for i in order][::-1],
        [importances[i] for i in order][::-1],
        color="#3b7dd8",
    )
    ax.set_title("Feature importance - crowd prediction model")
    ax.set_xlabel("importance (gain-based split count)")
    plt.tight_layout()
    plt.savefig(MODELS_DIR / "feature_importance.png", dpi=150)
    plt.close()
    print(f"saved {MODELS_DIR / 'feature_importance.png'}")


def cross_validate_full_report(X, y, best_params):
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    rows = []
    for fold, (tr_idx, va_idx) in enumerate(cv.split(X, y), 1):
        model = lgb.LGBMClassifier(
            objective="multiclass", random_state=RANDOM_STATE, verbose=-1,
            **best_params,
        )
        model.fit(X.iloc[tr_idx], y[tr_idx], categorical_feature=CAT_FEATURES)
        pred = model.predict(X.iloc[va_idx])
        acc = accuracy_score(y[va_idx], pred)
        f1 = f1_score(y[va_idx], pred, average="macro")
        rows.append([fold, f"{acc:.4f}", f"{f1:.4f}"])

    accs = [float(r[1]) for r in rows]
    f1s = [float(r[2]) for r in rows]
    rows.append(["mean", f"{np.mean(accs):.4f}", f"{np.mean(f1s):.4f}"])
    print(tabulate(rows, headers=["fold", "accuracy", "macro f1"], tablefmt="github"))


def main():
    if not DATA_PATH.exists():
        print(
            f"error: {DATA_PATH} does not exist.\n"
            f"run the preprocessor first:\n"
            f"    python preprocess_data.py",
            file=sys.stderr,
        )
        sys.exit(1)

    print("loading cleaned data...")
    df = load_data()

    label_encoder = LabelEncoder()
    df["crowd_level_encoded"] = label_encoder.fit_transform(df[TARGET])
    print(f"classes: {list(label_encoder.classes_)}")

    # Lag features first, using the train/test year boundary as the
    # leak-safety mask (see add_lag_features() docstring). This has to
    # happen before time_based_split() so shift() sees each place's full
    # chronological history, not two artificially disconnected halves.
    train_mask = df["year"] < 2023
    df = add_lag_features(df, train_mask)

    train_df, test_df = time_based_split(df)

    # leak-safe place-level feature: computed only from the training years
    train_df, _, _ = add_place_avg_feature(train_df, train_df)
    test_df, _, _ = add_place_avg_feature(train_df, test_df)

    X_train, y_train = train_df[FEATURES], train_df["crowd_level_encoded"].values
    X_test, y_test = test_df[FEATURES], test_df["crowd_level_encoded"].values

    print("\n--- hyperparameter tuning (randomizedsearchcv, 5-fold cv) ---")
    best_params = tune_hyperparameters(X_train, y_train)

    print("\n--- extra robustness check: 5-fold cv across full dataset ---")
    # Reuses the same lag features already computed above (train-year
    # fallback). place_avg_log_visitors is recomputed across the whole
    # dataset here -- as the original comment notes, that's "not
    # leak-safe on its own" the way the primary time-based split is, since
    # random k-fold shuffling can put a chronologically-later row in a
    # training fold for an earlier row's validation fold. This block
    # exists purely as an extra robustness signal on top of the honest
    # holdout evaluation below, not a replacement for it.
    df_full_feat, _, _ = add_place_avg_feature(df, df)
    cross_validate_full_report(df_full_feat[FEATURES], df["crowd_level_encoded"].values, best_params)

    print("\n--- training final model (train years, early stopping) ---")
    model = train_final_model(X_train, y_train, best_params)

    metrics = evaluate(model, X_test, y_test, label_encoder)
    plot_feature_importance(model, FEATURES)

    # ------------------------------------------------------------------
    # Production model: once we trust the methodology above, retrain on
    # all available data (train+test years) so the deployed model has
    # seen everything up to today. This is standard practice -- the
    # holdout evaluation above is what tells you if you can trust it.
    # ------------------------------------------------------------------
    print("\n--- refitting production model on all data ---")
    df_all, place_stats, fallback = add_place_avg_feature(df, df)
    X_all, y_all = df_all[FEATURES], df_all["crowd_level_encoded"].values
    production_model = lgb.LGBMClassifier(
        objective="multiclass", random_state=RANDOM_STATE, verbose=-1, **best_params,
    )
    production_model.fit(X_all, y_all, categorical_feature=CAT_FEATURES)

    joblib.dump(production_model, MODELS_DIR / "crowd_model.joblib")
    joblib.dump(label_encoder, MODELS_DIR / "crowd_label_encoder.joblib")
    joblib.dump(FEATURES, MODELS_DIR / "crowd_model_features.joblib")
    # save the place-level stats + fallback so predict_crowd.py can
    # reproduce this exact feature at prediction time.
    joblib.dump({"place_stats": place_stats, "fallback": fallback},
                MODELS_DIR / "place_visitor_stats.joblib")
    with open(MODELS_DIR / "crowd_model_metrics.json", "w") as f:
        json.dump({**metrics, "best_params": best_params}, f, indent=2)

    print(f"\nsaved all artifacts to {MODELS_DIR}/")
    print("\ndone.")


if __name__ == "__main__":
    main()
