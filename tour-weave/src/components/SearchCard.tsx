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
  ShieldCheck,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { TransportMode, CrowdPreference } from '../types';
import { getSearchSuggestions, SearchSuggestionItem } from '../data/searchData';

interface SearchCardProps {
  onGenerate: (destination: string, transport: TransportMode, crowdPref: CrowdPreference, dateRange: string) => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({ onGenerate }) => {
  const [destination, setDestination] = useState('Jaipur');
  const [searchInput, setSearchInput] = useState('Jaipur');
  const [transport, setTransport] = useState<TransportMode>('Train (Vande Bharat)');
  const [crowdPref, setCrowdPref] = useState<CrowdPreference>('Avoid Crowds');
  const [dates, setDates] = useState('Oct 14 - Oct 17, 2026');
  
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  const [showCrowdDropdown, setShowCrowdDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions: SearchSuggestionItem[] = getSearchSuggestions(searchInput);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
        setShowTransportDropdown(false);
        setShowCrowdDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    setDestination(item.name);
    setSearchInput(item.name);
    setShowDestDropdown(false);
    setFocusedIndex(-1);
  };

  const handleCustomSearchSelect = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      setDestination(trimmed);
      setSearchInput(trimmed);
    }
    setShowDestDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowDestDropdown(true);
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[focusedIndex]);
      } else if (searchInput.trim()) {
        handleCustomSearchSelect(searchInput);
      }
    } else if (e.key === 'Escape') {
      setShowDestDropdown(false);
    }
  };

  const datePresets = [
    'Oct 14 - Oct 17, 2026 (3 Days • Festival Off-Peak)',
    'Nov 05 - Nov 09, 2026 (4 Days • Crisp Autumn)',
    'Dec 18 - Dec 23, 2026 (5 Days • Winter Heritage)',
    'Jan 10 - Jan 14, 2027 (4 Days • Clear Blue Skies)'
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDest = searchInput.trim() || destination || 'Jaipur';
    onGenerate(finalDest, transport, crowdPref, dates);
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
          
          {/* Destination Searchbar with Live Autocomplete Suggestions */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="hero-destination-search-input" className="block text-[10px] uppercase tracking-widest opacity-60 font-bold text-[#1D3D33]">
                Destination in Bharat
              </label>
              {searchInput && (
                <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
                  Live AI search
                </span>
              )}
            </div>

            <div className="relative flex items-center rounded-xl border border-[#1D3D33]/15 bg-[#FDF8F3] hover:border-[#1D3D33]/30 focus-within:border-[#1D3D33] focus-within:ring-2 focus-within:ring-[#1D3D33]/10 transition-all">
              <div className="pl-3 pr-1 text-[#1D3D33] pointer-events-none">
                <Search className="w-4 h-4 text-[#1D3D33]" />
              </div>
              <input
                id="hero-destination-search-input"
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setDestination(e.target.value);
                  setShowDestDropdown(true);
                  setFocusedIndex(-1);
                }}
                onFocus={() => {
                  setShowDestDropdown(true);
                  setShowTransportDropdown(false);
                  setShowCrowdDropdown(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type city, state, or monument..."
                autoComplete="off"
                className="w-full py-3 px-2 text-sm font-bold text-[#1D3D33] bg-transparent placeholder:text-[#1D3D33]/40 placeholder:font-normal focus:outline-none"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDestination('');
                    inputRef.current?.focus();
                  }}
                  className="pr-3 pl-1 text-[#1D3D33]/40 hover:text-[#1D3D33] transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="pr-3 pl-1 text-[#1D3D33]/30 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showDestDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/10 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 max-h-80 overflow-y-auto no-scrollbar search-dropdown">
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest border-b border-stone-100 mb-1">
                  <span>{searchInput.trim() ? `Suggestions for "${searchInput}"` : 'Top Destinations in Bharat'}</span>
                  <span>{suggestions.length} places</span>
                </div>

                {suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((item, idx) => {
                      const isSelected = destination.toLowerCase() === item.name.toLowerCase();
                      const isFocused = focusedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          onMouseEnter={() => setFocusedIndex(idx)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isFocused || isSelected
                              ? 'bg-[#1D3D33] text-white shadow-sm'
                              : 'hover:bg-[#FDF8F3] text-[#1D3D33]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/20"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isFocused || isSelected ? 'bg-white/15 text-[#FBC02D]' : 'bg-[#1D3D33]/10 text-[#1D3D33]'
                              }`}>
                                <MapPin className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm truncate">{item.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                                  isFocused || isSelected ? 'bg-[#FBC02D] text-[#1D3D33]' : 'bg-[#1D3D33]/10 text-[#1D3D33]'
                                }`}>
                                  {item.category}
                                </span>
                              </div>
                              <div className={`text-[11px] truncate mt-0.5 ${
                                isFocused || isSelected ? 'text-stone-300' : 'text-[#1D3D33]/60'
                              }`}>
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-bold block ${
                              isFocused || isSelected ? 'text-[#FBC02D]' : 'text-emerald-700'
                            }`}>
                              {item.aiMatch}% Match
                            </span>
                            <span className={`text-[9px] block ${
                              isFocused || isSelected ? 'text-stone-300' : 'text-stone-400'
                            }`}>
                              {item.crowdLevel.split(' ')[0]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-stone-500 mb-2">
                      No preset match for "{searchInput}".
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCustomSearchSelect(searchInput)}
                      className="px-3.5 py-2 rounded-xl bg-[#1D3D33] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full hover:bg-black transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
                      <span>Generate Custom AI Plan for "{searchInput}"</span>
                    </button>
                  </div>
                )}

                {/* Direct Custom Query Trigger if typed */}
                {searchInput.trim() && suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleCustomSearchSelect(searchInput)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1D3D33] hover:bg-[#FDF8F3] flex items-center justify-between group transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3 h-3 text-[#FBC02D]" />
                        <span>Search exact term: <strong>"{searchInput}"</strong></span>
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 text-[#1D3D33]" />
                    </button>
                  </div>
                )}
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
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] cursor-pointer transition-all"
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
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
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
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] cursor-pointer transition-all"
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
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between my-1 transition-colors cursor-pointer ${
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
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
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
          {['Jaipur', 'Varanasi', 'Munnar', 'Leh-Ladakh', 'Udaipur', 'Goa', 'Hampi', 'Agra', 'Rishikesh'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchInput(tag);
                setDestination(tag);
                setShowDestDropdown(false);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                destination.toLowerCase() === tag.toLowerCase()
                  ? 'bg-[#1D3D33] text-white shadow-sm'
                  : 'bg-[#1D3D33]/5 hover:bg-[#1D3D33] hover:text-white text-[#1D3D33]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
