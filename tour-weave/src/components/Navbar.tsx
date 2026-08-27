import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Menu, X, Compass, Search, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { Destination } from '../types';
import { getSearchSuggestions, SearchSuggestionItem } from '../data/searchData';
import { POPULAR_DESTINATIONS } from '../data/mockData';

interface NavbarProps {
  savedPlaces: Destination[];
  onOpenSavedDrawer: () => void;
  onOpenPlanWizard: () => void;
  onSelectDestination: (dest: Destination) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedPlaces,
  onOpenSavedDrawer,
  onOpenPlanWizard,
  onSelectDestination,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const searchSuggestions: SearchSuggestionItem[] = getSearchSuggestions(searchQuery);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click to close dropdowns and mobile search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)) {
        // If clicked outside mobile search bar container, collapse it if query is empty
        if (!searchQuery) {
          setIsMobileSearchExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Focus mobile input when expanded
  useEffect(() => {
    if (isMobileSearchExpanded) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 80);
    }
  }, [isMobileSearchExpanded]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectNavSuggestion = (item: SearchSuggestionItem) => {
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    setSearchQuery('');
    setMobileMenuOpen(false);

    // Check if item corresponds to an existing Destination to trigger detail modal
    const matchedDest = POPULAR_DESTINATIONS.find(
      (d) =>
        (item.destinationId && d.id === item.destinationId) ||
        d.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(d.name.split(',')[0].trim().toLowerCase())
    );

    if (matchedDest) {
      onSelectDestination(matchedDest);
    }

    // Also scroll down to Explore or AI Insights
    const exploreSection = document.getElementById('explore-section');
    exploreSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm py-2.5 sm:py-3 border-b border-[#1D3D33]/10'
          : 'bg-gradient-to-b from-black/70 via-black/35 to-transparent py-3 sm:py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile Expanded Search View (Revealed when search icon is clicked on mobile) */}
        {isMobileSearchExpanded ? (
          <div
            ref={mobileSearchContainerRef}
            className="flex items-center gap-2 py-0.5 animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchExpanded(false);
                setSearchQuery('');
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                isScrolled ? 'text-[#1D3D33] hover:bg-stone-100' : 'text-white hover:bg-white/20'
              }`}
              aria-label="Back to navigation"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <div
                className={`flex items-center rounded-full px-3 py-2 border shadow-inner transition-all ${
                  isScrolled
                    ? 'bg-[#FDF8F3] border-[#1D3D33]/20 text-[#1D3D33]'
                    : 'bg-white/20 border-white/30 text-white backdrop-blur-md'
                }`}
              >
                <Search
                  className={`w-4 h-4 mr-2 shrink-0 ${
                    isScrolled ? 'text-[#1D3D33]/60' : 'text-white/80'
                  }`}
                />
                <input
                  ref={mobileInputRef}
                  id="navbar-mobile-expanded-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search Bharat destinations, forts, ghats..."
                  className={`w-full text-xs bg-transparent focus:outline-none font-medium ${
                    isScrolled
                      ? 'text-[#1D3D33] placeholder:text-[#1D3D33]/50'
                      : 'text-white placeholder:text-white/70'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-stone-700 pl-1 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Auto-Suggestions Overlay Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/15 p-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-80 overflow-y-auto no-scrollbar search-dropdown">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>{searchQuery ? `Suggestions for "${searchQuery}"` : '🔥 Popular Indian Places'}</span>
                    <span className="text-[9px] text-[#FBC02D] font-bold">AI Matched</span>
                  </div>
                  <div className="space-y-1">
                    {searchSuggestions.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectNavSuggestion(item)}
                        className="w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between hover:bg-[#FDF8F3] text-[#1D3D33] transition-colors cursor-pointer active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#1D3D33]/10 flex items-center justify-center shrink-0 text-[#1D3D33]">
                              <MapPin className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-stone-900">{item.name}</span>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {item.state} • {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {item.aiMatch}% Match
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileSearchExpanded(false);
                setSearchQuery('');
              }}
              className={`p-2 rounded-full text-xs font-semibold cursor-pointer shrink-0 ${
                isScrolled ? 'text-[#1D3D33]' : 'text-white'
              }`}
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Standard Navbar Header Bar */
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Brand Logo */}
            <button
              id="brand-logo-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 group text-left cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D3D33] flex items-center justify-center text-[#FBC02D] shadow-sm transition-transform group-hover:scale-105 border border-[#FBC02D]/30">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${
                      isScrolled ? 'text-[#1D3D33]' : 'text-white'
                    }`}
                  >
                    Tour-<span className="text-[#FBC02D]">Weave</span>
                  </span>
                </div>
                <span
                  className={`hidden sm:block text-[9px] sm:text-[10px] uppercase tracking-widest font-medium ${
                    isScrolled ? 'text-[#1D3D33]/60' : 'text-stone-300'
                  }`}
                >
                  Predictive Indian Tourism
                </span>
              </div>
            </button>

            {/* Desktop Search Bar (Full bar on lg+ screens) */}
            <div
              ref={searchContainerRef}
              className="relative hidden lg:block w-56 xl:w-72 2xl:w-80 transition-all duration-300 focus-within:w-72 xl:focus-within:w-80"
            >
              <div
                className={`flex items-center rounded-full px-3 py-1.5 transition-all border ${
                  isScrolled
                    ? 'bg-[#FDF8F3] border-[#1D3D33]/15 text-[#1D3D33] focus-within:border-[#1D3D33] focus-within:ring-2 focus-within:ring-[#1D3D33]/10'
                    : 'bg-white/15 border-white/20 text-white placeholder:text-white/60 focus-within:bg-white/25'
                }`}
              >
                <Search
                  className={`w-3.5 h-3.5 mr-2 shrink-0 ${
                    isScrolled ? 'text-[#1D3D33]/60' : 'text-white/70'
                  }`}
                />
                <input
                  ref={desktopInputRef}
                  id="navbar-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search Bharat..."
                  autoComplete="off"
                  className={`w-full text-xs bg-transparent focus:outline-none font-medium ${
                    isScrolled
                      ? 'text-[#1D3D33] placeholder:text-[#1D3D33]/40'
                      : 'text-white placeholder:text-white/60'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-stone-600 pl-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Desktop Autocomplete Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#1D3D33]/15 p-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-80 overflow-y-auto no-scrollbar search-dropdown">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>{searchQuery ? `Suggestions for "${searchQuery}"` : '🔥 Top Indian Destinations'}</span>
                    <span className="text-[9px] text-[#FBC02D] font-bold">Predictive AI</span>
                  </div>
                  <div className="space-y-1">
                    {searchSuggestions.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectNavSuggestion(item)}
                        className="w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-[#FDF8F3] text-[#1D3D33] transition-colors cursor-pointer active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#1D3D33]/10 flex items-center justify-center shrink-0 text-[#1D3D33]">
                              <MapPin className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-stone-900">{item.name}</span>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {item.state} • {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {item.aiMatch}% Match
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop & Tablet Nav Links (Always visible on md and up) */}
            <nav className="hidden md:flex items-center gap-3.5 lg:gap-5 xl:gap-7">
              <button
                id="nav-link-ai-insights"
                onClick={() => scrollToSection('ai-insights-section')}
                className={`text-xs lg:text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
                AI Insights
              </button>
              <button
                id="nav-link-explore"
                onClick={() => scrollToSection('explore-section')}
                className={`text-xs lg:text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer whitespace-nowrap ${
                  isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
                }`}
              >
                Explore
              </button>
              <button
                id="nav-link-routes"
                onClick={() => scrollToSection('plan-journey-section')}
                className={`text-xs lg:text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer whitespace-nowrap ${
                  isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
                }`}
              >
                Routes
              </button>
              <button
                id="nav-link-testimonials"
                onClick={() => scrollToSection('reviews-section')}
                className={`text-xs lg:text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer whitespace-nowrap ${
                  isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
                }`}
              >
                Stories
              </button>
            </nav>

            {/* Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Icon Button (For Mobile AND Tablet view: < lg) */}
              <button
                id="navbar-mobile-search-btn"
                onClick={() => {
                  setIsMobileSearchExpanded(true);
                  setMobileMenuOpen(false);
                }}
                className={`lg:hidden p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  isScrolled
                    ? 'bg-[#1D3D33]/5 hover:bg-[#1D3D33]/10 text-[#1D3D33]'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
                }`}
                title="Search Places"
                aria-label="Open search bar"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist / Saved Places Button */}
              <button
                id="navbar-saved-trips-btn"
                onClick={onOpenSavedDrawer}
                className={`relative p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  isScrolled
                    ? 'bg-[#1D3D33]/5 hover:bg-[#1D3D33]/10 text-[#1D3D33]'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
                }`}
                title="Saved Destinations"
              >
                <Heart className="w-4 h-4" />
                {savedPlaces.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FBC02D] text-[#1D3D33] text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {savedPlaces.length}
                  </span>
                )}
              </button>

              {/* User Profile avatar toggle */}
              <div className="relative">
                <button
                  id="navbar-profile-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all flex items-center justify-center text-xs font-bold cursor-pointer ${
                    isScrolled
                      ? 'bg-[#1D3D33] text-white hover:bg-black shadow-sm'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30'
                  }`}
                  title="Profile"
                >
                  RD
                </button>

                {/* Profile Popover */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#1D3D33]/10 py-2 z-50 text-[#1D3D33] animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-[#1D3D33]">Radhika D. (RD)</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#1D3D33]/60">
                        Bharat Voyager Tier
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenSavedDrawer();
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDF8F3] flex items-center justify-between text-[#1D3D33]"
                    >
                      <span>Saved Destinations</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#1D3D33] text-white font-bold">
                        {savedPlaces.length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        scrollToSection('ai-insights-section');
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-[#FDF8F3] text-[#1D3D33]"
                    >
                      Live Crowd Alert Settings
                    </button>
                    <div className="border-t border-stone-100 mt-1 pt-1.5 px-4 py-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">
                        IRCTC & Flight Sync: Active
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Trip CTA */}
              <button
                id="navbar-cta-plan-trip"
                onClick={onOpenPlanWizard}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#1D3D33] text-white hover:bg-black shadow-sm hover:shadow transition-all border border-[#FBC02D]/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
                Plan Trip
              </button>

              {/* Mobile Menu Button */}
              <button
                id="navbar-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-colors ${
                  isScrolled
                    ? 'text-[#1D3D33] hover:bg-stone-100'
                    : 'text-white hover:bg-white/20'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu (When Hamburger is clicked) */}
      {mobileMenuOpen && !isMobileSearchExpanded && (
        <div className="md:hidden bg-[#FDF8F3] border-b border-stone-200 px-6 py-5 text-stone-900 shadow-xl space-y-4 animate-in slide-in-from-top-2">
          {/* Mobile Quick Search Bar in Menu */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-white border border-[#1D3D33]/15 px-3 py-2">
              <Search className="w-4 h-4 text-[#1D3D33]/60 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any destination in Bharat..."
                className="w-full text-xs bg-transparent focus:outline-none text-[#1D3D33]"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 bg-white rounded-xl border border-stone-200 p-2 shadow-lg max-h-56 overflow-y-auto no-scrollbar search-dropdown space-y-1">
                {searchSuggestions.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNavSuggestion(item)}
                    className="w-full text-left p-2 text-xs hover:bg-[#FDF8F3] rounded-xl flex items-center justify-between gap-2 text-[#1D3D33] cursor-pointer"
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
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection('ai-insights-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>AI Crowd & Weather Hub</span>
              <Sparkles className="w-4 h-4 text-[#FBC02D]" />
            </button>
            <button
              onClick={() => scrollToSection('explore-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>Explore Top Destinations</span>
              <MapPin className="w-4 h-4 text-[#1D3D33]" />
            </button>
            <button
              onClick={() => scrollToSection('plan-journey-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100"
            >
              Routes & Transit
            </button>
            <button
              onClick={() => scrollToSection('reviews-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100"
            >
              Traveler Stories
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlanWizard();
              }}
              className="w-full py-3 rounded-xl bg-[#1D3D33] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#FBC02D]" />
              Start AI Trip Customizer
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
