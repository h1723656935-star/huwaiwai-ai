"use client";

import { motion } from 'framer-motion';

const sparkles = [
  { id: 1, x: '10%', y: '20%', size: 200, delay: 0 },
  { id: 2, x: '80%', y: '30%', size: 300, delay: 1 },
  { id: 3, x: '50%', y: '60%', size: 250, delay: 2 },
  { id: 4, x: '20%', y: '70%', size: 180, delay: 0.5 },
  { id: 5, x: '90%', y: '80%', size: 220, delay: 1.5 },
  { id: 6, x: '30%', y: '10%', size: 150, delay: 2.5 },
];

export default function SparklesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            background: `radial-gradient(circle, rgba(255, 156, 206, 0.3) 0%, rgba(255, 182, 193, 0.1) 50%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 156, 206, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 228, 240, 0.2) 0%, transparent 60%)
          `,
        }}
      />
    </div>
  );
}
