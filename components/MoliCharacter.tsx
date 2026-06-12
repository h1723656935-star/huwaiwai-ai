"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHARACTER_IMAGE = '/moli/moli-standby.png';

// 墨璃语录库
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

export default function MoliCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAssistantMode, setIsAssistantMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(MOLI_QUOTES[0]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const artworksSection = document.getElementById('artworks');
      if (artworksSection) {
        const rect = artworksSection.getBoundingClientRect();
        setIsAssistantMode(rect.top < window.innerHeight * 0.5);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMobile) {
    return null;
  }

  const charWidth = 380;
  const charHeight = 480;
  const avatarSize = 90;

  const handleAvatarClick = () => {
    setShowMenu(!showMenu);
    if (!showMenu) {
      const randomIndex = Math.floor(Math.random() * MOLI_QUOTES.length);
      setCurrentQuote(MOLI_QUOTES[randomIndex]);
    }
  };

  const handleNavigate = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAssistantMode ? (
          // ============ Hero区域 - 全身立绘 ============
          <motion.div
            key="full-character"
            ref={containerRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-30 pointer-events-none moli-character"
            style={{
              right: -80,
              bottom: 0,
              width: charWidth,
              height: charHeight,
            }}
          >
            <motion.div
              className="relative w-full h-full cursor-pointer pointer-events-auto"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ opacity: isHovered ? 1 : 0.95 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(120,101,248,0.2) 0%, transparent 70%)',
                  transform: 'translate(30%, 50%)',
                  width: '280px',
                  height: '280px',
                }}
                animate={{
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.img
                src={CHARACTER_IMAGE}
                alt="墨璃 - MOLI"
                className="relative z-10 w-full h-full object-contain object-position bottom-center"
                style={{
                  filter: `drop-shadow(0 20px 50px rgba(120,101,248,0.3)) drop-shadow(0 10px 30px rgba(0,0,0,0.4))`,
                }}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('[墨璃] 立绘加载失败');
                  target.style.display = 'none';
                }}
                draggable={false}
              />

              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(120,101,248,0.6), transparent)',
                  filter: 'blur(2px)',
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        ) : (
          // ============ 作品区 - 圆形头像（聚焦肩部以上） ============
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40 moli-character"
            style={{
              right: 32,
              bottom: 32,
            }}
          >
            <motion.button
              onClick={handleAvatarClick}
              className="relative overflow-hidden"
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(120,101,248,0.2) 0%, rgba(169,145,255,0.15) 100%)',
                boxShadow: isHovered
                  ? '0 12px 40px rgba(120,101,248,0.45), 0 0 32px rgba(120,101,248,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 8px 32px rgba(120,101,248,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(120,101,248,0.4)',
                transition: 'box-shadow 0.3s ease',
                padding: 0,
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 头像：使用立绘图片，object-position 聚焦肩部以上 */}
              <img
                src={CHARACTER_IMAGE}
                alt="墨璃"
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  // 关键：聚焦肩部以上（图片的 5%-50% 区域）
                  objectPosition: '50% 22%',
                }}
                draggable={false}
              />

              {/* 顶部高光 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 50%)',
                }}
              />

              {/* 外层呼吸光环 */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: '1.5px solid rgba(120,101,248,0.4)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* 边缘紫色描边光 */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 12px rgba(120,101,248,0.2)',
                }}
              />
            </motion.button>

            {/* ============ 助手菜单 ============ */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute"
                  style={{
                    bottom: `${avatarSize + 16}px`,
                    right: 0,
                    width: '280px',
                  }}
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
                        className="overflow-hidden flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '1.5px solid rgba(120,101,248,0.4)',
                          boxShadow: '0 0 12px rgba(120,101,248,0.3)',
                        }}
                      >
                        <img
                          src={CHARACTER_IMAGE}
                          alt="墨璃"
                          className="w-full h-full"
                          style={{
                            objectFit: 'cover',
                            objectPosition: '50% 22%',
                          }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: '#ECE7FF', fontFamily: "'Smiley Sans', sans-serif" }}
                        >
                          墨璃
                        </p>
                        <p className="text-xs" style={{ color: '#A991FF' }}>
                          AI 助手
                        </p>
                      </div>
                    </div>

                    {/* 随机语录 */}
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
                        onClick={(e) => handleNavigate(e, 'artworks')}
                      />
                      <MenuButton
                        icon={
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="6,3 13,8 6,13" fill="currentColor" stroke="none" />
                            <rect x="2" y="3" width="2" height="10" rx="0.5" />
                          </svg>
                        }
                        label="视频画廊"
                        onClick={(e) => handleNavigate(e, 'videos')}
                      />
                      <MenuButton
                        icon={
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M 8 13 L 3 8 L 5 6 L 8 9 L 11 6 L 13 8 Z" fill="currentColor" />
                            <path d="M 8 13 L 8 3" />
                          </svg>
                        }
                        label="返回顶部"
                        onClick={(e) => handleNavigate(e, 'top')}
                      />
                    </div>
                  </div>

                  {/* 指向箭头 */}
                  <div
                    className="absolute w-4 h-4 rotate-45"
                    style={{
                      bottom: '-8px',
                      right: '32px',
                      background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(32,24,48,0.96) 100%)',
                      borderRight: '1px solid rgba(120,101,248,0.35)',
                      borderBottom: '1px solid rgba(120,101,248,0.35)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
