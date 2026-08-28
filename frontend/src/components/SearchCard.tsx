import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Train,
  Plane,
  Bus,
  Car,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { TransportMode, CrowdPreference } from '../types';

interface SearchCardProps {
  onGenerate: (destination: string, transport: TransportMode, crowdPref: CrowdPreference, dateRange: string) => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({ onGenerate }) => {
  const [destination, setDestination] = useState('Jaipur');
  const [transport, setTransport] = useState<TransportMode>('Train (Vande Bharat)');
  const [crowdPref, setCrowdPref] = useState<CrowdPreference>('Avoid Crowds');
  const [dates, setDates] = useState('Oct 14 - Oct 17, 2026');
  
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  const [showCrowdDropdown, setShowCrowdDropdown] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
        setShowTransportDropdown(false);
        setShowCrowdDropdown(false);
        setShowDateSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularDestinations = [
    { city: 'Jaipur', state: 'Rajasthan', type: 'Royal Heritage' },
    { city: 'Varanasi', state: 'Uttar Pradesh', type: 'Spiritual Ghats' },
    { city: 'Munnar', state: 'Kerala', type: 'Tea Highlands' },
    { city: 'Leh-Ladakh', state: 'Ladakh', type: 'High Altitude Lakes' },
    { city: 'Udaipur', state: 'Rajasthan', type: 'Lakes & Palaces' },
    { city: 'Goa', state: 'Goa', type: 'Coastal Serenity' },
    { city: 'Hampi', state: 'Karnataka', type: 'UNESCO Boulder Ruins' },
    { city: 'Rishikesh', state: 'Uttarakhand', type: 'Ganges & Yoga Haven' }
  ];

  const datePresets = [
    'Oct 14 - Oct 17, 2026 (3 Days • Festival Off-Peak)',
    'Nov 05 - Nov 09, 2026 (4 Days • Crisp Autumn)',
    'Dec 18 - Dec 23, 2026 (5 Days • Winter Heritage)',
    'Jan 10 - Jan 14, 2027 (4 Days • Clear Blue Skies)'
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(destination, transport, crowdPref, dates);
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'Flight':
        return <Plane className="w-4 h-4 text-[#1D3D33]" />;
      case 'Train (Vande Bharat)':
        return <Train className="w-4 h-4 text-[#1D3D33]" />;
      case 'Luxury Bus':
        return <Bus className="w-4 h-4 text-[#1D3D33]" />;
      case 'Private Cab':
        return <Car className="w-4 h-4 text-[#1D3D33]" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto z-20 mt-6 sm:mt-8 px-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-5 border border-[#1D3D33]/5">
        
        {/* Top mini banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1D3D33]/10 text-xs text-[#1D3D33]/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1D3D33] text-[#FBC02D] font-bold text-[10px] tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              LightGBM AI Engine Active
            </span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="hidden sm:inline font-medium text-xs text-[#1D3D33]/80">Real-time crowd telemetry & IRCTC/Air synchronization</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D3D33]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>94.8% Predictive Model Accuracy</span>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4 items-center">
          
          {/* Destination Selector */}
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1 text-[#1D3D33]">
              Destination in Bharat
            </label>
            <div
              onClick={() => {
                setShowDestDropdown(!showDestDropdown);
                setShowTransportDropdown(false);
                setShowCrowdDropdown(false);
                setShowDateSelector(false);
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#1D3D33]/10 bg-[#FDF8F3] hover:bg-[#F8F1E9] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MapPin className="w-4 h-4 text-[#1D3D33] shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-sm text-[#1D3D33] truncate">{destination}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#1D3D33]/60 truncate">Popular AI Routes</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1D3D33]/40 shrink-0" />
            </div>

            {/* Destination Dropdown */}
            {showDestDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/10 p-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest">
                  Curated Indian Destinations
                </div>
                {popularDestinations.map((item) => (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => {
                      setDestination(item.city);
                      setShowDestDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      destination === item.city
                        ? 'bg-[#1D3D33] text-white'
                        : 'hover:bg-[#FDF8F3] text-[#1D3D33]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{item.city}</div>
                      <div className={`text-[11px] ${destination === item.city ? 'text-stone-300' : 'text-[#1D3D33]/60'}`}>
                        {item.state} • {item.type}
                      </div>
                    </div>
                    {destination === item.city && (
                      <span className="text-xs text-[#FBC02D] font-bold">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transportation Mode */}
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1 text-[#1D3D33]">
              Preferred Transit
            </label>
            <div
              onClick={() => {
                setShowTransportDropdown(!showTransportDropdown);
                setShowDestDropdown(false);
                setShowCrowdDropdown(false);
                setShowDateSelector(false);
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#1D3D33]/10 bg-[#FDF8F3] hover:bg-[#F8F1E9] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {getTransportIcon(transport)}
                <div className="truncate">
                  <div className="font-bold text-sm text-[#1D3D33] truncate">{transport}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#1D3D33]/60 truncate">Multi-Modal Sync</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1D3D33]/40 shrink-0" />
            </div>

            {/* Transport Dropdown */}
            {showTransportDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/10 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest">
                  Transport Options
                </div>
                {(['Train (Vande Bharat)', 'Flight', 'Luxury Bus', 'Private Cab'] as TransportMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTransport(mode);
                      setShowTransportDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                      transport === mode
                        ? 'bg-[#1D3D33] text-white'
                        : 'hover:bg-[#FDF8F3] text-[#1D3D33]'
                    }`}
                  >
                    {getTransportIcon(mode)}
                    <span className="font-semibold">{mode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates & Crowd Preference Selector */}
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1 text-[#1D3D33]">
              AI Crowd Optimization
            </label>
            <div
              onClick={() => {
                setShowCrowdDropdown(!showCrowdDropdown);
                setShowDestDropdown(false);
                setShowTransportDropdown(false);
                setShowDateSelector(false);
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#1D3D33]/10 bg-[#FDF8F3] hover:bg-[#F8F1E9] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Calendar className="w-4 h-4 text-[#1D3D33] shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-sm text-[#1D3D33] truncate">{crowdPref}</div>
                  <div className="text-[11px] text-emerald-800 font-semibold truncate">
                    {dates.split('(')[0].trim()}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1D3D33]/40 shrink-0" />
            </div>

            {/* Crowd Dropdown & Date Picker Modal */}
            {showCrowdDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/10 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1 text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest">
                  AI Crowd Preference
                </div>
                {(['Avoid Crowds', 'Standard', 'Festival Explorer'] as CrowdPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => {
                      setCrowdPref(pref);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between my-1 transition-colors ${
                      crowdPref === pref
                        ? 'bg-[#1D3D33] text-white'
                        : 'hover:bg-[#FDF8F3] text-[#1D3D33]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{pref}</div>
                      <div className={`text-[10px] ${crowdPref === pref ? 'text-stone-300' : 'text-[#1D3D33]/60'}`}>
                        {pref === 'Avoid Crowds' && 'Prioritizes 6 AM sunrise slots & serene heritage courtyards'}
                        {pref === 'Standard' && 'Balanced schedule balancing popular hours & convenience'}
                        {pref === 'Festival Explorer' && 'Includes vibrant local melas, temple aartis & street fairs'}
                      </div>
                    </div>
                  </button>
                ))}

                <div className="mt-3 pt-2 border-t border-stone-100">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest">
                    Select Travel Window
                  </div>
                  {datePresets.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDates(d);
                        setShowCrowdDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                        dates === d ? 'bg-[#FBC02D]/20 text-[#1D3D33] font-bold' : 'hover:bg-[#FDF8F3] text-[#1D3D33]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2 md:pt-0">
            <button
              id="search-generate-itinerary-btn"
              type="submit"
              className="w-full h-full py-3.5 px-6 rounded-xl bg-[#1D3D33] hover:bg-black text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-[#FBC02D]/30 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FBC02D] transition-transform group-hover:rotate-12" />
              <span>Generate AI Itinerary</span>
            </button>
          </div>

        </form>

        {/* Quick popular suggestion tags */}
        <div className="mt-3.5 pt-3 border-t border-[#1D3D33]/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#1D3D33]/60 font-semibold text-[11px] uppercase tracking-wider">Trending Escapes:</span>
          {['Udaipur Lakes', 'Varanasi Dawn Ghats', 'Munnar Tea Valleys', 'Leh Alpine Trails', 'Hampi Heritage'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const cityName = tag.split(' ')[0];
                setDestination(cityName);
              }}
              className="px-2.5 py-1 rounded-full bg-[#1D3D33]/5 hover:bg-[#1D3D33] hover:text-white text-[#1D3D33] font-medium transition-colors text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
