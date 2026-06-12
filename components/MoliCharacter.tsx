"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { moliQuotes, moliColors } from '@/lib/moliCharacter';

type Mode = 'normal' | 'hover' | 'clicked' | 'recommend';

export default function MoliCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<Mode>('normal');
  const [eyeLook, setEyeLook] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 鼠标跟随 - 视线跟随
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && !isMobile) {
        const rect = containerRef.current.getBoundingClientRect();
        const characterX = rect.left + rect.width / 2;
        const characterY = rect.top + rect.height / 3;

        const dx = e.clientX - characterX;
        const dy = e.clientY - characterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 限制视线移动范围
        const maxOffset = 5;
        const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (dx / distance) * 4));
        const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (dy / distance) * 3));

        setEyeLook({ x: offsetX, y: offsetY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // 眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // 随机语录
  useEffect(() => {
    const showRandomQuote = () => {
      if (mode !== 'normal') return;
      const allQuotes = [...moliQuotes.idle];
      const quote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setCurrentQuote(quote);
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 4000);
    };

    const interval = setInterval(showRandomQuote, 12000);
    const initialTimer = setTimeout(showRandomQuote, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [mode]);

  const handleClick = () => {
    if (isMobile) {
      setShowMenu(!showMenu);
      return;
    }
    setMode('clicked');
    setCurrentQuote(moliQuotes.greeting[Math.floor(Math.random() * moliQuotes.greeting.length)]);
    setShowQuote(true);
    setTimeout(() => {
      setShowQuote(false);
      setMode('normal');
    }, 4000);
  };

  // 移动端渲染Q版
  if (isMobile) {
    return <MoliQVersion onMenuToggle={() => setShowMenu(!showMenu)} showMenu={showMenu} />;
  }

  return (
    <>
      {/* 角色立绘 - 右下角常驻 */}
      <div
        ref={containerRef}
        className="fixed bottom-0 right-0 md:right-4 z-30 pointer-events-none"
        style={{ width: '420px', height: '600px' }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer pointer-events-auto"
          onClick={handleClick}
          onMouseEnter={() => setMode('hover')}
          onMouseLeave={() => setMode('normal')}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* 呼吸光晕 */}
          <motion.div
            className="absolute bottom-12 left-1/2 w-80 h-80 rounded-full -translate-x-1/2"
            style={{
              background: `radial-gradient(circle, ${moliColors.dressPurple}40 0%, transparent 60%)`,
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* 漂浮粒子 - 装饰 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 70}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg viewBox="0 0 10 10" width="6" height="6">
                <path d="M 5 0 L 6 4 L 10 5 L 6 6 L 5 10 L 4 6 L 0 5 L 4 4 Z" fill={moliColors.gem} />
              </svg>
            </motion.div>
          ))}

          {/* 角色主体 - SVG立绘 */}
          <MoliSVG eyeLook={eyeLook} isBlinking={isBlinking} mode={mode} />
        </motion.div>
      </div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {showQuote && currentQuote && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-72 right-12 z-40 max-w-xs"
          >
            <div
              className="relative px-5 py-4 rounded-2xl backdrop-blur-md"
              style={{
                background: `linear-gradient(135deg, rgba(26, 20, 38, 0.95) 0%, rgba(61, 42, 92, 0.95) 100%)`,
                border: `1px solid ${moliColors.ribbon}50`,
                boxShadow: `0 10px 40px ${moliColors.dressPurple}80`,
              }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{
                    background: moliColors.gem,
                    boxShadow: `0 0 8px ${moliColors.gem}`,
                  }}
                />
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: moliColors.hairLight }}
                >
                  {currentQuote}
                </p>
              </div>
              <div
                className="absolute -bottom-2 right-8 w-4 h-4 rotate-45"
                style={{
                  background: moliColors.dressPurple,
                  borderRight: `1px solid ${moliColors.ribbon}50`,
                  borderBottom: `1px solid ${moliColors.ribbon}50`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 快捷导航菜单 */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-72 right-12 z-40"
          >
            <div
              className="px-4 py-3 rounded-2xl backdrop-blur-md space-y-1"
              style={{
                background: `linear-gradient(135deg, rgba(26, 20, 38, 0.95) 0%, rgba(61, 42, 92, 0.95) 100%)`,
                border: `1px solid ${moliColors.ribbon}50`,
                boxShadow: `0 10px 40px ${moliColors.dressPurple}80`,
                minWidth: '180px',
              }}
            >
              <p
                className="text-xs font-medium mb-2 px-3 py-1"
                style={{ color: moliColors.eyePurpleLight }}
              >
                ✦ 墨璃的快捷导航
              </p>
              {[
                { href: '#home', icon: '◇', label: moliQuotes.navigation.home },
                { href: '#artworks', icon: '◆', label: moliQuotes.navigation.artworks },
                { href: '#videos', icon: '◇', label: moliQuotes.navigation.videos },
                { href: '/admin', icon: '◆', label: moliQuotes.navigation.admin },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    color: moliColors.hairLight,
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${moliColors.ribbon}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => setShowMenu(false)}
                >
                  <span style={{ color: moliColors.gem }}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬浮按钮 - 触发菜单 */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full flex items-center justify-center md:hidden"
        style={{
          background: `linear-gradient(135deg, ${moliColors.dressPurple} 0%, ${moliColors.dressAccent} 100%)`,
          boxShadow: `0 4px 20px ${moliColors.dressPurple}80`,
          border: `1px solid ${moliColors.ribbon}50`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            `0 4px 20px ${moliColors.dressPurple}80`,
            `0 4px 30px ${moliColors.dressPurple}`,
            `0 4px 20px ${moliColors.dressPurple}80`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span style={{ color: moliColors.hairLight, fontSize: '20px' }}>✦</span>
      </motion.button>
    </>
  );
}

// 「墨璃」主立绘 SVG
function MoliSVG({ eyeLook, isBlinking, mode }: { eyeLook: { x: number; y: number }; isBlinking: boolean; mode: Mode }) {
  return (
    <svg
      viewBox="0 0 420 600"
      className="w-full h-full relative z-10"
      style={{
        filter: `drop-shadow(0 20px 40px ${moliColors.dressPurple}80)`,
      }}
    >
      <defs>
        {/* 银白渐变 - 长发 */}
        <linearGradient id="moliHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={moliColors.hairLight} />
          <stop offset="30%" stopColor={moliColors.hairSilver} />
          <stop offset="60%" stopColor={moliColors.hairMid} />
          <stop offset="100%" stopColor={moliColors.hairShadow} />
        </linearGradient>

        {/* 头发高光 */}
        <linearGradient id="moliHairShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* 肤色 */}
        <linearGradient id="moliSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={moliColors.skin} />
          <stop offset="100%" stopColor={moliColors.skinShadow} />
        </linearGradient>

        {/* 紫色瞳孔 */}
        <radialGradient id="moliEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={moliColors.eyePurpleLight} />
          <stop offset="50%" stopColor={moliColors.eyePurple} />
          <stop offset="100%" stopColor={moliColors.eyePurpleDeep} />
        </radialGradient>

        {/* 黑色礼服 */}
        <linearGradient id="moliDress" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={moliColors.dressBlack} />
          <stop offset="50%" stopColor={moliColors.dressDark} />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* 紫色内衬 */}
        <linearGradient id="moliLining" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={moliColors.dressPurple} />
          <stop offset="100%" stopColor={moliColors.dressAccent} />
        </linearGradient>

        {/* 金属装饰 */}
        <linearGradient id="moliSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor={moliColors.silver} />
          <stop offset="100%" stopColor={moliColors.silverDark} />
        </linearGradient>

        {/* 金色装饰 */}
        <linearGradient id="moliGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={moliColors.goldLight} />
          <stop offset="100%" stopColor={moliColors.gold} />
        </linearGradient>

        {/* 紫水晶宝石 */}
        <radialGradient id="moliGem" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E0CFFC" />
          <stop offset="50%" stopColor={moliColors.gem} />
          <stop offset="100%" stopColor={moliColors.eyePurpleDeep} />
        </radialGradient>

        {/* 柔光 */}
        <radialGradient id="moliGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={moliColors.ribbon} stopOpacity="0.3" />
          <stop offset="100%" stopColor={moliColors.ribbon} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 背景光晕 */}
      <ellipse cx="210" cy="320" rx="180" ry="280" fill="url(#moliGlow)" />

      {/* ==== 长发 - 后层飘散 ==== */}
      <motion.path
        d="M 60 180 Q 30 280 45 380 Q 25 480 60 580 L 100 580 Q 75 480 100 380 Q 110 280 105 200 Z"
        fill="url(#moliHair)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.path
        d="M 360 180 Q 390 280 375 380 Q 395 480 360 580 L 320 580 Q 345 480 320 380 Q 310 280 315 200 Z"
        fill="url(#moliHair)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* 头发飘带 - 装饰飘带 */}
      <path
        d="M 80 250 Q 50 350 65 450 Q 70 500 90 540"
        stroke={moliColors.ribbon}
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M 340 250 Q 370 350 355 450 Q 350 500 330 540"
        stroke={moliColors.ribbon}
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* 头发高光层 */}
      <path
        d="M 90 220 Q 75 320 85 420 L 95 420 Q 105 320 110 220 Z"
        fill="url(#moliHairShine)"
        opacity="0.5"
      />
      <path
        d="M 330 220 Q 345 320 335 420 L 325 420 Q 315 320 310 220 Z"
        fill="url(#moliHairShine)"
        opacity="0.5"
      />

      {/* ==== 身体 - 礼服 ==== */}
      {/* 礼服主体 */}
      <path
        d="M 140 380 Q 145 370 160 365 L 210 360 L 260 365 Q 275 370 280 380 L 295 480 Q 305 560 280 600 L 140 600 Q 115 560 125 480 Z"
        fill="url(#moliDress)"
      />

      {/* 礼服装饰线条 - 高光 */}
      <path
        d="M 160 380 Q 158 450 165 540"
        stroke={moliColors.silver}
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 260 380 Q 262 450 255 540"
        stroke={moliColors.silver}
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />

      {/* 礼服紫色镶边 */}
      <path
        d="M 140 380 Q 145 370 160 365 L 210 360 L 260 365 Q 275 370 280 380 L 285 400 L 135 400 Z"
        fill="url(#moliLining)"
        opacity="0.9"
      />

      {/* 胸前装饰 - V字领口 */}
      <path
        d="M 175 365 L 210 410 L 245 365 L 240 360 L 210 395 L 180 360 Z"
        fill="url(#moliLining)"
        stroke={moliColors.silver}
        strokeWidth="0.5"
      />

      {/* 项链 */}
      <path
        d="M 175 360 Q 210 380 245 360"
        stroke="url(#moliSilver)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* 项链吊坠 - 紫水晶 */}
      <ellipse cx="210" cy="385" rx="6" ry="8" fill="url(#moliGem)" />
      <circle cx="210" cy="385" r="2" fill="#FFFFFF" opacity="0.8" />
      <path
        d="M 205 380 L 207 383 L 205 386 L 203 383 Z"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* 腰部腰带 */}
      <path
        d="M 145 460 Q 210 470 275 460 L 273 478 Q 210 488 147 478 Z"
        fill={moliColors.dressAccent}
      />
      {/* 腰带金色装饰 */}
      <rect x="200" y="463" width="20" height="3" fill="url(#moliGold)" />
      <circle cx="210" cy="471" r="3" fill="url(#moliGem)" stroke={moliColors.gold} strokeWidth="0.5" />

      {/* 礼服下摆装饰 - 不对称高开叉 */}
      <path
        d="M 140 510 Q 160 530 200 540 L 220 540 Q 260 530 280 510"
        stroke="url(#moliLining)"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />

      {/* 手臂 */}
      <path
        d="M 138 380 Q 115 420 105 470 Q 100 510 115 530 L 130 525 Q 130 480 140 440 Z"
        fill="url(#moliDress)"
      />
      {/* 手套/袖口 */}
      <ellipse cx="112" cy="525" rx="10" ry="14" fill={moliColors.skin} />
      <path
        d="M 105 515 Q 112 510 119 515 L 118 525 L 106 525 Z"
        fill={moliColors.dressAccent}
      />

      <path
        d="M 282 380 Q 305 420 315 470 Q 320 510 305 530 L 290 525 Q 290 480 280 440 Z"
        fill="url(#moliDress)"
      />
      <ellipse cx="308" cy="525" rx="10" ry="14" fill={moliColors.skin} />
      <path
        d="M 301 515 Q 308 510 315 515 L 314 525 L 302 525 Z"
        fill={moliColors.dressAccent}
      />

      {/* ==== 头部 ==== */}
      {/* 脖子 */}
      <path
        d="M 192 340 L 195 365 L 225 365 L 228 340 Z"
        fill="url(#moliSkin)"
      />
      {/* 脖子阴影 */}
      <path
        d="M 195 355 L 225 355 L 224 365 L 196 365 Z"
        fill={moliColors.skinShadow}
        opacity="0.4"
      />

      {/* 头 - 后层头发包围 */}
      <ellipse cx="210" cy="220" rx="85" ry="100" fill="url(#moliHair)" />

      {/* 脸部轮廓 */}
      <path
        d="M 165 200 Q 160 250 175 295 Q 195 330 210 335 Q 225 330 245 295 Q 260 250 255 200 Q 250 165 210 160 Q 170 165 165 200 Z"
        fill="url(#moliSkin)"
      />

      {/* 脸部下颌阴影 */}
      <path
        d="M 175 290 Q 195 320 210 325 Q 225 320 245 290 Q 240 305 220 318 L 200 318 Q 180 305 175 290 Z"
        fill={moliColors.skinShadow}
        opacity="0.3"
      />

      {/* 头顶头发 */}
      <path
        d="M 130 160 Q 125 80 210 70 Q 295 80 290 160 Q 295 200 285 220 Q 280 200 270 195 Q 260 210 245 200 Q 235 215 220 205 Q 210 220 200 205 Q 185 215 175 200 Q 160 210 150 195 Q 140 200 135 220 Q 125 200 130 160 Z"
        fill="url(#moliHair)"
      />

      {/* 刘海 - 中分 */}
      <path
        d="M 150 170 Q 160 200 175 220 L 180 195 L 190 215 L 200 195 L 210 220 L 220 195 L 230 215 L 240 195 L 245 220 Q 260 200 270 170 Q 250 155 210 153 Q 170 155 150 170 Z"
        fill="url(#moliHair)"
      />

      {/* 刘海高光 */}
      <path
        d="M 175 175 Q 200 195 225 195 Q 240 185 250 175 Q 230 200 210 200 Q 190 200 175 175 Z"
        fill={moliColors.hairLight}
        opacity="0.4"
      />

      {/* 侧边发丝 - 左 */}
      <path
        d="M 130 170 Q 100 230 110 320 L 130 320 Q 130 240 145 180 Z"
        fill="url(#moliHair)"
      />
      <path
        d="M 135 170 Q 110 200 115 250 L 130 250 Q 130 215 145 185 Z"
        fill={moliColors.hairLight}
        opacity="0.3"
      />

      {/* 侧边发丝 - 右 */}
      <path
        d="M 290 170 Q 320 230 310 320 L 290 320 Q 290 240 275 180 Z"
        fill="url(#moliHair)"
      />
      <path
        d="M 285 170 Q 310 200 305 250 L 290 250 Q 290 215 275 185 Z"
        fill={moliColors.hairLight}
        opacity="0.3"
      />

      {/* 紫色发饰 - 左侧宝石 */}
      <g transform="translate(150, 165)">
        <ellipse cx="0" cy="0" rx="5" ry="8" fill={moliColors.ribbon} transform="rotate(-20)" />
        <ellipse cx="0" cy="0" rx="3" ry="5" fill="url(#moliGem)" transform="rotate(-20)" />
        <circle cx="-1" cy="-2" r="1" fill="#FFFFFF" opacity="0.8" transform="rotate(-20)" />
      </g>
      {/* 流苏装饰 */}
      <path
        d="M 145 170 Q 135 200 130 230"
        stroke={moliColors.gold}
        strokeWidth="0.8"
        fill="none"
      />
      <circle cx="130" cy="232" r="2" fill="url(#moliGem)" />

      {/* 紫色发饰 - 右侧 */}
      <g transform="translate(265, 175)">
        <ellipse cx="0" cy="0" rx="4" ry="6" fill={moliColors.ribbon} transform="rotate(20)" />
        <ellipse cx="0" cy="0" rx="2" ry="4" fill="url(#moliGem)" transform="rotate(20)" />
      </g>

      {/* ==== 五官 ==== */}
      {/* 眉毛 - 高挑的御姐眉 */}
      <path
        d="M 168 220 Q 180 213 192 220"
        stroke={moliColors.hairShadow}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 228 220 Q 240 213 252 220"
        stroke={moliColors.hairShadow}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 左眼 - 紫色瞳孔 */}
      <g>
        {/* 眼白 */}
        <ellipse
          cx={180 + eyeLook.x}
          cy={245 + eyeLook.y}
          rx="14"
          ry={isBlinking ? 1 : 10}
          fill="#FFFFFF"
        />
        {!isBlinking && (
          <>
            {/* 虹膜 */}
            <ellipse
              cx={180 + eyeLook.x}
              cy={245 + eyeLook.y}
              rx="11"
              ry="9"
              fill="url(#moliEye)"
            />
            {/* 瞳孔 */}
            <ellipse
              cx={180 + eyeLook.x}
              cy={245 + eyeLook.y}
              rx="5"
              ry="7"
              fill={moliColors.eyePurpleDeep}
            />
            {/* 高光 */}
            <ellipse
              cx={177 + eyeLook.x}
              cy={240 + eyeLook.y}
              rx="3"
              ry="4"
              fill="#FFFFFF"
            />
            <circle
              cx={183 + eyeLook.x}
              cy={250 + eyeLook.y}
              r="1.5"
              fill="#FFFFFF"
              opacity="0.6"
            />
          </>
        )}
        {/* 眼线 - 上 */}
        <path
          d={`M ${167 + eyeLook.x} ${238 + eyeLook.y} Q ${180 + eyeLook.x} ${233 + eyeLook.y} ${193 + eyeLook.x} ${238 + eyeLook.y}`}
          stroke={moliColors.hairDark}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* 眼线 - 下 */}
        <path
          d={`M ${168 + eyeLook.x} ${252 + eyeLook.y} Q ${180 + eyeLook.x} ${256 + eyeLook.y} ${192 + eyeLook.x} ${252 + eyeLook.y}`}
          stroke={moliColors.hairShadow}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* 睫毛 - 上 */}
        <path
          d={`M ${170 + eyeLook.x} ${235 + eyeLook.y} l -2 -4`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${180 + eyeLook.x} ${232 + eyeLook.y} l 0 -5`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${190 + eyeLook.x} ${235 + eyeLook.y} l 2 -4`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* 右眼 - 紫色瞳孔 */}
      <g>
        <ellipse
          cx={240 + eyeLook.x}
          cy={245 + eyeLook.y}
          rx="14"
          ry={isBlinking ? 1 : 10}
          fill="#FFFFFF"
        />
        {!isBlinking && (
          <>
            <ellipse
              cx={240 + eyeLook.x}
              cy={245 + eyeLook.y}
              rx="11"
              ry="9"
              fill="url(#moliEye)"
            />
            <ellipse
              cx={240 + eyeLook.x}
              cy={245 + eyeLook.y}
              rx="5"
              ry="7"
              fill={moliColors.eyePurpleDeep}
            />
            <ellipse
              cx={237 + eyeLook.x}
              cy={240 + eyeLook.y}
              rx="3"
              ry="4"
              fill="#FFFFFF"
            />
            <circle
              cx={243 + eyeLook.x}
              cy={250 + eyeLook.y}
              r="1.5"
              fill="#FFFFFF"
              opacity="0.6"
            />
          </>
        )}
        <path
          d={`M ${227 + eyeLook.x} ${238 + eyeLook.y} Q ${240 + eyeLook.x} ${233 + eyeLook.y} ${253 + eyeLook.x} ${238 + eyeLook.y}`}
          stroke={moliColors.hairDark}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${228 + eyeLook.x} ${252 + eyeLook.y} Q ${240 + eyeLook.x} ${256 + eyeLook.y} ${252 + eyeLook.x} ${252 + eyeLook.y}`}
          stroke={moliColors.hairShadow}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${230 + eyeLook.x} ${235 + eyeLook.y} l -2 -4`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${240 + eyeLook.x} ${232 + eyeLook.y} l 0 -5`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${250 + eyeLook.x} ${235 + eyeLook.y} l 2 -4`}
          stroke={moliColors.hairDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* 鼻子 - 精致小鼻 */}
      <path
        d="M 210 260 L 207 275 L 213 275 Z"
        fill={moliColors.skinShadow}
        opacity="0.4"
      />
      <ellipse cx="210" cy="278" rx="1.5" ry="1" fill={moliColors.skinShadow} opacity="0.5" />

      {/* 嘴唇 - 御姐薄唇 */}
      <path
        d="M 197 295 Q 210 298 223 295 Q 220 305 210 306 Q 200 305 197 295 Z"
        fill={moliColors.skinBlush}
        opacity="0.7"
      />
      <path
        d="M 198 295 Q 210 290 222 295"
        stroke={moliColors.dressPurple}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 200 298 Q 210 302 220 298"
        stroke={moliColors.dressAccent}
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />

      {/* 腮红 - 淡淡紫粉 */}
      <ellipse cx="170" cy="270" rx="12" ry="6" fill={moliColors.eyePurpleLight} opacity="0.2" />
      <ellipse cx="250" cy="270" rx="12" ry="6" fill={moliColors.eyePurpleLight} opacity="0.2" />

      {/* 耳朵 (左) */}
      <path
        d="M 158 235 Q 150 245 152 265 Q 155 270 160 265 L 160 240 Z"
        fill="url(#moliSkin)"
      />
      <path
        d="M 155 245 Q 153 255 156 263"
        stroke={moliColors.skinShadow}
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />

      {/* 耳朵 (右) */}
      <path
        d="M 262 235 Q 270 245 268 265 Q 265 270 260 265 L 260 240 Z"
        fill="url(#moliSkin)"
      />

      {/* 耳环 - 紫水晶 */}
      <circle cx="155" cy="268" r="2.5" fill="url(#moliGem)" />
      <circle cx="265" cy="268" r="2.5" fill="url(#moliGem)" />

      {/* ==== 装饰光环 - 角色背后 ==== */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '210px 320px' }}
        opacity="0.5"
      >
        <circle cx="210" cy="320" r="160" fill="none" stroke={moliColors.ribbon} strokeWidth="0.5" strokeDasharray="4 6" />
        <circle cx="210" cy="320" r="180" fill="none" stroke={moliColors.gem} strokeWidth="0.3" strokeDasharray="2 4" />
      </motion.g>
    </svg>
  );
}

// Q版形象 - 移动端
function MoliQVersion({ onMenuToggle, showMenu }: { onMenuToggle: () => void; showMenu: boolean }) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-30 w-20 h-20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full cursor-pointer"
        onClick={onMenuToggle}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="moliQHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={moliColors.hairLight} />
              <stop offset="100%" stopColor={moliColors.hairShadow} />
            </linearGradient>
            <radialGradient id="moliQEye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={moliColors.eyePurpleLight} />
              <stop offset="100%" stopColor={moliColors.eyePurpleDeep} />
            </radialGradient>
          </defs>

          {/* 光环 */}
          <circle cx="50" cy="50" r="48" fill="url(#moliQEye)" opacity="0.05" />

          {/* 头发后层 */}
          <ellipse cx="50" cy="45" rx="38" ry="38" fill="url(#moliQHair)" />

          {/* 脸 */}
          <ellipse cx="50" cy="55" rx="28" ry="30" fill={moliColors.skin} />

          {/* 刘海 */}
          <path
            d="M 22 35 Q 30 20 50 18 Q 70 20 78 35 Q 70 38 60 36 L 50 42 L 40 36 Q 30 38 22 35 Z"
            fill="url(#moliQHair)"
          />

          {/* 侧发 */}
          <path
            d="M 22 38 Q 18 60 22 80 L 32 80 Q 28 60 30 42 Z"
            fill="url(#moliQHair)"
          />
          <path
            d="M 78 38 Q 82 60 78 80 L 68 80 Q 72 60 70 42 Z"
            fill="url(#moliQHair)"
          />

          {/* 眼睛 */}
          <ellipse cx="40" cy="55" rx="4" ry={isBlinking ? 0.5 : 5} fill="#FFFFFF" />
          {!isBlinking && (
            <>
              <ellipse cx="40" cy="55" rx="3" ry="4" fill="url(#moliQEye)" />
              <circle cx="41" cy="53" r="1" fill="#FFFFFF" />
            </>
          )}

          <ellipse cx="60" cy="55" rx="4" ry={isBlinking ? 0.5 : 5} fill="#FFFFFF" />
          {!isBlinking && (
            <>
              <ellipse cx="60" cy="55" rx="3" ry="4" fill="url(#moliQEye)" />
              <circle cx="61" cy="53" r="1" fill="#FFFFFF" />
            </>
          )}

          {/* 腮红 */}
          <ellipse cx="32" cy="65" rx="4" ry="2" fill={moliColors.skinBlush} opacity="0.5" />
          <ellipse cx="68" cy="65" rx="4" ry="2" fill={moliColors.skinBlush} opacity="0.5" />

          {/* 嘴 */}
          <path
            d="M 46 70 Q 50 72 54 70"
            stroke={moliColors.dressPurple}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />

          {/* 身体 - 黑色礼服 */}
          <path
            d="M 35 78 Q 40 75 50 75 Q 60 75 65 78 L 68 100 L 32 100 Z"
            fill={moliColors.dressBlack}
          />

          {/* 紫色镶边 */}
          <path
            d="M 38 80 L 62 80 L 64 84 L 36 84 Z"
            fill={moliColors.dressPurple}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
