export interface SearchSuggestionItem {
  id: string;
  name: string;
  subtitle: string;
  category: 'Heritage' | 'Spiritual' | 'Nature' | 'Adventure' | 'Coastal' | 'Culture' | 'Wildlife';
  state: string;
  region: string;
  tags: string[];
  aiMatch: number;
  crowdLevel: string;
  image?: string;
  destinationId?: string;
}

export const ALL_SEARCH_DESTINATIONS: SearchSuggestionItem[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    subtitle: 'Pink City • Amber Fort & Hawa Mahal',
    category: 'Heritage',
    state: 'Rajasthan',
    region: 'North',
    tags: ['pink city', 'amber fort', 'hawa mahal', 'jantar mantar', 'rajasthan', 'royal', 'palaces', 'forts', 'bazaars', 'heritage'],
    aiMatch: 96,
    crowdLevel: 'Moderate (35%)',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80',
    destinationId: 'jaipur-pink-city-heritage'
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    subtitle: 'City of Lakes • Lake Pichola & City Palace',
    category: 'Heritage',
    state: 'Rajasthan',
    region: 'North',
    tags: ['city of lakes', 'lake pichola', 'city palace', 'sunset boat cruise', 'rajasthan', 'royal', 'romantic', 'havelis'],
    aiMatch: 96,
    crowdLevel: 'Low (28%)',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=400&q=80',
    destinationId: 'udaipur-city-of-lakes'
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    subtitle: 'Spiritual Capital • Dawn Ghats & Ganga Aarti',
    category: 'Spiritual',
    state: 'Uttar Pradesh',
    region: 'North',
    tags: ['kashi', 'banaras', 'ganga aarti', 'assi ghat', 'dashashwamedh', 'kashi vishwanath', 'temples', 'spiritual', 'sunrise boat'],
    aiMatch: 93,
    crowdLevel: 'Moderate (38%)',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80',
    destinationId: 'varanasi-spiritual-ghats'
  },
  {
    id: 'munnar',
    name: 'Munnar',
    subtitle: 'Tea Highlands • Kolukkumalai & Eravikulam',
    category: 'Nature',
    state: 'Kerala',
    region: 'South',
    tags: ['kerala', 'tea gardens', 'highlands', 'western ghats', 'waterfalls', 'nature', 'misty hills', 'trekking', 'spices'],
    aiMatch: 94,
    crowdLevel: 'Low (19%)',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80',
    destinationId: 'munnar-tea-valleys'
  },
  {
    id: 'leh-ladakh',
    name: 'Leh-Ladakh',
    subtitle: 'High Altitude Plateau • Pangong Tso & Khardung La',
    category: 'Adventure',
    state: 'Ladakh',
    region: 'Himalayas',
    tags: ['ladakh', 'leh', 'pangong tso', 'nubra valley', 'khardung la', 'himalayas', 'monasteries', 'biking', 'snow peaks', 'high passes'],
    aiMatch: 98,
    crowdLevel: 'Low (16%)',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=85',
    destinationId: 'leh-ladakh-high-passes'
  },
  {
    id: 'hampi',
    name: 'Hampi',
    subtitle: 'UNESCO Ruins • Vijayanagara Empire & Stone Chariot',
    category: 'Heritage',
    state: 'Karnataka',
    region: 'South',
    tags: ['unesco', 'vijayanagara', 'stone chariot', 'vittala temple', 'virupaksha', 'coracle ride', 'boulders', 'monuments', 'history'],
    aiMatch: 91,
    crowdLevel: 'Low (22%)',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80',
    destinationId: 'hampi-vijayanagara-ruins'
  },
  {
    id: 'goa',
    name: 'Goa (South Goa)',
    subtitle: 'Coastal Serenity • Palolem Beaches & Fontainhas',
    category: 'Coastal',
    state: 'Goa',
    region: 'Coastal',
    tags: ['south goa', 'palolem', 'agonda', 'fontainhas', 'portuguese', 'beaches', 'kayaking', 'sunset', 'coastal'],
    aiMatch: 92,
    crowdLevel: 'Moderate (42%)',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80',
    destinationId: 'goa-south-coastal-bliss'
  },
  {
    id: 'agra',
    name: 'Agra',
    subtitle: 'Mughal Splendor • Taj Mahal & Red Fort',
    category: 'Heritage',
    state: 'Uttar Pradesh',
    region: 'North',
    tags: ['taj mahal', 'agra fort', 'fatehpur sikri', 'mughal', 'seven wonders', 'monument', 'uttar pradesh'],
    aiMatch: 98,
    crowdLevel: 'Moderate (34%)',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80',
    destinationId: 'agra-taj-mahal-wonder'
  },
  {
    id: 'alleppey',
    name: 'Alleppey (Alappuzha)',
    subtitle: 'Venice of the East • Kettuvallam Houseboats & Canals',
    category: 'Coastal',
    state: 'Kerala',
    region: 'South',
    tags: ['alleppey', 'alappuzha', 'kerala backwaters', 'houseboat', 'vembanad lake', 'kayaking', 'lagoons'],
    aiMatch: 95,
    crowdLevel: 'Low (24%)',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80',
    destinationId: 'alleppey-backwaters-serenity'
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    subtitle: 'Yoga Capital • Ganga Aarti & Himalayan Foothills',
    category: 'Spiritual',
    state: 'Uttarakhand',
    region: 'North',
    tags: ['rishikesh', 'yoga', 'ganges', 'laxman jhula', 'triveni ghat', 'ashrams', 'white water rafting', 'uttarakhand'],
    aiMatch: 95,
    crowdLevel: 'Moderate (30%)',
    image: 'https://images.unsplash.com/photo-1596761611086-b4895694ff8a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    subtitle: 'Golden Sanctuary • Harmandir Sahib & Wagah Border',
    category: 'Spiritual',
    state: 'Punjab',
    region: 'North',
    tags: ['amritsar', 'golden temple', 'harmandir sahib', 'wagah border', 'punjab', 'langar', 'heritage'],
    aiMatch: 97,
    crowdLevel: 'Moderate (45%)',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    subtitle: 'Queen of Hills • Kanchenjunga Views & Himalayan Toy Train',
    category: 'Nature',
    state: 'West Bengal',
    region: 'East',
    tags: ['darjeeling', 'toy train', 'kanchenjunga', 'tiger hill', 'tea estates', 'himalayas', 'west bengal'],
    aiMatch: 93,
    crowdLevel: 'Low (25%)',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur',
    subtitle: 'Sun City • Mehrangarh Fort & Blue Houses',
    category: 'Heritage',
    state: 'Rajasthan',
    region: 'North',
    tags: ['jodhpur', 'blue city', 'mehrangarh fort', 'jaswant thada', 'rajasthan', 'desert'],
    aiMatch: 94,
    crowdLevel: 'Low (26%)',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'manali',
    name: 'Manali',
    subtitle: 'Valley of the Gods • Solang Valley & Rohtang Pass',
    category: 'Adventure',
    state: 'Himachal Pradesh',
    region: 'North',
    tags: ['manali', 'solang valley', 'rohtang pass', 'himachal pradesh', 'snow', 'paragliding', 'mountains'],
    aiMatch: 92,
    crowdLevel: 'Moderate (48%)',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mysore',
    name: 'Mysore (Mysuru)',
    subtitle: 'City of Palaces • Mysore Palace & Chamundi Hills',
    category: 'Heritage',
    state: 'Karnataka',
    region: 'South',
    tags: ['mysore', 'mysuru', 'mysore palace', 'chamundi hills', 'karnataka', 'silk', 'sandalwood', 'palaces'],
    aiMatch: 90,
    crowdLevel: 'Low (25%)',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4439c3a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry (Puducherry)',
    subtitle: 'French Riviera of the East • White Town & Promenade',
    category: 'Coastal',
    state: 'Puducherry',
    region: 'South',
    tags: ['pondicherry', 'puducherry', 'french quarter', 'white town', 'auroville', 'promenade beach', 'coastal'],
    aiMatch: 91,
    crowdLevel: 'Low (27%)',
    image: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=400&q=80'
  }
];

export const getSearchSuggestions = (query: string): SearchSuggestionItem[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return ALL_SEARCH_DESTINATIONS.slice(0, 8);

  const exactMatches: SearchSuggestionItem[] = [];
  const startMatches: SearchSuggestionItem[] = [];
  const tagMatches: SearchSuggestionItem[] = [];

  ALL_SEARCH_DESTINATIONS.forEach((item) => {
    const nameLower = item.name.toLowerCase();
    const subtitleLower = item.subtitle.toLowerCase();
    const stateLower = item.state.toLowerCase();
    const categoryLower = item.category.toLowerCase();

    if (nameLower === clean) {
      exactMatches.push(item);
    } else if (nameLower.startsWith(clean) || stateLower.startsWith(clean)) {
      startMatches.push(item);
    } else if (
      nameLower.includes(clean) ||
      subtitleLower.includes(clean) ||
      stateLower.includes(clean) ||
      categoryLower.includes(clean) ||
      item.tags.some((t) => t.includes(clean))
    ) {
      tagMatches.push(item);
    }
  });

  return [...exactMatches, ...startMatches, ...tagMatches];
};
