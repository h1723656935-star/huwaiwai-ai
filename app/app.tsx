"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Artworks from '@/components/Artworks';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';
import IntroAnimation from '@/components/IntroAnimation';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // 页面加载后启动 Intro，2.8s 后消失
  }, []);

  // 内容区域的进场动画变体
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
    </div>
  );
}
