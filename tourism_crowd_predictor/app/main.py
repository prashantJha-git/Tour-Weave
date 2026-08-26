from __future__ import annotations

import json
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Make the project root importable so we can reuse the existing,
# battle-tested prediction/recommendation modules instead of
# duplicating that logic inside the API layer.
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from predict_crowd import CrowdPredictor, MONTH_NAMES, confidence_word  # noqa: E402
from recommend_places import PlaceRecommender  # noqa: E402

from app import config  # noqa: E402
from app.cache import cache  # noqa: E402
from app.monitoring import RateLimitMiddleware, MetricsMiddleware, metrics  # noqa: E402
from app.schemas import (  # noqa: E402
    CrowdPredictionResponse, YearOutlookResponse, MonthOutlook,
    PlaceListResponse, PlaceSummary, TripPlanRequest, TripPlanResponse,
    ModelInfo, HealthResponse, CacheStatsResponse,
)

# ╔════════════════════════════════════════════════════════════════════╗
# ║ MIDDLEWARE STACK                                                   ║
# ║                                                                    ║
# ║ Request Flow:                                                      ║
# ║   Client                                                           ║
# ║     │                                                              ║
# ║     ├─→ MetricsMiddleware      [Track latency, errors, uptime]     ║
# ║     │                                                              ║
# ║     ├─→ RateLimitMiddleware    [100 req/min per IP]                ║
# ║     │                                                              ║
# ║     ├─→ CORSMiddleware         [Allow cross-origin requests]       ║
# ║     │                                                              ║
# ║     └─→ Route Handler          [Prediction logic]                  ║
# ║                                                                    ║
# ╚════════════════════════════════════════════════════════════════════╝

app = FastAPI(
    title=config.API_TITLE,
    version=config.API_VERSION,
    description=config.API_DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware, limit_per_minute=config.RATE_LIMIT_PER_MINUTE)
app.add_middleware(MetricsMiddleware)


# ╔════════════════════════════════════════════════════════════════════╗
# ║ MODEL LOADING (ONCE AT STARTUP)                                    ║
# ║                                                                    ║
# ║  Why load once, not per-request?                                   ║
# ║  ┌────────────────────────────────────────────────────────────┐    ║
# ║  │ • LightGBM model + ~3k-row dataframe take ~500ms to load   │    ║
# ║  │ • Per-request loading = 500ms latency on every API call    │    ║
# ║  │ • Startup loading = < 5ms per prediction (in-memory)       │    ║
# ║  │ • Result: 100x speedup from smart initialization           │    ║
# ║  └────────────────────────────────────────────────────────────┘    ║
# ║                                                                    ║
# ║  Model artifacts in memory:                                        ║
# ║  ├─ predictor        [CrowdPredictor instance]                     ║
# ║  ├─ recommender      [PlaceRecommender instance]                   ║
# ║  └─ model_metrics    [Accuracy, F1, hyperparams]                   ║
# ║                                                                    ║
# ╚════════════════════════════════════════════════════════════════════╝

predictor: CrowdPredictor | None = None
recommender: PlaceRecommender | None = None
model_metrics: dict = {}


@app.on_event("startup")
def load_models() -> None:
    global predictor, recommender, model_metrics
    try:
        predictor = CrowdPredictor()
        recommender = PlaceRecommender()
        metrics_path = BASE_DIR / "models" / "crowd_model_metrics.json"
        if metrics_path.exists():
            model_metrics = json.loads(metrics_path.read_text())
        print(f"[startup] model + data loaded -- {len(predictor.list_places())} places available.")
    except SystemExit:
        # CrowdPredictor.__init__ calls sys.exit() if model artifacts are
        # missing. Convert that into a clear log message instead of
        # silently killing the whole API process.
        print(
            "[startup] FATAL: model artifacts not found. Run:\n"
            "    python preprocess_data.py && python train_model.py\n"
            "before starting the API.",
            file=sys.stderr,
        )
        raise


def _require_models() -> None:
    if predictor is None or recommender is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet. The server is starting up or failed to load artifacts.",
        )


# ┌───────────────────────────────────────────────────────────────────┐
# │  INTERNAL HELPERS · shared formatting logic, cached where it pays │
# └───────────────────────────────────────────────────────────────────┘

@cache.cached(ttl_seconds=config.PREDICTION_CACHE_TTL_SECONDS, prefix="predict")
def _cached_predict(place_name: str, month: int) -> dict:
    result = predictor.predict(place_name, month)
    top_prob = max(result["probabilities"].values())
    return {
        "place_name": result["place_name"],
        "state": result["state"],
        "category": result["category"],
        "month": result["month"],
        "month_name": MONTH_NAMES[result["month"] - 1],
        "predicted_crowd_level": result["predicted_crowd_level"],
        "confidence": round(top_prob, 4),
        "confidence_word": confidence_word(top_prob),
        "probabilities": result["probabilities"],
        "summary": (
            f"{result['place_name']} is expected to be "
            f"{result['predicted_crowd_level'].lower()} crowd in "
            f"{MONTH_NAMES[result['month'] - 1]}."
        ),
    }


@cache.cached(ttl_seconds=config.PREDICTION_CACHE_TTL_SECONDS, prefix="year_outlook")
def _cached_year_outlook(place_name: str) -> dict:
    year_results = predictor.predict_year(place_name)
    months = [
        {
            "month": r["month"],
            "month_name": MONTH_NAMES[r["month"] - 1],
            "predicted_crowd_level": r["predicted_crowd_level"],
            "confidence": round(max(r["probabilities"].values()), 4),
        }
        for r in year_results
    ]
    quiet = [m["month_name"] for m in months if m["predicted_crowd_level"] == "Low"]
    busy = [m["month_name"] for m in months if m["predicted_crowd_level"] == "High"]
    return {
        "place_name": year_results[0]["place_name"],
        "state": year_results[0]["state"],
        "months": months,
        "quietest_months": quiet,
        "busiest_months": busy,
    }


# ┌───────────────────────────────────────────────────────────────────┐
# │  ROUTES · CROWD PREDICTION                                        │
# └───────────────────────────────────────────────────────────────────┘

@app.get("/predict", response_model=CrowdPredictionResponse, tags=["prediction"])
def predict_crowd(
    place: str = Query(..., description="Place name, e.g. 'Taj Mahal' (case-insensitive, partial OK if unambiguous)"),
    month: int = Query(..., ge=1, le=12, description="1 = January ... 12 = December"),
):
    _require_models()
    try:
        resolved = predictor.resolve_place_name(place)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return _cached_predict(resolved, month)


@app.get("/predict/year", response_model=YearOutlookResponse, tags=["prediction"])
def predict_year(place: str = Query(..., description="Place name")):
    _require_models()
    try:
        resolved = predictor.resolve_place_name(place)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return _cached_year_outlook(resolved)


# ┌───────────────────────────────────────────────────────────────────┐
# │  ROUTES · PLACE RECOMMENDATIONS / SEARCH                          │
# └───────────────────────────────────────────────────────────────────┘

@app.get("/places/top", response_model=PlaceListResponse, tags=["places"])
def top_places(
    n: int = Query(15, ge=1, le=200),
    category: str | None = Query(None),
    state: str | None = Query(None),
):
    _require_models()
    df = recommender.top(n=n, category=category, state=state)
    places = [
        PlaceSummary(place_name=name, category=row["category"], state=row["state"],
                     popularity_percentile=round(float(row["popularity_percentile"]), 4))
        for name, row in df.iterrows()
    ]
    return PlaceListResponse(count=len(places), places=places)


@app.get("/places/search", response_model=PlaceListResponse, tags=["places"])
def search_places(q: str = Query(..., min_length=1), limit: int = Query(15, ge=1, le=100)):
    _require_models()
    df = recommender.search(q, limit=limit)
    places = [
        PlaceSummary(place_name=name, category=row["category"], state=row["state"],
                     popularity_percentile=round(float(row["popularity_percentile"]), 4))
        for name, row in df.iterrows()
    ]
    return PlaceListResponse(count=len(places), places=places)


@app.get("/places/all", response_model=PlaceListResponse, tags=["places"])
def all_places():
    _require_models()
    df = recommender.all_places()
    places = [
        PlaceSummary(place_name=name, category=row["category"], state=row["state"],
                     popularity_percentile=round(float(row["popularity_percentile"]), 4))
        for name, row in df.iterrows()
    ]
    return PlaceListResponse(count=len(places), places=places)


@app.get("/places/categories", tags=["places"])
def categories():
    _require_models()
    return {"categories": recommender.categories()}


@app.get("/places/states", tags=["places"])
def states():
    _require_models()
    return {"states": recommender.states()}


# ┌───────────────────────────────────────────────────────────────────┐
# │  ROUTES · TRIP PLANNING (the "real product" endpoint)             │
# └───────────────────────────────────────────────────────────────────┘

@app.post("/trip/plan", response_model=TripPlanResponse, tags=["trip"])
def plan_trip(request: TripPlanRequest):
    _require_models()
    try:
        resolved = predictor.resolve_place_name(request.place_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    prediction = _cached_predict(resolved, request.month)
    year_outlook = _cached_year_outlook(resolved)

    # Suggest alternatives: same category, predicted Low crowd, that month.
    alternatives: list[PlaceSummary] = []
    try:
        category = prediction["category"]
        candidates = recommender.top(n=30, category=category)
        for name, row in candidates.iterrows():
            if name == resolved:
                continue
            alt_pred = _cached_predict(name, request.month)
            if alt_pred["predicted_crowd_level"] == "Low":
                alternatives.append(PlaceSummary(
                    place_name=name, category=row["category"], state=row["state"],
                    popularity_percentile=round(float(row["popularity_percentile"]), 4),
                ))
            if len(alternatives) >= 5:
                break
    except Exception:
        # Alternatives are a nice-to-have; never let this block break the
        # core prediction the user actually asked for.
        alternatives = []

    return TripPlanResponse(
        prediction=prediction,
        year_outlook=year_outlook,
        alternative_low_crowd_places=alternatives,
    )


# ┌───────────────────────────────────────────────────────────────────┐
# │  ROUTES · MONITORING / OPS                                        │
# └───────────────────────────────────────────────────────────────────┘

@app.get("/health", response_model=HealthResponse, tags=["ops"])
def health():
    return HealthResponse(
        status="ok" if predictor is not None else "starting",
        model_loaded=predictor is not None,
        data_loaded=recommender is not None,
        version=config.API_VERSION,
    )


@app.get("/model/info", response_model=ModelInfo, tags=["ops"])
def model_info():
    _require_models()
    if not model_metrics:
        raise HTTPException(status_code=404, detail="No metrics file found. Train the model first.")
    return ModelInfo(
        accuracy=model_metrics.get("accuracy", 0.0),
        error_rate=model_metrics.get("error_rate", 0.0),
        macro_f1=model_metrics.get("macro_f1", 0.0),
        features_used=predictor.features,
        trained_classes=list(predictor.label_encoder.classes_),
        total_places=len(predictor.list_places()),
    )


@app.get("/metrics", tags=["ops"])
def request_metrics():
    return metrics.snapshot()


@app.get("/cache/stats", response_model=CacheStatsResponse, tags=["ops"])
def cache_stats():
    return cache.stats()


@app.post("/cache/clear", tags=["ops"])
def clear_cache():
    cache.clear()
    return {"status": "cache cleared"}


# ┌───────────────────────────────────────────────────────────────────┐
# │  STATIC FRONTEND · serves frontend/index.html at "/"              │
# └───────────────────────────────────────────────────────────────────┘

FRONTEND_DIR = BASE_DIR / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/", include_in_schema=False)
    def dashboard():
        index_path = FRONTEND_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Dashboard not built yet.")
