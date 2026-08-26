import argparse
import sys

from tabulate import tabulate

from recommend_places import PlaceRecommender, print_recommendation_table
from predict_crowd import (
    CrowdPredictor, print_prediction_table, print_year_outlook, MONTH_NAMES,
)

MAX_PROMPT_ATTEMPTS = 5


def print_month_table():
    rows = [[i + 1, name] for i, name in enumerate(MONTH_NAMES)]
    print(tabulate(rows, headers=["#", "month"], tablefmt="github"))


def _show_candidates_and_pick(candidates_df, prompt_label: str) -> str:
    if len(candidates_df) == 0:
        print(f"no places found for '{prompt_label}'. try 'all' to browse everything, or a different search term.")
        return None
    ordered_names = print_recommendation_table(candidates_df)
    if len(ordered_names) == 1:
        return ordered_names[0]
    choice = input("enter the # of the place you meant: ").strip()
    if choice.isdigit() and 1 <= int(choice) <= len(ordered_names):
        return ordered_names[int(choice) - 1]
    return None


def choose_place(recommender: PlaceRecommender, predictor: CrowdPredictor,
                  place_arg: str, place_number_arg: int) -> str:
    top_places = recommender.top(15)
    print("\ntop recommended places:")
    ordered_names = print_recommendation_table(top_places)

    if place_arg:
        return predictor.resolve_place_name(place_arg)
    if place_number_arg:
        return ordered_names[place_number_arg - 1]

    print(
        "\nyou're not limited to the list above -- enter a # from the table, "
        "type any place name (full or partial, e.g. 'beach' or 'taj'), "
        "or type 'all' to browse every place in the database."
    )

    for _ in range(MAX_PROMPT_ATTEMPTS):
        choice = input("\nwhere do you want to go? ").strip()
        if not choice:
            continue

        if choice.isdigit() and 1 <= int(choice) <= len(ordered_names):
            return ordered_names[int(choice) - 1]

        if choice.lower() in ("all", "list", "show all", "everything"):
            print(f"\nall {len(recommender.all_places())} available places:")
            picked = _show_candidates_and_pick(recommender.all_places(), choice)
            if picked:
                return picked
            continue

        try:
            return predictor.resolve_place_name(choice)
        except ValueError:
            pass

        matches = recommender.search(choice)
        if len(matches) == 1:
            return matches.index[0]
        elif len(matches) > 1:
            print(f"\nfound {len(matches)} places matching '{choice}':")
            picked = _show_candidates_and_pick(matches, choice)
            if picked:
                return picked
            continue
        else:
            print(f"\nno place found matching '{choice}'. try 'all' to browse the full list.")

    print("too many attempts -- pass --place \"exact name\" instead.", file=sys.stderr)
    sys.exit(1)


def choose_month(month_arg: int) -> int:
    if month_arg:
        return month_arg
    print("\nmonths:")
    print_month_table()
    for _ in range(MAX_PROMPT_ATTEMPTS):
        choice = input("\nenter the # of the month you're planning to travel: ").strip()
        if choice.isdigit() and 1 <= int(choice) <= 12:
            return int(choice)
        print("please enter a number from 1 to 12.")
    print("too many attempts -- pass --month <1-12> instead.", file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="plan a trip: pick any place, pick a month, see the crowd forecast."
    )
    parser.add_argument("--place", help="place name (full or partial), skips the interactive prompt")
    parser.add_argument("--place-number", type=int, help="row number from the recommended places table")
    parser.add_argument("--month", type=int, choices=range(1, 13), help="1-12")
    parser.add_argument("--technical", action="store_true",
                         help="also show raw model confidence percentages, not just the plain-language summary")
    parser.add_argument("--no-year-outlook", action="store_true",
                         help="skip the full-year 'best months to visit' table")
    args = parser.parse_args()

    recommender = PlaceRecommender()
    predictor = CrowdPredictor()

    try:
        place_name = choose_place(recommender, predictor, args.place, args.place_number)
        month = choose_month(args.month)
    except (EOFError, KeyboardInterrupt):
        print("\nno input received -- pass --place and --month instead for non-interactive use.", file=sys.stderr)
        sys.exit(1)

    try:
        result = predictor.predict(place_name, month)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    print_prediction_table(result, technical=args.technical)

    if not args.no_year_outlook:
        year_results = predictor.predict_year(place_name)
        print_year_outlook(year_results)


if __name__ == "__main__":
    main()
