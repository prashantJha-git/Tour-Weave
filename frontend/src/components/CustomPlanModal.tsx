import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Train,
  Plane,
  Bus,
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';
import { TransportMode, CrowdPreference } from '../types';

interface CustomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (destination: string, transport: TransportMode, crowdPref: CrowdPreference, dateRange: string) => void;
}

export const CustomPlanModal: React.FC<CustomPlanModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('Udaipur');
  const [travelTheme, setTravelTheme] = useState('Royal Heritage & Palaces');
  const [transport, setTransport] = useState<TransportMode>('Train (Vande Bharat)');
  const [crowdPref, setCrowdPref] = useState<CrowdPreference>('Avoid Crowds');
  const [travelers, setTravelers] = useState('Couple (2 Adults)');
  const [dates, setDates] = useState('Nov 10 - Nov 14, 2026');

  if (!isOpen) return null;

  const destinationsList = [
    { name: 'Udaipur', state: 'Rajasthan', theme: 'Lakes & Royal Courtyards' },
    { name: 'Munnar', state: 'Kerala', theme: 'Highland Tea & Mist' },
    { name: 'Varanasi', state: 'Uttar Pradesh', theme: 'Sacred Ghats & Aarti' },
    { name: 'Leh-Ladakh', state: 'Ladakh', theme: 'Alpine Passes & Monasteries' },
    { name: 'Goa', state: 'Goa', theme: 'Tranquil South Coast' },
    { name: 'Hampi', state: 'Karnataka', theme: 'Vijayanagara Monoliths' }
  ];

  const travelThemes = [
    { title: 'Royal Heritage & Palaces', desc: 'Courtyards, havelis, and historic fort trails' },
    { title: 'Spiritual & Mindfulness', desc: 'Ghat dawns, temple aartis, and yoga sanctuaries' },
    { title: 'Nature & High Altitude', desc: 'Tea hills, wildlife sanctuaries, and glacial lakes' },
    { title: 'Coastal & Leisure', desc: 'Secret beaches, coastal cuisines, and backwaters' }
  ];

  const handleFinish = () => {
    onPlanCreated(destination, transport, crowdPref, dates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full border border-[#EADBCE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#1D3D33] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#FBC02D] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Predictive Bharat Trip Architect</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold">
              Customize Your Incredible Journey
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#FDF8F3] px-6 py-3 border-b border-[#1D3D33]/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-[#1D3D33]">
            <span>Step {step} of 3</span>
            <span className="text-[#1D3D33]/30">•</span>
            <span className="text-[#1D3D33]">
              {step === 1 && 'Destination & Theme'}
              {step === 2 && 'Transit & AI Crowd Mode'}
              {step === 3 && 'Dates & Group Profile'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-[#1D3D33]'
                    : i < step
                    ? 'w-4 bg-emerald-600'
                    : 'w-4 bg-[#1D3D33]/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  Select Primary Destination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {destinationsList.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setDestination(d.name)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        destination === d.name
                          ? 'border-[#1D3D33] bg-[#1D3D33] text-white shadow-sm'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <div className="font-bold text-sm">{d.name}</div>
                      <div className={`text-[10px] truncate ${destination === d.name ? 'text-stone-300' : 'text-[#1D3D33]/60'}`}>
                        {d.state}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  Choose Journey Vibe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {travelThemes.map((th) => (
                    <button
                      key={th.title}
                      type="button"
                      onClick={() => setTravelTheme(th.title)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        travelTheme === th.title
                          ? 'border-[#1D3D33] bg-[#EBF7EF] text-[#1D3D33] ring-2 ring-[#1D3D33]'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm text-[#1D3D33] flex items-center justify-between">
                        <span>{th.title}</span>
                        {travelTheme === th.title && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-[#1D3D33]/70 mt-1">
                        {th.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  Select Transportation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { mode: 'Train (Vande Bharat)' as TransportMode, desc: 'High-speed semi-high speed rail' },
                    { mode: 'Flight' as TransportMode, desc: 'Direct regional domestic flights' },
                    { mode: 'Luxury Bus' as TransportMode, desc: 'Volvo Multi-Axle sleeper' },
                    { mode: 'Private Cab' as TransportMode, desc: 'Chauffeur driven SUV / Sedan' }
                  ]).map((t) => (
                    <button
                      key={t.mode}
                      type="button"
                      onClick={() => setTransport(t.mode)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        transport === t.mode
                          ? 'border-[#1D3D33] bg-[#1D3D33] text-white shadow-sm'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{t.mode}</div>
                      <div className={`text-[10px] ${transport === t.mode ? 'text-stone-300' : 'text-[#1D3D33]/60'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  AI Crowd Preference
                </label>
                <div className="space-y-2">
                  {([
                    { title: 'Avoid Crowds' as CrowdPreference, sub: 'Prioritizes dawn monument visits (6 AM) & quiet havelis.' },
                    { title: 'Standard' as CrowdPreference, sub: 'Balanced itinerary between key sights & flexible timings.' },
                    { title: 'Festival Explorer' as CrowdPreference, sub: 'Includes vibrant local melas, temple aartis, & street culture.' }
                  ]).map((cp) => (
                    <button
                      key={cp.title}
                      type="button"
                      onClick={() => setCrowdPref(cp.title)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        crowdPref === cp.title
                          ? 'border-[#1D3D33] bg-[#EBF7EF] text-[#1D3D33] ring-2 ring-[#1D3D33]'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs sm:text-sm">{cp.title}</span>
                        <p className="text-[11px] text-[#1D3D33]/60">{cp.sub}</p>
                      </div>
                      {crowdPref === cp.title && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  Select Travel Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Nov 10 - Nov 14, 2026 (Autumn Splendor)',
                    'Dec 05 - Dec 09, 2026 (Winter Heritage)',
                    'Jan 14 - Jan 18, 2027 (Kite Festival & Clear Skies)',
                    'Feb 20 - Feb 24, 2027 (Pleasant Spring)'
                  ].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDates(d)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        dates === d
                          ? 'border-[#1D3D33] bg-[#1D3D33] text-white shadow-sm'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 mb-1 opacity-70" />
                      <span className="font-bold">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#1D3D33]/70 tracking-wider mb-2">
                  Who is Traveling?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Solo Explorer',
                    'Couple (2 Adults)',
                    'Family (3-4)',
                    'Group of Friends'
                  ].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTravelers(g)}
                      className={`p-3 rounded-2xl border text-center text-xs transition-all cursor-pointer ${
                        travelers === g
                          ? 'border-[#1D3D33] bg-[#EBF7EF] text-[#1D3D33] font-bold ring-2 ring-[#1D3D33]'
                          : 'border-[#1D3D33]/15 bg-[#FDF8F3] hover:bg-[#F8F1E9] text-[#1D3D33]'
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1 text-[#1D3D33]/70" />
                      <span>{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Preview Box */}
              <div className="p-4 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 text-xs text-[#1D3D33] space-y-1">
                <div className="font-bold text-[#1D3D33] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AI Plan Synthesis Ready</span>
                </div>
                <p className="text-[11px] text-[#1D3D33]/70">
                  Customizing {destination} itinerary for {travelers} via {transport} with {crowdPref} engine.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-5 bg-[#FDF8F3] border-t border-[#1D3D33]/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#1D3D33]/15 text-[#1D3D33] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#1D3D33] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FBC02D]" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#1D3D33] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-[#FBC02D]/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
              <span>Generate Custom Plan</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
