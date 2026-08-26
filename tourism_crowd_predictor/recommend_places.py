from pathlib import Path
import difflib

import pandas as pd
from tabulate import tabulate

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "processed" / "crowd_prediction_dataset_clean.csv"


class PlaceRecommender:
    def __init__(self):
        if not DATA_PATH.exists():
            raise FileNotFoundError(
                f"{DATA_PATH} does not exist. run preprocess_data.py first."
            )
        df = pd.read_csv(DATA_PATH)
        # one row per place: its most recent year's attributes
        self._places = (
            df.sort_values("year")
            .drop_duplicates("place_name", keep="last")
            .set_index("place_name")
        )

    def top(self, n: int = 15, category: str = None, state: str = None) -> pd.DataFrame:
        df = self._places
        if category:
            df = df[df["category"].str.lower() == category.lower()]
        if state:
            df = df[df["state"].str.lower() == state.lower()]

        df = df.sort_values("popularity_percentile", ascending=False).head(n)
        return df[["category", "state", "popularity_percentile"]]

    def all_places(self) -> pd.DataFrame:
        return self._places.sort_index()[["category", "state", "popularity_percentile"]]

    def search(self, query: str, limit: int = 15) -> pd.DataFrame:
        query = query.strip().lower()
        if not query:
            return self._places.iloc[0:0][["category", "state", "popularity_percentile"]]

        all_names = self._places.index.tolist()
        substring_hits = [n for n in all_names if query in n.lower()]

        fuzzy_hits = difflib.get_close_matches(query, [n.lower() for n in all_names], n=limit, cutoff=0.5)
        fuzzy_hits = [n for n in all_names if n.lower() in fuzzy_hits]

        # substring matches first (usually what the user meant), then
        # fuzzy matches, de-duplicated, capped at `limit`.
        ordered = list(dict.fromkeys(substring_hits + fuzzy_hits))[:limit]
        return self._places.loc[ordered][["category", "state", "popularity_percentile"]]

    def categories(self) -> list:
        return sorted(self._places["category"].dropna().unique().tolist())

    def states(self) -> list:
        return sorted(self._places["state"].dropna().unique().tolist())


def print_recommendation_table(df: pd.DataFrame) -> list:
    rows = [
        [i + 1, place, row["category"], row["state"], f"{row['popularity_percentile'] * 100:.1f}%"]
        for i, (place, row) in enumerate(df.iterrows())
    ]
    print(tabulate(rows, headers=["#", "place", "category", "state", "popularity"], tablefmt="github"))
    return df.index.tolist()


if __name__ == "__main__":
    recommender = PlaceRecommender()
    print("top recommended places overall:")
    print_recommendation_table(recommender.top(15))

    print(f"\ntotal places available: {len(recommender.all_places())}")
    print("\nsearch demo -- places matching 'beach':")
    print_recommendation_table(recommender.search("beach"))
