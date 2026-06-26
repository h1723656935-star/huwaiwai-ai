"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import MobileTabBar from './MobileTabBar';
import MobileHero from './MobileHero';
import MobileArtworks from './MobileArtworks';
import MobileVideos from './MobileVideos';
import MobileVideoEdits from './MobileVideoEdits';
import MobileAbout from './MobileAbout';
import MoliCharacter from './MoliCharacter';

export default function MobileLayout() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0D0A18]">
      <motion.div
        key="mobile-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pb-16"
      >
        {activeTab === 'home' && <MobileHero />}
        {activeTab === 'artworks' && <MobileArtworks />}
        {activeTab === 'videos' && <MobileVideos />}
        {activeTab === 'video-edits' && <MobileVideoEdits />}
        {activeTab === 'about' && <MobileAbout />}
      </motion.div>

      <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 墨璃助手 - 移动端 64px 圆形头像 */}
      <MoliCharacter mobileSize={64} />
    </div>
  );
}
