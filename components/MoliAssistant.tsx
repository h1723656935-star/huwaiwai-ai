"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 墨璃语录库 - 高级感 + 神秘感 + 艺术气息
const MOLI_QUOTES = [
  '月下紫晶，静候君至。',
  '银辉流影，画意成诗。',
  '愿你的世界，常有星光。',
  '每一笔，都是与世界的对话。',
  '今夜的月色，很适合创作。',
  '艺术，是灵魂的另一种呼吸。',
  '紫晶流转间，万物皆可入画。',
  '静水流深，沧笙踏歌。',
  '愿你以梦为马，不负韶华。',
  '光影之间，藏着我对你的问候。',
  '琉璃易碎，匠心难求。',
  '银河倾落，化为笔尖星尘。',
];

export default function MoliAssistant() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(MOLI_QUOTES[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // 在作品区才显示
  useEffect(() => {
    const handleScroll = () => {
      const artworksSection = document.getElementById('artworks');
      if (artworksSection) {
        const rect = artworksSection.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight * 0.5 && rect.bottom > 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 随机眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleAvatarClick = () => {
    setShowMenu(!showMenu);
    if (!showMenu) {
      // 切换语录
      const randomIndex = Math.floor(Math.random() * MOLI_QUOTES.length);
      setCurrentQuote(MOLI_QUOTES[randomIndex]);
    }
  };

  const handleViewWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(false);
    document.getElementById('artworks')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewVideos = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(false);
    document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isMobile) return null;
  if (!isVisible) return null;

  return (
    <div
      className="fixed z-40 moli-character"
      style={{
        right: 32,
        bottom: 32,
      }}
    >
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[88px] right-0"
            style={{ width: '280px' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(32,24,48,0.96) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px',
                border: '1px solid rgba(120,101,248,0.35)',
                boxShadow: '0 20px 60px rgba(13,10,24,0.6), 0 0 40px rgba(120,101,248,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                padding: '18px',
              }}
            >
              {/* 角色信息头 */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    border: '1.5px solid rgba(120,101,248,0.4)',
                    boxShadow: '0 0 12px rgba(120,101,248,0.3)',
                  }}
                >
                  <svg viewBox="0 0 40 40" width="40" height="40">
                    <defs>
                      <linearGradient id="menuHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F8F7FC" />
                        <stop offset="100%" stopColor="#C7B8FF" />
                      </linearGradient>
                    </defs>
                    <rect width="40" height="40" fill="rgba(120,101,248,0.15)" />
                    <ellipse cx="20" cy="14" rx="9" ry="8" fill="url(#menuHairGrad)" />
                    <circle cx="20" cy="18" r="6" fill="#F8F7FC" />
                    <circle cx="17" cy="18" r="1" fill="#7865F8" />
                    <circle cx="23" cy="18" r="1" fill="#7865F8" />
                    <path d="M 12 22 Q 20 30 28 22 L 28 30 L 12 30 Z" fill="#1A1628" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#ECE7FF', fontFamily: "'Smiley Sans', sans-serif" }}>
                    墨璃
                  </p>
                  <p className="text-xs" style={{ color: '#A991FF' }}>
                    AI 助手
                  </p>
                </div>
              </div>

              {/* 语录 */}
              <div
                className="mb-4 p-3 rounded-xl text-sm leading-relaxed"
                style={{
                  background: 'rgba(120,101,248,0.08)',
                  color: '#ECE7FF',
                  border: '1px solid rgba(120,101,248,0.15)',
                  fontStyle: 'italic',
                }}
              >
                「{currentQuote}」
              </div>

              {/* 菜单项 */}
              <div className="space-y-2">
                <MenuButton
                  icon={
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="5" height="5" rx="1" />
                      <rect x="9" y="2" width="5" height="5" rx="1" />
                      <rect x="2" y="9" width="5" height="5" rx="1" />
                      <rect x="9" y="9" width="5" height="5" rx="1" />
                    </svg>
                  }
                  label="查看作品"
                  onClick={handleViewWorks}
                />
                <MenuButton
                  icon={
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="6,3 13,8 6,13" fill="currentColor" stroke="none" />
                      <rect x="2" y="3" width="2" height="10" rx="0.5" />
                    </svg>
                  }
                  label="视频画廊"
                  onClick={handleViewVideos}
                />
                <MenuButton
                  icon={
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M 8 13 L 3 8 L 5 6 L 8 9 L 11 6 L 13 8 Z" fill="currentColor" />
                      <path d="M 8 13 L 8 3" />
                    </svg>
                  }
                  label="返回顶部"
                  onClick={handleBackToTop}
                />
              </div>
            </div>

            {/* 指向箭头 */}
            <div
              className="absolute -bottom-2 right-8 w-4 h-4 rotate-45"
              style={{
                background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(32,24,48,0.96) 100%)',
                borderRight: '1px solid rgba(120,101,248,0.35)',
                borderBottom: '1px solid rgba(120,101,248,0.35)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Q版墨璃头像 - 72px */}
      <motion.button
        onClick={handleAvatarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(120,101,248,0.25) 0%, rgba(169,145,255,0.18) 100%)',
          border: '1.5px solid rgba(120,101,248,0.4)',
          boxShadow: isHovered
            ? '0 12px 36px rgba(120,101,248,0.45), 0 0 32px rgba(120,101,248,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 6px 24px rgba(120,101,248,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <ChibiMoli isBlinking={isBlinking} />

        {/* 内层紫晶高光 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />

        {/* 外层呼吸光环 */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid rgba(120,101,248,0.4)',
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  );
}

// ============= 菜单按钮 =============
function MenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all"
      style={{
        background: 'rgba(120,101,248,0.08)',
        color: '#ECE7FF',
        border: '1px solid rgba(120,101,248,0.15)',
      }}
      whileHover={{
        background: 'rgba(120,101,248,0.18)',
        x: 4,
        borderColor: 'rgba(120,101,248,0.35)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span style={{ color: '#A991FF' }}>{icon}</span>
      {label}
    </motion.button>
  );
}

// ============= Q版墨璃 SVG（2.5头身） =============
function ChibiMoli({ isBlinking = false }: { isBlinking?: boolean }) {
  return (
    <svg
      viewBox="0 0 72 72"
      width="72"
      height="72"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 银白长发渐变 */}
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F0EDFF" />
          <stop offset="100%" stopColor="#C7B8FF" />
        </linearGradient>

        {/* 紫色眼睛渐变 */}
        <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A991FF" />
          <stop offset="100%" stopColor="#624DE3" />
        </linearGradient>

        {/* 服装渐变 */}
        <linearGradient id="clothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A1628" />
          <stop offset="100%" stopColor="#0A0812" />
        </linearGradient>

        {/* 紫晶胸针渐变 */}
        <radialGradient id="crystalGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#ECE7FF" />
          <stop offset="50%" stopColor="#A991FF" />
          <stop offset="100%" stopColor="#624DE3" />
        </radialGradient>
      </defs>

      {/* === 背景光晕 === */}
      <circle cx="36" cy="36" r="35" fill="rgba(120,101,248,0.08)" />

      {/* === 后发（长发） === */}
      <path
        d="M 14 36 Q 10 50 14 60 L 22 58 Q 18 48 20 38 Z"
        fill="url(#hairGrad)"
        opacity="0.9"
      />
      <path
        d="M 58 36 Q 62 50 58 60 L 50 58 Q 54 48 52 38 Z"
        fill="url(#hairGrad)"
        opacity="0.9"
      />

      {/* === 身体（2.5头身：上半身大） === */}
      <path
        d="M 24 52 Q 24 46 36 46 Q 48 46 48 52 L 50 64 Q 50 70 36 70 Q 22 70 22 64 Z"
        fill="url(#clothGrad)"
      />

      {/* 衣服高光 */}
      <path
        d="M 24 52 Q 24 46 36 46 Q 48 46 48 52 L 48 56 Q 36 58 24 56 Z"
        fill="rgba(120,101,248,0.15)"
      />

      {/* === 紫晶胸针（胸口中央） === */}
      <g transform="translate(36, 56)">
        <polygon
          points="0,-3 2.5,0 0,3 -2.5,0"
          fill="url(#crystalGrad)"
        />
        <polygon
          points="0,-3 2.5,0 0,0"
          fill="rgba(255,255,255,0.4)"
        />
      </g>

      {/* === 头部（2.5头身中的大头） === */}
      <ellipse
        cx="36"
        cy="32"
        rx="18"
        ry="20"
        fill="#FBF9FF"
      />

      {/* === 刘海（前发） === */}
      <path
        d="M 20 26 Q 18 18 24 16 L 22 24 Q 26 22 30 24 L 28 18 Q 32 16 36 18 Q 40 16 44 18 L 42 24 Q 46 22 50 24 L 48 16 Q 54 18 52 26 Q 50 30 36 30 Q 22 30 20 26 Z"
        fill="url(#hairGrad)"
      />

      {/* 侧发 */}
      <path
        d="M 18 28 Q 16 36 19 44 L 23 42 Q 20 36 22 30 Z"
        fill="url(#hairGrad)"
      />
      <path
        d="M 54 28 Q 56 36 53 44 L 49 42 Q 52 36 50 30 Z"
        fill="url(#hairGrad)"
      />

      {/* 头饰 - 紫晶发饰（左侧） */}
      <g transform="translate(20, 22)">
        <polygon
          points="0,-2 1.5,0 0,2 -1.5,0"
          fill="url(#crystalGrad)"
        />
        <circle cx="0" cy="0" r="0.4" fill="#ECE7FF" />
      </g>

      {/* === 眼睛（紫晶竖瞳） === */}
      <g transform="translate(30, 34)">
        <ellipse cx="0" cy="0" rx="3" ry="3.5" fill="#FFFFFF" />
        <ellipse
          cx="0"
          cy={isBlinking ? 0 : 0.3}
          rx="2.5"
          ry={isBlinking ? 0.3 : 3}
          fill="url(#eyeGrad)"
          style={{ transition: 'ry 0.15s' }}
        />
        <circle cx="0" cy={isBlinking ? 0 : -0.8} r="0.8" fill="#FFFFFF" />
      </g>
      <g transform="translate(42, 34)">
        <ellipse cx="0" cy="0" rx="3" ry="3.5" fill="#FFFFFF" />
        <ellipse
          cx="0"
          cy={isBlinking ? 0 : 0.3}
          rx="2.5"
          ry={isBlinking ? 0.3 : 3}
          fill="url(#eyeGrad)"
          style={{ transition: 'ry 0.15s' }}
        />
        <circle cx="0" cy={isBlinking ? 0 : -0.8} r="0.8" fill="#FFFFFF" />
      </g>

      {/* 睫毛 */}
      <path d="M 27 31 L 30 30" stroke="#624DE3" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M 45 31 L 42 30" stroke="#624DE3" strokeWidth="0.6" strokeLinecap="round" />

      {/* === 鼻子（极简点） === */}
      <circle cx="36" cy="38" r="0.4" fill="rgba(120,101,248,0.4)" />

      {/* === 嘴巴（微小微笑） === */}
      <path
        d="M 34 40 Q 36 41.5 38 40"
        stroke="#A991FF"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
