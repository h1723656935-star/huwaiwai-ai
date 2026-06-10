"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssistantCharacter() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 3000);
  };

  const tips = [
    '点击这里看作品哦~',
    '欢迎来到胡歪歪 AI Studio！',
    '今天也要元气满满！',
    '一起探索二次元世界吧~',
  ];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <motion.div
        className="relative cursor-pointer"
        animate={{
          x: position.x * 0.15,
          y: position.y * 0.15,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.div
          className="relative w-28 h-40 md:w-36 md:h-48"
          animate={{
            y: [0, -8, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />

          <svg viewBox="0 0 100 150" className="w-full h-full relative z-10">
            <ellipse cx="50" cy="130" rx="25" ry="8" fill="rgba(255,156,206,0.3)" />
            
            <circle cx="50" cy="45" r="28" fill="#FFF8FB" />
            <circle cx="50" cy="45" r="26" fill="#FFE4F0" />
            
            <ellipse cx="40" cy="42" rx="5" ry="6" fill="#374151">
              {isBlinking && (
                <animate
                  attributeName="ry"
                  values="6;0.5;6"
                  dur="0.2s"
                  fill="freeze"
                />
              )}
            </ellipse>
            <ellipse cx="60" cy="42" rx="5" ry="6" fill="#374151">
              {isBlinking && (
                <animate
                  attributeName="ry"
                  values="6;0.5;6"
                  dur="0.2s"
                  fill="freeze"
                />
              )}
            </ellipse>
            <circle cx="42" cy="40" r="2" fill="white" />
            <circle cx="62" cy="40" r="2" fill="white" />
            
            <ellipse cx="50" cy="55" rx="4" ry="3" fill="#FFB6C1" />
            
            <path
              d="M 44 62 Q 50 68 56 62"
              stroke="#E87BB2"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            
            <ellipse cx="30" cy="48" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="70" cy="48" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
            
            <ellipse cx="50" cy="100" rx="22" ry="30" fill="#FF9CCE" />
            <ellipse cx="50" cy="105" rx="18" ry="22" fill="#FFB6C1" />
            
            <ellipse cx="35" cy="90" rx="8" ry="12" fill="#FF9CCE" />
            <ellipse cx="65" cy="90" rx="8" ry="12" fill="#FF9CCE" />
            
            <ellipse cx="30" cy="78" rx="6" ry="10" fill="#FFE4F0" />
            <ellipse cx="70" cy="78" rx="6" ry="10" fill="#FFE4F0" />
            
            <ellipse cx="28" cy="105" rx="6" ry="12" fill="#FF9CCE" />
            <ellipse cx="72" cy="105" rx="6" ry="12" fill="#FF9CCE" />
            
            <circle cx="50" cy="95" r="8" fill="#FFE4F0" />
            <circle cx="50" cy="93" r="4" fill="#FFB6C1" />
            
            <path
              d="M 20 35 Q 15 50 25 55"
              stroke="#FFE4F0"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 80 35 Q 85 50 75 55"
              stroke="#FFE4F0"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <span className="text-xs">★</span>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-white rounded-2xl shadow-lg border border-primary/20"
            >
              <p className="text-gray-700 text-sm whitespace-nowrap">
                {tips[Math.floor(Math.random() * tips.length)]}
              </p>
              <div className="absolute bottom-0 right-4 transform translate-y-full rotate-45 w-3 h-3 bg-white border-r border-b border-primary/20" />
            </motion.div>
          )}

          {isClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg"
            >
              <p className="text-white text-sm whitespace-nowrap">
                欢迎来到胡歪歪 AI Studio！
              </p>
              <div className="absolute bottom-0 right-4 transform translate-y-full rotate-45 w-3 h-3 bg-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
