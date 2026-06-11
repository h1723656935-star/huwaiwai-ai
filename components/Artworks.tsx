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
      
      // 从 localStorage 获取用户上传的作品（作为后备）
      const stored = localStorage.getItem('userArtworks');
      const localArtworks: Artwork[] = stored ? JSON.parse(stored) : [];
      
      // 合并作品，按 id 去重，数据库优先
      const artworkMap = new Map<string, Artwork>();
      localArtworks.forEach(a => artworkMap.set(a.id, a));
      dbArtworks.forEach(a => artworkMap.set(a.id, a));
      setArtworks(Array.from(artworkMap.values()));
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      // 回退到 localStorage
      const stored = localStorage.getItem('userArtworks');
      setArtworks(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  // 动态获取分类列表：从作品数据 + localStorage 自定义图片分类
  const getDynamicCategories = (): string[] => {
    const cats = new Set<string>();
    cats.add('全部');
    // 从已有作品提取分类
    artworks.forEach(w => { if (w.category) cats.add(w.category); });
    // 从 localStorage 获取自定义图片分类
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
    <section id="artworks" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">AI绘画作品</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">探索二次元美学与梦幻表达，每一幅作品都承载着独特的创作灵感</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <motion.a href="/admin" className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-primary/30 rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span>+</span> 上传作品
            </motion.a>
            <motion.button 
              onClick={fetchArtworks}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-primary/30 rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-300" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
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
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((category) => (
            <motion.button 
              key={category} 
              onClick={() => setActiveCategory(category)} 
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === category ? 'gradient-btn text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-secondary border border-primary/20'}`}
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
            className="flex justify-center items-center py-12"
          >
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((work) => (
              <motion.div 
                key={work.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedImage(work.image)}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {work.image.startsWith('data:') ? (
                    <img 
                      src={work.image} 
                      alt={work.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={work.image} 
                      alt={work.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{work.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{work.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && artworks.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 mt-12">
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
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[80vh]"
            >
              {selectedImage.startsWith('data:') ? (
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="rounded-2xl shadow-2xl max-w-full max-h-[80vh] object-contain"
                />
              ) : (
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="rounded-2xl shadow-2xl max-w-full max-h-[80vh] object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
