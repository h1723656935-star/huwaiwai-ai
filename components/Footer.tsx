"use client";

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer
      className="py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #1A1628 0%, #0A0812 100%)',
        borderTop: '1px solid rgba(120, 101, 248, 0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: "'Smiley Sans', sans-serif",
              letterSpacing: '0.1em',
            }}
          >
            HUWAIWAI
          </h3>
          <p
            className="mb-6"
            style={{ color: 'rgba(199, 184, 255, 0.7)' }}
          >
            AI Creator & Digital Artist
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a
              href="#home"
              className="transition-colors"
              style={{ color: 'rgba(199, 184, 255, 0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A991FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(199, 184, 255, 0.7)')}
            >
              首页
            </a>
            <a
              href="#artworks"
              className="transition-colors"
              style={{ color: 'rgba(199, 184, 255, 0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A991FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(199, 184, 255, 0.7)')}
            >
              AI绘画
            </a>
            <a
              href="#videos"
              className="transition-colors"
              style={{ color: 'rgba(199, 184, 255, 0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A991FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(199, 184, 255, 0.7)')}
            >
              AI视频
            </a>
          </div>
          <div
            className="pt-8"
            style={{ borderTop: '1px solid rgba(120, 101, 248, 0.15)' }}
          >
            <p
              className="text-sm"
              style={{ color: 'rgba(199, 184, 255, 0.5)' }}
            >
              © 2026 HUWAIWAI AI Studio. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
