"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHARACTER_IMAGE = '/moli/moli-standby.png';

export default function MoliCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isAssistantMode, setIsAssistantMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
        setIsAssistantMode(rect.top < window.innerHeight * 0.7);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAssistantMode && !isMobile) {
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 5000);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isAssistantMode, isMobile]);

  const handleAvatarClick = () => {
    setShowDialog(!showDialog);
  };

  if (isMobile) {
    return null;
  }

  const charWidth = 380;
  const charHeight = 480;
  const avatarSize = 90;

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAssistantMode ? (
          <motion.div
            key="full-character"
            ref={containerRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-30 pointer-events-none"
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
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40"
            style={{
              right: 32,
              bottom: 32,
            }}
          >
            <motion.button
              onClick={handleAvatarClick}
              className="relative w-[90px] h-[90px] rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(120,101,248,0.2) 0%, rgba(169,145,255,0.15) 100%)',
                boxShadow: '0 8px 32px rgba(120,101,248,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid rgba(120,101,248,0.3)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(120,101,248,0.3)',
                  '0 12px 40px rgba(120,101,248,0.4)',
                  '0 8px 32px rgba(120,101,248,0.3)',
                ],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={CHARACTER_IMAGE}
                alt="墨璃"
                className="w-full h-full object-cover object-position top-center"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            <AnimatePresence>
              {showDialog && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-[100px] right-0 w-64"
                  style={{
                    background: 'linear-gradient(135deg, rgba(13,10,24,0.98) 0%, rgba(32,24,48,0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(120,101,248,0.35)',
                    boxShadow: '0 20px 60px rgba(13,10,24,0.6), 0 0 40px rgba(120,101,248,0.15)',
                    padding: '20px',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: '1px solid rgba(120,101,248,0.3)' }}
                    >
                      <img
                        src={CHARACTER_IMAGE}
                        alt="墨璃"
                        className="w-full h-full object-cover object-position top-center"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#C7B8FF' }}>墨璃</p>
                      <p className="text-xs" style={{ color: '#A991FF' }}>AI 助手</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#ECE7FF' }}>
                    欢迎回来。
                  </p>

                  <div className="space-y-2">
                    <motion.a
                      href="#artworks"
                      onClick={() => setShowDialog(false)}
                      className="block w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(120,101,248,0.15) 0%, rgba(169,145,255,0.1) 100%)',
                        color: '#C7B8FF',
                        border: '1px solid rgba(120,101,248,0.2)',
                      }}
                      whileHover={{
                        background: 'linear-gradient(135deg, rgba(120,101,248,0.25) 0%, rgba(169,145,255,0.2) 100%)',
                        x: 4,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ◆ 查看作品
                    </motion.a>
                    <motion.a
                      href="#videos"
                      onClick={() => setShowDialog(false)}
                      className="block w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all"
                      style={{
                        background: 'rgba(120,101,248,0.05)',
                        color: '#ECE7FF',
                        border: '1px solid rgba(120,101,248,0.1)',
                      }}
                      whileHover={{
                        background: 'rgba(120,101,248,0.1)',
                        x: 4,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ◇ 视频画廊
                    </motion.a>
                  </div>

                  <div
                    className="absolute -bottom-3 right-6 w-6 h-6 rotate-45"
                    style={{
                      background: 'linear-gradient(135deg, rgba(13,10,24,0.98) 0%, rgba(32,24,48,0.98) 100%)',
                      borderBottom: '1px solid rgba(120,101,248,0.35)',
                      borderRight: '1px solid rgba(120,101,248,0.35)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDialog && !isAssistantMode && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="fixed z-40"
            style={{
              right: charWidth - 40,
              bottom: charHeight - 60,
              maxWidth: 240,
            }}
          >
            <div
              className="px-5 py-4 rounded-2xl relative"
              style={{
                background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(32,24,48,0.96) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(120,101,248,0.35)',
                boxShadow: '0 15px 45px rgba(13,10,24,0.5), 0 0 50px rgba(120,101,248,0.2)',
              }}
            >
              <div
                className="absolute top-0 left-6 right-6 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(120,101,248,0.6), rgba(212,175,122,0.6), rgba(120,101,248,0.6), transparent)',
                }}
              />
              <p className="text-sm leading-relaxed mt-2" style={{ color: '#ECE7FF' }}>
                欢迎回来。
              </p>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href="#artworks"
                  onClick={() => setShowDialog(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(120,101,248,0.2)',
                    color: '#C7B8FF',
                    border: '1px solid rgba(120,101,248,0.3)',
                  }}
                >
                  查看作品
                </a>
              </div>
              <div
                className="absolute -bottom-2 right-8 w-4 h-4 rotate-45"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,10,24,0.96) 0%, rgba(32,24,48,0.96) 100%)',
                  borderBottom: '1px solid rgba(120,101,248,0.35)',
                  borderRight: '1px solid rgba(120,101,248,0.35)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
