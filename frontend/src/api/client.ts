// Thin fetch wrapper around the Tourism Crowd Prediction backend.
// Every component talks to the backend through here — never fetch()
// directly in a component — so there's one place to change the base
// URL, add auth, or adjust error handling.

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---- GET de-duplication + short cache ----
// Several components independently ask for overlapping data on mount
// (e.g. App.tsx's top-20 destinations overlap RecommendedPlaces.tsx's
// top-8), and React StrictMode double-fires every effect in dev on top
// of that. Without this, a single page load can fire 50+ near-identical
// /predict calls and blow through the backend's rate limit in seconds.
// This makes concurrent identical GETs share one network call, and
// caches the result briefly so remounts/re-renders don't refetch.
const CACHE_TTL_MS = 60_000;
const inFlight = new Map<string, Promise<any>>();
const cache = new Map<string, { value: any; expiresAt: number }>();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isGet = !init || !init.method || init.method === 'GET';
  const key = `${(init?.method || 'GET')}:${path}`;

  if (isGet) {
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    const pending = inFlight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const doFetch = async (): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.detail || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  };

  if (!isGet) {
    return doFetch();
  }

  const promise = doFetch()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

// ---- Backend response shapes (mirrors app/schemas.py) ----

export interface PlaceSummary {
  place_name: string;
  category: string;
  state: string;
  popularity_percentile: number;
}

export interface ModelInfo {
  accuracy: number;
  error_rate: number;
  macro_f1: number;
  features_used: string[];
  trained_classes: string[];
  total_places: number;
}

export interface CrowdPrediction {
  place_name: string;
  state: string;
  category: string;
  month: number;
  month_name: string;
  predicted_crowd_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  confidence_word: string;
  probabilities: { Low: number; Medium: number; High: number };
  summary: string;
}

export interface LiveWeather {
  place_name: string;
  available: boolean;
  provider: string | null;
  current: { temp_c: number | null; precip_mm: number | null; humidity_pct: number | null; condition: string } | null;
  forecast: { date: string; temp_max_c: number | null; temp_min_c: number | null; precip_mm: number | null; condition: string }[];
  message: string;
}

// ---- Weather ML (XGBoost, /weather/forecast/*) response shapes ----
// A distinct model family from CrowdPrediction/LiveWeather above: trained
// on 10 years of NASA POWER data for 20 India-wide cities, giving a
// genuine next-day/multi-day-ahead temperature + rain forecast rather
// than "current conditions" (LiveWeather) or "typical month" (CrowdPrediction).

export interface WeatherMLPrediction {
  location: string;
  date: string;
  predicted_max_temperature: number;
  predicted_min_temperature: number;
  rainfall_probability: number;
  weather_category: string;
}

export interface WeatherMLForecastDay {
  date: string;
  location: string;
  predicted_tmax: number;
  predicted_tmin: number;
  rainfall_probability: number;
  weather_category: string;
}

export interface WeatherMLForecastResponse {
  location: string;
  days: WeatherMLForecastDay[];
}

export interface WeatherMLLocationsResponse {
  trained_locations: string[];
  odisha_locations: string[];
}

export const api = {
  topPlaces: (n = 8) => request<{ count: number; places: PlaceSummary[] }>(`/places/top?n=${n}`),
  searchPlaces: (q: string, limit = 8) =>
    request<{ count: number; places: PlaceSummary[] }>(`/places/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  predict: (place: string, month: number) =>
    request<CrowdPrediction>(`/predict?place=${encodeURIComponent(place)}&month=${month}`),
  liveWeather: (place: string) => request<LiveWeather>(`/weather/live?place=${encodeURIComponent(place)}`),
  health: () => request<{ status: string; model_loaded: boolean }>('/health'),
  modelInfo: () => request<ModelInfo>('/model/info'),

  // ---- Weather ML (multi-day XGBoost forecast) ----
  weatherForecastLocations: () => request<WeatherMLLocationsResponse>('/weather/forecast/locations'),
  weatherForecastPredict: (location: string, date: string) =>
    request<WeatherMLPrediction>(`/weather/forecast/predict?location=${encodeURIComponent(location)}&date=${date}`),
  weatherForecast: (location: string, days = 7) =>
    request<WeatherMLForecastResponse>(`/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`),
  weatherForecastOdisha: (date: string) =>
    request<WeatherMLPrediction[]>(`/weather/forecast/odisha?date=${date}`),
};

export { ApiError };
