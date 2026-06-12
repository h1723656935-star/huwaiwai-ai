"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { moliQuotes } from '@/lib/moliCharacter';

// 「墨璃」角色图片路径 - 将你的立绘图片放入 public/moli/ 目录
const CHARACTER_IMAGE = '/moli/moli-standby.png';
const CHARACTER_IMAGE_INTRO = '/moli/moli-intro.png';

export default function MoliCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // 检测移动端
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // 鼠标跟随视线
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageLoaded) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.48; // 眼睛大致在画面中偏左一点
      const cy = rect.top + rect.height * 0.22;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxMove = 6;
      setEyeOffset({
        x: dist > 10 ? (dx / dist) * Math.min(maxMove, dist * 0.03) : 0,
        y: dist > 10 ? (dy / dist) * Math.min(maxMove, dist * 0.02) : 0,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, imageLoaded]);

  // 眨眼动画（通过 CSS class 切换模拟）
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  // 随机语录
  useEffect(() => {
    const showRandomQuote = () => {
      setCurrentQuote(moliQuotes.idle[Math.floor(Math.random() * moliQuotes.idle.length)]);
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 5000);
    };
    const timer = setInterval(showRandomQuote, 15000);
    const initial = setTimeout(showRandomQuote, 6000);
    return () => { clearInterval(timer); clearTimeout(initial); };
  }, []);

  const handleClick = () => {
    if (isMobile) { setShowMenu(!showMenu); return; }
    setCurrentQuote(moliQuotes.greeting[Math.floor(Math.random() * moliQuotes.greeting.length)]);
    setShowQuote(true);
    setTimeout(() => setShowQuote(false), 4500);
  };

  // 角色尺寸配置
  const charWidth = isMobile ? 120 : 320;
  const charHeight = isMobile ? 200 : 520;

  return (
    <>
      {/* ====== 角色容器 ====== */}
      <div
        ref={containerRef}
        className="fixed bottom-0 right-0 z-30 pointer-events-none"
        style={{ width: `${charWidth + (isMobile ? 20 : 60)}px`, height: `${charHeight + 40}px` }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer pointer-events-auto"
          onClick={handleClick}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* ====== 背景光效层 ====== */}
          <motion.div
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${charWidth * 1.2}px`,
              height: `${charHeight * 0.5}px`,
              left: '50%',
              top: '55%',
              background: 'radial-gradient(ellipse, rgba(94,61,138,0.35) 0%, rgba(26,20,38,0.2) 50%, transparent 70%)',
              transform: 'translateX(-50%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ====== 漂浮粒子装饰 ====== */}
          {[...Array(isMobile ? 4 : 12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${5 + Math.random() * 85}%`,
                width: `${isMobile ? 2 : 3 + Math.random() * 3}px`,
                height: `${isMobile ? 2 : 3 + Math.random() * 3}px`,
                background: i % 3 === 0 ? '#A78BD9' : i % 3 === 1 ? '#C9B3E0' : '#E8DEED',
                boxShadow: `0 0 ${4 + Math.random() * 4}px ${i % 2 === 0 ? '#A78BD980' : '#C9B3E060'}`,
              }}
              animate={{
                y: [0, -(20 + Math.random() * 25), 0],
                opacity: [0, 0.9, 0],
                x: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* ====== 星光闪烁装饰 ====== */}
          {[...Array(isMobile ? 3 : 8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.3, 0],
                opacity: [0, 1, 0],
                rotate: [0, 90],
              }}
              transition={{
                duration: 2,
                delay: 0.5 + i * 0.25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg viewBox="0 0 16 16" width={isMobile ? 8 : 14} height={isMobile ? 8 : 14}>
                <path d="M 8 0 L 9.5 6 L 16 8 L 9.5 10 L 8 16 L 6.5 10 L 0 8 L 6.5 6 Z" fill="#D4AF7A" />
                <path d="M 8 2 L 9 7 L 8 9 L 7 7 Z" fill="#FFFFFF" opacity="0.7" />
              </svg>
            </motion.div>
          ))}

          {/* ====== 角色图片主体 ====== */}
          <motion.div
            className="absolute"
            style={{
              right: isMobile ? 0 : 10,
              bottom: 10,
              width: `${charWidth}px`,
              height: `${charHeight}px`,
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 图片 */}
            <img
              src={CHARACTER_IMAGE}
              alt="墨璃 - MOLI"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                filter: 'drop-shadow(0 15px 35px rgba(26,20,38,0.45))',
              }}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />

            {/* ====== 视线跟随覆盖层（眼睛区域）===== */}
            {!isMobile && imageLoaded && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  top: `${charHeight * 0.17}%`,
                  left: `${charWidth * 0.36}%`,
                  width: `${charWidth * 0.28}%`,
                  height: `${charHeight * 0.06}%`,
                  overflow: 'hidden',
                  borderRadius: '50%',
                }}
                animate={{
                  x: eyeOffset.x,
                  y: eyeOffset.y,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              >
                {/* 左眼高光微动 */}
                <motion.div
                  className="absolute rounded-full bg-white/20"
                  style={{
                    width: '30%',
                    height: '50%',
                    top: '15%',
                    left: '20%',
                    filter: 'blur(1px)',
                  }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            )}

            {/* 眨眼效果 - 通过整体透明度变化模拟 */}
            {isBlinking && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.08, 0] }}
                transition={{ duration: 0.18 }}
                style={{ background: '#000' }}
              />
            )}
          </motion.div>

          {/* ====== 底部科技感光带 ====== */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: '50%',
              bottom: 5,
              width: `${charWidth * 0.6}px`,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #5E3D8A, #A78BD9, #5E3D8A, transparent)',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 10px #5E3D8A80',
            }}
            animate={{
              scaleX: [0.6, 1, 0.6],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* ====== 对话气泡 ====== */}
      <AnimatePresence>
        {showQuote && currentQuote && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            className="fixed z-40"
            style={{
              right: isMobile ? 70 : charWidth + 40,
              bottom: charHeight - 40,
              maxWidth: 260,
            }}
          >
            <div
              className="px-5 py-3.5 rounded-2xl backdrop-blur-xl border relative"
              style={{
                background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(42,31,61,0.96) 100%)',
                borderColor: 'rgba(122,91,171,0.4)',
                boxShadow: '0 12px 45px rgba(13,10,24,0.6), 0 0 60px rgba(94,61,138,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* 顶部装饰线 */}
              <div
                className="absolute top-0 left-6 right-6 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, #A78BD9, #D4AF7A, #A78BD9, transparent)',
                }}
              />

              <div className="flex items-start gap-2.5">
                {/* 墨璃标识 */}
                <div
                  className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#A78BD9',
                    boxShadow: '0 0 8px #A78BD9, 0 0 16px #A78BD940',
                  }}
                />
                <p
                  className="text-[13px] leading-relaxed font-light tracking-wide"
                  style={{ color: '#E8DEED' }}
                >
                  {currentQuote}
                </p>
              </div>

              {/* 气泡尖角 */}
              <div
                className="absolute -bottom-2 right-8 w-4 h-4 rotate-45"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(42,31,61,0.96) 100%)',
                  borderBottom: '1px solid rgba(122,91,171,0.4)',
                  borderRight: '1px solid rgba(122,91,171,0.4)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 快捷导航菜单 ====== */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40"
            style={{
              right: isMobile ? 70 : charWidth + 40,
              bottom: isMobile ? 140 : charHeight + 20,
            }}
          >
            <div
              className="px-4 py-3 rounded-2xl backdrop-blur-xl space-y-0.5 min-w-[190px]"
              style={{
                background: 'linear-gradient(145deg, rgba(13,10,24,0.97) 0%, rgba(32,24,48,0.97) 100%)',
                border: '1px solid rgba(122,91,171,0.35)',
                boxShadow: '0 12px 45px rgba(13,10,24,0.65), 0 0 50px rgba(94,61,138,0.2)',
              }}
            >
              {/* 标题栏 */}
              <div
                className="flex items-center gap-2 px-3 py-2 mb-1.5 rounded-lg"
                style={{ background: 'rgba(94,61,138,0.15)' }}
              >
                <span style={{ color: '#D4AF7A', fontSize: 11 }}>✦</span>
                <span className="text-xs font-medium tracking-wider" style={{ color: '#C9B3E0' }}>
                  墨璃 · 导航
                </span>
                <span style={{ color: '#D4AF7A', fontSize: 11 }}>✦</span>
              </div>

              {[
                { href: '#home', icon: '◆', label: moliQuotes.navigation.home },
                { href: '#artworks', icon: '◇', label: moliQuotes.navigation.artworks },
                { href: '#videos', icon: '◆', label: moliQuotes.navigation.videos },
                { href: '/admin', icon: '◇', label: moliQuotes.navigation.admin },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                  style={{ color: '#E8DEED' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(94,61,138,0.2)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }}
                  onClick={() => setShowMenu(false)}
                >
                  <span
                    className="text-sm flex-shrink-0 w-5 text-center"
                    style={{ color: '#A78BD9', fontSize: 11 }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-light tracking-wide">{item.label}</span>
                  <span
                    className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#D4AF7A' }}
                  >
                    →
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 移动端触发按钮 ====== */}
      {isMobile && (
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1A1426 0%, #3D2A5C 50%, #5E3D8A 100%)',
            boxShadow: '0 4px 25px rgba(94,61,138,0.5), 0 0 40px rgba(167,139,217,0.15)',
            border: '1px solid rgba(122,91,171,0.5)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          animate={{
            boxShadow: [
              '0 4px 25px rgba(94,61,138,0.5)',
              '0 4px 35px rgba(94,61,138,0.7)',
              '0 4px 25px rgba(94,61,138,0.5)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span style={{ color: '#E8DEED', fontSize: 18 }}>✦</span>
        </motion.button>
      )}
    </>
  );
}
