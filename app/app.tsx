"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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

function DesktopLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  const ease = [0.16, 1, 0.3, 1] as const;

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease, delay: 0.05 },
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease, delay: 0.15 },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background overflow-x-hidden custom-cursor-active"
    >
      {isLoaded && <CustomCursor />}
      <MouseGlow />

      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroAnimation key="intro" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showIntro && (
          <motion.div
            key="page-content"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="relative z-[20]"
          >
            <motion.div variants={navbarVariants}>
              <Navbar />
            </motion.div>

            <main>
              <motion.div variants={heroVariants}>
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
