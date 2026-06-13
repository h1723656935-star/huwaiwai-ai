"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtworks } from '@/lib/worksService';
import type { Artwork } from '@/lib/worksService';

interface CardProps {
  work: Artwork;
  index: number;
  onClick: () => void;
}

function ArtworkCard({ work, index, onClick }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 30;
      const rotateY = (centerX - e.clientX) / 30;
      setTransform({
        rotateX: Math.max(-15, Math.min(15, rotateX)),
        rotateY: Math.max(-15, Math.min(15, rotateY)),
        translateY: -8,
      });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0, translateY: 0 });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      key={work.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-moli overflow-hidden cursor-pointer artwork-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        rotateX: transform.rotateX,
        rotateY: transform.rotateY,
        y: transform.translateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ transform: 'translateZ(20px)' }}
      >
        <motion.img
          src={work.image}
          alt={work.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* 底部渐变蒙层 - hover 时显示 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark/95 via-dark/60 to-transparent pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* hover 时显示的标签条 - 底部 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 p-4 pointer-events-none"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <p className="text-foreground text-sm font-semibold truncate mb-2" style={{ letterSpacing: '-0.01em' }}>
            {work.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(work.categories && work.categories.length > 0
              ? work.categories
              : work.category
                ? [work.category]
                : []
            ).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: 'rgba(120, 101, 248, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                }}
              >
                {cat}
              </span>
            ))}
            {work.tags && work.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-5" style={{ transform: 'translateZ(10px)' }}>
        <motion.h3
          className="font-semibold text-lg text-foreground truncate"
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {work.title}
        </motion.h3>
        {work.categories && work.categories.length > 0 ? (
          <motion.div
            className="flex items-center gap-2 mt-2 flex-wrap"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {work.categories.map((cat) => (
              <span key={cat} className="px-2.5 py-1 bg-primary/15 text-secondary rounded-full text-xs font-medium">
                {cat}
              </span>
            ))}
          </motion.div>
        ) : work.category ? (
          <motion.div
            className="flex items-center gap-2 mt-2"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="px-2.5 py-1 bg-primary/15 text-secondary rounded-full text-xs font-medium">
              {work.category}
            </span>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Artworks() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const dbArtworks = await getArtworks();
      const stored = localStorage.getItem('userArtworks');
      const localArtworks: Artwork[] = stored ? JSON.parse(stored) : [];
      const artworkMap = new Map<string, Artwork>();
      localArtworks.forEach(a => artworkMap.set(a.id, a));
      dbArtworks.forEach(a => artworkMap.set(a.id, a));
      setArtworks(Array.from(artworkMap.values()));
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      const stored = localStorage.getItem('userArtworks');
      setArtworks(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const getDynamicCategories = (): string[] => {
    const cats = new Set<string>();
    cats.add('全部');
    artworks.forEach(w => { if (w.category) cats.add(w.category); });
    try {
      const stored = localStorage.getItem('imageCategories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: string) => cats.add(c));
        }
      }
    } catch { /* ignore */ }
    return Array.from(cats);
  };

  const categories = getDynamicCategories();

  const filteredArtworks = activeCategory === '全部'
    ? artworks
    : artworks.filter((work) => {
        const cats = work.categories || (work.category ? [work.category] : []);
        return cats.includes(activeCategory);
      });

  return (
    <section id="artworks" className="py-24 px-4 gradient-bg-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-secondary font-medium mb-4 text-lg tracking-wider"
          >
            AI Art Gallery
          </motion.p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-title mb-4">
            AI绘画作品
          </h2>
          <p className="text-foreground-subtle max-w-2xl mx-auto text-lg">
            探索二次元美学与梦幻表达，每一幅作品都承载着独特的创作灵感
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <motion.a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-foreground-muted hover:text-foreground hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>+</span> 上传作品
            </motion.a>
            <motion.button
              onClick={fetchArtworks}
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-foreground-muted hover:text-foreground hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              ↻ 刷新
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'gradient-btn shadow-lg'
                  : 'card-moli text-foreground-muted hover:text-foreground hover:border-primary'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <motion.div
              className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArtworks.map((work, index) => (
              <ArtworkCard
                key={work.id}
                work={work}
                index={index}
                onClick={() => setSelectedImage(work.image)}
              />
            ))}
          </motion.div>
        )}

        {!loading && filteredArtworks.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-foreground-subtle mt-12 text-lg"
          >
            {activeCategory === '全部' ? '暂无作品，快去上传吧！' : `暂无"${activeCategory}"分类的作品`}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh]"
            >
              <motion.img
                src={selectedImage}
                alt="Preview"
                className="rounded-2xl max-w-full max-h-[90vh] object-contain shadow-2xl"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
              />
              
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 w-10 h-10 rounded-full glass flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
