import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  TrendingDown,
  Train,
  CheckCircle2,
  Share2,
  Download,
  IndianRupee,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { GeneratedItinerary, TransportMode, CrowdPreference } from '../types';
import { SAMPLE_GENERATED_ITINERARIES, CITIES_DATA } from '../data/mockData';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  transport: TransportMode;
  crowdPref: CrowdPreference;
  dateRange: string;
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  destination,
  transport,
  crowdPref,
  dateRange,
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedToProfile, setIsSavedToProfile] = useState(false);

  if (!isOpen) return null;

  // Fetch or generate dynamic mock itinerary with robust fuzzy fallback matching
  const findItineraryKey = (destStr: string): string => {
    const clean = destStr.toLowerCase();
    for (const key of Object.keys(SAMPLE_GENERATED_ITINERARIES)) {
      if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
        return key;
      }
    }
    return 'Jaipur';
  };

  const matchedKey = findItineraryKey(destination);
  const baseItin = SAMPLE_GENERATED_ITINERARIES[matchedKey] || SAMPLE_GENERATED_ITINERARIES['Jaipur'];
  const cityInfo = CITIES_DATA[matchedKey] || CITIES_DATA['Jaipur'];

  const itinerary: GeneratedItinerary = {
    ...baseItin,
    destination: destination.includes(',') ? destination : `${destination}, ${cityInfo.weather.state}`,
    transportMode: transport,
    crowdPreference: crowdPref,
    dateRange: dateRange,
    estimatedCostInr: baseItin.estimatedCostInr || (destination.toLowerCase().includes('ladakh') ? 18999 : destination.toLowerCase().includes('udaipur') ? 14999 : 11499),
  };

  const activeDayData = itinerary.days.find((d) => d.dayNumber === selectedDay) || itinerary.days[0];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#FFFDFB] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#EADBCE] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-7 bg-[#1D3D33] text-white flex items-start justify-between relative">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBC02D]/20 text-[#FBC02D] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#FBC02D]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Optimized Bharat Itinerary</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              {itinerary.destination}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-200 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FBC02D]" />
                {itinerary.dateRange}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-[#FBC02D]" />
                {itinerary.transportMode}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Crowd Mode: {itinerary.crowdPreference}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Highlights Metric Bar */}
        <div className="bg-[#FDF8F3] px-6 py-3.5 border-b border-[#1D3D33]/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#EBF7EF] text-[#1D3D33] font-bold flex items-center gap-1 border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              {itinerary.crowdSavedPercentage}% Queue Time Avoided
            </span>
            <span className="hidden sm:inline text-[#1D3D33]/70 font-medium">
              Early access slots & telemetry routing applied
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#1D3D33] font-bold">
            <span className="text-[#1D3D33]/60 font-normal">Est. Budget:</span>
            <span className="text-base text-[#1D3D33]">
              ₹{itinerary.estimatedCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#1D3D33]/50 font-normal">/ person incl. stay & transit</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-6">
          
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1D3D33]/10 pb-3">
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDay === day.dayNumber
                    ? 'bg-[#1D3D33] text-white shadow-sm'
                    : 'bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33] border border-[#1D3D33]/10'
                }`}
              >
                Day {day.dayNumber} : {day.theme}
              </button>
            ))}
          </div>

          {/* Active Day Header */}
          <div className="bg-[#FDF8F3] p-4 rounded-2xl border border-[#1D3D33]/10 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1D3D33]">
                Day {activeDayData.dayNumber}: {activeDayData.title}
              </h3>
              <p className="text-xs text-[#1D3D33]/60 mt-0.5">
                Weather: <strong className="text-[#1D3D33]">{activeDayData.weatherSummary}</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1D3D33]/10 text-[#1D3D33]">
              {activeDayData.activities.length} AI Scheduled Stops
            </span>
          </div>

          {/* Activities Timeline */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[#1D3D33]/10">
            {activeDayData.activities.map((act, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-1">
                {/* Timeline node */}
                <div className="w-10 h-10 rounded-full bg-[#1D3D33] text-[#FBC02D] flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white shadow-md z-10">
                  {index + 1}
                </div>

                {/* Activity Card */}
                <div className="flex-1 p-5 rounded-2xl bg-white border border-[#1D3D33]/10 shadow-sm space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1D3D33]" />
                      <span className="font-bold text-xs text-[#1D3D33]">{act.time}</span>
                      <span className="text-[#1D3D33]/30">•</span>
                      <span className="text-xs font-semibold text-[#1D3D33] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1D3D33]/50" />
                        {act.location}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EF] text-[#1D3D33] border border-emerald-200">
                      {act.crowdPrediction}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#1D3D33]">
                    {act.title}
                  </h4>

                  <p className="text-xs text-[#1D3D33]/70 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="pt-2 border-t border-[#1D3D33]/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#1D3D33]/60">
                      Transit: <strong className="text-[#1D3D33]">{act.modeOfTransit}</strong>
                    </span>
                    <span className="text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md font-semibold border border-amber-200/60">
                      💡 {act.smartTip}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-[#FDF8F3] border-t border-[#1D3D33]/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#1D3D33]/15 text-[#1D3D33] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Link Copied!' : 'Share Itinerary'}</span>
            </button>
            <button
              onClick={() => {
                setIsSavedToProfile(true);
                setTimeout(() => setIsSavedToProfile(false), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#1D3D33]/15 text-[#1D3D33] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isSavedToProfile ? 'Saved to Profile!' : 'Export / Save'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1D3D33] hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Done Exploring
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
