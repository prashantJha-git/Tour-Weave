import React, { useState, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { MOCK_TESTIMONIALS } from '../data/mockData';
import { Testimonial } from '../types';

interface Testimonial3DCardProps {
  t: Testimonial;
  index: number;
  isActive: boolean;
}

const Testimonial3DCard: React.FC<Testimonial3DCardProps> = ({ t, index, isActive }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 240, damping: 25 });
  const springY = useSpring(y, { stiffness: 240, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['2.5deg', '-2.5deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-2.5deg', '2.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`p-6 sm:p-7 rounded-3xl bg-white border border-[#1D3D33]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group cursor-pointer ${
        isActive ? 'ring-2 ring-[#1D3D33]' : ''
      }`}
    >
      <div style={{ transform: 'translateZ(15px)' }}>
        {/* 5-Star Rating in Gold */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(t.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#FBC02D] text-[#FBC02D]" />
            ))}
          </div>
          <Quote className="w-6 h-6 text-[#1D3D33]/20" />
        </div>

        {/* Trip Title Badge */}
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1D3D33]/5 text-[#1D3D33] border border-[#1D3D33]/10">
            {t.tripTitle}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-[#1D3D33]/80 text-sm italic leading-relaxed">
          "{t.review}"
        </p>
      </div>

      {/* Author Row with 3D Z-plane elevation */}
      <div
        style={{ transform: 'translateZ(20px)' }}
        className="pt-6 mt-6 border-t border-[#1D3D33]/10 flex items-center gap-3"
      >
        <img
          src={t.avatar}
          alt={t.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
          }}
          className="w-11 h-11 rounded-full object-cover border-2 border-[#FBC02D] shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-serif font-bold text-[#1D3D33] text-sm truncate group-hover:text-[#FBC02D] transition-colors">
            {t.name}
          </h4>
          <p className="text-[11px] text-[#1D3D33]/60 truncate">
            {t.location}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="truncate">Verified AI Traveler</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? MOCK_TESTIMONIALS.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === MOCK_TESTIMONIALS.length - 1 ? 0 : prevIdx + 1));
  };

  return (
    <section id="reviews-section" className="py-16 bg-[#FDF8F3] border-t border-[#1D3D33]/10 [perspective:1400px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1D3D33]/60 block mb-1">
              TRAVELERS LOVE US
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight">
              What Our Travelers Say
            </h2>
            <p className="text-[#1D3D33]/70 text-sm mt-1">
              Real journeys across Bharat powered by Tour-Weave crowd avoidance and transit synchrony.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="testimonials-prev-btn"
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[#1D3D33]/15 bg-white hover:bg-stone-50 flex items-center justify-center text-[#1D3D33] shadow-sm transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="testimonials-next-btn"
              onClick={next}
              className="w-10 h-10 rounded-full border border-[#1D3D33]/15 bg-white hover:bg-stone-50 flex items-center justify-center text-[#1D3D33] shadow-sm transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [perspective:1200px]">
          {MOCK_TESTIMONIALS.map((t, idx) => (
            <Testimonial3DCard
              key={t.id}
              t={t}
              index={idx}
              isActive={idx === currentIndex}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
