"use client";

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary/10 to-accent/10 py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold gradient-text mb-4">HUWAIWAI</h3>
          <p className="text-gray-500 mb-6">
            AI Creator & Digital Artist
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="#home" className="text-gray-600 hover:text-primary transition-colors">
              首页
            </a>
            <a href="#artworks" className="text-gray-600 hover:text-primary transition-colors">
              AI绘画
            </a>
            <a href="#videos" className="text-gray-600 hover:text-primary transition-colors">
              AI视频
            </a>
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">
              关于我
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">
              联系我
            </a>
          </div>
          <div className="border-t border-primary/20 pt-8">
            <p className="text-gray-500 text-sm">
              © 2026 HUWAIWAI AI Studio. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
