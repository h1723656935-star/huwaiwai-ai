"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videos } from '@/data/works';
import { Play, X } from 'lucide-react';
import Image from 'next/image';

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <section id="videos" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            AI视频作品
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            记录创作过程，分享AI视频制作技巧与心得
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500 cursor-pointer"
              onClick={() => setSelectedVideo(video.url)}
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fill
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </motion.div>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded-full text-white text-sm">
                  {video.duration}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-500 text-sm">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden"
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <iframe
                src={selectedVideo.replace('watch?v=', 'embed/')}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
