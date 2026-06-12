"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtworks } from '@/lib/worksService';
import type { Artwork } from '@/lib/worksService';

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
    : artworks.filter((work) => work.category === activeCategory);

  return (
    <section id="artworks" className="py-24 px-4 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-medium mb-4 text-lg"
          >
            AI Art Gallery
          </motion.p>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-title mb-4">
            AI绘画作品
          </h2>
          <p className="text-foreground-subtle max-w-2xl mx-auto text-lg">
            探索二次元美学与梦幻表达，每一幅作品都承载着独特的创作灵感
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <motion.a href="/admin" className="inline-flex items-center gap-2 px-6 py-3 card-moli text-primary hover:border-primary transition-all duration-300" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span>+</span> 上传作品
            </motion.a>
            <motion.button 
              onClick={fetchArtworks}
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-primary hover:border-primary transition-all duration-300" 
              whileHover={{ scale: 1.02 }} 
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
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button 
              key={category} 
              onClick={() => setActiveCategory(category)} 
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${activeCategory === category ? 'gradient-btn shadow-lg' : 'card-moli text-foreground-muted hover:text-primary hover:border-primary'}`}
              whileHover={{ scale: 1.05 }} 
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
            className="flex justify-center items-center py-16"
          >
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((work, index) => (
              <motion.div 
                key={work.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-moli overflow-hidden cursor-pointer hover-lift"
                onClick={() => setSelectedImage(work.image)}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={work.image} 
                    alt={work.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-foreground">{work.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {work.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && artworks.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-foreground-subtle mt-12 text-lg">
            暂无作品，快去上传吧！
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[80vh]"
            >
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="rounded-2xl shadow-2xl max-w-full max-h-[80vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
