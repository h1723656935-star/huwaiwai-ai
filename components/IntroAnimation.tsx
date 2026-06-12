"use client";

import { motion } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: '#0D0A18' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="relative">
        {/* Logo */}
        <motion.div
          className="relative w-32 h-32 mx-auto"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
        >
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(120, 101, 248, 0.3) 0%, rgba(169, 145, 255, 0.2) 50%, rgba(120, 101, 248, 0.3) 100%)',
              animation: 'spin 8s linear infinite',
              boxShadow: '0 0 60px rgba(120, 101, 248, 0.4)',
            }}
          />
          <motion.div 
            className="absolute inset-1 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: '#0D0A18' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-20 h-20 object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h1
            className="text-3xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #ECE7FF 0%, #A991FF 50%, #7865F8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
            }}
          >
            墨璃画廊
          </h1>
          <motion.p 
            className="text-sm mt-2"
            style={{ color: 'rgba(169, 145, 255, 0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            探索AI创作的无限可能
          </motion.p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          className="mt-12 w-48 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120, 101, 248, 0.2)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7865F8 0%, #A991FF 100%)',
                boxShadow: '0 0 10px rgba(169, 145, 255, 0.8)',
              }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.5 }}
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
