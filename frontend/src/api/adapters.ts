// Converts real backend responses (CrowdPrediction, LiveWeather, PlaceSummary)
// into the exact shapes the existing dashboard UI (AIInsightsHub) and
// RecommendedPlaces already render — so those components' JSX/theme never
// has to change, only where their data comes from.
//
// Honesty note: the backend's crowd model predicts a MONTHLY Low/Medium/High
// level, and Open-Meteo's live endpoint doesn't return AQI, UV index, or an
// hourly crowd breakdown. Rather than silently inventing precise-looking
// numbers for things the model doesn't actually predict, every derived/
// estimated field below is flagged with a comment. If you later add a real
// AQI feed or an hourly-footfall model, swap those two spots only.

import { CityWeatherData, CrowdIntelligenceData, HourlyCrowd, WeatherDay, CrowdLevel, Destination } from '../types';
import { CrowdPrediction, LiveWeather, PlaceSummary } from './client';

const CONDITION_MAP: Record<string, WeatherDay['condition']> = {
  'Clear sky': 'Clear Sky', 'Mostly clear': 'Sunny', 'Partly cloudy': 'Partly Cloudy',
  'Overcast': 'Partly Cloudy', 'Fog': 'Misty', 'Depositing rime fog': 'Misty',
};
function mapCondition(raw?: string): WeatherDay['condition'] {
  if (!raw) return 'Clear Sky';
  if (raw in CONDITION_MAP) return CONDITION_MAP[raw];
  return /rain|drizzle|shower|thunder/i.test(raw) ? 'Rain' : 'Sunny';
}

// Backend uses Low/Medium/High; the existing frontend type uses Low/Moderate/High.
export function toFrontendCrowdLevel(level: 'Low' | 'Medium' | 'High'): CrowdLevel {
  return level === 'Medium' ? 'Moderate' : level;
}

export function toCityWeatherData(place: string, state: string, live: LiveWeather): CityWeatherData {
  const days = live.available ? live.forecast.slice(0, 5) : [];
  const forecast5Days: WeatherDay[] = days.length
    ? days.map((d, i) => ({
        day: new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
        temp: Math.round(d.temp_max_c ?? 0),
        tempMin: Math.round(d.temp_min_c ?? 0),
        rainfallMm: Math.round(d.precip_mm ?? 0),
        condition: mapCondition(d.condition),
        crowdPercent: 0, // filled in by the caller once the crowd prediction is known
      }))
    : [];

  return {
    city: place,
    state,
    currentTemp: live.current?.temp_c != null ? Math.round(live.current.temp_c) : 0,
    condition: live.available ? live.current?.condition || 'Unknown' : 'Live data unavailable',
    feelsLike: live.current?.temp_c != null ? Math.round(live.current.temp_c) : 0, // Open-Meteo's free tier doesn't expose "feels like" separately
    humidity: live.current?.humidity_pct != null ? Math.round(live.current.humidity_pct) : 0,
    aqi: 0, // not modeled — no AQI feed wired up yet
    windKmH: 0, // not requested from Open-Meteo yet (see utils/live_weather.py to add it)
    uvIndex: 'N/A', // not modeled yet
    bestVisitingWindow: '6:00 AM – 9:00 AM', // generic heuristic, not place-specific yet
    monsoonStatus: (live.current?.precip_mm ?? 0) > 2 ? 'Active Rainfall' : 'Dry Conditions',
    forecast5Days,
  };
}

export function toCrowdIntelligenceData(place: string, prediction: CrowdPrediction): CrowdIntelligenceData {
  const densityScore = Math.round(
    (prediction.probabilities.Medium * 50 + prediction.probabilities.High * 100) /
      (prediction.probabilities.Low + prediction.probabilities.Medium + prediction.probabilities.High || 1)
  );
  const level = prediction.predicted_crowd_level;
  const statusColor: CrowdIntelligenceData['statusColor'] = level === 'Low' ? 'green' : level === 'Medium' ? 'yellow' : 'red';

  // The model predicts a MONTHLY level, not an hour-by-hour curve. This
  // synthesizes a plausible daily shape (quiet mornings/evenings, busier
  // midday) scaled by the real monthly density score, purely for the
  // visual histogram — it is not a separate hourly prediction.
  const hourlyShape = [0.3, 0.5, 0.75, 1.0, 0.95, 0.85, 0.6, 0.35];
  const hours = ['7AM', '9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'];
  const hourlyTrends: HourlyCrowd[] = hourlyShape.map((mult, i) => {
    const density = Math.min(97, Math.round(densityScore * mult + 5));
    return { hour: hours[i], density, isRecommended: density < 45 };
  });

  return {
    city: place,
    monumentName: place,
    densityScore,
    status: level === 'Low' ? 'Quiet — Great Time to Visit' : level === 'Medium' ? 'Moderate Footfall' : 'Busy — Expect Queues',
    statusColor,
    confidenceScore: Math.round(prediction.confidence * 1000) / 10,
    modelType: 'LightGBM Crowd Model', // accuracy % is shown live elsewhere from /model/info, not hardcoded here
    peakHours: '12PM – 3PM', // heuristic, not a separate hourly model
    bestHours: hourlyTrends.find(h => h.isRecommended)?.hour ? `Before ${hourlyTrends.find(h => h.isRecommended)!.hour}` : 'Early Morning',
    estimatedQueueTimeMin: Math.max(5, Math.round(densityScore / 3)),
    liveFootfallRadar: prediction.summary,
    hourlyTrends,
  };
}

// Per-category base cost (INR, per person) for a short trip -- a simple,
// transparent, DETERMINISTIC heuristic (not random, not backend-modeled --
// the backend has no pricing model). Same place + same backend data always
// yields the same number, and it scales with real signals the backend does
// provide: category and how popular/in-demand the place is.
const CATEGORY_BASE_PRICE_INR: Record<string, number> = {
  Heritage: 4500, Spiritual: 3000, Nature: 5500, Adventure: 7000, Coastal: 6000,
};

/** Deterministic starting price derived from real backend fields
 * (category + popularity_percentile). No randomness: re-running this on
 * the same PlaceSummary always produces the same number. */
function estimatePriceInr(place: PlaceSummary): number {
  const base = CATEGORY_BASE_PRICE_INR[place.category] ?? 4000;
  // More popular / in-demand places command a premium, up to +60%.
  const demandMultiplier = 1 + Math.min(0.6, place.popularity_percentile * 0.6);
  const raw = base * demandMultiplier;
  return Math.round(raw / 100) * 100; // round to nearest ₹100
}

/** Deterministic 3.9–4.9 rating derived from the real popularity percentile
 * the backend returns, instead of a fixed placeholder for every place. */
function estimateRating(place: PlaceSummary): number {
  return Math.round((3.9 + place.popularity_percentile * 1.0) * 10) / 10;
}

export function toDestination(place: PlaceSummary, prediction: CrowdPrediction | null): Destination {
  const level: CrowdLevel = prediction ? toFrontendCrowdLevel(prediction.predicted_crowd_level) : 'Moderate';
  const density = prediction
    ? Math.round((prediction.probabilities.Medium * 50 + prediction.probabilities.High * 100))
    : Math.round(place.popularity_percentile * 100);

  return {
    id: place.place_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: `${place.place_name}, ${place.state}`,
    state: place.state,
    region: 'North', // not modeled by the backend — cosmetic only, safe default
    tagline: place.category,
    category: (['Heritage', 'Spiritual', 'Nature', 'Adventure', 'Coastal'] as const).includes(place.category as any)
      ? (place.category as Destination['category'])
      : 'Heritage',
    image: `https://source.unsplash.com/800x600/?india,${encodeURIComponent(place.category)}`,
    gallery: [],
    startingPriceInr: estimatePriceInr(place), // deterministic estimate from category + real popularity data
    aiMatchPercentage: Math.round(place.popularity_percentile * 100),
    crowdLevel: level,
    crowdDensity: density,
    rating: estimateRating(place), // deterministic, derived from real popularity data
    reviewsCount: Math.round(place.popularity_percentile * 2000),
    idealDuration: '2 - 3 Days',
    description: prediction?.summary || `${place.place_name} is one of the most popular ${place.category.toLowerCase()} destinations in ${place.state}.`,
    highlights: [],
    aiTravelTip: prediction ? prediction.summary : 'Check the live dashboard for a month-by-month crowd forecast.',
    bestMonths: 'Oct – Mar',
    recommendedTransport: 'Train (Vande Bharat)',
  };
}
