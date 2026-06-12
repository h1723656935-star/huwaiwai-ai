"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], input, textarea');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Outer Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        animate={{
          x: mousePosition.x - (isHovering ? 20 : 15),
          y: mousePosition.y - (isHovering ? 20 : 15),
          scale: isClicking ? 0.8 : isHovering ? 1.2 : 1,
          opacity: isHovering ? 0.6 : 0.4,
        }}
        transition={{
          type: 'spring',
          stiffness: 1000,
          damping: 30,
          mass: 0.3,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: isHovering ? 40 : 30,
            height: isHovering ? 40 : 30,
            background: 'radial-gradient(circle, rgba(120, 101, 248, 0.6) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Inner Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isClicking ? 1.5 : isHovering ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 1200,
          damping: 25,
          mass: 0.2,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: '#A991FF',
            boxShadow: '0 0 10px rgba(169, 145, 255, 0.8)',
          }}
        />
      </motion.div>
    </>
  );
}
