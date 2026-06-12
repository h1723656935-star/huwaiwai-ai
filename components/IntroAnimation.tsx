"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 0.5,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: 0.6, ease: 'easeInOut' },
        }}
      >
        {/* 背景渐变 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* 放射状光晕 1 */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,156,206,0.4) 0%, rgba(255,182,193,0.2) 40%, transparent 70%)',
            top: '50%',
            left: '50%',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.2, 1],
            opacity: [0, 0.6, 0.3],
            rotate: 180,
          }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* 放射状光晕 2 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,182,225,0.5) 0%, transparent 60%)',
            top: '50%',
            left: '50%',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.5, 1.2],
            opacity: [0, 0.8, 0.4],
          }}
          transition={{ duration: 1.8, delay: 0.2, ease: 'easeOut' }}
        />

        {/* 粒子效果 */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white shadow-lg"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: '0 0 10px rgba(255,156,206,0.8), 0 0 20px rgba(255,182,193,0.5)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: (Math.random() - 0.5) * 200,
              y: (Math.random() - 0.5) * 200,
            }}
            transition={{
              duration: 1.5,
              delay: 0.3 + p.delay,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* 扩散圆环 */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/40"
            style={{
              top: '50%',
              left: '50%',
              width: '20px',
              height: '20px',
            }}
            initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 1 }}
            animate={{
              x: '-50%',
              y: '-50%',
              scale: [0, 15, 30],
              opacity: [1, 0.3, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* 中心 Logo */}
        <div className="relative z-10 text-center">
          {/* 外层光环 */}
          <motion.div
            className="absolute -inset-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,156,206,0.3) 0%, transparent 60%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* 主标题 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1],
              y: [40, -5, 0],
              scale: [0.8, 1.05, 1],
            }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #FF9CCE 0%, #FFB6C1 40%, #FFD1DC 70%, #FF9CCE 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease infinite',
                }}
              >
                胡歪歪
              </span>
            </h1>
          </motion.div>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
            className="text-xl sm:text-2xl font-medium text-gray-600 mt-4"
          >
            AI Studio
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: 'easeInOut' }}
            style={{ originX: 0.5 }}
            className="h-[2px] w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
          />

          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-gray-500 mt-6 text-base sm:text-lg"
          >
            AI 绘画 · 视频创作 · 二次元美学
          </motion.p>
        </div>

        {/* 进度条 */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.6, delay: 1, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          LOADING YOUR EXPERIENCE...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
