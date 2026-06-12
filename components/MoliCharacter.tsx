"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoliAssistant from './MoliAssistant';

const CHARACTER_IMAGE = '/moli/moli-standby.png';

export default function MoliCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAssistantMode, setIsAssistantMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const artworksSection = document.getElementById('artworks');
      if (artworksSection) {
        const rect = artworksSection.getBoundingClientRect();
        setIsAssistantMode(rect.top < window.innerHeight * 0.5);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMobile) {
    return null;
  }

  const charWidth = 380;
  const charHeight = 480;

  // 作品区切换为Q版助手
  if (isAssistantMode) {
    return <MoliAssistant />;
  }

  return (
    <>
      <motion.div
        key="full-character"
        ref={containerRef}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed z-30 pointer-events-none moli-character"
        style={{
          right: -80,
          bottom: 0,
          width: charWidth,
          height: charHeight,
        }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ opacity: isHovered ? 1 : 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(120,101,248,0.2) 0%, transparent 70%)',
              transform: 'translate(30%, 50%)',
              width: '280px',
              height: '280px',
            }}
            animate={{
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.img
            src={CHARACTER_IMAGE}
            alt="墨璃 - MOLI"
            className="relative z-10 w-full h-full object-contain object-position bottom-center"
            style={{
              filter: `drop-shadow(0 20px 50px rgba(120,101,248,0.3)) drop-shadow(0 10px 30px rgba(0,0,0,0.4))`,
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('[墨璃] 立绘加载失败');
              target.style.display = 'none';
            }}
            draggable={false}
          />

          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(120,101,248,0.6), transparent)',
              filter: 'blur(2px)',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
