import React, { useRef } from 'react';
import { IndianRupee, BedDouble, Bot, ShieldCheck } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ValueCardProps {
  item: {
    icon: React.ReactElement;
    title: string;
    desc: string;
  };
  index: number;
}

const ValueCard: React.FC<ValueCardProps> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['3deg', '-3deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-3deg', '3deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
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
      className="flex items-start gap-4 p-5 rounded-3xl bg-white border border-[#1D3D33]/10 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default"
    >
      <div
        style={{ transform: 'translateZ(24px)' }}
        className="w-12 h-12 rounded-2xl bg-[#FDF8F3] border border-[#1D3D33]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1D3D33] group-hover:text-white transition-colors duration-300 shadow-xs"
      >
        {React.cloneElement(item.icon, {
          className: 'w-5 h-5 text-[#1D3D33] group-hover:text-[#FBC02D] transition-colors',
        })}
      </div>
      <div style={{ transform: 'translateZ(16px)' }}>
        <h4 className="font-serif font-bold text-[#1D3D33] text-base mb-1">
          {item.title}
        </h4>
        <p className="text-xs text-[#1D3D33]/70 leading-relaxed">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
};

export const ValueProps: React.FC = () => {
  const values = [
    {
      icon: <IndianRupee className="w-6 h-6 text-[#1D3D33]" />,
      title: 'Best Price in INR',
      desc: 'Transparent pricing with zero hidden convenience markups on heritage passes and bookings.'
    },
    {
      icon: <BedDouble className="w-6 h-6 text-[#1D3D33]" />,
      title: 'Handpicked Heritage Stays',
      desc: 'Verified royal havelis, spice plantation cottages, and luxury backwater houseboats.'
    },
    {
      icon: <Bot className="w-6 h-6 text-[#1D3D33]" />,
      title: '24/7 AI Travel Concierge',
      desc: 'Live crowd telemetry, temple aarti slots, and micro-climate rain advisories.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#1D3D33]" />,
      title: 'Safe & Verified Routes',
      desc: 'Optimized IRCTC Vande Bharat connections, high-altitude road alerts, and safe transit.'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-4 [perspective:1200px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {values.map((item, index) => (
          <ValueCard key={index} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};
