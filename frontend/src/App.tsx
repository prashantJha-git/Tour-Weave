import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValueProps } from './components/ValueProps';
import { AIInsightsHub } from './components/AIInsightsHub';
import { WeatherForecastLab } from './components/WeatherForecastLab';
import { RecommendedPlaces } from './components/RecommendedPlaces';
import { PlanPerfectTrip } from './components/PlanPerfectTrip';
import { Testimonials } from './components/Testimonials';
import { JournalOfBharat } from './components/JournalOfBharat';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

// Modals and Drawers
import { ItineraryModal } from './components/ItineraryModal';
import { CustomPlanModal } from './components/CustomPlanModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import { VideoModal } from './components/VideoModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';

import { Destination, TransportMode, CrowdPreference, HeritageGalleryItem } from './types';
import { POPULAR_DESTINATIONS } from './data/mockData';

export default function App() {
  // Saved places state (pre-populated with 2 authentic Indian destinations for immediate delight)
  const [savedPlaces, setSavedPlaces] = useState<Destination[]>([
    POPULAR_DESTINATIONS[0], // Udaipur
    POPULAR_DESTINATIONS[1], // Munnar
  ]);

  // Modal and Drawer States
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlanWizardOpen, setIsPlanWizardOpen] = useState(false);
  const [selectedDestinationDetail, setSelectedDestinationDetail] = useState<Destination | null>(null);
  const [lightboxItem, setLightboxItem] = useState<HeritageGalleryItem | null>(null);

  // AI Itinerary Modal State
  const [itineraryState, setItineraryState] = useState<{
    isOpen: boolean;
    destination: string;
    transport: TransportMode;
    crowdPref: CrowdPreference;
    dateRange: string;
  }>({
    isOpen: false,
    destination: 'Jaipur',
    transport: 'Train (Vande Bharat)',
    crowdPref: 'Avoid Crowds',
    dateRange: 'Oct 14 - Oct 17, 2026',
  });

  // Toggle saving destinations
  const handleToggleSave = (dest: Destination) => {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.id === dest.id);
      if (exists) {
        return prev.filter((p) => p.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
  };

  const handleGenerateItinerary = (
    destination: string,
    transport: TransportMode,
    crowdPref: CrowdPreference,
    dateRange: string
  ) => {
    setItineraryState({
      isOpen: true,
      destination,
      transport,
      crowdPref,
      dateRange,
    });
  };

  const handlePlanForPlace = (placeName: string) => {
    setItineraryState({
      isOpen: true,
      destination: placeName,
      transport: 'Train (Vande Bharat)',
      crowdPref: 'Avoid Crowds',
      dateRange: 'Nov 12 - Nov 15, 2026',
    });
  };

  const handleViewDestinationDetail = (locationOrCity: string, destinationId?: string) => {
    if (destinationId) {
      const byId = POPULAR_DESTINATIONS.find((d) => d.id === destinationId);
      if (byId) {
        setSelectedDestinationDetail(byId);
        return;
      }
    }

    const raw = locationOrCity.toLowerCase();
    const cityName = locationOrCity.split(',')[0].trim().toLowerCase();
    const matched = POPULAR_DESTINATIONS.find((d) => {
      const dCity = d.name.split(',')[0].trim().toLowerCase();
      return (
        d.id.toLowerCase().includes(cityName) ||
        d.name.toLowerCase().includes(cityName) ||
        cityName.includes(dCity) ||
        raw.includes(dCity) ||
        d.state.toLowerCase().includes(cityName) ||
        d.tagline.toLowerCase().includes(cityName) ||
        (cityName.includes('amber') || cityName.includes('jaipur') || raw.includes('amber') || raw.includes('jaipur') ? d.id === 'jaipur-pink-city-heritage' : false) ||
        (cityName.includes('hampi') || cityName.includes('chariot') || raw.includes('hampi') || raw.includes('chariot') ? d.id === 'hampi-vijayanagara-ruins' : false) ||
        (cityName.includes('taj') || cityName.includes('agra') || raw.includes('taj') || raw.includes('agra') ? d.id === 'agra-taj-mahal-wonder' : false) ||
        (cityName.includes('goa') || cityName.includes('van') || raw.includes('goa') || raw.includes('van') ? d.id === 'goa-south-coastal-bliss' : false) ||
        (cityName.includes('pangong') || cityName.includes('ladakh') || cityName.includes('leh') || raw.includes('ladakh') ? d.id === 'leh-ladakh-high-passes' : false) ||
        (cityName.includes('alleppey') || cityName.includes('houseboat') || raw.includes('alleppey') || raw.includes('backwaters') ? (d.id === 'alleppey-backwaters-serenity' || d.id === 'munnar-tea-valleys') : false)
      );
    });

    if (matched) {
      setSelectedDestinationDetail(matched);
    } else {
      setSelectedDestinationDetail(POPULAR_DESTINATIONS[0]);
    }
  };

  const handleGenerateMultiCity = () => {
    if (savedPlaces.length > 0) {
      const firstCity = savedPlaces[0].name.split(',')[0].trim();
      setItineraryState({
        isOpen: true,
        destination: `${firstCity} & ${savedPlaces.length > 1 ? savedPlaces[1].name.split(',')[0].trim() : 'Circuits'}`,
        transport: 'Train (Vande Bharat)',
        crowdPref: 'Avoid Crowds',
        dateRange: 'Nov 15 - Nov 20, 2026',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3] text-stone-900 selection:bg-[#1D3D33] selection:text-[#FBC02D]">
      
      {/* 1. Transparent-to-Solid Navigation Header */}
      <Navbar
        savedPlaces={savedPlaces}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenPlanWizard={() => setIsPlanWizardOpen(true)}
        onSelectDestination={(dest) => setSelectedDestinationDetail(dest)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section & Floating AI Travel Search Bar */}
        <HeroSection
          onExploreClick={() => {
            const el = document.getElementById('explore-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onWatchVideo={() => setIsVideoModalOpen(true)}
          onGenerateItinerary={handleGenerateItinerary}
        />

        {/* 3. Value Props / Capability Pills */}
        <ValueProps />

        {/* 4. Core AI Insights & Predictions Section (SIH Feature Hub) */}
        <AIInsightsHub />

        {/* 4b. AI Weather Forecast Lab (merged-in weather_ml: multi-day XGBoost forecasts) */}
        <WeatherForecastLab />

        {/* 5. AI Recommended Places Carousel ("Top Places To Explore") */}
        <RecommendedPlaces
          savedPlaces={savedPlaces}
          onToggleSave={handleToggleSave}
          onSelectDestination={(dest) => setSelectedDestinationDetail(dest)}
        />

        {/* 6. "Plan Your Perfect Trip" Feature Block */}
        <PlanPerfectTrip
          onStartCustomPlan={() => setIsPlanWizardOpen(true)}
        />

        {/* 7. Indian Travel Stories & Reviews (Testimonials) */}
        <Testimonials />

        {/* 8. "Journal of Bharat" (Travel Blog) */}
        <JournalOfBharat />

        {/* 9. Smart Travel Alerts & Newsletter Banner */}
        <Newsletter />
      </main>

      {/* 10. Deep Evergreen Footer with 6-Image Heritage Gallery */}
      <Footer
        onSelectGalleryItem={(item) => handleViewDestinationDetail(item.location, item.destinationId)}
      />

      {/* Modals & Overlay Drawers */}
      <ItineraryModal
        isOpen={itineraryState.isOpen}
        onClose={() => setItineraryState((prev) => ({ ...prev, isOpen: false }))}
        destination={itineraryState.destination}
        transport={itineraryState.transport}
        crowdPref={itineraryState.crowdPref}
        dateRange={itineraryState.dateRange}
      />

      <CustomPlanModal
        isOpen={isPlanWizardOpen}
        onClose={() => setIsPlanWizardOpen(false)}
        onPlanCreated={(destination, transport, crowdPref, dateRange) => {
          handleGenerateItinerary(destination, transport, crowdPref, dateRange);
        }}
      />

      <PlaceDetailModal
        destination={selectedDestinationDetail}
        onClose={() => setSelectedDestinationDetail(null)}
        isSaved={selectedDestinationDetail ? savedPlaces.some((p) => p.id === selectedDestinationDetail.id) : false}
        onToggleSave={handleToggleSave}
        onGenerateForPlace={handlePlanForPlace}
      />

      <SavedTripsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPlaces={savedPlaces}
        onRemove={handleToggleSave}
        onSelect={(dest) => setSelectedDestinationDetail(dest)}
        onGenerateMultiCity={handleGenerateMultiCity}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      <ImageLightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onPlanTripToHeritage={(cityName) => handlePlanForPlace(cityName)}
        onViewDestinationDetail={(cityName, destinationId) => handleViewDestinationDetail(cityName, destinationId)}
      />

    </div>
  );
}
