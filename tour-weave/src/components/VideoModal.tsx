import React from 'react';
import { X, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#1D3D33] rounded-3xl max-w-3xl w-full border border-[#FBC02D]/30 shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FBC02D] text-[#1D3D33] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-white">
                Incredible Bharat: AI Tour Experience
              </h3>
              <p className="text-[11px] text-stone-300">
                Visualizing India's spiritual dawns, royal forts & predictive transit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area (rich simulated high-definition video frame with dynamic scenery) */}
        <div className="relative aspect-video bg-black overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1400&q=85"
            alt="Royal Rajasthan & Incredible India Montage"
            className="w-full h-full object-cover animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Telemetry overlay on video */}
          <div className="absolute top-4 left-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#FBC02D] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live ML Radar Active</span>
            </div>
            <p className="text-[10px] text-stone-300">Footfall: 24% (Low) • Sunlight: Optimal 8:45 AM</p>
          </div>

          {/* Center Play indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#FBC02D] text-[#1D3D33] mx-auto flex items-center justify-center shadow-2xl ring-8 ring-white/20">
                <span className="text-xl font-black">AI</span>
              </div>
              <p className="text-sm font-serif-luxury font-bold text-white drop-shadow-md">
                Exploring Rajasthan, Kerala & Ladakh in 4K
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live 360° Heritage Telemetry</span>
            </div>
            <span className="font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded">
              01:48 / 03:20
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#152e27] border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Curated by Ministry of Tourism & Tour-Weave Geospatial Models</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FBC02D] text-[#1D3D33] font-bold text-xs"
          >
            Close Video
          </button>
        </div>

      </div>
    </div>
  );
};
