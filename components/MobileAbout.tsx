"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as worksService from '@/lib/worksService';
import type { SiteConfig } from '@/lib/worksService';

export default function MobileAbout() {
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
    <section id="about" className="min-h-screen bg-[#0D0A18] px-6 py-12">
      {/* 头像 */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden" style={{
          border: '2px solid rgba(120,101,248,0.4)',
        }}>
          {config.avatarUrl ? (
            <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl" style={{
              background: 'linear-gradient(135deg, #7865F8, #A991FF)',
            }}>
              墨
            </div>
          )}
        </div>
      </div>

      {/* 名称 */}
      <h2 className="text-xl font-bold text-white text-center mb-1">
        {config.aboutName || config.heroTitle}
      </h2>
      <p className="text-[#C7B8FF]/50 text-sm text-center mb-6">
        {config.aboutTitle || 'AI 创作者'}
      </p>

      {/* 描述 */}
      <div className="rounded-xl p-4 mb-6" style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p className="text-sm text-[#C7B8FF]/70 leading-relaxed">
          {config.aboutDescription || '专注于 AI 绘画与视频创作，探索数字艺术的无限可能。'}
        </p>
      </div>

      {/* 标签 */}
      {config.aboutTags && (
        <div className="flex flex-wrap gap-2 justify-center">
          {config.aboutTags.split(',').map((tag) => (
            <span
              key={tag.trim()}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(120,101,248,0.15)',
                color: '#A991FF',
              }}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* 社交链接 */}
      <div className="mt-8 space-y-3">
        <motion.a
          href="/admin"
          className="block w-full py-3 rounded-xl text-center text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #7865F8, #A991FF)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          管理后台
        </motion.a>
      </div>

      {/* 页脚 */}
      <div className="mt-12 text-center">
        <p className="text-[10px] text-[#C7B8FF]/30">
          © 2024 墨璃 · MOLI. All rights reserved.
        </p>
      </div>
    </section>
  );
}
