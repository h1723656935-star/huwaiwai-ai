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
    '有什么想了解的吗？',
    '作品管理就交给我吧~',
  ];

  // 从角色设计稿提取的配色：紫色系 + 金色点缀
  const colors = {
    primary: '#6B4E8F',
    secondary: '#8B6FB0',
    accent: '#D4A857',
    light: '#E8DEED',
    hairLight: '#9B8BB5',
    hairDark: '#5A4672',
    dress: '#2A1F3D',
    dressAccent: '#1A1228',
  };

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
          className="relative w-32 h-48 md:w-40 md:h-60"
          animate={{
            y: [0, -10, 0],
            rotate: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* 魔法光环 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.light}60 0%, transparent 60%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* 旋转的魔法阵装饰 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ opacity: 0.4 }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke={colors.accent} strokeWidth="0.5" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="35" fill="none" stroke={colors.secondary} strokeWidth="0.5" />
            </svg>
          </motion.div>

          {/* 二次元少女形象 SVG  */}
          <svg
            viewBox="0 0 160 240"
            className="w-full h-full relative z-10 drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 8px 20px rgba(107, 78, 143, 0.3))' }}
          >
            <defs>
              {/* 头发渐变 - 紫色系 */}
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.hairLight} />
                <stop offset="50%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.hairDark} />
              </linearGradient>

              {/* 肤色 */}
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDF5F3" />
                <stop offset="100%" stopColor="#F5E6E8" />
              </linearGradient>

              {/* 衣服渐变 - 深紫色 */}
              <linearGradient id="dressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.dress} />
                <stop offset="100%" stopColor={colors.dressAccent} />
              </linearGradient>

              {/* 外袍渐变 */}
              <linearGradient id="robeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5F0F8" />
                <stop offset="50%" stopColor={colors.light} />
                <stop offset="100%" stopColor="#D8CCE0" />
              </linearGradient>

              {/* 金色装饰 */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.accent} />
                <stop offset="100%" stopColor="#B8954A" />
              </linearGradient>

              {/* 紫色丝带 */}
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.primary} />
              </linearGradient>
            </defs>

            {/* 投影 */}
            <ellipse cx="80" cy="225" rx="30" ry="6" fill="rgba(107, 78, 143, 0.2)" />

            {/* 长发后层 - 左侧 */}
            <motion.path
              d="M 30 85 Q 15 120 25 160 Q 20 200 35 230 L 50 225 Q 45 190 55 150 Q 60 120 55 90 Z"
              fill="url(#hairGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* 长发后层 - 右侧 */}
            <motion.path
              d="M 130 85 Q 145 120 135 160 Q 140 200 125 230 L 110 225 Q 115 190 105 150 Q 100 120 105 90 Z"
              fill="url(#hairGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* 外袍 - 左侧 */}
            <path
              d="M 35 140 Q 20 160 15 200 Q 12 220 20 230 L 45 230 Q 48 200 50 180 Q 52 160 50 145 Z"
              fill="url(#robeGrad)"
              stroke={colors.primary}
              strokeWidth="0.5"
            />

            {/* 外袍 - 右侧 */}
            <path
              d="M 125 140 Q 140 160 145 200 Q 148 220 140 230 L 115 230 Q 112 200 110 180 Q 108 160 110 145 Z"
              fill="url(#robeGrad)"
              stroke={colors.primary}
              strokeWidth="0.5"
            />

            {/* 外袍金色装饰边 */}
            <path d="M 35 140 Q 25 165 20 200" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
            <path d="M 125 140 Q 135 165 140 200" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />

            {/* 胸前装饰小花 */}
            <g transform="translate(105, 130)">
              <circle cx="0" cy="0" r="3" fill={colors.primary} />
              <circle cx="0" cy="0" r="1.5" fill={colors.accent} />
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse
                  key={i}
                  cx={Math.cos((angle * Math.PI) / 180) * 4}
                  cy={Math.sin((angle * Math.PI) / 180) * 4}
                  rx="2"
                  ry="3"
                  fill={colors.secondary}
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>

            {/* 衣服主体 - 立领连衣裙 */}
            <path
              d="M 50 130 Q 55 125 80 125 Q 105 125 110 130 L 115 170 Q 118 200 105 215 L 55 215 Q 42 200 45 170 Z"
              fill="url(#dressGrad)"
              stroke={colors.primary}
              strokeWidth="0.5"
            />

            {/* 胸前金色装饰 */}
            <path
              d="M 65 130 L 65 145 L 80 150 L 95 145 L 95 130"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <circle cx="80" cy="142" r="2" fill={colors.accent} />

            {/* 颈部丝带 */}
            <path
              d="M 60 115 Q 80 122 100 115 L 95 130 Q 80 135 65 130 Z"
              fill="url(#dressGrad)"
              stroke={colors.accent}
              strokeWidth="0.5"
            />
            <circle cx="80" cy="125" r="2" fill={colors.accent} />

            {/* 腰部丝带 - 紫色 */}
            <path
              d="M 48 168 Q 80 175 112 168 L 112 175 Q 80 180 48 175 Z"
              fill="url(#ribbonGrad)"
            />
            <path d="M 75 175 L 72 200 L 85 195 L 88 175" fill="url(#ribbonGrad)" />
            <circle cx="80" cy="173" r="2" fill={colors.accent} />

            {/* 手臂 - 左 */}
            <path
              d="M 45 140 Q 35 155 30 175 Q 28 185 35 188 L 42 185 Q 45 165 52 150 Z"
              fill="url(#dressGrad)"
              stroke={colors.primary}
              strokeWidth="0.3"
            />
            {/* 手 */}
            <ellipse cx="32" cy="188" rx="5" ry="6" fill="url(#skinGrad)" />

            {/* 手臂 - 右 */}
            <path
              d="M 115 140 Q 125 155 130 175 Q 132 185 125 188 L 118 185 Q 115 165 108 150 Z"
              fill="url(#dressGrad)"
              stroke={colors.primary}
              strokeWidth="0.3"
            />
            {/* 手 */}
            <ellipse cx="128" cy="188" rx="5" ry="6" fill="url(#skinGrad)" />

            {/* 脖子 */}
            <ellipse cx="80" cy="110" rx="8" ry="10" fill="url(#skinGrad)" />

            {/* 头部 */}
            <ellipse cx="80" cy="70" rx="28" ry="32" fill="url(#skinGrad)" />

            {/* 头发 - 头顶 */}
            <path
              d="M 52 55 Q 50 25 80 22 Q 110 25 108 55 Q 110 65 105 70 Q 102 60 95 58 Q 90 65 85 60 Q 80 65 75 60 Q 70 65 65 58 Q 58 60 55 70 Q 50 65 52 55 Z"
              fill="url(#hairGrad)"
            />

            {/* 刘海 */}
            <path
              d="M 55 58 Q 60 75 65 80 Q 70 70 75 65 Q 78 78 82 65 Q 88 70 90 80 Q 95 75 105 58 Q 95 50 80 50 Q 65 50 55 58 Z"
              fill="url(#hairGrad)"
            />

            {/* 侧边发丝 - 左 */}
            <path
              d="M 52 60 Q 45 90 50 130 L 58 128 Q 55 95 62 65 Z"
              fill="url(#hairGrad)"
            />

            {/* 侧边发丝 - 右 */}
            <path
              d="M 108 60 Q 115 90 110 130 L 102 128 Q 105 95 98 65 Z"
              fill="url(#hairGrad)"
            />

            {/* 紫色花饰 */}
            <g transform="translate(55, 35)">
              <motion.g
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <ellipse
                    key={i}
                    cx={Math.cos((angle * Math.PI) / 180) * 4}
                    cy={Math.sin((angle * Math.PI) / 180) * 4}
                    rx="3"
                    ry="5"
                    fill={colors.secondary}
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3" fill={colors.accent} />
                {[36, 108, 180, 252, 324].map((angle, i) => (
                  <ellipse
                    key={`b-${i}`}
                    cx={Math.cos((angle * Math.PI) / 180) * 7}
                    cy={Math.sin((angle * Math.PI) / 180) * 7}
                    rx="2"
                    ry="4"
                    fill={colors.primary}
                    transform={`rotate(${angle})`}
                    opacity="0.8"
                  />
                ))}
              </motion.g>
            </g>

            {/* 丝带发饰 */}
            <path
              d="M 45 40 Q 38 45 42 52 L 48 48 Q 52 42 50 38 Z"
              fill={colors.primary}
            />
            <path
              d="M 42 48 L 35 58 L 40 62 L 45 55 Z"
              fill={colors.primary}
              opacity="0.8"
            />

            {/* 眼睛 - 左 */}
            <g>
              <ellipse cx="68" cy="72" rx="5" ry={isBlinking ? 0.5 : 6} fill="#fff" />
              {!isBlinking && (
                <>
                  <ellipse cx="68" cy="73" rx="4" ry="5" fill={colors.primary} />
                  <ellipse cx="68" cy="73" rx="3" ry="4" fill={colors.hairDark} />
                  <circle cx="69" cy="71" r="1.5" fill="#fff" />
                  <circle cx="67" cy="75" r="0.8" fill="#fff" opacity="0.7" />
                </>
              )}
              <path d="M 62 65 Q 68 63 74 66" stroke={colors.hairDark} strokeWidth="1" fill="none" strokeLinecap="round" />
            </g>

            {/* 眼睛 - 右 */}
            <g>
              <ellipse cx="92" cy="72" rx="5" ry={isBlinking ? 0.5 : 6} fill="#fff" />
              {!isBlinking && (
                <>
                  <ellipse cx="92" cy="73" rx="4" ry="5" fill={colors.primary} />
                  <ellipse cx="92" cy="73" rx="3" ry="4" fill={colors.hairDark} />
                  <circle cx="93" cy="71" r="1.5" fill="#fff" />
                  <circle cx="91" cy="75" r="0.8" fill="#fff" opacity="0.7" />
                </>
              )}
              <path d="M 86 66 Q 92 63 98 65" stroke={colors.hairDark} strokeWidth="1" fill="none" strokeLinecap="round" />
            </g>

            {/* 眉毛 */}
            <path d="M 62 60 Q 68 58 74 60" stroke={colors.hairDark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 86 60 Q 92 58 98 60" stroke={colors.hairDark} strokeWidth="1.2" fill="none" strokeLinecap="round" />

            {/* 腮红 */}
            <ellipse cx="62" cy="85" rx="5" ry="3" fill="#F5B8C8" opacity="0.6" />
            <ellipse cx="98" cy="85" rx="5" ry="3" fill="#F5B8C8" opacity="0.6" />

            {/* 鼻子 */}
            <path d="M 80 82 L 78 88 L 82 88 Z" fill={colors.accent} opacity="0.3" />

            {/* 嘴唇 */}
            <path
              d="M 74 95 Q 80 98 86 95 Q 85 100 80 100 Q 75 100 74 95 Z"
              fill="#D4787C"
            />
            <path
              d="M 74 95 Q 80 93 86 95"
              stroke="#B8555A"
              strokeWidth="0.5"
              fill="none"
            />

            {/* 胸前金色图案 */}
            <path
              d="M 80 155 L 78 165 L 80 175 L 82 165 Z"
              fill="url(#goldGrad)"
              opacity="0.6"
            />
          </svg>

          {/* 闪光装饰 */}
          {[
            { x: 5, y: 20, size: 6, delay: 0 },
            { x: 100, y: 30, size: 4, delay: 0.5 },
            { x: 8, y: 80, size: 5, delay: 1 },
            { x: 110, y: 90, size: 3, delay: 1.5 },
          ].map((sparkle, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${(sparkle.x / 160) * 100}%`,
                top: `${(sparkle.y / 240) * 100}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg viewBox="0 0 10 10" className="w-full h-full">
                <path
                  d="M 5 0 L 6 4 L 10 5 L 6 6 L 5 10 L 4 6 L 0 5 L 4 4 Z"
                  fill={colors.accent}
                />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* 悬浮气泡 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.85 }}
              className="absolute bottom-full right-0 mb-4"
              style={{ minWidth: '180px' }}
            >
              <div
                className="px-5 py-3 rounded-2xl shadow-xl border"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F5FB 100%)',
                  borderColor: `${colors.primary}30`,
                  boxShadow: `0 8px 30px ${colors.primary}30`,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  {tips[Math.floor(Math.random() * tips.length)]}
                </p>
              </div>
              {/* 气泡尖角 */}
              <div
                className="absolute bottom-0 right-6 w-3 h-3 border-r border-b rounded-br-sm"
                style={{
                  transform: 'translateY(50%) rotate(45deg)',
                  background: '#F8F5FB',
                  borderColor: `${colors.primary}30`,
                }}
              />
            </motion.div>
          )}

          {isClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-4"
            >
              <div
                className="px-5 py-3 rounded-2xl shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  boxShadow: `0 8px 30px ${colors.primary}50`,
                }}
              >
                <p className="text-white text-sm font-medium whitespace-nowrap">
                  欢迎来到胡歪歪 AI Studio！✨
                </p>
              </div>
              <div
                className="absolute bottom-0 right-6 w-3 h-3"
                style={{
                  transform: 'translateY(50%) rotate(45deg)',
                  background: colors.secondary,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
