"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { getVideos } from '@/lib/worksService';
import type { Video } from '@/lib/worksService';

export default function MobileVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos().then(data => {
      setVideos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0D0A18]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#7865F8]/30 border-t-[#7865F8] rounded-full"
        />
      </section>
    );
  }

  return (
    <section id="videos" className="min-h-screen bg-[#0D0A18] pb-24">
      {/* 标题 */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-[#A991FF]/60 text-xs font-medium tracking-[0.2em] uppercase mb-1">
          AI Video
        </p>
        <h2 className="text-xl font-bold text-white mb-1">AI视频作品</h2>
        <p className="text-[#C7B8FF]/40 text-xs">动态视觉与创意表达</p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#C7B8FF]/40 text-sm">暂无视频</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 缩略图 */}
              <div className="relative aspect-video">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(120,101,248,0.2), rgba(169,145,255,0.1))',
                  }}>
                    <Play className="w-12 h-12 text-[#A991FF]/60" />
                  </div>
                )}
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                    background: 'rgba(120,101,248,0.9)',
                  }}>
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                {/* 时长 */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs" style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFF',
                  }}>
                    {video.duration}
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-white mb-1">{video.title}</h3>
                {video.description && (
                  <p className="text-xs text-[#C7B8FF]/50 line-clamp-2">{video.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
