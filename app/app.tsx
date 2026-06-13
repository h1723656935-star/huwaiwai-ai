"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Artworks from '@/components/Artworks';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';
import IntroAnimation from '@/components/IntroAnimation';
import MoliCharacter from '@/components/MoliCharacter';
import CustomCursor from '@/components/CustomCursor';
import MouseGlow from '@/components/MouseGlow';
import MobileLayout from '@/components/MobileLayout';

// PC 端布局组件（独立拆分，避免 hooks 在条件渲染前调用）
function DesktopLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-background overflow-x-hidden custom-cursor-active`}
    >
      {isLoaded && <CustomCursor />}

      <MouseGlow />

      <AnimatePresence>
        {showIntro && (
          <IntroAnimation
            key="intro"
            onComplete={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        key="page-content"
        variants={pageVariants}
        initial="hidden"
        animate={showIntro ? 'hidden' : 'visible'}
        className="relative z-[20]"
      >
        <motion.div variants={sectionVariants}>
          <Navbar />
        </motion.div>

        <main>
          <motion.div variants={sectionVariants}>
            <Hero />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <Artworks />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <Videos />
          </motion.div>
        </main>

        <motion.footer variants={sectionVariants}>
          <Footer />
        </motion.footer>
      </motion.div>

      <MoliCharacter />
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile(768);

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}
