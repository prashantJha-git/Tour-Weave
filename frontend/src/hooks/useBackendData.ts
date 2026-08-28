import { useEffect, useState } from 'react';
import { api, WeatherMLForecastDay } from '../api/client';
import { toCityWeatherData, toCrowdIntelligenceData } from '../api/adapters';
import { CityWeatherData, CrowdIntelligenceData, Destination } from '../types';
import { toDestination } from '../api/adapters';

const CURRENT_MONTH = new Date().getMonth() + 1;

/** Fetches the live crowd prediction + weather for one place and adapts
 * them into the dashboard's existing data shapes. Used by AIInsightsHub. */
export function usePlaceInsights(placeName: string | null) {
  const [weather, setWeather] = useState<CityWeatherData | null>(null);
  const [crowd, setCrowd] = useState<CrowdIntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // allSettled, not all: the crowd prediction is the core feature and
    // should still render even if the live-weather call fails or the
    // endpoint isn't deployed yet on this backend.
    Promise.allSettled([api.predict(placeName, CURRENT_MONTH), api.liveWeather(placeName)])
      .then(([predictionResult, liveResult]) => {
        if (cancelled) return;
        if (predictionResult.status === 'rejected') {
          setError(predictionResult.reason?.message || 'Failed to load crowd prediction');
          return;
        }
        const prediction = predictionResult.value;
        const live = liveResult.status === 'fulfilled'
          ? liveResult.value
          : { place_name: placeName, available: false, provider: null, current: null, forecast: [], message: 'Live weather endpoint unavailable' };

        const crowdData = toCrowdIntelligenceData(placeName, prediction);
        const weatherData = toCityWeatherData(placeName, prediction.state, live);
        // Share the real monthly density score across the 5-day strip so
        // the two panels agree with each other visually.
        weatherData.forecast5Days = weatherData.forecast5Days.map(d => ({ ...d, crowdPercent: crowdData.densityScore }));
        setCrowd(crowdData);
        setWeather(weatherData);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [placeName]);

  return { weather, crowd, loading, error };
}

/** Fetches the top N most popular real places from the backend, once. */
export function useTopPlaceNames(n = 6) {
  const [places, setPlaces] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    api.topPlaces(n)
      .then(res => !cancelled && setPlaces(res.places.map(p => p.place_name)))
      .catch(() => !cancelled && setPlaces([]));
    return () => { cancelled = true; };
  }, [n]);
  return places;
}

/** Fetches the top N real places from the backend and adapts them into full
 * Destination cards (with a live crowd prediction for each). Returns null
 * while loading or if the backend is unreachable — the caller decides
 * whether to fall back to mock destinations in that case. */
export function useRecommendedDestinations(n = 8) {
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.topPlaces(n)
      .then(async ({ places }) => {
        const withCrowd = await Promise.all(
          places.map(async (p) => {
            try {
              const prediction = await api.predict(p.place_name, CURRENT_MONTH);
              return toDestination(p, prediction);
            } catch {
              return toDestination(p, null);
            }
          })
        );
        if (!cancelled) setDestinations(withCrowd);
      })
      .catch(() => !cancelled && setDestinations(null))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [n]);

  return { destinations, loading };
}

/** Multi-day XGBoost weather forecast (backend `weather_ml/`) for one of
 * the ~20 trained cities — a genuinely different signal from the live
 * Open-Meteo conditions (`usePlaceInsights`) or the monthly crowd-level
 * model: this is a trained-model prediction of tomorrow's (and further
 * out) temperature/rain, built from 10 years of historical data. */
export function useWeatherForecastML(location: string | null, days = 7) {
  const [forecast, setForecast] = useState<WeatherMLForecastDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.weatherForecast(location, days)
      .then((res) => !cancelled && setForecast(res.days))
      .catch((e) => !cancelled && setError(e?.message || 'Forecast unavailable'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [location, days]);

  return { forecast, loading, error };
}

/** The list of cities the weather_ml model was actually trained on —
 * fetched once, used to populate the forecast lab's city picker. */
export function useWeatherForecastLocations() {
  const [locations, setLocations] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    api.weatherForecastLocations()
      .then((res) => !cancelled && setLocations(res.trained_locations))
      .catch(() => !cancelled && setLocations([]));
    return () => { cancelled = true; };
  }, []);
  return locations;
}
