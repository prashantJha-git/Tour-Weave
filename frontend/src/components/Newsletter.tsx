import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1D3D33]/10 shadow-sm relative overflow-hidden">
        
        {/* Decorative subtle ambient circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FBC02D]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#1D3D33]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Title & Copy */}
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#1D3D33] text-[#FBC02D] flex items-center justify-center shrink-0 shadow-sm">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1D3D33] mb-1">
                <Sparkles className="w-3 h-3 text-[#FBC02D]" />
                Live Bharat Travel Radar
              </div>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1D3D33] leading-snug">
                Let's Get You Somewhere Amazing in Bharat
              </h3>
              <p className="text-[#1D3D33]/70 text-xs sm:text-sm mt-1 leading-relaxed">
                Subscribe to receive live AI monsoon forecasts, off-peak festival windows, and curated royal haveli offers straight to your inbox.
              </p>
            </div>
          </div>

          {/* Right Input Form */}
          <div className="w-full lg:w-auto lg:min-w-[420px]">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-[#EBF7EF] border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Namaste & Welcome aboard!</p>
                  <p className="text-xs text-emerald-800">You'll receive our monthly AI Bharat travel digest at {email}.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3.5 rounded-xl bg-[#FDF8F3] border border-[#1D3D33]/15 text-[#1D3D33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3D33] transition-all placeholder:text-[#1D3D33]/40"
                />
                <button
                  id="newsletter-subscribe-btn"
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-[#1D3D33] hover:bg-black text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-sm hover:shadow transition-all border border-[#FBC02D]/30 whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
