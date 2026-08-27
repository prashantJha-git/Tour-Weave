export type CrowdLevel = 'Low' | 'Moderate' | 'High';

export type TransportMode = 'Flight' | 'Train (Vande Bharat)' | 'Luxury Bus' | 'Private Cab';

export type CrowdPreference = 'Avoid Crowds' | 'Standard' | 'Festival Explorer';

export interface WeatherDay {
  day: string;
  temp: number;
  tempMin: number;
  rainfallMm: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Misty' | 'Clear Sky';
  crowdPercent: number;
}

export interface CityWeatherData {
  city: string;
  state: string;
  currentTemp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  aqi: number;
  windKmH: number;
  uvIndex: string;
  bestVisitingWindow: string;
  monsoonStatus: string;
  forecast5Days: WeatherDay[];
}

export interface HourlyCrowd {
  hour: string;
  density: number; // 0 to 100
  isRecommended: boolean;
}

export interface CrowdIntelligenceData {
  city: string;
  monumentName: string;
  densityScore: number;
  status: string;
  statusColor: 'green' | 'yellow' | 'red';
  confidenceScore: number; // e.g. 94.6
  modelType: string; // e.g. "LightGBM + Historical Footfall & Festival Calendar"
  peakHours: string;
  bestHours: string;
  estimatedQueueTimeMin: number;
  liveFootfallRadar: string;
  hourlyTrends: HourlyCrowd[];
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Himalayas' | 'Coastal';
  tagline: string;
  category: 'Heritage' | 'Spiritual' | 'Nature' | 'Adventure' | 'Coastal';
  image: string;
  gallery: string[];
  startingPriceInr: number;
  aiMatchPercentage: number;
  crowdLevel: CrowdLevel;
  crowdDensity: number;
  rating: number;
  reviewsCount: number;
  idealDuration: string;
  description: string;
  highlights: string[];
  aiTravelTip: string;
  bestMonths: string;
  recommendedTransport: TransportMode;
}

export interface Activity {
  time: string;
  title: string;
  location: string;
  description: string;
  crowdPrediction: '🟢 Low Crowd' | '🟡 Moderate' | '🔴 Peak Rush';
  modeOfTransit: string;
  smartTip: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  weatherSummary: string;
  activities: Activity[];
}

export interface GeneratedItinerary {
  id: string;
  destination: string;
  state: string;
  transportMode: TransportMode;
  crowdPreference: CrowdPreference;
  dateRange: string;
  totalDays: number;
  estimatedCostInr: number;
  aiMatchReason: string;
  crowdSavedPercentage: number;
  days: ItineraryDay[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  tripTitle: string;
  rating: number;
  date: string;
  avatar: string;
  review: string;
  verifiedRoute: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: 'Spiritual Trails' | 'Heritage & Palaces' | 'Coastal Escapes' | 'Himalayan Treks';
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  image: string;
  excerpt: string;
  fullBody?: string[];
}

export interface HeritageGalleryItem {
  id: string;
  title: string;
  location: string;
  image: string;
  description: string;
  destinationId?: string;
  cityKey?: string;
}
