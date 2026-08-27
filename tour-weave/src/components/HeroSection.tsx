import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { SearchCard } from './SearchCard';
import { TransportMode, CrowdPreference } from '../types';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2000&q=85", // Taj Mahal
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85", // Rajasthan
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=85", // Kerala
  "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2000&q=85", // Varanasi
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=85"  // Himalayas
];

interface HeroSectionProps {
  onExploreClick: () => void;
  onWatchVideo?: () => void;
  onGenerateItinerary: (destination: string, transport: TransportMode, crowdPref: CrowdPreference, dateRange: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onGenerateItinerary,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      id="hero-section"
      className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-24 pb-16 z-20"
    >
      {/* Background Image with luxury gradient overlays and smooth parallax - overflow hidden strictly on background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          className="absolute inset-0 origin-center pointer-events-none bg-stone-900"
        >
          {HERO_IMAGES.map((imgUrl, index) => (
            <motion.img
              key={imgUrl}
              src={imgUrl}
              alt="Majestic Indian Destinations"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ))}
          {/* Editorial gradient overlay for legibility and luxury atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F3] via-transparent to-black/50" />
        </motion.div>
      </div>

      {/* Hero Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-4"
      >
        <div className="max-w-2xl text-white space-y-5">
          
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#FBC02D] text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Predictive Indian Tourism</span>
          </motion.div>

          {/* Main Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.12]"
          >
            Experience <br />
            <span className="text-[#FDF8F3]">Incredible Bharat</span> <br />
            <span className="font-serif italic font-normal text-[#FBC02D]">Like Never Before</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-stone-200 font-normal leading-relaxed max-w-xl"
          >
            Discover sacred river ghats, royal desert havelis, and misty emerald tea hills with real-time crowd forecasts, historical weather trends, and multimodal transit optimization.
          </motion.p>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-1"
          >
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="px-8 py-4 sm:py-4.5 rounded-2xl bg-[#1D3D33] hover:bg-black text-white font-bold text-sm sm:text-base tracking-wide flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all border border-[#FBC02D]/40 group cursor-pointer"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FBC02D] transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Quick metric pill row - cleanly spaced and unobstructed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2"
          >
            <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6 px-4 py-2.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-xs text-stone-200 shadow-sm">
              <div>
                <span className="font-bold text-white text-base leading-tight block">500+</span>
                <p className="text-stone-300 text-[11px]">Heritage Sites Mapped</p>
              </div>
              <div className="w-px h-7 bg-white/20" />
              <div>
                <span className="font-bold text-[#FBC02D] text-base leading-tight block">94.8%</span>
                <p className="text-stone-300 text-[11px]">Crowd Model Accuracy</p>
              </div>
              <div className="w-px h-7 bg-white/20" />
              <div>
                <span className="font-bold text-white text-base leading-tight block">₹0</span>
                <p className="text-stone-300 text-[11px]">Hidden Booking Fees</p>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Floating Search Bar Integration - flat and stable */}
      <div className="w-full relative z-30">
        <SearchCard onGenerate={onGenerateItinerary} />
      </div>
    </section>
  );
};
