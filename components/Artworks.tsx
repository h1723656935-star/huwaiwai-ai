"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Heart, Eye } from 'lucide-react';
import { worksService, Artwork } from '@/lib/worksService';

const categories = ['全部', '二次元', '古风', '少女风', '温暖风格', '人像', '赛博朋克', '科幻', '奇幻'];

export default function Artworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadArtworks();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const data = await worksService.getAllArtworks();
      setArtworks(data);
    } catch (error) {
      console.error('Failed to load artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const filteredArtworks = artworks.filter(artwork => {
    const matchesCategory = selectedCategory === '全部' || 
      (artwork.categories && artwork.categories.includes(selectedCategory)) || 
      artwork.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artwork.tags && artwork.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="artworks" className="py-20 px-4 relative">
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(120, 101, 248, 0.05) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ECE7FF 0%, #A991FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI绘画作品
          </h2>
          <p style={{ color: 'rgba(199, 184, 255, 0.7)' }}>
            探索由AI创作的精美艺术作品
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: 'rgba(199, 184, 255, 0.5)' }} 
            />
            <input
              type="text"
              placeholder="搜索作品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
              style={{
                background: 'rgba(13, 10, 24, 0.6)',
                border: '1px solid rgba(120, 101, 248, 0.2)',
                color: '#ECE7FF',
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(199, 184, 255, 0.5)' }} />
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                style={{
                  background: selectedCategory === category 
                    ? 'rgba(120, 101, 248, 0.2)' 
                    : 'rgba(13, 10, 24, 0.6)',
                  border: `1px solid ${selectedCategory === category 
                    ? 'rgba(120, 101, 248, 0.4)' 
                    : 'rgba(120, 101, 248, 0.15)'
                  }`,
                  color: selectedCategory === category ? '#A991FF' : 'rgba(199, 184, 255, 0.7)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Artwork Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                className="aspect-[3/4] rounded-xl"
                style={{ background: 'rgba(120, 101, 248, 0.1)' }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group"
                  onMouseEnter={() => setHoveredId(artwork.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.a
                    href={`/artwork/${artwork.id}`}
                    className="block relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: '3/4' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      style={{ transition: 'transform 0.5s ease' }}
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(transparent 60%, rgba(13, 10, 24, 0.9) 100%)',
                      }}
                      animate={{ opacity: hoveredId === artwork.id ? 1 : 0.7 }}
                    />

                    {/* Info */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{
                        transform: hoveredId === artwork.id ? 'translateY(0)' : 'translateY(10px)',
                        opacity: hoveredId === artwork.id ? 1 : 0.8,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <h3 
                        className="font-semibold mb-1 truncate"
                        style={{ color: '#ECE7FF' }}
                      >
                        {artwork.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(199, 184, 255, 0.7)' }}>
                        <span>{artwork.date}</span>
                        <span>
                          {(artwork.categories?.[0] || artwork.category) || '未分类'}
                        </span>
                      </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                      className="absolute top-3 right-3 flex flex-col gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredId === artwork.id ? 1 : 0 }}
                    >
                      <motion.button
                        onClick={(e) => toggleFavorite(e, artwork.id)}
                        className="p-2 rounded-full"
                        style={{
                          background: 'rgba(13, 10, 24, 0.7)',
                          backdropFilter: 'blur(10px)',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart 
                          className="w-4 h-4" 
                          style={{ 
                            color: favorites.has(artwork.id) ? '#FF6B8A' : '#C7B8FF',
                            fill: favorites.has(artwork.id) ? '#FF6B8A' : 'none',
                          }} 
                        />
                      </motion.button>
                      <div 
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          background: 'rgba(13, 10, 24, 0.7)',
                          backdropFilter: 'blur(10px)',
                          color: '#C7B8FF',
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        {artwork.views || 0}
                      </div>
                    </motion.div>
                  </motion.a>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredArtworks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p style={{ color: 'rgba(199, 184, 255, 0.5)' }}>
              暂无符合条件的作品
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
