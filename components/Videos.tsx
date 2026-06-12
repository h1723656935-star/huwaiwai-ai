"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Video as VideoIcon } from 'lucide-react';
import { getVideos } from '@/lib/worksService';
import type { Video } from '@/lib/worksService';

export default function Videos() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const dbVideos = await getVideos();
      const stored = localStorage.getItem('userVideos');
      const localVideos: Video[] = stored ? JSON.parse(stored) : [];
      const videoMap = new Map<string, Video>();
      localVideos.forEach(v => videoMap.set(v.id, v));
      dbVideos.forEach(v => videoMap.set(v.id, v));
      setVideos(Array.from(videoMap.values()));
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      const stored = localStorage.getItem('userVideos');
      setVideos(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const getDynamicCategories = (): string[] => {
    const cats = new Set<string>();
    cats.add('全部');
    videos.forEach(v => { if (v.category) cats.add(v.category); });
    try {
      const stored = localStorage.getItem('videoCategories');
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

  const filteredVideos = activeCategory === '全部'
    ? videos
    : videos.filter((v) => v.category === activeCategory);

  return (
    <section id="videos" className="py-24 px-4 bg-background">
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
            AI Video Gallery
          </motion.p>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-title mb-4">
            AI视频作品
          </h2>
          <p className="text-foreground-subtle max-w-2xl mx-auto text-lg">
            记录创作过程，分享AI视频制作技巧与心得
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <motion.a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-primary hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>+</span> 上传视频
            </motion.a>
            <motion.button
              onClick={fetchVideos}
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
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-moli overflow-hidden cursor-pointer hover-lift"
                onClick={() => setSelectedVideo(video.videoFile ?? video.url)}
              >
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail && video.thumbnail.length > 0 ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = 'linear-gradient(135deg, rgba(111,90,239,0.2) 0%, rgba(157,124,255,0.15) 100%)';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                      <VideoIcon className="w-16 h-16 text-primary/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-dark/30">
                    <motion.div
                      className="w-14 h-14 rounded-full glass flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-dark/70 backdrop-blur-sm rounded-full text-white/90 text-sm">
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-foreground">{video.title}</h3>
                    {video.category && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {video.category}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground-subtle text-sm">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredVideos.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-foreground-subtle mt-12 text-lg"
          >
            {activeCategory === '全部' ? '暂无视频作品，快去上传吧！' : `暂无"${activeCategory}"分类的视频作品`}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-dark-card rounded-2xl overflow-hidden border border-border"
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center transition-colors hover:bg-primary/20"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-6 h-6 text-foreground-muted" />
              </button>
              {selectedVideo.startsWith('data:') ? (
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={selectedVideo.replace('watch?v=', 'embed/')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
