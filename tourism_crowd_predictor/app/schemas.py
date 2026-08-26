from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------
# Shared / reusable pieces
# ---------------------------------------------------------------------

class ErrorResponse(BaseModel):
    detail: str


# ---------------------------------------------------------------------
# Crowd prediction
# ---------------------------------------------------------------------

class CrowdPredictionResponse(BaseModel):
    place_name: str
    state: str
    category: str
    month: int
    month_name: str
    predicted_crowd_level: str
    confidence: float = Field(..., description="Model's probability for the predicted class, 0-1")
    confidence_word: str
    probabilities: dict[str, float]
    summary: str = Field(..., description="One human-readable sentence describing the forecast")


class MonthOutlook(BaseModel):
    month: int
    month_name: str
    predicted_crowd_level: str
    confidence: float


class YearOutlookResponse(BaseModel):
    place_name: str
    state: str
    months: list[MonthOutlook]
    quietest_months: list[str]
    busiest_months: list[str]


# ---------------------------------------------------------------------
# Place recommendations / search
# ---------------------------------------------------------------------

class PlaceSummary(BaseModel):
    place_name: str
    category: str
    state: str
    popularity_percentile: float


class PlaceListResponse(BaseModel):
    count: int
    places: list[PlaceSummary]


# ---------------------------------------------------------------------
# Full trip planning (recommendation + prediction combined)
# ---------------------------------------------------------------------

class TripPlanRequest(BaseModel):
    place_name: str = Field(..., examples=["Taj Mahal"])
    month: int = Field(..., ge=1, le=12, examples=[12])

    @field_validator("place_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("place_name cannot be blank")
        return v.strip()


class TripPlanResponse(BaseModel):
    prediction: CrowdPredictionResponse
    year_outlook: YearOutlookResponse
    alternative_low_crowd_places: list[PlaceSummary] = Field(
        default_factory=list,
        description="Other highly-rated places that are predicted Low crowd for the same month",
    )


# ---------------------------------------------------------------------
# Monitoring / health
# ---------------------------------------------------------------------

class ModelInfo(BaseModel):
    accuracy: float
    error_rate: float
    macro_f1: float
    features_used: list[str]
    trained_classes: list[str]
    total_places: int


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    data_loaded: bool
    version: str


class CacheStatsResponse(BaseModel):
    backend: str
    hits: int
    misses: int
    hit_rate: float
    keys_cached: Optional[int] = None
