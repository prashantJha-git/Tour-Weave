"""
Optional exploratory-data-analysis plots, mirroring the notebook's
Sections 5, 6, 6b and 10. Not required for training or serving — import
and call these from a notebook / script when you want the visuals back.

Every function takes a DataFrame (usually the cleaned `df` from
`data_clean.clean_weather_data`, or the model outputs) and draws to the
current matplotlib figure; call `plt.show()` or save the figure yourself.
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix

from . import config


def plot_location_map(loc_df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(7, 8))
    ax.scatter(loc_df["longitude"], loc_df["latitude"], s=90, c=loc_df["latitude"],
               cmap="viridis", edgecolor="k", zorder=3)
    for _, row in loc_df.iterrows():
        ax.annotate(row["location"], (row["longitude"] + 0.3, row["latitude"]), fontsize=9)
    ax.set_title("TourIntel — India-wide Tourist Locations (lat/lon)")
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    plt.tight_layout()


def plot_temperature_trends(df: pd.DataFrame, locations: list[str] | None = None) -> None:
    locations = locations or ["Delhi", "Goa", "Srinagar", "Tawang", "Kochi"]
    fig, ax = plt.subplots(figsize=(13, 5))
    for loc in locations:
        sub = df[df.location == loc].set_index("date")["tmax"].resample("MS").mean()
        ax.plot(sub.index, sub.values, label=loc)
    ax.set_title("Monthly Average Max Temperature Over Time (selected locations)")
    ax.set_ylabel("Temperature (°C)")
    ax.legend()
    plt.tight_layout()


def plot_rainfall_distribution(df: pd.DataFrame) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    sns.histplot(df.loc[df.rainfall_mm > 0, "rainfall_mm"], bins=40, ax=axes[0], color="steelblue")
    axes[0].set_title("Distribution of Daily Rainfall (rainy days only, mm)")
    axes[0].set_xlabel("Rainfall (mm)")

    rain_by_loc = (
        df.assign(is_rain=(df.rainfall_mm >= config.RAIN_THRESHOLD_MM))
        .groupby("location")["is_rain"].mean().sort_values()
    )
    rain_by_loc.plot(kind="barh", ax=axes[1], color="teal")
    axes[1].set_title(f"Share of Rainy Days (>={config.RAIN_THRESHOLD_MM}mm) by Location")
    axes[1].set_xlabel("Fraction of days")
    plt.tight_layout()


def plot_seasonal_boxplot(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(13, 6))
    order = df.groupby("location")["tmax"].mean().sort_values().index
    sns.boxplot(data=df, x="location", y="tmax", order=order, ax=ax, palette="coolwarm")
    ax.set_title("Max Temperature Distribution by Location")
    ax.set_ylabel("Tmax (°C)")
    plt.xticks(rotation=40, ha="right")
    plt.tight_layout()


def plot_correlation_heatmap(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(6, 5))
    corr = df[["tmax", "tmin", "rainfall_mm", "cloud_amt", "latitude", "longitude"]].corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax)
    ax.set_title("Correlation Heatmap")
    plt.tight_layout()


def plot_odisha_focus(odisha_df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(12, 5))
    for loc in config.ODISHA_LOCATIONS:
        sub = odisha_df[odisha_df.location == loc].set_index("date")["tmax"].resample("MS").mean()
        ax.plot(sub.index, sub.values, label=loc)
    ax.set_title("Odisha — Monthly Average Max Temperature by Destination")
    ax.set_ylabel("Temperature (°C)")
    ax.legend(ncol=3)
    plt.tight_layout()

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    monthly_rain = (
        odisha_df.assign(is_rain=(odisha_df.rainfall_mm >= config.RAIN_THRESHOLD_MM), month=odisha_df.date.dt.month)
        .groupby(["location", "month"])["is_rain"].mean().unstack(0)
    )
    monthly_rain.plot(ax=axes[0], marker="o")
    axes[0].axvspan(6, 9, color="steelblue", alpha=0.12, label="Monsoon (Jun-Sep)")
    axes[0].axvspan(10, 11, color="darkorange", alpha=0.15, label="Cyclone season (Oct-Nov)")
    axes[0].set_title("Odisha — Rainy-Day Fraction by Month")
    axes[0].set_xlabel("Month")
    axes[0].set_ylabel("Fraction of rainy days")
    axes[0].legend(fontsize=8)

    sns.boxplot(data=odisha_df, x="location", y="tmax", order=config.ODISHA_LOCATIONS, ax=axes[1], palette="Oranges")
    axes[1].set_title("Odisha — Max Temperature Spread by Destination")
    axes[1].set_ylabel("Tmax (°C)")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()


def plot_actual_vs_predicted(y_test_tmax, pred_test_tmax, y_test_tmin, pred_test_tmin) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    for ax, y_true, y_pred, title in [
        (axes[0], y_test_tmax, pred_test_tmax, "Tmax: Actual vs Predicted"),
        (axes[1], y_test_tmin, pred_test_tmin, "Tmin: Actual vs Predicted"),
    ]:
        ax.scatter(y_true, y_pred, alpha=0.15, s=10, color="darkorange")
        lims = [min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())]
        ax.plot(lims, lims, "k--", linewidth=1)
        ax.set_xlabel("Actual (°C)")
        ax.set_ylabel("Predicted (°C)")
        ax.set_title(title)
    plt.tight_layout()


def plot_error_distribution(y_test_tmax, pred_test_tmax, y_test_tmin, pred_test_tmin) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(13, 4.5))
    sns.histplot(y_test_tmax.values - pred_test_tmax, bins=40, ax=axes[0], color="crimson")
    axes[0].set_title("Tmax Prediction Error (Actual - Predicted)")
    axes[0].set_xlabel("Error (°C)")
    sns.histplot(y_test_tmin.values - pred_test_tmin, bins=40, ax=axes[1], color="royalblue")
    axes[1].set_title("Tmin Prediction Error (Actual - Predicted)")
    axes[1].set_xlabel("Error (°C)")
    plt.tight_layout()


def plot_rain_confusion_matrix(y_test_rain, pred_test_rain) -> None:
    cm = confusion_matrix(y_test_rain, pred_test_rain)
    fig, ax = plt.subplots(figsize=(5, 5))
    ConfusionMatrixDisplay(cm, display_labels=["No Rain", "Rain"]).plot(ax=ax, cmap="Blues", colorbar=False)
    ax.set_title("Rain / No-Rain — Confusion Matrix (Test Set)")
    plt.tight_layout()


def plot_feature_importance(tmax_model, tmin_model, rain_model, feature_cols: list[str]) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(17, 5))
    for ax, model, title in [
        (axes[0], tmax_model, "Tmax model"),
        (axes[1], tmin_model, "Tmin model"),
        (axes[2], rain_model, "Rain model"),
    ]:
        imp = pd.Series(model.feature_importances_, index=feature_cols).sort_values(ascending=True).tail(10)
        imp.plot(kind="barh", ax=ax, color="seagreen")
        ax.set_title(f"Top-10 Feature Importance — {title}")
    plt.tight_layout()
