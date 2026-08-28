import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Menu, X, Compass, User, MapPin } from 'lucide-react';
import { Destination } from '../types';

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
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-md shadow-sm py-3.5 border-b border-[#1D3D33]/10'
          : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent py-5 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#1D3D33] flex items-center justify-center text-[#FBC02D] shadow-sm transition-transform group-hover:scale-105 border border-[#FBC02D]/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-serif font-bold tracking-tight ${
                isScrolled ? 'text-[#1D3D33]' : 'text-white'
              }`}>
                tour<span className="text-[#FBC02D]">-weave</span>
              </span>
            </div>
            <span className={`block text-[10px] uppercase tracking-widest font-medium ${
              isScrolled ? 'text-[#1D3D33]/60' : 'text-stone-300'
            }`}>
              Predictive Indian Tourism
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            id="nav-link-explore"
            onClick={() => scrollToSection('explore-section')}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer ${
              isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
            }`}
          >
            Explore
          </button>
          <button
            id="nav-link-ai-insights"
            onClick={() => scrollToSection('ai-insights-section')}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] flex items-center gap-1.5 cursor-pointer ${
              isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
            AI Insights
          </button>
          <button
            id="nav-link-routes"
            onClick={() => scrollToSection('plan-journey-section')}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer ${
              isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
            }`}
          >
            Routes
          </button>
          <button
            id="nav-link-testimonials"
            onClick={() => scrollToSection('reviews-section')}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer ${
              isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
            }`}
          >
            Stories
          </button>
          <button
            id="nav-link-journal"
            onClick={() => scrollToSection('journal-section')}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FBC02D] cursor-pointer ${
              isScrolled ? 'text-[#1D3D33]' : 'text-stone-100'
            }`}
          >
            Journal
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Wishlist / Saved Places Button */}
          <button
            id="navbar-saved-trips-btn"
            onClick={onOpenSavedDrawer}
            className={`relative p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
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
              className={`w-9 h-9 rounded-full transition-all flex items-center justify-center text-xs font-bold cursor-pointer ${
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
                  <p className="text-[10px] uppercase tracking-widest text-[#1D3D33]/60">Bharat Voyager Tier</p>
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
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">IRCTC & Flight Sync: Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Plan Trip CTA */}
          <button
            id="navbar-cta-plan-trip"
            onClick={onOpenPlanWizard}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#1D3D33] text-white hover:bg-black shadow-sm hover:shadow transition-all border border-[#FBC02D]/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
            Plan AI Trip
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
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDF8F3] border-b border-stone-200 px-6 py-5 text-stone-900 shadow-xl space-y-4">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection('explore-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>Explore Top Destinations</span>
              <MapPin className="w-4 h-4 text-[#1D3D33]" />
            </button>
            <button
              onClick={() => scrollToSection('ai-insights-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>AI Crowd & Weather Hub</span>
              <Sparkles className="w-4 h-4 text-[#FBC02D]" />
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
            <button
              onClick={() => scrollToSection('journal-section')}
              className="text-left font-semibold text-stone-800 py-2 border-b border-stone-100"
            >
              Journal of Bharat
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
