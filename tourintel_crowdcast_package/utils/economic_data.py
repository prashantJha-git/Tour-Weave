from __future__ import annotations

# year -> approximate annual average USD/INR exchange rate.
USD_INR_ANNUAL_AVG: dict[int, float] = {
    2019: 70.4,
    2020: 74.1,
    2021: 74.3,
    2022: 78.6,
    2023: 82.6,
    2024: 83.4,
    2025: 85.6,  # in-progress-year estimate -- refresh periodically
}


def _nearest_known_year(year: int) -> int:
    known_years = sorted(USD_INR_ANNUAL_AVG)
    if year in USD_INR_ANNUAL_AVG:
        return year
    return min(known_years, key=lambda y: abs(y - year))


def usd_inr_rate(year: int) -> float:
    return USD_INR_ANNUAL_AVG[_nearest_known_year(year)]
