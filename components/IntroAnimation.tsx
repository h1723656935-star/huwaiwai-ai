"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// 「墨璃」Loading 界面 - 图片 + 电影级特效
const INTRO_IMAGE = '/moli/moli-intro.png';

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  y: number;
}

interface CharStar {
  id: number;
  left: number;
  top: number;
  delay: number;
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [charStars, setCharStars] = useState<CharStar[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 检测手机端 - 减少星星数量避免性能问题
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 768;
    const mobile = isCoarse || isSmallScreen;
    setIsMobile(mobile);

    // 客户端生成随机星星 - 避免 SSR/客户端水合不一致导致的闪烁
    const starCount = mobile ? 30 : 80;
    const colors = ['#A78BD9', '#E8DEED', '#D4AF7A', '#C9B3E0'];
    const newStars: Star[] = [...Array(starCount)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      color: colors[i % 4],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2.5,
      y: 10 + Math.random() * 20,
    }));
    setStars(newStars);

    // 角色周围星光
    const newCharStars: CharStar[] = [...Array(mobile ? 6 : 12)].map((_, i) => ({
      id: i,
      left: -5 + Math.random() * 110,
      top: Math.random() * 95,
      delay: 0.6 + i * 0.18,
    }));
    setCharStars(newCharStars);

    const timer = setTimeout(() => {
      onComplete();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #080610 0%, #0D0A18 25%, #1A1426 50%, #2A1F3D 75%, #0D0A18 100%)`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          filter: 'blur(8px)',
          scale: 1.03,
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* ====== 背景星空 ====== */}
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.color,
            }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0],
              y: [0, -star.y, 0],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* ====== 大型背景光晕 ====== */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '800px',
            height: '600px',
            top: '50%',
            left: '50%',
            background:
              'radial-gradient(ellipse, rgba(94,61,138,0.35) 0%, rgba(61,42,92,0.15) 30%, rgba(26,20,38,0.08) 60%, transparent 75%)',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0.3, 1.25, 1],
            opacity: [0, 0.8, 0.5],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 3, ease: 'easeOut' }}
        />

        {/* 第二层光晕 - 紫色 */}
        <motion.div
          className="absolute rounded-full blur-2xl"
          style={{
            width: '500px',
            height: '400px',
            top: '45%',
            left: '52%',
            background:
              'radial-gradient(ellipse, rgba(167,139,217,0.18) 0%, rgba(122,91,171,0.08) 40%, transparent 65%)',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.4, 1.1],
            opacity: [0, 0.7, 0.3],
          }}
          transition={{ duration: 2.8, delay: 0.3, ease: 'easeOut' }}
        />

        {/* ====== 旋转魔法阵 ====== */}
        <motion.div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: '700px',
            height: '700px',
          }}
          animate={{ rotate: 360, x: '-50%', y: '-50%' }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 700 700" className="w-full h-full" style={{ opacity: 0.22 }}>
            {/* 外圈 */}
            <circle cx="350" cy="350" r="330" fill="none" stroke="#A78BD9" strokeWidth="0.6" strokeDasharray="8 5" />
            <circle cx="350" cy="350" r="280" fill="none" stroke="#C9B3E0" strokeWidth="0.4" strokeDasharray="3 6" />
            <circle cx="350" cy="350" r="230" fill="none" stroke="#5E3D8A" strokeWidth="0.5" strokeDasharray="12 4" />
            <circle cx="350" cy="350" r="180" fill="none" stroke="#D4AF7A" strokeWidth="0.3" />

            {/* 八角星标记 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 350 350)`}>
                <line x1="350" y1="20" x2="350" y2="55" stroke="#A78BD9" strokeWidth="1.2" />
                <polygon points="350,20 347,32 353,32" fill="#D4AF7A" />
                <circle cx="350" cy="16" r="3" fill="#A78BD9" opacity="0.8" />
              </g>
            ))}

            {/* 四方花饰 */}
            {[30, 120, 210, 300].map((angle) => (
              <g key={angle} transform={`translate(${350 + 240 * Math.cos((angle * Math.PI) / 180)}, ${350 + 240 * Math.sin((angle * Math.PI) / 180)})`}>
                {[0, 72, 144, 216, 288].map((p, j) => (
                  <ellipse
                    key={j}
                    cx={Math.cos((p * Math.PI) / 180) * 8}
                    cy={Math.sin((p * Math.PI) / 180) * 8}
                    rx="5"
                    ry="9"
                    fill="#C9B3E0"
                    transform={`rotate(${p})`}
                    opacity="0.5"
                  />
                ))}
                <circle cx="0" cy="0" r="4" fill="#D4AF7A" opacity="0.7" />
              </g>
            ))}

            {/* 内部几何装饰 */}
            <polygon points="350,150 420,290 570,320 450,430 480,580 350,500 220,580 250,430 130,320 280,290" fill="none" stroke="#5E3D8A" strokeWidth="0.4" opacity="0.4" />
          </svg>
        </motion.div>

        {/* ====== 扩散圆环 ====== */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              width: '40px',
              height: '40px',
              border: `1.5px solid ${i % 2 === 0 ? '#D4AF7A' : '#A78BD9'}`,
            }}
            initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0.85 }}
            animate={{
              x: '-50%',
              y: '-50%',
              scale: [0, 28 + i * 6],
              opacity: [0.85, 0.25, 0],
            }}
            transition={{
              duration: 2.8,
              delay: i * 0.28,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* ====== 角色立绘 - 图片主体 ====== */}
        <motion.div
          className="relative z-20 flex items-center justify-center"
          style={{ width: '340px', height: '520px' }}
          initial={{ opacity: 0, y: 70, scale: 0.88 }}
          animate={{
            opacity: [0, 1, 1],
            y: [70, -8, 0],
            scale: [0.88, 1.04, 1],
          }}
          transition={{
            duration: 1.6,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* 角色光环 */}
          <motion.div
            className="absolute rounded-full blur-2xl"
            style={{
              width: '90%',
              height: '55%',
              bottom: '5%',
              left: '5%',
              background:
                'radial-gradient(ellipse, rgba(94,61,138,0.4) 0%, rgba(167,139,217,0.15) 35%, transparent 65%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1.05], opacity: [0, 0.7, 0.35] }}
            transition={{ duration: 2.2, delay: 0.5, ease: 'easeOut' }}
          />

          {/* 角色图片 */}
          <img
            src={INTRO_IMAGE}
            alt="墨璃 - MOLI"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: 'drop-shadow(0 20px 50px rgba(13,10,24,0.7)) drop-shadow(0 0 80px rgba(94,61,138,0.25))',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('[墨璃] Loading立绘加载失败，请确认 /public/moli/moli-intro.png 存在');
            }}
            draggable={false}
          />

          {/* 角色周围星光 */}
          {charStars.map((cs) => (
            <motion.div
              key={`char-star-${cs.id}`}
              className="absolute"
              style={{
                left: `${cs.left}%`,
                top: `${cs.top}%`,
              }}
              animate={{
                scale: [0, 1.4, 0],
                opacity: [0, 1, 0],
                rotate: [0, 135],
              }}
              transition={{
                duration: 2.2,
                delay: cs.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg viewBox="0 0 16 16" width={14} height={14}>
                <path d="M 8 0 L 9.5 6 L 16 8 L 9.5 10 L 8 16 L 6.5 10 L 0 8 L 6.5 6 Z" fill="#D4AF7A" />
                <path d="M 8 2 L 9 7 L 8 9 L 7 7 Z" fill="#FFFFFF" opacity="0.7" />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* ====== 标题文字区 ====== */}
        <motion.div
          className="absolute z-30 text-center"
          style={{ bottom: '22%' }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.6, ease: 'easeOut' }}
        >
          <h1
            className="text-5xl md:text-6xl font-bold tracking-wider mb-1.5"
            style={{
              background: 'linear-gradient(135deg, #E8DEED 0%, #C9B3E0 35%, #A78BD9 65%, #D4AF7A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(167,139,217,0.3)',
            }}
          >
            墨璃
          </h1>
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.6em' }}
            transition={{ delay: 1.85, duration: 0.8 }}
            className="text-sm tracking-[0.6em] font-extralight"
            style={{ color: '#C9B3E0' }}
          >
            MO LI
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2.1 }}
            className="text-xs mt-2 font-light tracking-widest"
            style={{ color: '#A78BD9' }}
          >
            数字花园的守护者 · Digital Guardian
          </motion.p>
        </motion.div>

        {/* ====== 分隔线 ====== */}
        <motion.div
          className="absolute z-30 h-[1px]"
          style={{
            bottom: '13%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            background: 'linear-gradient(90deg, transparent, #5E3D8A, #A78BD9, #D4AF7A, #A78BD9, #5E3D8A, transparent)',
            boxShadow: '0 0 8px rgba(167,139,217,0.4)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.8, ease: 'easeInOut' }}
        />

        {/* ====== 进度条 ====== */}
        <motion.div
          className="absolute z-30 rounded-full overflow-hidden"
          style={{
            bottom: '7%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '260px',
            height: 2,
            background: 'rgba(61,42,92,0.4)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #5E3D8A, #A78BD9, #D4AF7A, #C9B3E0)',
              boxShadow: '0 0 12px rgba(167,139,217,0.6)',
            }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, delay: 1.6, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ====== 底部状态文字 ====== */}
        <motion.p
          className="absolute z-30 text-center text-xs font-light tracking-[0.35em]"
          style={{
            bottom: '3.5%',
            left: 0,
            right: 0,
            color: '#7A5BAB',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 2.2 }}
        >
          INITIALIZING DIGITAL GARDEN SYSTEM...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
