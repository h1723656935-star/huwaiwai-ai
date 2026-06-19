"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Artworks from '@/components/Artworks';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';
import Intro3D from '@/components/Intro3D';
import MoliCharacter from '@/components/MoliCharacter';
import CustomCursor from '@/components/CustomCursor';
import MouseGlow from '@/components/MouseGlow';
import MobileLayout from '@/components/MobileLayout';

const EASE = [0.16, 1, 0.3, 1] as const;

function DesktopLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleIntroComplete = useCallback(() => {
    // 先标记过渡开始，让过渡遮罩出现
    setTransitioning(true);
    // 等过渡遮罩完全覆盖后，再隐藏 Intro 并显示主内容
    setTimeout(() => {
      setShowIntro(false);
      // 过渡遮罩消退
      setTimeout(() => setTransitioning(false), 100);
    }, 600);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background overflow-x-hidden custom-cursor-active"
    >
      {isLoaded && <CustomCursor />}
      <MouseGlow />

      {/* ─── Intro 3D 动画 ─── */}
      <AnimatePresence>
        {showIntro && (
          <Intro3D key="intro" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* ─── 过渡遮罩：光闪效果 ─── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="transition-flash"
            className="fixed inset-0 z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(167,139,217,0.15) 0%, rgba(5,3,10,0.95) 50%, #05030A 100%)',
            }}
          >
            {/* 中心光点 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '200px',
                height: '200px',
                top: '50%',
                left: '50%',
                background:
                  'radial-gradient(circle, rgba(167,139,217,0.4) 0%, rgba(120,101,248,0.1) 40%, transparent 70%)',
                filter: 'blur(30px)',
              }}
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: [0, 3, 5], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.2, ease: EASE }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 主页面内容 ─── */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            key="page-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="relative z-[20]"
          >
            {/* Navbar - 从顶部滑入 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            >
              <Navbar />
            </motion.div>

            <main>
              {/* Hero - 从模糊中浮现，有 scale 感 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.0, ease: EASE, delay: 0.2 }}
              >
                <Hero />
              </motion.div>

              {/* Artworks - 从下方滑入 */}
              <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              >
                <Artworks />
              </motion.div>

              {/* Videos - 从下方滑入 */}
              <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
              >
                <Videos />
              </motion.div>
            </main>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.8 }}
            >
              <Footer />
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>

      <MoliCharacter />
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile(768);
  if (isMobile) return <MobileLayout />;
  return <DesktopLayout />;
}
