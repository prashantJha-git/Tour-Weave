import {
  CityWeatherData,
  CrowdIntelligenceData,
  Destination,
  BlogPost,
  Testimonial,
  HeritageGalleryItem,
  GeneratedItinerary
} from '../types';

export const CITIES_DATA: { [key: string]: { weather: CityWeatherData; crowd: CrowdIntelligenceData } } = {
  'Jaipur': {
    weather: {
      city: 'Jaipur',
      state: 'Rajasthan',
      currentTemp: 26,
      condition: 'Pleasant & Sunny',
      feelsLike: 27,
      humidity: 38,
      aqi: 72,
      windKmH: 11,
      uvIndex: 'Moderate (4)',
      bestVisitingWindow: '6:30 AM - 10:30 AM',
      monsoonStatus: 'Dry & Clear Skies',
      forecast5Days: [
        { day: 'Mon', temp: 26, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 28 },
        { day: 'Tue', temp: 27, tempMin: 17, rainfallMm: 0, condition: 'Sunny', crowdPercent: 35 },
        { day: 'Wed', temp: 28, tempMin: 18, rainfallMm: 0, condition: 'Partly Cloudy', crowdPercent: 42 },
        { day: 'Thu', temp: 25, tempMin: 15, rainfallMm: 2, condition: 'Clear Sky', crowdPercent: 24 },
        { day: 'Fri', temp: 26, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 55 },
      ]
    },
    crowd: {
      city: 'Jaipur',
      monumentName: 'Amber Fort & Hawa Mahal',
      densityScore: 24,
      status: 'Optimal Off-Peak Window',
      statusColor: 'green',
      confidenceScore: 95.4,
      modelType: 'LightGBM Regressor + Heritage Ticketing Live Stream',
      peakHours: '3:30 PM - 6:30 PM',
      bestHours: '6:00 AM - 9:30 AM',
      estimatedQueueTimeMin: 8,
      liveFootfallRadar: 'Low congestion across courtyard & Sheesh Mahal',
      hourlyTrends: [
        { hour: '6 AM', density: 12, isRecommended: true },
        { hour: '8 AM', density: 22, isRecommended: true },
        { hour: '10 AM', density: 48, isRecommended: false },
        { hour: '12 PM', density: 72, isRecommended: false },
        { hour: '2 PM', density: 64, isRecommended: false },
        { hour: '4 PM', density: 88, isRecommended: false },
        { hour: '6 PM', density: 70, isRecommended: false },
        { hour: '8 PM', density: 34, isRecommended: true },
      ]
    }
  },
  'Varanasi': {
    weather: {
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      currentTemp: 24,
      condition: 'Misty Ganges Morning',
      feelsLike: 25,
      humidity: 52,
      aqi: 88,
      windKmH: 8,
      uvIndex: 'Low (3)',
      bestVisitingWindow: '5:15 AM - 8:30 AM (Dawn Aarti)',
      monsoonStatus: 'Gentle River Breeze',
      forecast5Days: [
        { day: 'Mon', temp: 24, tempMin: 15, rainfallMm: 0, condition: 'Misty', crowdPercent: 32 },
        { day: 'Tue', temp: 25, tempMin: 16, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 38 },
        { day: 'Wed', temp: 26, tempMin: 16, rainfallMm: 1, condition: 'Partly Cloudy', crowdPercent: 44 },
        { day: 'Thu', temp: 24, tempMin: 14, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 30 },
        { day: 'Fri', temp: 25, tempMin: 15, rainfallMm: 0, condition: 'Sunny', crowdPercent: 62 },
      ]
    },
    crowd: {
      city: 'Varanasi',
      monumentName: 'Dashashwamedh & Assi Ghats',
      densityScore: 38,
      status: 'Moderate (Aarti Rush Predicted at Dusk)',
      statusColor: 'green',
      confidenceScore: 94.1,
      modelType: 'LightGBM + Lunar Calendar & Pilgrim Flux Matrix',
      peakHours: '5:45 PM - 8:15 PM (Evening Maha Aarti)',
      bestHours: '5:00 AM - 7:30 AM (Subah-e-Banaras)',
      estimatedQueueTimeMin: 12,
      liveFootfallRadar: 'Smooth flow on northern ghats; boat access prompt',
      hourlyTrends: [
        { hour: '5 AM', density: 25, isRecommended: true },
        { hour: '7 AM', density: 35, isRecommended: true },
        { hour: '10 AM', density: 40, isRecommended: false },
        { hour: '1 PM', density: 30, isRecommended: true },
        { hour: '4 PM', density: 58, isRecommended: false },
        { hour: '6 PM', density: 92, isRecommended: false },
        { hour: '8 PM', density: 65, isRecommended: false },
        { hour: '10 PM', density: 20, isRecommended: true },
      ]
    }
  },
  'Munnar': {
    weather: {
      city: 'Munnar',
      state: 'Kerala',
      currentTemp: 18,
      condition: 'Crisp Highland Mist',
      feelsLike: 17,
      humidity: 78,
      aqi: 22,
      windKmH: 14,
      uvIndex: 'Moderate (5)',
      bestVisitingWindow: '7:00 AM - 11:30 AM',
      monsoonStatus: 'Gentle Emerald Showers',
      forecast5Days: [
        { day: 'Mon', temp: 18, tempMin: 12, rainfallMm: 4, condition: 'Misty', crowdPercent: 20 },
        { day: 'Tue', temp: 19, tempMin: 13, rainfallMm: 2, condition: 'Partly Cloudy', crowdPercent: 25 },
        { day: 'Wed', temp: 17, tempMin: 11, rainfallMm: 8, condition: 'Rain', crowdPercent: 18 },
        { day: 'Thu', temp: 19, tempMin: 12, rainfallMm: 1, condition: 'Clear Sky', crowdPercent: 22 },
        { day: 'Fri', temp: 20, tempMin: 13, rainfallMm: 0, condition: 'Sunny', crowdPercent: 40 },
      ]
    },
    crowd: {
      city: 'Munnar',
      monumentName: 'Eravikulam & Tea Plantations',
      densityScore: 19,
      status: 'Serene & Low Density',
      statusColor: 'green',
      confidenceScore: 96.8,
      modelType: 'LightGBM + Western Ghats Eco-Tourism Influx',
      peakHours: '11:00 AM - 2:30 PM',
      bestHours: '6:30 AM - 9:30 AM',
      estimatedQueueTimeMin: 5,
      liveFootfallRadar: 'Wide open nature trails; zero vehicle bottlenecks',
      hourlyTrends: [
        { hour: '6 AM', density: 8, isRecommended: true },
        { hour: '8 AM', density: 18, isRecommended: true },
        { hour: '10 AM', density: 42, isRecommended: false },
        { hour: '12 PM', density: 62, isRecommended: false },
        { hour: '2 PM', density: 50, isRecommended: false },
        { hour: '4 PM', density: 35, isRecommended: true },
        { hour: '6 PM', density: 15, isRecommended: true },
        { hour: '8 PM', density: 5, isRecommended: true },
      ]
    }
  },
  'Leh-Ladakh': {
    weather: {
      city: 'Leh-Ladakh',
      state: 'Ladakh',
      currentTemp: 11,
      condition: 'Crisp Azure Skies',
      feelsLike: 9,
      humidity: 24,
      aqi: 14,
      windKmH: 18,
      uvIndex: 'High (8 - High Altitude)',
      bestVisitingWindow: '8:30 AM - 3:00 PM',
      monsoonStatus: 'Dry Rain-Shadow Valley',
      forecast5Days: [
        { day: 'Mon', temp: 11, tempMin: 1, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 15 },
        { day: 'Tue', temp: 12, tempMin: 2, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 18 },
        { day: 'Wed', temp: 10, tempMin: 0, rainfallMm: 0, condition: 'Sunny', crowdPercent: 20 },
        { day: 'Thu', temp: 11, tempMin: 1, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 16 },
        { day: 'Fri', temp: 13, tempMin: 3, rainfallMm: 0, condition: 'Sunny', crowdPercent: 28 },
      ]
    },
    crowd: {
      city: 'Leh-Ladakh',
      monumentName: 'Pangong Tso & Thiksey Gompa',
      densityScore: 16,
      status: 'Pristine Low Footfall',
      statusColor: 'green',
      confidenceScore: 97.2,
      modelType: 'LightGBM + Border Road Authority Permitting Sensors',
      peakHours: '12:30 PM - 2:30 PM',
      bestHours: '7:00 AM - 10:30 AM',
      estimatedQueueTimeMin: 0,
      liveFootfallRadar: 'Clear mountain passes; serene monastery spaces',
      hourlyTrends: [
        { hour: '6 AM', density: 5, isRecommended: true },
        { hour: '8 AM', density: 14, isRecommended: true },
        { hour: '10 AM', density: 28, isRecommended: true },
        { hour: '12 PM', density: 45, isRecommended: false },
        { hour: '2 PM', density: 40, isRecommended: false },
        { hour: '4 PM', density: 22, isRecommended: true },
        { hour: '6 PM', density: 10, isRecommended: true },
        { hour: '8 PM', density: 2, isRecommended: true },
      ]
    }
  },
  'Goa': {
    weather: {
      city: 'Goa',
      state: 'Goa',
      currentTemp: 29,
      condition: 'Tropical Coastal Sun',
      feelsLike: 32,
      humidity: 68,
      aqi: 45,
      windKmH: 16,
      uvIndex: 'High (7)',
      bestVisitingWindow: '4:30 PM - 7:30 PM (Sunset & Sea Breeze)',
      monsoonStatus: 'Gentle Ocean Tides',
      forecast5Days: [
        { day: 'Mon', temp: 29, tempMin: 22, rainfallMm: 0, condition: 'Sunny', crowdPercent: 45 },
        { day: 'Tue', temp: 30, tempMin: 23, rainfallMm: 0, condition: 'Sunny', crowdPercent: 48 },
        { day: 'Wed', temp: 29, tempMin: 22, rainfallMm: 1, condition: 'Partly Cloudy', crowdPercent: 52 },
        { day: 'Thu', temp: 31, tempMin: 24, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 40 },
        { day: 'Fri', temp: 30, tempMin: 23, rainfallMm: 0, condition: 'Sunny', crowdPercent: 78 },
      ]
    },
    crowd: {
      city: 'Goa',
      monumentName: 'Palolem & Fort Aguada',
      densityScore: 54,
      status: 'Moderate Afternoon Flow',
      statusColor: 'yellow',
      confidenceScore: 93.8,
      modelType: 'LightGBM + Coastal Ferry & Beach Activity Telemetry',
      peakHours: '4:30 PM - 8:30 PM',
      bestHours: '6:30 AM - 10:00 AM',
      estimatedQueueTimeMin: 15,
      liveFootfallRadar: 'South Goa peaceful; North Goa beaches buzzing',
      hourlyTrends: [
        { hour: '6 AM', density: 10, isRecommended: true },
        { hour: '8 AM', density: 25, isRecommended: true },
        { hour: '10 AM', density: 48, isRecommended: false },
        { hour: '12 PM', density: 50, isRecommended: false },
        { hour: '2 PM', density: 45, isRecommended: false },
        { hour: '4 PM', density: 75, isRecommended: false },
        { hour: '6 PM', density: 88, isRecommended: false },
        { hour: '8 PM', density: 70, isRecommended: false },
      ]
    }
  },
  'Udaipur': {
    weather: {
      city: 'Udaipur',
      state: 'Rajasthan',
      currentTemp: 25,
      condition: 'Serene Lake Sun',
      feelsLike: 25,
      humidity: 42,
      aqi: 60,
      windKmH: 9,
      uvIndex: 'Moderate (5)',
      bestVisitingWindow: '7:30 AM - 11:00 AM & Sunset',
      monsoonStatus: 'Calm Waters & Clear Blue Horizon',
      forecast5Days: [
        { day: 'Mon', temp: 25, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 30 },
        { day: 'Tue', temp: 26, tempMin: 17, rainfallMm: 0, condition: 'Sunny', crowdPercent: 36 },
        { day: 'Wed', temp: 26, tempMin: 16, rainfallMm: 0, condition: 'Partly Cloudy', crowdPercent: 38 },
        { day: 'Thu', temp: 24, tempMin: 15, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 28 },
        { day: 'Fri', temp: 25, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 58 },
      ]
    },
    crowd: {
      city: 'Udaipur',
      monumentName: 'City Palace & Lake Pichola',
      densityScore: 31,
      status: 'Low-to-Moderate (Morning Boat Window Recommended)',
      statusColor: 'green',
      confidenceScore: 95.9,
      modelType: 'LightGBM + Mewar Palace Heritage Footfall AI',
      peakHours: '4:00 PM - 7:00 PM',
      bestHours: '8:00 AM - 11:00 AM',
      estimatedQueueTimeMin: 9,
      liveFootfallRadar: 'Minimal queue at Jagdish Mandir and Lake Ghats',
      hourlyTrends: [
        { hour: '6 AM', density: 10, isRecommended: true },
        { hour: '8 AM', density: 25, isRecommended: true },
        { hour: '10 AM', density: 45, isRecommended: true },
        { hour: '12 PM', density: 60, isRecommended: false },
        { hour: '2 PM', density: 55, isRecommended: false },
        { hour: '4 PM', density: 80, isRecommended: false },
        { hour: '6 PM', density: 85, isRecommended: false },
        { hour: '8 PM', density: 40, isRecommended: true },
      ]
    }
  },
  'Agra': {
    weather: {
      city: 'Agra',
      state: 'Uttar Pradesh',
      currentTemp: 27,
      condition: 'Clear Marble Dawn',
      feelsLike: 28,
      humidity: 40,
      aqi: 78,
      windKmH: 9,
      uvIndex: 'Moderate (5)',
      bestVisitingWindow: '5:45 AM - 8:30 AM (Taj Sunrise)',
      monsoonStatus: 'Dry & Clear Views',
      forecast5Days: [
        { day: 'Mon', temp: 27, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 35 },
        { day: 'Tue', temp: 28, tempMin: 17, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 40 },
        { day: 'Wed', temp: 27, tempMin: 16, rainfallMm: 0, condition: 'Sunny', crowdPercent: 45 },
        { day: 'Thu', temp: 26, tempMin: 15, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 32 },
        { day: 'Fri', temp: 28, tempMin: 17, rainfallMm: 0, condition: 'Sunny', crowdPercent: 65 },
      ]
    },
    crowd: {
      city: 'Agra',
      monumentName: 'Taj Mahal & Agra Fort',
      densityScore: 34,
      status: 'Optimal Sunrise Window',
      statusColor: 'green',
      confidenceScore: 96.2,
      modelType: 'LightGBM + ASI Automated Turnstile Data',
      peakHours: '10:00 AM - 3:30 PM',
      bestHours: '5:45 AM - 8:00 AM',
      estimatedQueueTimeMin: 6,
      liveFootfallRadar: 'East Gate turnstiles moving rapidly; quiet reflecting pools',
      hourlyTrends: [
        { hour: '6 AM', density: 15, isRecommended: true },
        { hour: '8 AM', density: 30, isRecommended: true },
        { hour: '10 AM', density: 75, isRecommended: false },
        { hour: '12 PM', density: 85, isRecommended: false },
        { hour: '2 PM', density: 80, isRecommended: false },
        { hour: '4 PM', density: 65, isRecommended: false },
        { hour: '6 PM', density: 25, isRecommended: true },
        { hour: '8 PM', density: 10, isRecommended: true },
      ]
    }
  },
  'Hampi': {
    weather: {
      city: 'Hampi',
      state: 'Karnataka',
      currentTemp: 28,
      condition: 'Warm Golden Breeze',
      feelsLike: 29,
      humidity: 46,
      aqi: 32,
      windKmH: 12,
      uvIndex: 'Moderate (6)',
      bestVisitingWindow: '6:30 AM - 10:00 AM & 4:30 PM Sunset',
      monsoonStatus: 'Gentle Tungabhadra Flow',
      forecast5Days: [
        { day: 'Mon', temp: 28, tempMin: 19, rainfallMm: 0, condition: 'Sunny', crowdPercent: 22 },
        { day: 'Tue', temp: 29, tempMin: 20, rainfallMm: 0, condition: 'Sunny', crowdPercent: 25 },
        { day: 'Wed', temp: 28, tempMin: 19, rainfallMm: 0, condition: 'Clear Sky', crowdPercent: 28 },
        { day: 'Thu', temp: 27, tempMin: 18, rainfallMm: 0, condition: 'Sunny', crowdPercent: 20 },
        { day: 'Fri', temp: 29, tempMin: 20, rainfallMm: 0, condition: 'Sunny', crowdPercent: 42 },
      ]
    },
    crowd: {
      city: 'Hampi',
      monumentName: 'Vittala Temple & Virupaksha',
      densityScore: 22,
      status: 'Low Footfall & Serene Trails',
      statusColor: 'green',
      confidenceScore: 97.0,
      modelType: 'LightGBM + Tungabhadra Coracle & Heritage Entry Log',
      peakHours: '11:30 AM - 3:00 PM',
      bestHours: '6:30 AM - 9:30 AM',
      estimatedQueueTimeMin: 4,
      liveFootfallRadar: 'Wide open boulder terrain; tranquil temple corridors',
      hourlyTrends: [
        { hour: '6 AM', density: 8, isRecommended: true },
        { hour: '8 AM', density: 18, isRecommended: true },
        { hour: '10 AM', density: 38, isRecommended: true },
        { hour: '12 PM', density: 55, isRecommended: false },
        { hour: '2 PM', density: 48, isRecommended: false },
        { hour: '4 PM', density: 32, isRecommended: true },
        { hour: '6 PM', density: 15, isRecommended: true },
        { hour: '8 PM', density: 5, isRecommended: true },
      ]
    }
  },
  'Alleppey': {
    weather: {
      city: 'Alleppey',
      state: 'Kerala',
      currentTemp: 28,
      condition: 'Tropical Backwater Breeze',
      feelsLike: 31,
      humidity: 74,
      aqi: 28,
      windKmH: 13,
      uvIndex: 'Moderate (5)',
      bestVisitingWindow: '7:00 AM - 11:00 AM & Evening Cruise',
      monsoonStatus: 'Calm Canal Waters',
      forecast5Days: [
        { day: 'Mon', temp: 28, tempMin: 23, rainfallMm: 2, condition: 'Partly Cloudy', crowdPercent: 30 },
        { day: 'Tue', temp: 29, tempMin: 24, rainfallMm: 0, condition: 'Sunny', crowdPercent: 34 },
        { day: 'Wed', temp: 28, tempMin: 23, rainfallMm: 3, condition: 'Rain', crowdPercent: 26 },
        { day: 'Thu', temp: 29, tempMin: 24, rainfallMm: 0, condition: 'Sunny', crowdPercent: 32 },
        { day: 'Fri', temp: 30, tempMin: 25, rainfallMm: 0, condition: 'Sunny', crowdPercent: 54 },
      ]
    },
    crowd: {
      city: 'Alleppey',
      monumentName: 'Vembanad Lake & Punnamada Canals',
      densityScore: 29,
      status: 'Peaceful Canal Navigation',
      statusColor: 'green',
      confidenceScore: 95.1,
      modelType: 'LightGBM + Houseboat Harbor IoT Transponders',
      peakHours: '2:00 PM - 5:00 PM',
      bestHours: '7:30 AM - 10:30 AM',
      estimatedQueueTimeMin: 5,
      liveFootfallRadar: 'Smooth embarkation at finishing point jetties',
      hourlyTrends: [
        { hour: '6 AM', density: 10, isRecommended: true },
        { hour: '8 AM', density: 20, isRecommended: true },
        { hour: '10 AM', density: 35, isRecommended: true },
        { hour: '12 PM', density: 50, isRecommended: false },
        { hour: '2 PM', density: 65, isRecommended: false },
        { hour: '4 PM', density: 58, isRecommended: false },
        { hour: '6 PM', density: 24, isRecommended: true },
        { hour: '8 PM', density: 12, isRecommended: true },
      ]
    }
  }
};

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'udaipur-city-of-lakes',
    name: 'Udaipur, Rajasthan',
    state: 'Rajasthan',
    region: 'West',
    tagline: 'The Venice of the East & City of Royal Palaces',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 4999,
    aiMatchPercentage: 96,
    crowdLevel: 'Low',
    crowdDensity: 28,
    rating: 4.9,
    reviewsCount: 1420,
    idealDuration: '3 - 4 Days',
    description: 'Immerse in the regal grandeur of the City of Lakes. Wander through the intricate mirrored courtyards of the City Palace and embark on a golden hour sunset cruise across Lake Pichola.',
    highlights: ['Lake Pichola Boat Cruise', 'City Palace Royal Quarters', 'Saheliyon-ki-Bari Fountains', 'Rooftop Rajasthani Dining'],
    aiTravelTip: 'AI predicts Lake Pichola boat tickets have 45% less queue between 8:30 AM - 10:00 AM.',
    bestMonths: 'October - March',
    recommendedTransport: 'Train (Vande Bharat)'
  },
  {
    id: 'munnar-tea-valleys',
    name: 'Munnar, Kerala',
    state: 'Kerala',
    region: 'South',
    tagline: 'Rolling Emerald Tea Hills & Misty Waterfalls',
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 3999,
    aiMatchPercentage: 94,
    crowdLevel: 'Low',
    crowdDensity: 19,
    rating: 4.8,
    reviewsCount: 980,
    idealDuration: '3 Days',
    description: 'Breathe in the mountain air of Kerala’s lush spice-scented highlands. Endless velvet tea plantations, cascading waterfalls, and the rare Nilgiri Tahr at Eravikulam National Park.',
    highlights: ['Kolukkumalai Sunrise Jeep Safari', 'Tea Factory Heritage Tour', 'Mattupetty Dam Boating', 'Spice Garden Aromatics'],
    aiTravelTip: 'Our micro-climate model forecasts clear skies in early mornings with soft mist rolling in by 2 PM.',
    bestMonths: 'September - May',
    recommendedTransport: 'Flight'
  },
  {
    id: 'leh-ladakh-high-passes',
    name: 'Leh-Ladakh, Himalayas',
    state: 'Ladakh',
    region: 'Himalayas',
    tagline: 'The Land of High Passes & Azure Alpine Lakes',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85'
    ],
    startingPriceInr: 8999,
    aiMatchPercentage: 98,
    crowdLevel: 'Low',
    crowdDensity: 16,
    rating: 5.0,
    reviewsCount: 2150,
    idealDuration: '6 - 7 Days',
    description: 'A cinematic high-altitude plateau framed by rugged snow-capped peaks, ancient Buddhist Gompas, surreal Nubra sand dunes, and the ethereal color-shifting waters of Pangong Tso.',
    highlights: ['Pangong Lake Sunset Camp', 'Nubra Valley Double-Humped Camels', 'Khardung La Pass Crossing', 'Thiksey Monastery Chants'],
    aiTravelTip: 'AI acclimatization schedule recommends Day 1 & 2 resting in Leh before crossing Khardung La.',
    bestMonths: 'May - October',
    recommendedTransport: 'Flight'
  },
  {
    id: 'varanasi-spiritual-ghats',
    name: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    region: 'North',
    tagline: 'The World’s Oldest Living City of Eternal Light',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 2999,
    aiMatchPercentage: 93,
    crowdLevel: 'Moderate',
    crowdDensity: 38,
    rating: 4.9,
    reviewsCount: 3100,
    idealDuration: '3 Days',
    description: 'Experience the mystical pulse of Kashi. Watch dawn break over 84 ancient ghats during a silent wooden boat ride and witness the hypnotic synchrony of the evening Ganga Aarti.',
    highlights: ['Sunrise Wooden Boat on Ganges', 'Dashashwamedh Ghat Evening Aarti', 'Kashi Vishwanath Corridor', 'Banarasi Silk Weaving Lanes'],
    aiTravelTip: 'Book wooden boat rides at 5:15 AM at Assi Ghat for 3x less crowd and crystal golden hour lighting.',
    bestMonths: 'October - April',
    recommendedTransport: 'Train (Vande Bharat)'
  },
  {
    id: 'hampi-vijayanagara-ruins',
    name: 'Hampi, Karnataka',
    state: 'Karnataka',
    region: 'South',
    tagline: 'UNESCO Bouldered Wonder of the Vijayanagara Empire',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 3499,
    aiMatchPercentage: 91,
    crowdLevel: 'Low',
    crowdDensity: 22,
    rating: 4.8,
    reviewsCount: 840,
    idealDuration: '3 Days',
    description: 'A landscape of surreal granite monoliths, centuries-old Dravidian temple complexes, the stone chariot of Vittala, and serene coracle boat rides along the Tungabhadra River.',
    highlights: ['Vittala Temple Musical Pillars', 'Virupaksha Sunset Viewpoint', 'Coracle Boat Ride on Tungabhadra', 'Sanapur Lake Bouldering'],
    aiTravelTip: 'Bicycle rentals at 7:00 AM enable crowd-free exploration of the Royal Enclosure before heat peaks.',
    bestMonths: 'November - February',
    recommendedTransport: 'Train (Vande Bharat)'
  },
  {
    id: 'goa-south-coastal-bliss',
    name: 'South Goa Beaches',
    state: 'Goa',
    region: 'Coastal',
    tagline: 'Golden Sands, Portuguese Villas & Coastal Serenity',
    category: 'Coastal',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 5499,
    aiMatchPercentage: 92,
    crowdLevel: 'Moderate',
    crowdDensity: 42,
    rating: 4.7,
    reviewsCount: 1650,
    idealDuration: '4 - 5 Days',
    description: 'Ditch the overcrowded party strips for the serene, swaying palm coves of Palolem, Agonda, and historic heritage mansions of Fontainhas in Panjim.',
    highlights: ['Palolem Dolphin Kayaking', 'Cabo de Rama Cliff Sunset', 'Fontainhas Latin Quarter Walk', 'Authentic Goan Thali Trails'],
    aiTravelTip: 'South Goa beaches experience 60% lower tourist density compared to Baga/Calangute during peak season.',
    bestMonths: 'October - May',
    recommendedTransport: 'Flight'
  },
  {
    id: 'jaipur-pink-city-heritage',
    name: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    region: 'North',
    tagline: 'The Legendary Pink City of Royal Fortresses & Bazaars',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 3999,
    aiMatchPercentage: 96,
    crowdLevel: 'Moderate',
    crowdDensity: 35,
    rating: 4.9,
    reviewsCount: 2890,
    idealDuration: '3 - 4 Days',
    description: 'Explore the majesty of the Pink City. From Amber Fort’s mirror halls to the honeycomb facade of Hawa Mahal and astronomical sundials at Jantar Mantar.',
    highlights: ['Amber Fort Dawn Entry', 'Hawa Mahal View Terrace', 'Jantar Mantar Sundials', 'Johari Bazaar Gems'],
    aiTravelTip: 'Arriving at Amber Fort before 7:15 AM saves an average of 45 minutes in ticketing lines.',
    bestMonths: 'October - March',
    recommendedTransport: 'Train (Vande Bharat)'
  },
  {
    id: 'agra-taj-mahal-wonder',
    name: 'Agra, Uttar Pradesh',
    state: 'Uttar Pradesh',
    region: 'North',
    tagline: 'Home of the Sublime Taj Mahal & Mughal Splendor',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 2999,
    aiMatchPercentage: 98,
    crowdLevel: 'Moderate',
    crowdDensity: 34,
    rating: 4.9,
    reviewsCount: 4200,
    idealDuration: '2 - 3 Days',
    description: 'Witness the iconic monument of eternal love bathed in sunrise hues, alongside the monumental Agra Red Fort and Akbar’s imperial city of Fatehpur Sikri.',
    highlights: ['Taj Mahal East Gate Sunrise', 'Agra Red Fort Ramparts', 'Mehtab Bagh Twilight', 'Fatehpur Sikri Victory Gate'],
    aiTravelTip: 'Entering Taj Mahal via East Gate at 5:45 AM avoids the large 9:00 AM bus tours.',
    bestMonths: 'October - March',
    recommendedTransport: 'Train (Vande Bharat)'
  },
  {
    id: 'alleppey-backwaters-serenity',
    name: 'Alleppey, Kerala',
    state: 'Kerala',
    region: 'South',
    tagline: 'Emerald Lagoons, Kettuvallam Houseboats & Spice Canals',
    category: 'Coastal',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=80'
    ],
    startingPriceInr: 4499,
    aiMatchPercentage: 95,
    crowdLevel: 'Low',
    crowdDensity: 24,
    rating: 4.9,
    reviewsCount: 1840,
    idealDuration: '3 Days',
    description: 'Cruise through emerald palm-fringed backwaters aboard an eco-luxe houseboat. Sample authentic Malabar pearl spot fish and observe tranquil village life along Vembanad Lake.',
    highlights: ['Luxury Houseboat Overnight Stay', 'Punnamada Kayak Canals', 'Kuttanad Below-Sea Farming', 'Ayurvedic Herb Massages'],
    aiTravelTip: 'AI recommends early morning coracle or canoe rides in small tributary canals for 70% quieter wildlife spotting.',
    bestMonths: 'September - March',
    recommendedTransport: 'Train (Vande Bharat)'
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Ananya Sharma',
    location: 'Bengaluru, Karnataka',
    tripTitle: 'Leh-Ladakh Solo Odyssey (6 Days)',
    rating: 5,
    date: 'February 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    review: 'The crowd prediction algorithm was mind-blowing! Tour-Weave directed me to Thiksey Monastery at 6:15 AM—I had the morning prayer chanting almost entirely to myself before the tour buses arrived. Truly spiritual and seamless.',
    verifiedRoute: 'Vistara Flight + High-Altitude AI Route Planner'
  },
  {
    id: 'test-2',
    name: 'Rohan & Sunita Mehta',
    location: 'Mumbai, Maharashtra',
    tripTitle: 'Royal Rajasthan Heritage Circuit (5 Days)',
    rating: 5,
    date: 'January 2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    review: 'Our Vande Bharat express connection and heritage hotel bookings were flawlessly synchronized with weather forecasts. Udaipur felt like a dream. The estimated queue times saved us at least 2 hours at City Palace.',
    verifiedRoute: 'Vande Bharat Express + Heritage Chauffeur'
  },
  {
    id: 'test-3',
    name: 'Dr. Arvind Swamy',
    location: 'Chennai, Tamil Nadu',
    tripTitle: 'Munnar & Alleppey Rejuvenation (4 Days)',
    rating: 5,
    date: 'March 2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    review: 'The rain forecast was accurate down to the 2-hour window. We enjoyed tea plantation walks right before the afternoon showers rolled in, then relaxed inside our luxury spice villa. Outstanding AI craftsmanship.',
    verifiedRoute: 'Kochi Airport + Eco-Electric Cab'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Sacred Dawn: A Mindful Guide to Varanasi’s Ancient Ghats',
    category: 'Spiritual Trails',
    readTime: '5 Min Read',
    date: 'May 12, 2026',
    author: 'Kavita Iyer',
    authorRole: 'Cultural Heritage Researcher',
    image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    excerpt: 'How waking up at 4:45 AM reveals the soul of Kashi before the sound of bells and tourist boats fills the holy Ganges.'
  },
  {
    id: 'blog-2',
    title: 'Inside the Living Forts of Rajasthan: Beyond the Royal Postcards',
    category: 'Heritage & Palaces',
    readTime: '7 Min Read',
    date: 'May 06, 2026',
    author: 'Vikramaditya Rathore',
    authorRole: 'Architectural Historian',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Discover secret havelis, frescoed ceilings in Shekhawati, and how predictive ticketing avoids the midday desert heat.'
  },
  {
    id: 'blog-3',
    title: 'Secret Coves & Spice Plantations: Unlocking South Goa’s Serenity',
    category: 'Coastal Escapes',
    readTime: '4 Min Read',
    date: 'Apr 28, 2026',
    author: 'Zoya Fernandes',
    authorRole: 'Goan Travel Editor',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Leave behind the crowded shacks and take the scenic coastal train towards the tranquil backwater estuaries of Canacona.'
  }
];

export const HERITAGE_GALLERY: HeritageGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Taj Mahal at First Light',
    location: 'Agra, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    description: 'The sublime ivory-white marble mausoleum on the right bank of the Yamuna River, best experienced at sunrise.',
    destinationId: 'agra-taj-mahal-wonder',
    cityKey: 'Agra'
  },
  {
    id: 'gal-2',
    title: 'Amber Fort Royal Ramparts',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
    description: 'Majestic hilltop fortress featuring sweeping ramparts, courtyards, and the glittering Sheesh Mahal mirror palace.',
    destinationId: 'jaipur-pink-city-heritage',
    cityKey: 'Jaipur'
  },
  {
    id: 'gal-3',
    title: 'Pangong High Altitude Pass',
    location: 'Leh-Ladakh, Himalayas',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80',
    description: 'High altitude mountain road passing azure glacier-fed lakes and ancient gompas in the Trans-Himalayas.',
    destinationId: 'leh-ladakh-high-passes',
    cityKey: 'Leh-Ladakh'
  },
  {
    id: 'gal-4',
    title: 'Goan Coastal Wanderer Van',
    location: 'Goa, Coastal India',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
    description: 'Iconic retro travel van parked along the golden sands and swaying palms of South Goa beaches.',
    destinationId: 'goa-south-coastal-bliss',
    cityKey: 'Goa'
  },
  {
    id: 'gal-5',
    title: 'Kerala Backwaters Houseboat',
    location: 'Alleppey, Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    description: 'Gliding along serene palm-fringed canals in a traditional eco-wooden Kettuvallam through emerald lagoons.',
    destinationId: 'alleppey-backwaters-serenity',
    cityKey: 'Alleppey'
  },
  {
    id: 'gal-6',
    title: 'Stone Chariot of Hampi',
    location: 'Hampi, Karnataka',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
    description: 'An iconic 16th-century Vijayanagara monolithic shrine dedicated to Garuda amidst giant granite boulder landscapes.',
    destinationId: 'hampi-vijayanagara-ruins',
    cityKey: 'Hampi'
  }
];

export const SAMPLE_GENERATED_ITINERARIES: { [key: string]: GeneratedItinerary } = {
  'Jaipur': {
    id: 'itin-jaipur-ai',
    destination: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    transportMode: 'Train (Vande Bharat)',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Oct 14 - Oct 17, 2026',
    totalDays: 3,
    estimatedCostInr: 11499,
    aiMatchReason: '96% Match: Selected for low seasonal rainfall, Vande Bharat connectivity, and optimized early morning palace entry slots.',
    crowdSavedPercentage: 42,
    days: [
      {
        dayNumber: 1,
        title: 'Dawn at Amber & Royal Sheesh Mahal',
        theme: 'Pink City Royal Splendor',
        weatherSummary: '26°C Sunny, Crisp morning breeze',
        activities: [
          {
            time: '06:30 AM',
            title: 'Early Access Entry to Amber Fort',
            location: 'Amer Hilltop',
            description: 'Beat the tour bus rush by entering right at opening time. Marvel at the Mirror Palace (Sheesh Mahal) with tranquil acoustics.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Chauffeur / Electric Vehicle',
            smartTip: 'AI Alert: Arriving before 7:15 AM saves an average of 45 minutes in ticketing lines.'
          },
          {
            time: '11:00 AM',
            title: 'Panna Meena ka Kund Stepwell',
            location: 'Amer Village',
            description: 'Symmetrical geometric stairwells built in the 16th century with quiet shady corners and authentic Rajasthani architecture.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: '5 min walk',
            smartTip: 'Sunlight hits the southern steps at 11:30 AM for the sharpest architectural photographs.'
          },
          {
            time: '04:30 PM',
            title: 'Nahargarh Fort Sunset Panorama',
            location: 'Aravalli Hills',
            description: 'Gaze over the entire sprawling Pink City bathed in amber twilight as the palace lights begin to glow.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Hill Scenic Cab',
            smartTip: 'Reserved rooftop tea table recommended to avoid the evening wall crowd.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Astronomical Marvels & Textile Heritage',
        theme: 'Science, Silks & Jantar Mantar',
        weatherSummary: '27°C Clear Blue Skies',
        activities: [
          {
            time: '08:00 AM',
            title: 'Jantar Mantar UNESCO Observatory',
            location: 'City Centre',
            description: 'Walk through the giant stone sundial and astronomical instruments before mid-day heat and tour groups gather.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Pink City Metro / Cab',
            smartTip: 'Use audio-guide QR #4 to learn how the Samrat Yantra measures time within 2 seconds.'
          },
          {
            time: '01:30 PM',
            title: 'Traditional Dal Baati Churma Lunch & Block Print Studio',
            location: 'Old Walled City',
            description: 'Savor organic ghee-laden cuisine followed by a hands-on natural indigo block-printing masterclass with master artisans.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Cycle Rickshaw',
            smartTip: 'Authentic GI-tagged Sanganeri prints available with government artisan certification.'
          },
          {
            time: '06:00 PM',
            title: 'Hawa Mahal Golden Hour Façade & Café',
            location: 'Badi Choupad',
            description: 'View the 953 honeycomb windows from the opposite heritage café terrace with masala chai in hand.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Walking',
            smartTip: 'Best angle for photography is the 3rd-floor terrace of Wind View Cafe at 6:15 PM.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Hidden Havelis & Artisan Souks',
        theme: 'Culinary Trails & Royal Gardens',
        weatherSummary: '25°C Pleasant & Mild',
        activities: [
          {
            time: '07:30 AM',
            title: 'Sisodia Rani Ka Bagh Gardens',
            location: 'Agra Road',
            description: 'Terraced Mughal-style gardens with fountains, pavilions, and murals depicting Lord Krishna and Radha.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Cab',
            smartTip: 'Extremely peaceful morning sanctuary away from city traffic.'
          },
          {
            time: '03:00 PM',
            title: 'Johari Bazaar & Bapu Bazaar Craft Walk',
            location: 'Old City Gates',
            description: 'Handpicked lac bangles, mojaris, and kundan jewelry from multigenerational shopkeepers.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Heritage Walk',
            smartTip: 'Tour-Weave verified merchants ensure authentic gemstones and hallmark certifications.'
          }
        ]
      }
    ]
  },
  'Agra': {
    id: 'itin-agra-ai',
    destination: 'Agra, Uttar Pradesh',
    state: 'Uttar Pradesh',
    transportMode: 'Train (Vande Bharat)',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Nov 10 - Nov 13, 2026',
    totalDays: 3,
    estimatedCostInr: 9999,
    aiMatchReason: '98% Match: Optimized for sunrise gate access at the Taj Mahal, Yamuna riverfront twilight, and UNESCO heritage forts.',
    crowdSavedPercentage: 48,
    days: [
      {
        dayNumber: 1,
        title: 'Sunrise at Taj Mahal & Royal Red Fort',
        theme: 'Mughal Architectural Masterpieces',
        weatherSummary: '24°C Cool morning, Clear skies',
        activities: [
          {
            time: '05:45 AM',
            title: 'East Gate Sunrise Entry to Taj Mahal',
            location: 'Taj East Gate',
            description: 'Witness the white Makrana marble glow in pastel peach and gold shades as the sun rises across the Yamuna.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Electric Golf Cart',
            smartTip: 'Arriving at 5:45 AM avoids the massive 9 AM tour bus queues.'
          },
          {
            time: '11:00 AM',
            title: 'Agra Fort & Diwan-i-Khas',
            location: 'Agra Fort Complex',
            description: 'Explore the vast red sandstone fortress where Emperor Shah Jahan gazed at the Taj Mahal from Musamman Burj.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'AC Cab (10 mins)',
            smartTip: 'Diwan-i-Am courtyard has shaded walkways and excellent acoustic demonstrations.'
          },
          {
            time: '04:45 PM',
            title: 'Mehtab Bagh Sunset Across Yamuna',
            location: 'Moonlight Garden',
            description: 'Serene botanical gardens directly facing the rear facade of the Taj Mahal across the river during golden hour.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Cab / Auto Rickshaw',
            smartTip: 'Bring telephoto lens for symmetrical reflections over the Yamuna water.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tomb of Itmad-ud-Daulah & Petha Guilds',
        theme: 'The Baby Taj & Old Bazaar Gastronomy',
        weatherSummary: '26°C Sunny & Mild',
        activities: [
          {
            time: '08:30 AM',
            title: 'Itmad-ud-Daulah (Baby Taj)',
            location: 'Yamuna Riverbank',
            description: 'The exquisite precursor to the Taj Mahal with pioneering pietra dura marble inlay craftsmanship.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Cab',
            smartTip: 'Often has zero lines, providing an intimate look at delicate floral lattice work.'
          },
          {
            time: '01:00 PM',
            title: 'Heritage Mughlai Lunch & Authentic Petha Walk',
            location: 'Sadar Bazaar & Kinari Bazaar',
            description: 'Sample world-famous Angoori and Kesar Petha directly from heritage confectionery workshops.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Walking / E-Rickshaw',
            smartTip: 'GI-certified Panchhi Petha stores provide fresh vacuum-sealed travel packs.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Fatehpur Sikri Imperial Capital',
        theme: 'Akbar’s Ghost City of Red Sandstone',
        weatherSummary: '25°C Pleasant',
        activities: [
          {
            time: '08:00 AM',
            title: 'Buland Darwaza & Jama Masjid',
            location: 'Fatehpur Sikri (40km from Agra)',
            description: 'The monumental 54-meter Victory Gate, Sufi saint Salim Chishti’s white marble shrine, and royal courtyards.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Private AC Chauffeur',
            smartTip: 'Early departure from Agra gets you to the complex before tourist buses arrive.'
          }
        ]
      }
    ]
  },
  'Hampi': {
    id: 'itin-hampi-ai',
    destination: 'Hampi, Karnataka',
    state: 'Karnataka',
    transportMode: 'Train (Vande Bharat)',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Nov 18 - Nov 21, 2026',
    totalDays: 3,
    estimatedCostInr: 10499,
    aiMatchReason: '97% Match: Optimized for boulder terrain sunrise viewpoints, UNESCO stone monoliths, and peaceful Tungabhadra coracle voyages.',
    crowdSavedPercentage: 54,
    days: [
      {
        dayNumber: 1,
        title: 'Vittala Stone Chariot & Musical Pillars',
        theme: 'Imperial Vijayanagara Architecture',
        weatherSummary: '27°C Sunny, Gentle river breeze',
        activities: [
          {
            time: '06:30 AM',
            title: 'Vittala Temple & Monolithic Stone Chariot',
            location: 'Vittala Complex',
            description: 'Marvel at the world-famous carved granite stone chariot shrine dedicated to Garuda in serene dawn light.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Electric Buggy / Cycle',
            smartTip: 'Visiting right at 6:30 AM ensures empty courtyards for iconic chariot photos.'
          },
          {
            time: '11:00 AM',
            title: 'Royal Enclosure & Stepped Tank',
            location: 'Royal Centre',
            description: 'Explore the Mahanavami Dibba platform, underground chambers, and the geometric pushkarani water reservoir.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Bicycle Trail',
            smartTip: 'The stepped tank stone joints fit together without any mortar.'
          },
          {
            time: '05:00 PM',
            title: 'Hemakuta Hill Sunset & Virupaksha Glimpse',
            location: 'Hemakuta Hill',
            description: 'Watch the sun sink behind ancient pre-Vijayanagara shrine clusters with panoramic views over Virupaksha tower.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Gentle Hill Walk',
            smartTip: 'Bring a light mat to sit on the warm granite boulder plateaus.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tungabhadra Coracle & Zenana Enclosure',
        theme: 'River Crossings & Queens Architecture',
        weatherSummary: '28°C Clear Sky',
        activities: [
          {
            time: '07:30 AM',
            title: 'Traditional Round Coracle Boat Ride',
            location: 'Tungabhadra River Ghat',
            description: 'Navigate calm swirling river waters between giant balancing granite boulders and rock-carved Shiva lingas.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Wooden & Reed Coracle',
            smartTip: 'Life jackets provided; early morning reveals migratory river birds.'
          },
          {
            time: '02:00 PM',
            title: 'Lotus Mahal & Elephant Stables',
            location: 'Zenana Enclosure',
            description: 'Indo-Islamic arcaded pavilions and towering domed chambers designed for imperial royal elephants.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Auto Rickshaw',
            smartTip: 'The dual-level Lotus Mahal was engineered with internal water cooling tubes.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Anjaneya Hill & Sanapur Lake Bouldering',
        theme: 'Hippie Island & Mythological Landscapes',
        weatherSummary: '26°C Breezy',
        activities: [
          {
            time: '06:00 AM',
            title: 'Anjaneya Hill Sunrise Climb (575 Steps)',
            location: 'Anegundi Side',
            description: 'Ascend the legendary birthplace of Lord Hanuman for a 360-degree sunrise panorama over emerald paddy fields and boulder heaps.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Scooter / Cab',
            smartTip: 'Climb early in the morning cool; monkeys are peaceful but keep food in backpacks.'
          },
          {
            time: '02:30 PM',
            title: 'Sanapur Lake Cliff & Bouldering Views',
            location: 'Sanapur Reservoir',
            description: 'Tranquil irrigation reservoir surrounded by massive monoliths and sugarcane plantations.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Scenic Country Road',
            smartTip: 'Great café spots nearby serving south Indian filter coffee and woodfired meals.'
          }
        ]
      }
    ]
  },
  'Goa': {
    id: 'itin-goa-ai',
    destination: 'South Goa Beaches, Goa',
    state: 'Goa',
    transportMode: 'Flight',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Nov 24 - Nov 27, 2026',
    totalDays: 3,
    estimatedCostInr: 12999,
    aiMatchReason: '94% Match: Focuses on serene South Goa palm beaches, heritage Latin Quarter mansions, and sunset dolphin coves.',
    crowdSavedPercentage: 60,
    days: [
      {
        dayNumber: 1,
        title: 'Palolem Crescent Cove & Dolphin Kayak',
        theme: 'Tropical Coastal Serenity',
        weatherSummary: '29°C Warm, Ocean breeze',
        activities: [
          {
            time: '07:00 AM',
            title: 'Sunrise Kayaking & Dolphin Spotting',
            location: 'Palolem Beach Cove',
            description: 'Paddle along the calm, sheltered bay before motorboats start, watching pods of humpback dolphins breach.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Sea Kayak',
            smartTip: 'Morning water is crystal clear and flat as glass.'
          },
          {
            time: '04:30 PM',
            title: 'Cabo de Rama Fort Cliffside Sunset',
            location: 'Canacona Headland',
            description: 'Ancient Portuguese ramparts perched atop a 50-meter sea cliff overlooking the unbroken Arabian Sea.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Coastal Highway Ride',
            smartTip: 'Best sunset viewpoint in South Goa away from beach shacks.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Fontainhas Heritage Quarter & Spice Plantation',
        theme: 'Portuguese Heritage & Culinary Delights',
        weatherSummary: '30°C Sunny',
        activities: [
          {
            time: '08:30 AM',
            title: 'Fontainhas Latin Quarter Walking Tour',
            location: 'Panjim Old Quarter',
            description: 'Wander pastel yellow, indigo, and terracotta tiled 18th-century Portuguese heritage villas with wrought-iron balconies.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Heritage Walk',
            smartTip: 'Try freshly baked Bebinca and Poi bread from 100-year-old traditional bakeries.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Butterfly Beach & Agonda Sands',
        theme: 'Hidden Coves & Beachside Rejuvenation',
        weatherSummary: '28°C Pleasant',
        activities: [
          {
            time: '08:00 AM',
            title: 'Hidden Butterfly Beach Boat Trek',
            location: 'Secluded Bay',
            description: 'A secret semicircular cove surrounded by dense forest with golden sand and zero commercial shacks.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Fisherman Boat / Trail',
            smartTip: 'High tide fills natural rock pools perfect for swimming.'
          }
        ]
      }
    ]
  },
  'Alleppey': {
    id: 'itin-alleppey-ai',
    destination: 'Alleppey & Munnar, Kerala',
    state: 'Kerala',
    transportMode: 'Flight',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Dec 02 - Dec 05, 2026',
    totalDays: 3,
    estimatedCostInr: 13999,
    aiMatchReason: '95% Match: Traditional eco-houseboat backwater navigation, spice gardens, and tranquil palm canals.',
    crowdSavedPercentage: 45,
    days: [
      {
        dayNumber: 1,
        title: 'Private Kettuvallam Houseboat Embarkation',
        theme: 'Vembanad Backwaters Serenity',
        weatherSummary: '28°C Gentle breeze',
        activities: [
          {
            time: '11:30 AM',
            title: 'Houseboat Boarding at Punnamada',
            location: 'Alleppey Finishing Point',
            description: 'Board a traditional teak and coir thatch houseboat with private chef serving authentic Karimeen Pollichathu.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Eco Houseboat',
            smartTip: 'Cruising through narrow village canals offers a look at traditional coir weaving and duck farming.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Village Canoe Safari & Kayaking',
        theme: 'Narrow Canal Life & Birds',
        weatherSummary: '27°C Pleasant',
        activities: [
          {
            time: '06:30 AM',
            title: 'Sunrise Country Canoe in Kuttanad',
            location: 'Kuttanad Waterways',
            description: 'Silent oar-powered small canoe gliding under swaying coconut canopy where large houseboats cannot enter.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Hand-rowed Canoe',
            smartTip: 'Kingfishers, cormorants, and lotus blooms are most active at dawn.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Marari Fishermen Beach & Ayurvedic Wellness',
        theme: 'Coastal Palms & Herbology',
        weatherSummary: '29°C Sunny',
        activities: [
          {
            time: '08:00 AM',
            title: 'Marari Beach Walk & Traditional Abhyanga',
            location: 'Mararikulam',
            description: 'Unspoiled fishing village coastline followed by certified Kerala Ayurvedic herbal rejuvenation.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Auto / Cab',
            smartTip: 'Relaxing end to a backwater retreat.'
          }
        ]
      }
    ]
  },
  'Leh-Ladakh': {
    id: 'itin-ladakh-ai',
    destination: 'Leh-Ladakh, Himalayas',
    state: 'Ladakh',
    transportMode: 'Flight',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Oct 05 - Oct 08, 2026',
    totalDays: 3,
    estimatedCostInr: 18999,
    aiMatchReason: '98% Match: High altitude lake camps, morning monastery chants, and off-peak scenic pass navigation.',
    crowdSavedPercentage: 50,
    days: [
      {
        dayNumber: 1,
        title: 'Thiksey Gompa Dawn Chants & Shey Palace',
        theme: 'Spiritual Monasteries of Indus Valley',
        weatherSummary: '12°C Crisp & Clear',
        activities: [
          {
            time: '06:00 AM',
            title: 'Morning Prayer Chanting at Thiksey Gompa',
            location: 'Thiksey Monastery',
            description: 'Listen to monks blow giant conch shells and deep Tibetan horns with panoramic sunrise over the Indus Valley.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Chauffeur 4x4',
            smartTip: 'Arrive 15 mins before dawn; butter tea is graciously shared in the assembly hall.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Pangong Tso Color-Shifting Waters',
        theme: 'Endorheic Himalayan Lake',
        weatherSummary: '9°C Azure Skies',
        activities: [
          {
            time: '07:00 AM',
            title: 'Chang La Pass to Pangong Tso',
            location: '14,270 ft Lake',
            description: 'Cross the world’s third-highest motorable pass to reach the 134-km long surreal sapphire lake.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'High Altitude SUV',
            smartTip: 'Lakeside eco-yurt lunch with zero light pollution for evening stargazing.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Nubra Valley & Diskit Giant Buddha',
        theme: 'Silk Route Oasis & Sand Dunes',
        weatherSummary: '14°C Sunny',
        activities: [
          {
            time: '08:30 AM',
            title: 'Diskit Monastery & Hunder Dunes',
            location: 'Nubra Valley',
            description: 'Gaze up at the 106-foot golden Maitreya Buddha statue and meet rare double-humped Bactrian camels.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: '4x4 Cab',
            smartTip: 'Khardung La pass crossing is smoothest between 8:30 AM - 10:30 AM.'
          }
        ]
      }
    ]
  },
  'Varanasi': {
    id: 'itin-varanasi-ai',
    destination: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    transportMode: 'Train (Vande Bharat)',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Nov 01 - Nov 04, 2026',
    totalDays: 3,
    estimatedCostInr: 8999,
    aiMatchReason: '94% Match: Dawn wooden boat rides along 84 ghats, silk weaver quarters, and reserved Aarti viewing.',
    crowdSavedPercentage: 46,
    days: [
      {
        dayNumber: 1,
        title: 'Subah-e-Banaras & Silent Wooden Boat',
        theme: 'Ganges Dawn Awakening',
        weatherSummary: '24°C Gentle River Mist',
        activities: [
          {
            time: '05:15 AM',
            title: 'Dawn Wooden Boat from Assi Ghat',
            location: 'Assi to Manikarnika Ghat',
            description: 'Glide quietly past centuries-old palatial havelis as Vedic hymns and sunrise bathe the river in gold.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Traditional Rowboat',
            smartTip: 'Hand-rowed wooden boats produce no engine noise, preserving the spiritual morning peace.'
          },
          {
            time: '06:00 PM',
            title: 'Dashashwamedh Maha Aarti Reserved Boat',
            location: 'Dashashwamedh Ghat',
            description: 'Watch the magnificent evening ritual of massive brass oil lamps and peacock-feather fans from the river.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Anchored Boat View',
            smartTip: 'Viewing from an anchored boat avoids the packed stone stair crowd.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Sarnath Buddhist Deer Park & Dhamek Stupa',
        theme: 'Lord Buddha’s First Sermon',
        weatherSummary: '25°C Sunny & Mild',
        activities: [
          {
            time: '08:30 AM',
            title: 'Dhamek Stupa & Archaeological Museum',
            location: 'Sarnath (10km from Kashi)',
            description: 'Walk the peaceful deer park where the Buddha first turned the Wheel of Dharma in 528 BCE.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'AC Cab',
            smartTip: 'See the original 3rd-century BCE Ashoka Lion Capital (National Emblem of India).'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Banarasi Silk Loom Trails & Street Gastronomy',
        theme: 'Artisans & Heritage Flavors',
        weatherSummary: '24°C Pleasant',
        activities: [
          {
            time: '09:00 AM',
            title: 'Master Weavers of Madanpura',
            location: 'Old City Alleys',
            description: 'Witness master weavers hand-loom gold zari and pure mulberry silk brocades on ancestral wooden pit-looms.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Heritage Walk',
            smartTip: 'Sample authentic Malaiyo (saffron milk foam) and Blue Lassi in the morning.'
          }
        ]
      }
    ]
  },
  'Udaipur': {
    id: 'itin-udaipur-ai',
    destination: 'Udaipur, Rajasthan',
    state: 'Rajasthan',
    transportMode: 'Train (Vande Bharat)',
    crowdPreference: 'Avoid Crowds',
    dateRange: 'Nov 05 - Nov 08, 2026',
    totalDays: 3,
    estimatedCostInr: 14999,
    aiMatchReason: '96% Match: City Palace mirror quarters, sunset cruises on Lake Pichola, and monsoon hilltop palaces.',
    crowdSavedPercentage: 40,
    days: [
      {
        dayNumber: 1,
        title: 'City Palace Regal Walk & Lake Pichola Cruise',
        theme: 'Mewar Royal Grandeur',
        weatherSummary: '25°C Sunny & Clear',
        activities: [
          {
            time: '08:30 AM',
            title: 'City Palace Early Morning Access',
            location: 'Lake Pichola Shore',
            description: 'Marvel at the Mor Chowk peacock mosaics and mirrored halls before noon tour crowds arrive.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Walking / Cab',
            smartTip: 'Book the audio tour for rich stories of Maharana Pratap and royal Mewar defense.'
          },
          {
            time: '04:45 PM',
            title: 'Sunset Boat Cruise past Jag Mandir Island',
            location: 'Rameshwar Ghat',
            description: 'Float across calm turquoise waters as the palace lights reflect across Lake Pichola.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Solar Boat',
            smartTip: 'Island palace gardens are tranquil for evening tea.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Saheliyon-ki-Bari & Sajjangarh Monsoon Palace',
        theme: 'Royal Fountains & High Hilltop Vistas',
        weatherSummary: '26°C Sunny',
        activities: [
          {
            time: '09:00 AM',
            title: 'Saheliyon-ki-Bari Lotus Pools',
            location: 'Fateh Sagar Area',
            description: 'Lush 18th-century garden with marble elephants, rain-fountains, and bird-sculptured pavilions.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Cab',
            smartTip: 'Fountains operate on gravity water pressure from Fateh Sagar lake without pumps.'
          },
          {
            time: '04:30 PM',
            title: 'Sajjangarh (Monsoon Palace) Sunset',
            location: 'Bansdara Peak',
            description: 'Hilltop palatial fortress overlooking the Aravalli hills and all five lakes of Udaipur.',
            crowdPrediction: '🟡 Moderate',
            modeOfTransit: 'Hill Taxi',
            smartTip: 'Breathtaking twilight views across the Mewar plateau.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Bagore Ki Haveli & Miniature Painting Studio',
        theme: 'Living Heritage & Folk Arts',
        weatherSummary: '25°C Pleasant',
        activities: [
          {
            time: '10:00 AM',
            title: 'Gangaur Ghat & Bagore Ki Haveli',
            location: 'Old City Waterfront',
            description: 'Explore 138 rooms of royal costumes, vintage puppets, and fine Mewari miniature painting workshops.',
            crowdPrediction: '🟢 Low Crowd',
            modeOfTransit: 'Walking',
            smartTip: 'Authentic stone pigment miniature paintings certified by local artists.'
          }
        ]
      }
    ]
  }
};
