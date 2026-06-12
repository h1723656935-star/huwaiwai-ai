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
    <section id="videos" className="py-20 px-4 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-moli mb-4">
            AI视频作品
          </h2>
          <p className="text-foreground-subtle max-w-2xl mx-auto">
            记录创作过程，分享AI视频制作技巧与心得
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <motion.a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-2 glass border border-primary/30 rounded-full text-primary-light hover:bg-primary hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>+</span> 上传视频
            </motion.a>
            <motion.button
              onClick={fetchVideos}
              className="inline-flex items-center gap-2 px-6 py-2 glass border border-primary/30 rounded-full text-primary-light hover:bg-primary hover:text-white transition-all duration-300"
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
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === category ? 'gradient-btn text-white shadow-lg' : 'glass border border-border text-foreground-muted hover:border-primary/50 hover:text-primary-light'}`}
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
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = 'linear-gradient(135deg, rgba(94,61,138,0.8) 0%, rgba(167,139,217,0.4) 100%)';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary-dark to-primary-dark flex items-center justify-center">
                      <VideoIcon className="w-16 h-16 text-primary-light/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <motion.div
                      className="w-14 h-14 rounded-full glass flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-7 h-7 text-primary-light ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-foreground-muted text-sm">
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary-light transition-colors">
                      {video.title}
                    </h3>
                    {video.category && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary-light rounded-full text-xs">
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
            className="text-center text-foreground-subtle mt-12"
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
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-background-card rounded-2xl overflow-hidden border border-border"
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
