from __future__ import annotations

from typing import List, Optional

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
    weather_ml_loaded: bool = Field(
        default=False,
        description="Whether the merged XGBoost weather-forecast layer (weather_ml/) is loaded",
    )


class CurrentWeather(BaseModel):
    temp_c: Optional[float] = None
    precip_mm: Optional[float] = None
    humidity_pct: Optional[float] = None
    condition: str = "Unknown"


class DailyForecast(BaseModel):
    date: str
    temp_max_c: Optional[float] = None
    temp_min_c: Optional[float] = None
    precip_mm: Optional[float] = None
    condition: str = "Unknown"


class LiveWeatherResponse(BaseModel):
    place_name: str
    available: bool
    provider: Optional[str] = None
    current: Optional[CurrentWeather] = None
    forecast: List[DailyForecast] = Field(default_factory=list)
    message: str


# ---------------------------------------------------------------------
# ML weather forecasting (XGBoost, NASA POWER trained -- "weather_ml")
# Distinct from LiveWeatherResponse above: that one is *today's real*
# conditions from Open-Meteo; this one is a *trained-model prediction*
# for a requested date, potentially days ahead, using lag/rolling
# features learned from 10 years of historical data.
# ---------------------------------------------------------------------

class WeatherMLPrediction(BaseModel):
    location: str
    date: str
    predicted_max_temperature: float
    predicted_min_temperature: float
    rainfall_probability: float
    weather_category: str


class WeatherMLForecastDay(BaseModel):
    date: str
    location: str
    predicted_tmax: float
    predicted_tmin: float
    rainfall_probability: float
    weather_category: str


class WeatherMLForecastResponse(BaseModel):
    location: str
    days: list[WeatherMLForecastDay]


class WeatherMLLocationsResponse(BaseModel):
    trained_locations: list[str]
    odisha_locations: list[str]


class CacheStatsResponse(BaseModel):
    backend: str
    hits: int
    misses: int
    hit_rate: float
    keys_cached: Optional[int] = None
