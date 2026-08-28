import React from 'react';
import { X, Trash2, Heart, Sparkles, MapPin, ArrowRight, IndianRupee } from 'lucide-react';
import { Destination } from '../types';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: Destination[];
  onRemove: (dest: Destination) => void;
  onSelect: (dest: Destination) => void;
  onGenerateMultiCity: () => void;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedPlaces,
  onRemove,
  onSelect,
  onGenerateMultiCity,
}) => {
  if (!isOpen) return null;

  const totalEstCost = savedPlaces.reduce((acc, curr) => acc + curr.startingPriceInr, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDFB] border-l border-[#EADBCE] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-[#1D3D33] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FBC02D] text-[#1D3D33] flex items-center justify-center font-bold shadow-sm">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">
                  Saved Bharat Destinations
                </h3>
                <p className="text-[11px] text-stone-300">
                  {savedPlaces.length} {savedPlaces.length === 1 ? 'place' : 'places'} bookmarked
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Saved Places */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {savedPlaces.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FDF8F3] mx-auto flex items-center justify-center text-[#1D3D33]/40 border border-[#1D3D33]/10">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-[#1D3D33] text-lg">
                  Your Wishlist is Empty
                </h4>
                <p className="text-xs text-[#1D3D33]/60 max-w-xs mx-auto">
                  Click the heart icon on any destination card to bookmark it for personalized AI multi-city itinerary generation.
                </p>
              </div>
            ) : (
              savedPlaces.map((dest) => (
                <div
                  key={dest.id}
                  className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 shadow-sm hover:shadow transition-all flex gap-3 items-center group"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onSelect(dest);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1D3D33]/50 uppercase tracking-widest">
                        {dest.category}
                      </span>
                      <button
                        onClick={() => onRemove(dest)}
                        className="text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      onClick={() => {
                        onClose();
                        onSelect(dest);
                      }}
                      className="font-serif font-bold text-sm text-[#1D3D33] truncate hover:text-[#FBC02D] cursor-pointer transition-colors"
                    >
                      {dest.name}
                    </h4>

                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-bold text-[#1D3D33]">
                        ₹{dest.startingPriceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-[#EBF7EF] px-1.5 py-0.5 rounded border border-emerald-200">
                        {dest.aiMatchPercentage}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Multi-City Action */}
          {savedPlaces.length > 0 && (
            <div className="p-6 bg-[#FDF8F3] border-t border-[#1D3D33]/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#1D3D33]">
                <span>Estimated Combined Budget:</span>
                <span className="text-base text-[#1D3D33]">
                  ₹{totalEstCost.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onGenerateMultiCity();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1D3D33] hover:bg-black text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm border border-[#FBC02D]/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FBC02D]" />
                <span>Build Synchronized Multi-City Route</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
