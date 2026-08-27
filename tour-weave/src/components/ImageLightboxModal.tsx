import React from 'react';
import { X, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { HeritageGalleryItem } from '../types';

interface ImageLightboxModalProps {
  item: HeritageGalleryItem | null;
  onClose: () => void;
  onPlanTripToHeritage: (locationName: string, destinationId?: string) => void;
  onViewDestinationDetail?: (locationName: string, destinationId?: string) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  item,
  onClose,
  onPlanTripToHeritage,
  onViewDestinationDetail,
}) => {
  if (!item) return null;

  const resolvedCity = item.cityKey || item.location.split(',')[0].trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full border border-[#EADBCE] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Image Container */}
        <div className="relative aspect-[16/10] bg-black">
          <img
            src={item.image}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80';
            }}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Body */}
        <div className="p-6 space-y-4 bg-white">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#1D3D33]/60 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#1D3D33]" />
              <span>{item.location}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1D3D33]">
              {item.title}
            </h3>
            <p className="text-[#1D3D33]/70 text-sm mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 text-xs text-[#1D3D33] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FBC02D]" />
              <span>AI Crowd Telemetry: <strong>Active at this site</strong></span>
            </div>
            <span className="text-emerald-800 font-semibold bg-[#EBF7EF] px-2 py-0.5 rounded border border-emerald-200">Verified Bharat Monument</span>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#1D3D33]/70 hover:bg-stone-100 cursor-pointer"
            >
              Close Gallery
            </button>
            <div className="flex items-center gap-2">
              {onViewDestinationDetail && (
                <button
                  onClick={() => {
                    onClose();
                    onViewDestinationDetail(resolvedCity, item.destinationId);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#1D3D33]/20 text-[#1D3D33] text-xs font-bold hover:bg-[#1D3D33]/5 transition-all cursor-pointer"
                >
                  View Destination Guide
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  onPlanTripToHeritage(resolvedCity, item.destinationId);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1D3D33] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-black transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
                <span>Generate AI Route</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
