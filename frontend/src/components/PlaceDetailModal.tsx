import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  MapPin,
  Star,
  Clock,
  TrendingDown,
  Calendar,
  Train,
  CheckCircle2,
  Heart,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { Destination } from '../types';

interface PlaceDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (dest: Destination) => void;
  onGenerateForPlace: (placeName: string) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  destination,
  onClose,
  isSaved,
  onToggleSave,
  onGenerateForPlace,
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  React.useEffect(() => {
    setActiveImgIndex(0);
  }, [destination?.id]);

  if (!destination) return null;

  const currentImageSrc =
    (destination.gallery && destination.gallery[activeImgIndex]) ||
    destination.image ||
    'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=85';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDFB] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#EADBCE] shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Gallery & Header Hero */}
        <div className="relative h-64 sm:h-80 bg-stone-900 overflow-hidden shrink-0">
          <img
            key={currentImageSrc}
            src={currentImageSrc}
            alt={destination.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85';
            }}
            className="w-full h-full object-cover object-center transition-all duration-500"
          />
          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 pointer-events-none" />

          {/* Top action buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1D3D33]/90 text-[#FBC02D] text-xs font-bold backdrop-blur-md border border-[#FBC02D]/40 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
                <span>{destination.aiMatchPercentage}% AI Match</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/90 text-stone-900 text-xs font-bold backdrop-blur-md shadow-sm">
                {destination.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(destination)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors backdrop-blur-md shadow-sm cursor-pointer ${
                  isSaved ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-white hover:text-red-500'
                }`}
                aria-label="Save destination"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-md shadow-sm cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title & Location Banner with Gallery Thumbnails */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white z-20">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs text-stone-200 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FBC02D]" />
                <span className="font-medium">{destination.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#FBC02D]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {destination.rating} ({destination.reviewsCount} Reviews)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold leading-tight drop-shadow-md">
                {destination.tagline}
              </h2>
            </div>

            {/* Gallery Thumbnails */}
            {destination.gallery && destination.gallery.length > 1 && (
              <div className="flex gap-1.5 shrink-0 bg-black/40 p-1 rounded-xl backdrop-blur-md border border-white/20">
                {destination.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImgIndex === idx
                        ? 'border-[#FBC02D] scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 bg-white">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
              <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Crowd Density</span>
              <div className="text-sm font-bold text-[#1D3D33] mt-1 flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                {destination.crowdLevel} ({destination.crowdDensity}%)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
              <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Duration</span>
              <div className="text-sm font-bold text-[#1D3D33] mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#1D3D33]/60" />
                {destination.idealDuration}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
              <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Best Season</span>
              <div className="text-sm font-bold text-[#1D3D33] mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#FBC02D]" />
                {destination.bestMonths}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
              <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Recommended Transit</span>
              <div className="text-sm font-bold text-[#1D3D33] mt-1 flex items-center gap-1 truncate">
                <Train className="w-4 h-4 shrink-0" />
                <span className="truncate">{destination.recommendedTransport}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-serif font-bold text-[#1D3D33] text-base mb-2">
              About This Destination
            </h4>
            <p className="text-[#1D3D33]/70 text-sm leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* AI Intelligence Advice Callout */}
          <div className="p-4 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 text-[#1D3D33] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1D3D33] text-[#FBC02D] flex items-center justify-center shrink-0 font-bold">
              💡
            </div>
            <div>
              <span className="font-bold text-[10px] uppercase tracking-widest block text-[#1D3D33]">
                Tour-Weaver Machine Learning Travel Advisory
              </span>
              <p className="text-xs text-[#1D3D33]/80 mt-0.5 leading-relaxed">
                {destination.aiTravelTip}
              </p>
            </div>
          </div>

          {/* Highlights List */}
          <div>
            <h4 className="font-serif font-bold text-[#1D3D33] text-base mb-2">
              Key Experiences & Sights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {destination.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDF8F3] border border-[#1D3D33]/10 text-xs font-semibold text-[#1D3D33]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer with Price & Plan CTA */}
        <div className="p-5 bg-[#FDF8F3] border-t border-[#1D3D33]/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#1D3D33]/60 uppercase tracking-widest block font-semibold">
              Estimated Heritage Package
            </span>
            <div className="flex items-baseline text-[#1D3D33] font-bold text-lg">
              <span>₹{destination.startingPriceInr.toLocaleString('en-IN')}</span>
              <span className="text-xs text-[#1D3D33]/60 font-normal ml-1">/ person all-inclusive</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                const cityName = destination.name.split(',')[0];
                onGenerateForPlace(cityName);
              }}
              className="px-6 py-3 rounded-2xl bg-[#1D3D33] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm border border-[#FBC02D]/40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FBC02D]" />
              <span>Generate AI 3-Day Plan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
