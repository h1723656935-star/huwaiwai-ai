"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[10]"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        className="absolute rounded-full"
        animate={{
          x: position.x - 200,
          y: position.y - 200,
          opacity: isVisible ? 0.15 : 0,
          scale: isVisible ? 1 : 0.8,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 30,
          mass: 0.5,
        }}
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(120, 101, 248, 0.4) 0%, rgba(169, 145, 255, 0.1) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </motion.div>
  );
}
