"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { artworks as defaultArtworks, categories } from '@/data/works';
import Image from 'next/image';

interface Artwork {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  image: string;
}

export default function Artworks() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    const storedArtworks = localStorage.getItem('artworks');
    if (storedArtworks) {
      setUserArtworks(JSON.parse(storedArtworks));
    }
  }, []);

  const allArtworks = [...defaultArtworks, ...userArtworks];

  const filteredArtworks =
    activeCategory === '全部'
      ? allArtworks
      : allArtworks.filter((work) => work.category === activeCategory);

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
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            AI绘画作品
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            探索二次元美学与梦幻表达，每一幅作品都承载着独特的创作灵感
          </p>
          <motion.a
            href="/admin"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-white border border-primary/30 rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>+</span> 上传作品
          </motion.a>
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
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'gradient-btn text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-secondary border border-primary/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6"
        >
          {filteredArtworks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="break-inside-avoid mb-6 group cursor-pointer"
              onClick={() => setSelectedImage(work.image)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500">
                <div className="relative aspect-auto">
                  <Image
                    src={work.image}
                    alt={work.title}
                    className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {work.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/20 rounded-full text-white text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/70 text-sm">{work.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
              <Image
                src={selectedImage}
                alt="Preview"
                className="rounded-2xl shadow-2xl"
                width={1200}
                height={1200}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
