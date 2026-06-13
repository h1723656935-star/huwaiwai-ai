"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileTabBar from './MobileTabBar';
import MobileHero from './MobileHero';
import MobileArtworks from './MobileArtworks';
import MobileVideos from './MobileVideos';
import MobileAbout from './MobileAbout';
import IntroAnimation from './IntroAnimation';
import MoliCharacter from './MoliCharacter';

export default function MobileLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0D0A18]">
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation
            key="intro"
            onComplete={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        key="mobile-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="pb-16"
      >
        {activeTab === 'home' && <MobileHero />}
        {activeTab === 'artworks' && <MobileArtworks />}
        {activeTab === 'videos' && <MobileVideos />}
        {activeTab === 'about' && <MobileAbout />}
      </motion.div>

      <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 墨璃助手 - 移动端 64px 圆形头像 */}
      <MoliCharacter mobileSize={64} />
    </div>
  );
}
