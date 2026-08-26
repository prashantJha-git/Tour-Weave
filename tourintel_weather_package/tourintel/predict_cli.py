#!/usr/bin/env python3
"""
Quick command-line predictions against the trained models, without
spinning up the FastAPI server.

Examples:
    python predict_cli.py --location Goa --date 2026-09-15
    python predict_cli.py --location Gangtok --forecast-days 7
    python predict_cli.py --odisha --date 2026-09-15
"""
from __future__ import annotations

import argparse
import json

from tourintel_weather.inference import InferenceEngine


def main() -> None:
    parser = argparse.ArgumentParser(description="TourIntel weather prediction CLI")
    parser.add_argument("--location", help="Location name (see /api/tourintel/locations)")
    parser.add_argument("--date", help="YYYY-MM-DD")
    parser.add_argument("--forecast-days", type=int, help="Recursive N-day-ahead forecast instead of a single date")
    parser.add_argument("--odisha", action="store_true", help="Forecast all 6 Odisha ML locations for --date")
    args = parser.parse_args()

    engine = InferenceEngine.load()

    if args.odisha:
        if not args.date:
            parser.error("--odisha requires --date")
        df = engine.odisha_forecast(args.date)
        print(df.to_string(index=False))
        return

    if not args.location:
        parser.error("--location is required unless using --odisha")

    if args.forecast_days:
        df = engine.forecast_forward(args.location, args.forecast_days)
        print(df.to_string(index=False))
    else:
        if not args.date:
            parser.error("--date is required unless using --forecast-days")
        result = engine.predict_weather(args.location, args.date)
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
