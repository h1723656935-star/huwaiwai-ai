"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { moliQuotes } from '@/lib/moliCharacter';

export default function MoliCharacter() {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    showRandomMessage('idle');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible && !showMessage && !isHovered) {
        showRandomMessage('idle');
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isVisible, showMessage, isHovered]);

  const showRandomMessage = (type: keyof typeof moliQuotes) => {
    const quotes = moliQuotes[type] as string[];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMessage(randomQuote);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    showRandomMessage('hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4"
            ref={containerRef}
          >
          {/* Message Bubble */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-xs"
              >
                <motion.div
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(13, 10, 24, 0.95)',
                    border: '1px solid rgba(120, 101, 248, 0.3)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(120, 101, 248, 0.2)',
                  }}
                  initial={{ boxShadow: '0 0 0 rgba(120, 101, 248, 0)' }}
                  animate={{ 
                    boxShadow: '0 8px 32px rgba(120, 101, 248, 0.2)',
                  }}
                >
                  <p style={{ color: '#ECE7FF', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {message}
                  </p>
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 right-6 w-4 h-4"
                  style={{
                    background: 'rgba(13, 10, 24, 0.95)',
                    borderRight: '1px solid rgba(120, 101, 248, 0.3)',
                    borderBottom: '1px solid rgba(120, 101, 248, 0.3)',
                  }}
                  animate={{ rotate: 45 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character */}
          <motion.div
            className="relative cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(120, 101, 248, 0.3)',
                border: '2px solid rgba(120, 101, 248, 0.3)',
              }}
            >
              <img
                src="/moli/moli-standby.png"
                alt="墨璃"
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(120, 101, 248, 0.1) 0%, transparent 50%)',
                }}
              />
            </div>

            {/* Glow Effect */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(120, 101, 248, 0.2) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
