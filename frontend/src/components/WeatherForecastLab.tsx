import React, { useState } from 'react';
import { CloudRain, Thermometer, Sparkles, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useWeatherForecastLocations, useWeatherForecastML } from '../hooks/useBackendData';

const DAY_OPTIONS = [3, 5, 7, 14];

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * "AI Weather Forecast Lab" -- surfaces the merged-in weather_ml layer
 * (three XGBoost models trained on 10 years of NASA POWER data for 20
 * India-wide cities). This is intentionally a separate section from the
 * AIInsightsHub above rather than folded into it: that hub's city list is
 * the crowd-prediction dataset's ~300 monuments/places, while this
 * forecast lab's cities are the smaller, distinct set the weather model
 * was actually trained on -- keeping the two honest about what data
 * backs each panel, same spirit as the rest of this dashboard.
 */
export const WeatherForecastLab: React.FC = () => {
  const locations = useWeatherForecastLocations();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  React.useEffect(() => {
    if (!selectedLocation && locations.length > 0) setSelectedLocation(locations[0]);
  }, [locations, selectedLocation]);

  const { forecast, loading, error } = useWeatherForecastML(selectedLocation, days);

  if (locations.length === 0) {
    // Backend not reachable / weather_ml not trained yet -- fail quiet,
    // this is a bonus section, never block the rest of the page.
    return null;
  }

  return (
    <section id="weather-forecast-lab" className="py-16 bg-white border-y border-[#1D3D33]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              AI Weather Forecast Lab
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight">
              Multi-Day Weather Forecasting, Trained on 10 Years of Data
            </h2>
            <p className="text-[#1D3D33]/70 text-sm sm:text-base mt-1 max-w-2xl font-normal">
              Three XGBoost models — max temp, min temp, and rain probability — trained on a decade of NASA POWER
              historical data across {locations.length} India-wide destinations.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  days === d
                    ? 'bg-[#1D3D33] text-white shadow-sm'
                    : 'bg-[#FDF8F3] text-[#1D3D33] hover:bg-[#F8F1E9] border border-[#1D3D33]/10'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </motion.div>

        {/* City tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-[#1D3D33] text-white shadow-sm'
                  : 'bg-[#FDF8F3] text-[#1D3D33] hover:bg-[#F8F1E9] border border-[#1D3D33]/10'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Forecast strip */}
        <div className="bg-[#FDF8F3] rounded-3xl p-5 sm:p-7 border border-[#1D3D33]/10">
          {loading && (
            <div className="text-center py-16 text-[#1D3D33]/60 text-sm">
              Running the model for {selectedLocation}…
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16 text-[#1D3D33]/60 text-sm">
              Couldn't reach the forecast API: {error}
            </div>
          )}

          {!loading && !error && forecast && forecast.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast.map((day, idx) => (
                <div
                  key={day.date}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-[#1D3D33] text-white border-[#1D3D33] shadow-md'
                      : 'bg-white text-[#1D3D33] border-[#1D3D33]/10'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest block ${idx === 0 ? 'text-[#FBC02D]' : 'text-[#1D3D33]/60'}`}>
                    {formatDayLabel(day.date)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Thermometer className={`w-4 h-4 ${idx === 0 ? 'text-[#FBC02D]' : 'text-[#1D3D33]/60'}`} />
                    <span className="text-lg font-bold">{Math.round(day.predicted_tmax)}°</span>
                    <span className={`text-xs ${idx === 0 ? 'text-white/70' : 'text-[#1D3D33]/60'}`}>
                      / {Math.round(day.predicted_tmin)}°
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CloudRain className={`w-3.5 h-3.5 ${idx === 0 ? 'text-white/70' : 'text-sky-600'}`} />
                    <span className={`text-xs font-medium ${idx === 0 ? 'text-white/80' : 'text-[#1D3D33]/70'}`}>
                      {Math.round(day.rainfall_probability * 100)}% rain
                    </span>
                  </div>
                  <span className={`text-[11px] mt-1.5 block ${idx === 0 ? 'text-white/70' : 'text-[#1D3D33]/60'}`}>
                    {day.weather_category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 mt-4 text-xs text-[#1D3D33]/60">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            This is a recursive forecast: each predicted day feeds the next day's lag/rolling features, so
            confidence naturally decreases the further out you look — treat day 1 as far more reliable than day{' '}
            {days}.
          </p>
        </div>
      </div>
    </section>
  );
};
