"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SparklesBackground from './SparklesBackground';
import * as worksService from '@/lib/worksService';
import type { SiteConfig } from '@/lib/worksService';

export default function Hero() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configData = await worksService.getSiteConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  if (!config) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </section>
    );
  }

  const easeOut = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg-dark"
    >
      <SparklesBackground />

      {/* 背景光晕层 - 视差滚动 */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ y: y1 }}
      >
        <motion.div
          className="absolute -top-[30%] -right-[20%] w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,122,224,0.12) 0%, rgba(169,145,255,0.06) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ y: y2 }}
      >
        <motion.div
          className="absolute -bottom-[25%] -left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(196,181,253,0.1) 0%, rgba(139,122,224,0.05) 40%, transparent 70%)',
          }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* 主内容区域 */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        style={{ opacity, scale }}
      >
        {/* 装饰性顶部线条 */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: easeOut, delay: 0.1 }}
          className="w-16 h-[1px] mx-auto mb-10 gradient-divider"
        />

        {/* Welcome 标签 */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.2, duration: 0.8, ease: easeOut }}
          className="mb-8"
          style={{
            fontFamily: 'var(--font-en)',
            fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
            fontWeight: 300,
            letterSpacing: '0.35em',
            color: 'var(--secondary)',
            textTransform: 'uppercase',
          }}
        >
          Welcome to
        </motion.p>

        {/* 主标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.35, duration: 1.0, ease: easeOut }}
          className="mb-6 leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            fontWeight: 400,
            letterSpacing: '0.08em',
            lineHeight: 1.2,
          }}
        >
          <span className="gradient-text-moli">{config.heroTitle}</span>
        </motion.h1>

        {/* 英文副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: easeOut }}
          className="mb-8"
          style={{
            fontFamily: 'var(--font-en)',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.15em',
            color: 'var(--light-subtle)',
          }}
        >
          Digital Art & AI Creation Studio
        </motion.p>

        {/* 装饰分割线 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 1.0, ease: easeOut }}
          className="w-24 h-[1px] mx-auto mb-8"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--secondary), var(--primary), var(--accent), var(--secondary), transparent)',
          }}
        />

        {/* 描述文字 */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 0.75, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.8, duration: 0.8, ease: easeOut }}
          className="mb-12 max-w-xl mx-auto"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
            fontWeight: 400,
            lineHeight: 1.85,
            color: 'var(--light-muted)',
            letterSpacing: '0.02em',
          }}
        >
          {config.heroDescription}
        </motion.p>

        {/* CTA 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 1.0, duration: 0.8, ease: easeOut }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <motion.a
            href="#artworks"
            className="gradient-btn px-10 py-4 rounded-full text-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            浏览作品
          </motion.a>
          <motion.a
            href="#contact"
            className="px-10 py-4 rounded-full text-lg transition-all duration-400"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              border: '1px solid rgba(139, 122, 224, 0.3)',
              color: 'var(--light-muted)',
              background: 'transparent',
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
              background: 'rgba(139, 122, 224, 0.08)',
              borderColor: 'rgba(139, 122, 224, 0.5)',
              color: 'var(--light)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            联系我
          </motion.a>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.4, duration: 1.0 }}
          className="mt-16"
          style={{
            fontFamily: 'var(--font-en)',
            fontSize: '0.7rem',
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: 'var(--light-dim)',
            textTransform: 'uppercase',
          }}
        >
          Scroll to explore
        </motion.div>
      </motion.div>

      {/* 滚动提示 */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease: easeOut }}
        style={{ opacity }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-6 h-10 rounded-full flex justify-center pt-2"
            style={{ border: '1px solid rgba(139, 122, 224, 0.25)' }}
          >
            <motion.div
              className="w-1.5 h-3 rounded-full"
              style={{ background: 'var(--primary)' }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
