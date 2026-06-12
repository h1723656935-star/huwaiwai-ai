"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Eye } from 'lucide-react';
import { worksService, Video } from '@/lib/worksService';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('videoFavorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await worksService.getAllVideos();
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
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
    localStorage.setItem('videoFavorites', JSON.stringify([...newFavorites]));
  };

  return (
    <section id="videos" className="py-20 px-4 relative">
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 80% 50%, rgba(120, 101, 248, 0.05) 0%, transparent 50%)',
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
            视频作品
          </h2>
          <p style={{ color: 'rgba(199, 184, 255, 0.7)' }}>
            探索由AI创作的精彩视频内容
          </p>
        </motion.div>

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                className="aspect-video rounded-xl"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group"
                  onMouseEnter={() => setHoveredId(video.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div
                    className="block relative overflow-hidden rounded-xl cursor-pointer"
                    style={{ aspectRatio: '16/9' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPlayingId(video.id)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      style={{ transition: 'transform 0.5s ease' }}
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(transparent 40%, rgba(13, 10, 24, 0.9) 100%)',
                      }}
                    />

                    {/* Play Button */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ opacity: hoveredId === video.id ? 1 : 0.7 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(120, 101, 248, 0.8)',
                          boxShadow: '0 4px 20px rgba(120, 101, 248, 0.4)',
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </motion.div>
                    </motion.div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 
                        className="font-semibold mb-1 truncate"
                        style={{ color: '#ECE7FF' }}
                      >
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(199, 184, 255, 0.7)' }}>
                        <span>{video.duration}</span>
                        <span>{video.category || '未分类'}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <motion.div
                      className="absolute top-3 right-3 flex flex-col gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredId === video.id ? 1 : 0 }}
                    >
                      <motion.button
                        onClick={(e) => toggleFavorite(e, video.id)}
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
                            color: favorites.has(video.id) ? '#FF6B8A' : '#C7B8FF',
                            fill: favorites.has(video.id) ? '#FF6B8A' : 'none',
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
                        {video.views || 0}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && videos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p style={{ color: 'rgba(199, 184, 255, 0.5)' }}>
              暂无视频作品
            </p>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(13, 10, 24, 0.9)' }}
            onClick={() => setPlayingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {videos.find(v => v.id === playingId)?.url ? (
                <video
                  src={videos.find(v => v.id === playingId)!.url}
                  autoPlay
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: '#0D0A18' }}>
                  <p style={{ color: 'rgba(199, 184, 255, 0.5)' }}>视频加载中...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
