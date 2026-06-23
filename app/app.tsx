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
      setTimeout(() => setTransitioning(false), 200);
    }, 500);
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

      {/* ─── 过渡遮罩：电影级溶解过渡 ─── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="transition-dissolve"
            className="fixed inset-0 z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(5,3,10,0.7) 0%, rgba(5,3,10,0.92) 40%, #05030A 100%)',
            }}
          >
            {/* 中心柔光扩散 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '120vw',
                height: '120vh',
                top: '50%',
                left: '50%',
                background:
                  'radial-gradient(circle, rgba(139,122,224,0.06) 0%, rgba(94,61,138,0.03) 30%, transparent 60%)',
                filter: 'blur(60px)',
              }}
              initial={{ x: '-50%', y: '-50%', scale: 0.5, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
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
            transition={{ duration: 1.0, ease: EASE }}
            className="relative z-[20]"
          >
            {/* Navbar - 从顶部滑入 */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            >
              <Navbar />
            </motion.div>

            <main>
              {/* Hero - 从模糊中浮现 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
              >
                <Hero />
              </motion.div>

              {/* Artworks - 从下方滑入 */}
              <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
              >
                <Artworks />
              </motion.div>

              {/* Videos - 从下方滑入 */}
              <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
              >
                <Videos />
              </motion.div>
            </main>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
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
