import React from 'react';
import { Compass, MapPin, Phone, Mail, Clock, Instagram, Twitter, Youtube, Facebook, ArrowUpRight } from 'lucide-react';
import { HERITAGE_GALLERY } from '../data/mockData';
import { HeritageGalleryItem } from '../types';

interface FooterProps {
  onSelectGalleryItem: (item: HeritageGalleryItem) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectGalleryItem }) => {
  return (
    <footer id="main-footer" className="bg-[#1D3D33] text-stone-300 pt-16 pb-12 border-t border-[#FBC02D]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FBC02D] text-[#1D3D33] flex items-center justify-center font-bold shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-serif text-white tracking-tight">
                Tour-<span className="text-[#FBC02D]">Weave</span>
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              We engineer predictive artificial intelligence for Incredible Bharat. Combining multi-modal train & air routing, historical monsoon models, and real-time crowd telemetry to elevate Indian tourism into an effortless, serene art form.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FBC02D] hover:text-[#1D3D33] flex items-center justify-center text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#twitter" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FBC02D] hover:text-[#1D3D33] flex items-center justify-center text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FBC02D] hover:text-[#1D3D33] flex items-center justify-center text-white transition-all">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FBC02D] hover:text-[#1D3D33] flex items-center justify-center text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wide border-b border-white/10 pb-2">
              Explore Bharat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#explore-section" className="hover:text-[#FBC02D] transition-colors flex items-center justify-between">
                  <span>Royal Rajasthan</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#explore-section" className="hover:text-[#FBC02D] transition-colors flex items-center justify-between">
                  <span>Kerala Backwaters</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#explore-section" className="hover:text-[#FBC02D] transition-colors flex items-center justify-between">
                  <span>Varanasi Spiritual</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#explore-section" className="hover:text-[#FBC02D] transition-colors flex items-center justify-between">
                  <span>Ladakh High Passes</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#explore-section" className="hover:text-[#FBC02D] transition-colors flex items-center justify-between">
                  <span>UNESCO Hampi Ruins</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Help (Col 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wide border-b border-white/10 pb-2">
              Contact & Support
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FBC02D] shrink-0 mt-0.5" />
                <span>
                  Bharat Travel Innovation Hub, 14 Barakhamba Rd, Connaught Place, New Delhi 110001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FBC02D] shrink-0" />
                <span>+91 1800-TOUR-WEAVE (24x7 Helpline)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FBC02D] shrink-0" />
                <span>concierge@tourweave.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FBC02D] shrink-0" />
                <span>AI Live Monitoring: 24/7/365</span>
              </div>
            </div>
          </div>

          {/* 6-Image Heritage Gallery Grid (Col 3) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-serif font-bold text-white text-base tracking-wide">
                Heritage Gallery
              </h4>
              <span className="text-[10px] text-[#FBC02D] uppercase font-bold tracking-widest">Incredible Bharat</span>
            </div>

            <p className="text-[11px] text-stone-400">
              Click any monument to view high-resolution AI travel details.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {HERITAGE_GALLERY.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectGalleryItem(item)}
                  className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#FBC02D] cursor-pointer"
                  title={`Explore ${item.title} (${item.location})`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                    <span className="text-[9px] text-white font-bold truncate leading-tight drop-shadow-md">
                      {item.cityKey || item.location.split(',')[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Tour-Weave Bharat Ltd. Crafted with pride for Indian Tourism.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#sih" className="text-[#FBC02D] hover:underline font-semibold">SIH AI Architecture</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
