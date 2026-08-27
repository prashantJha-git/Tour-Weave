import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  TrendingDown,
  Clock,
  IndianRupee,
  Search,
  X
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Destination } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { getSearchSuggestions, SearchSuggestionItem } from '../data/searchData';

interface RecommendedPlacesProps {
  savedPlaces: Destination[];
  onToggleSave: (dest: Destination) => void;
  onSelectDestination: (dest: Destination) => void;
}

interface Destination3DCardProps {
  destination: Destination;
  saved: boolean;
  onToggleSave: (dest: Destination) => void;
  onSelectDestination: (dest: Destination) => void;
  index: number;
}

const Destination3DCard: React.FC<Destination3DCardProps> = ({
  destination,
  saved,
  onToggleSave,
  onSelectDestination,
  index,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 240, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 240, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['2.5deg', '-2.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-2.5deg', '2.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-[300px] sm:w-[340px] shrink-0 snap-start bg-white rounded-3xl border border-[#1D3D33]/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
      onClick={() => onSelectDestination(destination)}
    >
      {/* Image Container with 3D Z-elevation */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

        {/* AI Match Badge with 3D elevation */}
        <div
          style={{ transform: 'translateZ(26px)' }}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FBC02D] text-[#1D3D33] text-[9px] font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md"
        >
          <Sparkles className="w-3 h-3 text-[#1D3D33]" />
          <span>{destination.aiMatchPercentage}% AI Match</span>
        </div>

        {/* Wishlist Button with 3D elevation */}
        <button
          style={{ transform: 'translateZ(26px)' }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(destination);
          }}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer ${
            saved
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-black/30 text-white hover:bg-white hover:text-red-500'
          }`}
          title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Location Pill Overlay on bottom left */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1D3D33] text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <MapPin className="w-3.5 h-3.5 text-[#1D3D33]" />
          <span>{destination.name}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3" style={{ transform: 'translateZ(12px)' }}>
        <div>
          {/* Category & Crowd Status Row */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase font-bold text-[#1D3D33]/60 tracking-widest">
              {destination.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EBF7EF] text-[#1D3D33] border border-emerald-200">
              <TrendingDown className="w-3 h-3 text-emerald-600" />
              {destination.crowdLevel} Crowd ({destination.crowdDensity}%)
            </span>
          </div>

          {/* Title & Tagline */}
          <h3 className="font-serif font-bold text-lg text-[#1D3D33] line-clamp-1 group-hover:text-[#FBC02D] transition-colors">
            {destination.tagline}
          </h3>

          <p className="text-xs text-[#1D3D33]/70 line-clamp-2 mt-1 leading-relaxed">
            {destination.description}
          </p>
        </div>

        {/* Rating & Details Row */}
        <div className="pt-2 border-t border-[#1D3D33]/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FBC02D] text-[#FBC02D]" />
            <span className="font-bold text-[#1D3D33]">{destination.rating}</span>
            <span className="text-[#1D3D33]/50">({destination.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1 text-[#1D3D33]/60">
            <Clock className="w-3.5 h-3.5" />
            <span>{destination.idealDuration}</span>
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="pt-2 border-t border-[#1D3D33]/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#1D3D33]/60 uppercase tracking-wider block font-semibold">
              Starting from
            </span>
            <div className="flex items-baseline text-[#1D3D33] font-bold text-base">
              <span>₹{destination.startingPriceInr.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-[#1D3D33]/50 font-normal ml-1">/ person</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectDestination(destination);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#1D3D33] hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:shadow transition-all group-hover:bg-[#1D3D33] cursor-pointer"
          >
            <span>View AI Details</span>
            <ArrowRight className="w-3 h-3 text-[#FBC02D]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const RecommendedPlaces: React.FC<RecommendedPlacesProps> = ({
  savedPlaces,
  onToggleSave,
  onSelectDestination,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Heritage', 'Spiritual', 'Nature', 'Adventure', 'Coastal'];
  const suggestions: SearchSuggestionItem[] = getSearchSuggestions(searchFilter);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlaces = POPULAR_DESTINATIONS.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const cleanSearch = searchFilter.trim().toLowerCase();
    const matchesSearch = !cleanSearch || (
      p.name.toLowerCase().includes(cleanSearch) ||
      p.state.toLowerCase().includes(cleanSearch) ||
      p.tagline.toLowerCase().includes(cleanSearch) ||
      p.description.toLowerCase().includes(cleanSearch) ||
      p.category.toLowerCase().includes(cleanSearch)
    );
    return matchesCategory && matchesSearch;
  });

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isSaved = (id: string) => savedPlaces.some(p => p.id === id);

  return (
    <section id="explore-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 [perspective:1400px]">
      
      {/* Top Header & Navigation Arrows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4"
      >
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#1D3D33]/60 block mb-1">
            POPULAR DESTINATIONS ACROSS BHARAT
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight">
            Top Places To Explore
          </h2>
          <p className="text-[#1D3D33]/70 text-sm mt-1">
            Handpicked destinations dynamically ranked by seasonal weather and crowd suitability.
          </p>
        </div>

        {/* View All & Carousel Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchFilter('');
            }}
            className="text-xs font-bold text-[#1D3D33] hover:text-[#FBC02D] transition-colors flex items-center gap-1 mr-2 cursor-pointer"
          >
            <span>Reset Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="places-carousel-prev"
            onClick={() => handleScroll('left')}
            className="w-10 h-10 rounded-full border border-[#1D3D33]/15 bg-white hover:bg-stone-50 flex items-center justify-center text-[#1D3D33] shadow-sm transition-all cursor-pointer"
            aria-label="Previous destination"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="places-carousel-next"
            onClick={() => handleScroll('right')}
            className="w-10 h-10 rounded-full border border-[#1D3D33]/15 bg-white hover:bg-stone-50 flex items-center justify-center text-[#1D3D33] shadow-sm transition-all cursor-pointer"
            aria-label="Next destination"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Filter and Search Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1D3D33] text-white shadow-sm'
                  : 'bg-white text-[#1D3D33] hover:bg-[#F8F1E9] border border-[#1D3D33]/10'
              }`}
            >
              {cat === 'All' ? '🌟 All Bharat' : cat}
            </button>
          ))}
        </div>

        {/* Live Searchbar with Suggestions Dropdown */}
        <div ref={searchBoxRef} className="relative w-full md:w-72">
          <div className="flex items-center rounded-full bg-white border border-[#1D3D33]/15 px-3.5 py-2 shadow-sm focus-within:border-[#1D3D33] focus-within:ring-2 focus-within:ring-[#1D3D33]/10 transition-all">
            <Search className="w-3.5 h-3.5 text-[#1D3D33]/50 mr-2 shrink-0" />
            <input
              id="explore-section-search-input"
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search places, states, themes..."
              className="w-full text-xs font-medium text-[#1D3D33] placeholder:text-[#1D3D33]/40 bg-transparent focus:outline-none"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="text-stone-400 hover:text-stone-700 pl-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search suggestions dropdown */}
          {showSearchDropdown && searchFilter.trim() && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#1D3D33]/10 p-2 z-40 max-h-60 overflow-y-auto no-scrollbar search-dropdown">
              <div className="text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest px-2 py-1">
                Suggested Destinations
              </div>
              <div className="space-y-1">
                {suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchFilter(item.name);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-[#FDF8F3] text-[#1D3D33] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-7 h-7 rounded-lg object-cover shrink-0 border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#1D3D33]/10 flex items-center justify-center shrink-0 text-[#1D3D33]">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] text-stone-500 block truncate">{item.state} • {item.category}</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200 shrink-0">
                      {item.aiMatch}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Destination Cards Carousel */}
      {filteredPlaces.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar [perspective:1200px]"
        >
          {filteredPlaces.map((destination, idx) => {
            const saved = isSaved(destination.id);
            return (
              <Destination3DCard
                key={destination.id}
                destination={destination}
                saved={saved}
                onToggleSave={onToggleSave}
                onSelectDestination={onSelectDestination}
                index={idx}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#1D3D33]/10 p-12 text-center my-6">
          <Sparkles className="w-8 h-8 text-[#FBC02D] mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[#1D3D33]">No destinations found matching "{searchFilter}"</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try searching for another Indian city like "Jaipur", "Munnar", "Varanasi", or reset your search.
          </p>
          <button
            onClick={() => {
              setSearchFilter('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1D3D33] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Reset Search & Show All Places
          </button>
        </div>
      )}

    </section>
  );
};
