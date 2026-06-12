"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetType, setTargetType] = useState<'default' | 'button' | 'work' | 'link' | 'moli'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;
      setPosition({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      const target = e.target as HTMLElement;
      if (target.closest('button') || target.tagName === 'BUTTON') {
        setTargetType('button');
      } else if (target.closest('.artwork-card') || target.closest('.video-card')) {
        setTargetType('work');
      } else if (target.closest('a') || target.tagName === 'A') {
        setTargetType('link');
      } else if (target.closest('.moli-character')) {
        setTargetType('moli');
      } else {
        setTargetType('default');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const getLabel = () => {
    switch (targetType) {
      case 'work':
        return 'OPEN';
      case 'link':
        return 'VISIT';
      case 'moli':
        return '墨璃';
      default:
        return '';
    }
  };

  return (
    <>
      {targetType === 'button' && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          animate={{
            x: position.x - 60,
            y: position.y - 8,
            opacity: isVisible ? 1 : 0,
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, rgba(120,101,248,0.15) 0%, rgba(169,145,255,0.08) 100%)',
              backdropFilter: 'blur(8px)',
              padding: '4px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(120,101,248,0.2)',
            }}
          >
            <div
              className="w-16 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(120,101,248,0.8) 0%, rgba(169,145,255,0.4) 100%)',
              }}
            />
          </div>
        </motion.div>
      )}

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z"
            fill="currentColor"
            stroke="#7865F8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(120,101,248,0.4))',
            }}
          />
        </svg>
      </motion.div>

      {getLabel() && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997]"
          animate={{
            x: position.x + 20,
            y: position.y - 8,
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(13,10,24,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(120,101,248,0.3)',
              color: '#F8F7FC',
              boxShadow: '0 4px 20px rgba(120,101,248,0.2)',
            }}
          >
            {getLabel()}
          </div>
        </motion.div>
      )}
    </>
  );
}
