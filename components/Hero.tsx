"use client";

import { motion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToContent = () => {
    const element = document.getElementById('artworks');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(120, 101, 248, 0.15) 0%, transparent 60%)',
          }}
        />
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(169, 145, 255, 0.1) 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(120, 101, 248, 0.1) 0%, transparent 70%)',
            animation: 'pulse 10s ease-in-out infinite reverse',
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(169, 145, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(169, 145, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(120, 101, 248, 0.15)',
            border: '1px solid rgba(120, 101, 248, 0.3)',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#A991FF' }} />
          <span className="text-sm font-medium" style={{ color: '#C7B8FF' }}>
            AI艺术画廊
          </span>
        </motion.div>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          style={{
            background: 'linear-gradient(135deg, #ECE7FF 0%, #C7B8FF 30%, #A991FF 50%, #7865F8 70%, #C7B8FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
            textShadow: '0 0 60px rgba(120, 101, 248, 0.3)',
          }}
        >
          墨璃画廊
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12"
          style={{ color: 'rgba(199, 184, 255, 0.8)' }}
        >
          探索AI创作的无限可能
          <br />
          <span style={{ color: 'rgba(199, 184, 255, 0.6)' }}>
            每一幅作品都是数字艺术的杰作
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={scrollToContent}
            className="px-8 py-4 rounded-xl font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
              boxShadow: '0 4px 30px rgba(120, 101, 248, 0.4)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 40px rgba(120, 101, 248, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            探索画廊
          </motion.button>

          <motion.button
            className="px-8 py-4 rounded-xl font-medium"
            style={{
              background: 'transparent',
              border: '1px solid rgba(120, 101, 248, 0.4)',
              color: '#C7B8FF',
            }}
            whileHover={{ 
              scale: 1.05, 
              background: 'rgba(120, 101, 248, 0.1)',
              borderColor: 'rgba(120, 101, 248, 0.6)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('/admin', '_self')}
          >
            上传作品
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToContent}
          className="flex flex-col items-center gap-2"
          style={{ color: '#C7B8FF' }}
          whileHover={{ color: '#ECE7FF' }}
        >
          <span className="text-xs font-medium">向下滚动</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
