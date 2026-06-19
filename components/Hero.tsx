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
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 50]);
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

  // 统一的缓动曲线
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
        className="absolute inset-0 overflow-hidden"
        style={{ y: y1 }}
      >
        <motion.div
          className="absolute -top-[30%] -right-[20%] w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(120,101,248,0.15) 0%, rgba(169,145,255,0.08) 40%, transparent 70%)',
          }}
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: y2 }}
      >
        <motion.div
          className="absolute -bottom-[25%] -left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(169,145,255,0.12) 0%, rgba(120,101,248,0.06) 40%, transparent 70%)',
          }}
          animate={{ 
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: y3 }}
      >
        <motion.div
          className="absolute top-[40%] left-[10%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(199,184,255,0.08) 0%, transparent 60%)',
          }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* 主内容区域 */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        style={{ opacity, scale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.1 }}
        >
          {/* Welcome 标签 */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}
            className="text-secondary font-medium mb-6 text-lg tracking-[0.3em]"
          >
            Welcome to
          </motion.p>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.45, duration: 0.9, ease: easeOut }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text-moli">{config.heroTitle}</span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.6, duration: 0.8, ease: easeOut }}
            className="text-xl sm:text-2xl text-foreground-muted mb-8"
          >
            {config.heroSubtitle}
          </motion.p>

          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.75, duration: 0.8, ease: easeOut }}
            className="text-foreground-subtle mb-10 max-w-xl mx-auto text-lg leading-relaxed"
          >
            {config.heroDescription}
          </motion.p>

          {/* CTA 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.9, duration: 0.8, ease: easeOut }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="#artworks"
              className="gradient-btn px-10 py-4 rounded-full font-medium text-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              浏览作品
            </motion.a>
            <motion.a
              href="#contact"
              className="border border-primary/40 text-foreground-muted px-10 py-4 rounded-full font-medium text-lg hover:bg-primary/10 hover:border-primary hover:text-foreground transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              联系我
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 滚动提示 */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8, ease: easeOut }}
        style={{ opacity }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 border border-primary/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-primary/60 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
