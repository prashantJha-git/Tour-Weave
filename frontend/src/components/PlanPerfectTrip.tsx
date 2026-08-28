import React, { useRef } from 'react';
import {
  Sparkles,
  Route,
  CloudLightning,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface PlanPerfectTripProps {
  onStartCustomPlan: () => void;
}

export const PlanPerfectTrip: React.FC<PlanPerfectTripProps> = ({ onStartCustomPlan }) => {
  const imageCardRef = useRef<HTMLDivElement>(null);
  const imgX = useMotionValue(0);
  const imgY = useMotionValue(0);

  const imgSpringX = useSpring(imgX, { stiffness: 220, damping: 25 });
  const imgSpringY = useSpring(imgY, { stiffness: 220, damping: 25 });

  const imgRotateX = useTransform(imgSpringY, [-0.5, 0.5], ['2deg', '-2deg']);
  const imgRotateY = useTransform(imgSpringX, [-0.5, 0.5], ['-2deg', '2deg']);

  const handleMouseMoveImg = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageCardRef.current) return;
    const rect = imageCardRef.current.getBoundingClientRect();
    imgX.set((e.clientX - rect.left) / rect.width - 0.5);
    imgY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeaveImg = () => {
    imgX.set(0);
    imgY.set(0);
  };

  return (
    <section id="plan-journey-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Full-height editorial image */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 relative"
        >
          <motion.div
            ref={imageCardRef}
            style={{
              rotateX: imgRotateX,
              rotateY: imgRotateY,
              transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMoveImg}
            onMouseLeave={handleMouseLeaveImg}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#1D3D33]/15 aspect-[4/3] sm:aspect-[14/11] lg:aspect-[4/5] cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
              alt="Traveler sailing peacefully in Kerala backwaters"
              className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700 ease-out"
            />
            
            {/* Subtle luxury gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

            {/* Floating Telemetry Badge on Image with 3D Z-plane elevation */}
            <motion.div
              style={{ transform: 'translateZ(35px)' }}
              className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl text-[#1D3D33] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1D3D33] text-[#FBC02D] flex items-center justify-center font-bold shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1D3D33] block">
                    Vande Bharat & Flight Sync
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    ⚡ Zero Layover Buffer Calculated
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#EBF7EF] text-[#1D3D33] px-2.5 py-1 rounded-full border border-emerald-200">
                AI Ready
              </span>
            </motion.div>

            {/* Top Badge with 3D Z-plane elevation */}
            <motion.div
              style={{ transform: 'translateZ(30px)' }}
              className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#1D3D33]/90 text-[#FBC02D] text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-[#FBC02D]/30 flex items-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Modal Bharat AI</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Column: Capabilities and CTA */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1D3D33]/60 block mb-1">
              PLAN YOUR JOURNEY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight leading-tight">
              Plan Your Perfect Trip with Predictive Bharat AI
            </h2>
            <p className="text-[#1D3D33]/70 text-sm sm:text-base mt-2 leading-relaxed">
              From weekend spiritual getaways in Kashi to week-long Himalayan crossings, we tailor hyper-personalized travel experiences synchronized with real-time crowd footfall and weather telemetry.
            </p>
          </motion.div>

          {/* 3 Custom Capability Rows with Staggered 3D entrance */}
          <div className="space-y-4">
            
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: 25, rotateX: 10 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-[#1D3D33]/10 shadow-sm hover:shadow-md hover:border-[#1D3D33]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 flex items-center justify-center text-[#1D3D33] shrink-0 group-hover:bg-[#1D3D33] group-hover:text-[#FBC02D] transition-colors">
                <Route className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1D3D33] text-base group-hover:text-[#1D3D33] transition-colors">
                  Multi-Modal Route Optimization
                </h4>
                <p className="text-xs text-[#1D3D33]/70 mt-0.5 leading-relaxed">
                  Seamlessly connects Vande Bharat express trains, domestic air routes, and certified state mountain chauffeurs into a single itinerary.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, x: 25, rotateX: 10 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-[#1D3D33]/10 shadow-sm hover:shadow-md hover:border-[#1D3D33]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7EF] border border-emerald-200 flex items-center justify-center text-[#1D3D33] shrink-0 group-hover:bg-[#1D3D33] group-hover:text-[#FBC02D] transition-colors">
                <CloudLightning className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1D3D33] text-base">
                  Smart Seasonal & Monsoon Insights
                </h4>
                <p className="text-xs text-[#1D3D33]/70 mt-0.5 leading-relaxed">
                  Trained on multi-decade IMD rainfall and temperature records to guarantee clear mountain visibility and serene coastal sunsets.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, x: 25, rotateX: 10 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-[#1D3D33]/10 shadow-sm hover:shadow-md hover:border-[#1D3D33]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 flex items-center justify-center text-[#1D3D33] shrink-0 group-hover:bg-[#1D3D33] group-hover:text-[#FBC02D] transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1D3D33] text-base">
                  Tailored Hour-by-Hour Schedules
                </h4>
                <p className="text-xs text-[#1D3D33]/70 mt-0.5 leading-relaxed">
                  Dynamic daily scheduling that routes you to monuments during low-density hours (e.g. 6 AM sunrise access to avoid 2-hour lines).
                </p>
              </div>
            </motion.div>

          </div>

          {/* CTA Button & Trust Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <button
              id="plan-custom-trip-btn"
              onClick={onStartCustomPlan}
              className="px-8 py-4 rounded-xl bg-[#1D3D33] hover:bg-black text-white font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl hover:shadow-2xl transition-all border border-[#FBC02D]/30 group cursor-pointer"
            >
              <span>Start Customized Plan</span>
              <ArrowRight className="w-4 h-4 text-[#FBC02D] transition-transform group-hover:translate-x-1.5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#1D3D33]/70">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant AI Generation • Free Plan Preview</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
