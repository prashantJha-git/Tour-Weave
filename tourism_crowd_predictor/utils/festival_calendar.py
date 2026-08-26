from __future__ import annotations

from datetime import date

# year -> list of (date, festival_name). Fixed-date festivals (Republic
# Day, Independence Day, Christmas, New Year) repeat identically every
# year; lunar/lunisolar festivals are listed with their actual date for
# that specific year.
FESTIVALS: dict[int, list[tuple[date, str]]] = {
    2021: [
        (date(2021, 1, 1), "New Year"),
        (date(2021, 1, 26), "Republic Day"),
        (date(2021, 3, 29), "Holi"),
        (date(2021, 8, 15), "Independence Day"),
        (date(2021, 8, 21), "Onam"),
        (date(2021, 8, 22), "Raksha Bandhan"),
        (date(2021, 9, 10), "Ganesh Chaturthi"),
        (date(2021, 10, 15), "Dussehra"),
        (date(2021, 11, 4), "Diwali"),
        (date(2021, 12, 25), "Christmas"),
    ],
    2022: [
        (date(2022, 1, 1), "New Year"),
        (date(2022, 1, 26), "Republic Day"),
        (date(2022, 3, 18), "Holi"),
        (date(2022, 8, 11), "Raksha Bandhan"),
        (date(2022, 8, 15), "Independence Day"),
        (date(2022, 8, 31), "Ganesh Chaturthi"),
        (date(2022, 9, 8), "Onam"),
        (date(2022, 10, 5), "Dussehra"),
        (date(2022, 10, 24), "Diwali"),
        (date(2022, 12, 25), "Christmas"),
    ],
    2023: [
        (date(2023, 1, 1), "New Year"),
        (date(2023, 1, 26), "Republic Day"),
        (date(2023, 3, 8), "Holi"),
        (date(2023, 8, 15), "Independence Day"),
        (date(2023, 8, 29), "Onam"),
        (date(2023, 8, 30), "Raksha Bandhan"),
        (date(2023, 9, 19), "Ganesh Chaturthi"),
        (date(2023, 10, 24), "Dussehra"),
        (date(2023, 11, 12), "Diwali"),
        (date(2023, 12, 25), "Christmas"),
    ],
    2024: [
        (date(2024, 1, 1), "New Year"),
        (date(2024, 1, 26), "Republic Day"),
        (date(2024, 3, 25), "Holi"),
        (date(2024, 8, 15), "Independence Day"),
        (date(2024, 8, 19), "Raksha Bandhan"),
        (date(2024, 9, 7), "Ganesh Chaturthi"),
        (date(2024, 9, 15), "Onam"),
        (date(2024, 10, 12), "Dussehra"),
        (date(2024, 11, 1), "Diwali"),
        (date(2024, 12, 25), "Christmas"),
    ],
    2025: [
        (date(2025, 1, 1), "New Year"),
        (date(2025, 1, 26), "Republic Day"),
        (date(2025, 3, 14), "Holi"),
        (date(2025, 8, 9), "Raksha Bandhan"),
        (date(2025, 8, 15), "Independence Day"),
        (date(2025, 8, 27), "Ganesh Chaturthi"),
        (date(2025, 9, 5), "Onam"),
        (date(2025, 10, 2), "Dussehra"),
        (date(2025, 10, 20), "Diwali"),
        (date(2025, 12, 25), "Christmas"),
    ],
}


def _nearest_known_year(year: int) -> int:
    known_years = sorted(FESTIVALS)
    if year in FESTIVALS:
        return year
    return min(known_years, key=lambda y: abs(y - year))


def festival_dates_for_year(year: int) -> list[tuple[date, str]]:
    return FESTIVALS[_nearest_known_year(year)]


def festival_day_count(year: int, month: int) -> int:
    return sum(1 for d, _ in festival_dates_for_year(year) if d.month == month)


def is_festival_month(year: int, month: int) -> bool:
    return festival_day_count(year, month) > 0


def average_festival_day_count(month: int) -> float:
    counts = [
        sum(1 for d, _ in dates if d.month == month)
        for dates in FESTIVALS.values()
    ]
    return round(sum(counts) / len(counts), 2) if counts else 0.0
