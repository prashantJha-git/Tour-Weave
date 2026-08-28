import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Calendar, Clock, ArrowRight, X, User } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { BLOG_POSTS } from '../data/mockData';
import { BlogPost } from '../types';

interface Blog3DCardProps {
  post: BlogPost;
  index: number;
  onClick: () => void;
}

const Blog3DCard: React.FC<Blog3DCardProps> = ({ post, index, onClick }) => {
  const cardRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 240, damping: 25 });
  const springY = useSpring(y, { stiffness: 240, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['2deg', '-2deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-2deg', '2deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
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
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="bg-white rounded-3xl border border-[#1D3D33]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        
        {/* Category Pill */}
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1D3D33] text-[#FBC02D] text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border border-[#FBC02D]/30 shadow-md"
        >
          {post.category}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1D3D33] leading-snug group-hover:text-[#FBC02D] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#1D3D33]/70 mt-2 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-[#1D3D33]/10 flex items-center justify-between text-[11px] text-[#1D3D33]/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1D3D33]/50" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1D3D33]/50" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const JournalOfBharat: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  return (
    <section id="journal-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
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
            FROM OUR BLOG
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D3D33] tracking-tight">
            Journal of Bharat: Stories & Guides
          </h2>
          <p className="text-[#1D3D33]/70 text-sm mt-1">
            Cultural wisdom, architectural deep dives, and smart tips for traversing Incredible India.
          </p>
        </div>

        <button
          onClick={() => setActiveArticle(BLOG_POSTS[0])}
          className="text-xs font-bold text-[#1D3D33] hover:text-[#FBC02D] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* 3-Column Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {BLOG_POSTS.map((post, idx) => (
          <Blog3DCard
            key={post.id}
            post={post}
            index={idx}
            onClick={() => setActiveArticle(post)}
          />
        ))}
      </div>

      {/* Fullscreen Article Reader Modal using Portal */}
      {activeArticle && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-[#FDF8F3] rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto border border-[#1D3D33]/10 shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-[#1D3D33] flex items-center justify-center transition-colors border border-[#1D3D33]/10 cursor-pointer shadow-sm z-10"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-3 py-1 rounded-full bg-[#1D3D33] text-[#FBC02D] text-[10px] font-bold uppercase tracking-widest border border-[#FBC02D]/30">
                {activeArticle.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D3D33] leading-tight mb-3 pr-10">
              {activeArticle.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#1D3D33]/60 pb-4 mb-4 border-b border-[#1D3D33]/10">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1D3D33]" />
                <span className="font-bold text-[#1D3D33]">{activeArticle.author}</span>
                <span>({activeArticle.authorRole})</span>
              </div>
              <span>•</span>
              <span>{activeArticle.date}</span>
              <span>•</span>
              <span>{activeArticle.readTime}</span>
            </div>

            <div className="rounded-2xl overflow-hidden mb-6 h-64 border border-[#1D3D33]/10">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-[#1D3D33]/80 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
              <p className="font-serif italic text-[#1D3D33] text-base border-l-2 border-[#FBC02D] pl-4">
                "{activeArticle.excerpt}"
              </p>
              <p>
                Traveling across India is an encounter with living history. By combining ancient geographical wisdom with state-of-the-art AI crowd density models, travelers can now experience sacred rituals and majestic forts in peaceful solitude.
              </p>
              <p>
                From Varanasi's Subah-e-Banaras dawn chants to the sunlit arches of Amber Palace, our telemetry ensures you arrive right when the light is most sublime and the footsteps of fellow travelers are sparse.
              </p>
              <p>
                Always pack lightweight cottons for heritage plains, carry reusable copper water bottles, and remember that respecting local customs opens doors that no guidebook can uncover.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1D3D33]/10 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1D3D33] text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </section>
  );
};
