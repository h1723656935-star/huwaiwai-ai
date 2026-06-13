"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import * as worksService from '@/lib/worksService';
import type { SiteConfig } from '@/lib/worksService';

export default function MobileHero() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    worksService.getSiteConfig().then(setConfig).catch(() => {});
  }, []);

  if (!config) {
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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#0D0A18] overflow-hidden">
      {/* 简化背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-64" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(120,101,248,0.12) 0%, transparent 70%)',
      }} />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 小标签 */}
        <motion.p
          className="text-[#A991FF]/60 text-xs font-medium tracking-[0.25em] uppercase mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to
        </motion.p>

        {/* 主标题 */}
        <motion.h1
          className="text-3xl font-bold mb-3 leading-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {config.heroTitle}
          </span>
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          className="text-[#C7B8FF]/80 text-base mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {config.heroSubtitle}
        </motion.p>

        {/* 描述 */}
        <motion.p
          className="text-[#C7B8FF]/50 text-sm leading-relaxed max-w-xs mx-auto mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {config.heroDescription}
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.a
            href="#artworks"
            className="px-8 py-3 rounded-full font-medium text-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #7865F8, #A991FF)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            浏览作品
          </motion.a>
          <motion.a
            href="#about"
            className="px-8 py-3 rounded-full font-medium text-sm"
            style={{
              border: '1px solid rgba(120,101,248,0.4)',
              color: 'rgba(199,184,255,0.8)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            关于我
          </motion.a>
        </motion.div>
      </motion.div>

      {/* 底部滚动提示 */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-5 h-8 border border-[#7865F8]/30 rounded-full flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-2 bg-[#7865F8]/60 rounded-full"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
