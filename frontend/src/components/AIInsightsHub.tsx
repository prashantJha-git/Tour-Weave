import React, { useState } from 'react';
import {
  Sparkles,
  CloudSun,
  Droplets,
  Wind,
  Gauge,
  Clock,
  TrendingDown,
  Info,
  ShieldCheck,
  AlertTriangle,
  SunMedium
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePlaceInsights, useTopPlaceNames } from '../hooks/useBackendData';

export const AIInsightsHub: React.FC = () => {
  const cityList = useTopPlaceNames(6);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Once the real place list arrives from the backend, default to the first one.
  React.useEffect(() => {
    if (!selectedCity && cityList.length > 0) setSelectedCity(cityList[0]);
  }, [cityList, selectedCity]);

  const { weather, crowd, loading, error } = usePlaceInsights(selectedCity);

  if (!selectedCity || loading || !weather || !crowd) {
    return (
      <section id="ai-insights-section" className="py-16 bg-[#FDF8F3] border-y border-[#1D3D33]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <Sparkles className="w-6 h-6 text-[#1D3D33] mx-auto mb-3 animate-pulse" />
          <p className="text-[#1D3D33]/70 text-sm">
            {error ? `Couldn't reach the prediction API: ${error}` : 'Loading live crowd & weather intelligence…'}
          </p>
        </div>
      </section>
    );
  }

  const activeDay = weather.forecast5Days[selectedDayIndex] || weather.forecast5Days[0] || {
    day: '—', temp: weather.currentTemp, tempMin: weather.currentTemp, rainfallMm: 0, condition: weather.condition, crowdPercent: crowd.densityScore,
  };

  return (
    <section id="ai-insights-section" className="py-16 bg-[#FDF8F3] border-y border-[#1D3D33]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D3D33] text-[#FBC02D] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#FBC02D]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Predictive Intelligence Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight">
              Real-Time AI Crowd & Weather Intelligence
            </h2>
            <p className="text-[#1D3D33]/70 text-sm sm:text-base mt-1 max-w-2xl font-normal">
              Trained on multi-year Indian tourism footfall, IRCTC passenger flux, and meteorological micro-climate models.
            </p>
          </div>

          {/* City Selection Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {cityList.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedDayIndex(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCity === city
                    ? 'bg-[#1D3D33] text-white shadow-sm'
                    : 'bg-white text-[#1D3D33] hover:bg-[#F8F1E9] border border-[#1D3D33]/10'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Two-Column AI Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Live Weather & 5-Day Historical/Forecast Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1D3D33]/10 shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1D3D33]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 flex items-center justify-center text-[#1D3D33]">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1D3D33]">
                      Live Weather & Historical Trends
                    </h3>
                    <p className="text-xs text-[#1D3D33]/60">
                      {weather.city}, {weather.state} • Micro-climate station
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EF] text-[#1D3D33] border border-emerald-200">
                  {weather.monsoonStatus}
                </span>
              </div>

              {/* Current Weather Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
                  <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Temp</span>
                  <div className="text-2xl font-bold text-[#1D3D33] mt-1 flex items-baseline gap-1">
                    {weather.currentTemp}°C
                  </div>
                  <span className="text-[11px] text-[#1D3D33]/70">{weather.condition}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
                  <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Humidity</span>
                  <div className="text-xl font-bold text-[#1D3D33] mt-1 flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    {weather.humidity}%
                  </div>
                  <span className="text-[11px] text-[#1D3D33]/70">Comfortable</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
                  <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Air Quality</span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    AQI {weather.aqi}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Good / Moderate</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10">
                  <span className="text-[10px] font-bold text-[#1D3D33]/60 uppercase tracking-widest block">Wind & UV</span>
                  <div className="text-xl font-bold text-[#1D3D33] mt-1 flex items-center gap-1">
                    <Wind className="w-4 h-4 text-[#1D3D33]/60" />
                    {weather.windKmH} <span className="text-xs font-normal">km/h</span>
                  </div>
                  <span className="text-[11px] text-[#1D3D33]/70">{weather.uvIndex}</span>
                </div>
              </div>

              {/* 5-Day Historical Rainfall & Temp Trend Bar Graph */}
              <div className="bg-[#FDF8F3] rounded-2xl p-4 border border-[#1D3D33]/10 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D3D33]">
                    <SunMedium className="w-4 h-4 text-[#FBC02D]" />
                    <span>5-Day Historical Rainfall & Temp Trends</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1D3D33]/60">Select day</span>
                </div>

                {/* Graph bars */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {weather.forecast5Days.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const barHeightPct = Math.max(30, Math.min(100, ((day.temp - 10) / 25) * 100));
                    return (
                      <button
                        key={day.day}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`flex flex-col items-center p-2.5 rounded-xl transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D3D33] text-white shadow-md scale-105'
                            : 'bg-white hover:bg-stone-50 text-[#1D3D33] border border-[#1D3D33]/10'
                        }`}
                      >
                        <span className="text-xs font-bold mb-1">{day.day}</span>
                        
                        {/* Visual graph bar with editorial colors */}
                        <div className="w-full h-16 bg-[#FDF8F3] rounded-lg flex flex-col justify-end p-1 my-1">
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className={`w-full rounded-t-sm transition-all ${
                              isSelected
                                ? 'bg-[#FBC02D]'
                                : day.rainfallMm > 0
                                ? 'bg-sky-400'
                                : idx === 1
                                ? 'bg-[#1D3D33]/40'
                                : idx === 2
                                ? 'bg-[#1D3D33]/20'
                                : 'bg-[#1D3D33]/60'
                            }`}
                          />
                        </div>

                        <span className="text-xs font-bold mt-1">{day.temp}°C</span>
                        <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-[#1D3D33]/60'}`}>
                          {day.rainfallMm > 0 ? `${day.rainfallMm}mm` : '0mm'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Recommendation footer note */}
            <div className="pt-3 border-t border-[#1D3D33]/10 flex items-center justify-between text-xs text-[#1D3D33]/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1D3D33]" />
                <span>Optimal sightseeing window: <strong>{weather.bestVisitingWindow}</strong></span>
              </div>
              <span className="text-[11px] text-[#1D3D33] bg-[#FBC02D]/20 px-2 py-0.5 rounded-full font-semibold">
                {activeDay.condition}
              </span>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: Crowd Level Intelligence (LightGBM model) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1D3D33]/10 shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1D3D33]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#EBF7EF] border border-emerald-200 flex items-center justify-center text-[#1D3D33]">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1D3D33]">
                      Crowd Level Intelligence
                    </h3>
                    <p className="text-xs text-[#1D3D33]/60">
                      {crowd.monumentName} • LightGBM Model
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1D3D33] text-[#FBC02D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{crowd.confidenceScore}% Confidence</span>
                </div>
              </div>

              {/* Visual Crowd Gauge Card */}
              <div className="bg-[#FDF8F3] rounded-2xl p-5 border border-[#1D3D33]/10 mb-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Gauge Arc Graphic */}
                  <div className="relative w-44 h-24 flex flex-col items-center justify-end overflow-hidden">
                    <svg className="absolute top-0 left-2 w-40 h-24" viewBox="0 0 160 80">
                      <path
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke="#E8DFD4"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke={crowd.densityScore < 35 ? '#10B981' : crowd.densityScore < 65 ? '#FBC02D' : '#EF4444'}
                        strokeWidth="12"
                        strokeDasharray="220"
                        strokeDashoffset={220 - (220 * (crowd.densityScore / 100))}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>

                    {/* Gauge needle & center text */}
                    <div className="absolute bottom-0 text-center">
                      <span className="text-2xl font-black text-[#1D3D33] leading-none">
                        {crowd.densityScore}%
                      </span>
                      <span className="block text-[10px] uppercase font-bold text-[#1D3D33]/60 tracking-widest">
                        Density
                      </span>
                    </div>
                  </div>

                  {/* Status & Prediction Details */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EF] text-[#1D3D33] border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{crowd.status}</span>
                    </div>
                    <p className="text-xs text-[#1D3D33] font-medium">
                      {crowd.liveFootfallRadar}
                    </p>
                    <div className="text-xs text-[#1D3D33]/70 flex items-center justify-center sm:justify-start gap-3 pt-1">
                      <span>Est. Queue: <strong className="text-[#1D3D33]">{crowd.estimatedQueueTimeMin} mins</strong></span>
                      <span>•</span>
                      <span>Peak Hours: <strong className="text-amber-800">{crowd.peakHours}</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Hourly Footfall Distribution Histogram */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#1D3D33] mb-2">
                  <span>Hourly Footfall Distribution</span>
                  <span className="text-[11px] text-emerald-800 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Green = Recommended Slots
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 text-center">
                  {crowd.hourlyTrends.map((h) => (
                    <div key={h.hour} className="flex flex-col items-center">
                      <div className="w-full h-14 bg-[#FDF8F3] rounded-md flex flex-col justify-end p-0.5 border border-[#1D3D33]/5">
                        <div
                          style={{ height: `${h.density}%` }}
                          className={`w-full rounded-sm transition-all ${
                            h.isRecommended ? 'bg-emerald-600' : 'bg-[#1D3D33]/30'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#1D3D33] mt-1">{h.hour}</span>
                      <span className="text-[9px] text-[#1D3D33]/50">{h.density}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Model Architecture Note */}
            <div className="pt-3 mt-4 border-t border-[#1D3D33]/10 flex items-center justify-between text-[11px] text-[#1D3D33]/70">
              <div className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#1D3D33]" />
                <span>Best Slot: <strong className="text-[#1D3D33]">{crowd.bestHours}</strong></span>
              </div>
              <span className="font-mono text-[10px] bg-[#1D3D33]/5 px-2 py-0.5 rounded text-[#1D3D33]">
                LightGBM + Ticket Telemetry
              </span>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
