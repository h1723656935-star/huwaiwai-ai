"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { moliColors } from '@/lib/moliCharacter';

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0D0A18 0%, #1A1426 30%, #2A1F3D 60%, #0D0A18 100%)`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.05,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* 背景星空粒子 */}
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              background: i % 3 === 0 ? moliColors.gem : moliColors.hairLight,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* 紫色光晕背景 */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${moliColors.dressPurple}60 0%, ${moliColors.dressAccent}20 30%, transparent 60%)`,
            top: '50%',
            left: '50%',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.4, 1],
            opacity: [0, 0.7, 0.4],
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />

        {/* 旋转魔法阵 */}
        <motion.div
          className="absolute"
          style={{ top: '50%', left: '50%', width: '600px', height: '600px' }}
          animate={{ rotate: 360, x: '-50%', y: '-50%' }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 600 600" className="w-full h-full" style={{ opacity: 0.3 }}>
            <circle cx="300" cy="300" r="280" fill="none" stroke={moliColors.ribbon} strokeWidth="0.8" strokeDasharray="6 4" />
            <circle cx="300" cy="300" r="220" fill="none" stroke={moliColors.gem} strokeWidth="0.6" strokeDasharray="3 6" />
            <circle cx="300" cy="300" r="160" fill="none" stroke={moliColors.eyePurpleLight} strokeWidth="0.4" />
            {/* 八角星 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 300 300)`}>
                <line x1="300" y1="30" x2="300" y2="60" stroke={moliColors.ribbon} strokeWidth="1.5" />
                <circle cx="300" cy="30" r="3" fill={moliColors.gem} />
              </g>
            ))}
            {/* 装饰花 */}
            {[30, 120, 210, 300].map((angle) => (
              <g key={angle} transform={`translate(${300 + 200 * Math.cos((angle * Math.PI) / 180)}, ${300 + 200 * Math.sin((angle * Math.PI) / 180)})`}>
                {[0, 72, 144, 216, 288].map((p, i) => (
                  <ellipse
                    key={i}
                    cx={Math.cos((p * Math.PI) / 180) * 6}
                    cy={Math.sin((p * Math.PI) / 180) * 6}
                    rx="4"
                    ry="7"
                    fill={moliColors.eyePurpleLight}
                    transform={`rotate(${p})`}
                    opacity="0.6"
                  />
                ))}
                <circle cx="0" cy="0" r="3" fill={moliColors.gem} />
              </g>
            ))}
          </svg>
        </motion.div>

        {/* 扩散圆环 */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              width: '40px',
              height: '40px',
              border: `2px solid ${i % 2 === 0 ? moliColors.gem : moliColors.ribbon}`,
            }}
            initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0.8 }}
            animate={{
              x: '-50%',
              y: '-50%',
              scale: [0, 25 + i * 5],
              opacity: [0.8, 0.2, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.25,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* 角色立绘 - 居中展示 */}
        <motion.div
          className="relative z-20"
          style={{ width: '280px', height: '400px' }}
          initial={{ opacity: 0, y: 60, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1],
            y: [60, -10, 0],
            scale: [0.5, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* 光环 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${moliColors.ribbon}50 0%, transparent 60%)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1.1], opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 2, delay: 0.4, ease: 'easeOut' }}
          />

          <svg viewBox="0 0 280 400" className="w-full h-full relative z-10"
            style={{
              filter: `drop-shadow(0 15px 30px ${moliColors.dressPurple}60)`,
            }}
          >
            <defs>
              <linearGradient id="introHair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={moliColors.hairLight} />
                <stop offset="50%" stopColor={moliColors.hairSilver} />
                <stop offset="100%" stopColor={moliColors.hairShadow} />
              </linearGradient>
              <linearGradient id="introSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={moliColors.skin} />
                <stop offset="100%" stopColor={moliColors.skinShadow} />
              </linearGradient>
              <radialGradient id="introEye" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={moliColors.eyePurpleLight} />
                <stop offset="100%" stopColor={moliColors.eyePurpleDeep} />
              </radialGradient>
              <linearGradient id="introDress" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={moliColors.dressBlack} />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="introLining" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={moliColors.dressPurple} />
                <stop offset="100%" stopColor={moliColors.dressAccent} />
              </linearGradient>
              <radialGradient id="introGem" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#E0CFFC" />
                <stop offset="50%" stopColor={moliColors.gem} />
                <stop offset="100%" stopColor={moliColors.eyePurpleDeep} />
              </radialGradient>
            </defs>

            {/* 投影 */}
            <ellipse cx="140" cy="380" rx="80" ry="10" fill={moliColors.dressPurple} opacity="0.3" />

            {/* 长发 - 后层 */}
            <path d="M 35 150 Q 15 240 30 350 L 70 350 Q 60 250 70 170 Z" fill="url(#introHair)" />
            <path d="M 245 150 Q 265 240 250 350 L 210 350 Q 220 250 210 170 Z" fill="url(#introHair)" />

            {/* 礼服主体 */}
            <path
              d="M 85 240 Q 90 235 105 232 L 140 230 L 175 232 Q 190 235 195 240 L 205 320 Q 215 380 200 400 L 80 400 Q 65 380 75 320 Z"
              fill="url(#introDress)"
            />

            {/* 礼服紫色镶边 */}
            <path
              d="M 85 240 Q 90 235 105 232 L 140 230 L 175 232 Q 190 235 195 240 L 200 260 L 80 260 Z"
              fill="url(#introLining)"
              opacity="0.9"
            />

            {/* V领装饰 */}
            <path
              d="M 120 232 L 140 270 L 160 232 L 155 228 L 140 258 L 125 228 Z"
              fill="url(#introLining)"
            />

            {/* 项链 */}
            <path d="M 120 228 Q 140 245 160 228" stroke={moliColors.silver} strokeWidth="1.5" fill="none" />
            <ellipse cx="140" cy="252" rx="4" ry="5" fill="url(#introGem)" />
            <circle cx="140" cy="252" r="1.5" fill="#FFFFFF" opacity="0.8" />

            {/* 腰带 */}
            <rect x="85" y="290" width="110" height="12" fill={moliColors.dressAccent} />
            <rect x="130" y="293" width="20" height="2" fill={moliColors.gold} />
            <circle cx="140" cy="296" r="2" fill="url(#introGem)" />

            {/* 头部 */}
            <ellipse cx="140" cy="150" rx="65" ry="75" fill="url(#introHair)" />

            {/* 脸 */}
            <path
              d="M 105 135 Q 100 175 115 215 Q 130 240 140 245 Q 150 240 165 215 Q 180 175 175 135 Q 170 105 140 100 Q 110 105 105 135 Z"
              fill="url(#introSkin)"
            />

            {/* 头顶头发 */}
            <path
              d="M 80 105 Q 75 50 140 42 Q 205 50 200 105 Q 205 130 195 145 Q 188 130 180 125 Q 175 140 165 130 Q 155 145 145 132 Q 140 145 135 132 Q 125 145 115 130 Q 105 140 100 125 Q 95 130 88 145 Q 78 130 80 105 Z"
              fill="url(#introHair)"
            />

            {/* 刘海 */}
            <path
              d="M 95 110 Q 105 135 120 150 L 125 130 L 132 148 L 140 130 L 148 148 L 155 130 L 160 150 Q 175 135 185 110 Q 165 100 140 100 Q 115 100 95 110 Z"
              fill="url(#introHair)"
            />

            {/* 侧发 */}
            <path d="M 80 110 Q 60 160 65 240 L 90 240 Q 80 170 90 120 Z" fill="url(#introHair)" />
            <path d="M 200 110 Q 220 160 215 240 L 190 240 Q 200 170 190 120 Z" fill="url(#introHair)" />

            {/* 紫色发饰 - 左 */}
            <g transform="translate(95, 95)">
              <ellipse cx="0" cy="0" rx="4" ry="6" fill={moliColors.ribbon} transform="rotate(-20)" />
              <ellipse cx="0" cy="0" rx="2.5" ry="4" fill="url(#introGem)" transform="rotate(-20)" />
            </g>
            {/* 紫色发饰 - 右 */}
            <g transform="translate(180, 100)">
              <ellipse cx="0" cy="0" rx="3" ry="5" fill={moliColors.ribbon} transform="rotate(20)" />
              <ellipse cx="0" cy="0" rx="2" ry="3" fill="url(#introGem)" transform="rotate(20)" />
            </g>

            {/* 眉毛 */}
            <path d="M 110 150 Q 120 144 130 150" stroke={moliColors.hairShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 150 150 Q 160 144 170 150" stroke={moliColors.hairShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* 左眼 */}
            <g>
              <ellipse cx={120} cy={172} rx="9" ry={isBlinking ? 1 : 7} fill="#FFFFFF" />
              {!isBlinking && (
                <>
                  <ellipse cx={120} cy={172} rx="7" ry="6" fill="url(#introEye)" />
                  <ellipse cx={120} cy={172} rx="3" ry="4" fill={moliColors.eyePurpleDeep} />
                  <ellipse cx={118} cy={169} rx="2" ry="2.5" fill="#FFFFFF" />
                </>
              )}
              <path d="M 110 165 Q 120 161 130 165" stroke={moliColors.hairDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>

            {/* 右眼 */}
            <g>
              <ellipse cx={160} cy={172} rx="9" ry={isBlinking ? 1 : 7} fill="#FFFFFF" />
              {!isBlinking && (
                <>
                  <ellipse cx={160} cy={172} rx="7" ry="6" fill="url(#introEye)" />
                  <ellipse cx={160} cy={172} rx="3" ry="4" fill={moliColors.eyePurpleDeep} />
                  <ellipse cx={158} cy={169} rx="2" ry="2.5" fill="#FFFFFF" />
                </>
              )}
              <path d="M 150 165 Q 160 161 170 165" stroke={moliColors.hairDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>

            {/* 鼻子 */}
            <path d="M 140 185 L 138 195 L 142 195 Z" fill={moliColors.skinShadow} opacity="0.4" />

            {/* 嘴 */}
            <path d="M 130 210 Q 140 213 150 210 Q 148 217 140 218 Q 132 217 130 210 Z" fill={moliColors.skinBlush} opacity="0.8" />
            <path d="M 130 210 Q 140 207 150 210" stroke={moliColors.dressPurple} strokeWidth="1" fill="none" strokeLinecap="round" />

            {/* 腮红 */}
            <ellipse cx="110" cy="190" rx="8" ry="4" fill={moliColors.eyePurpleLight} opacity="0.2" />
            <ellipse cx="170" cy="190" rx="8" ry="4" fill={moliColors.eyePurpleLight} opacity="0.2" />
          </svg>

          {/* 角色周围闪烁星光 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${-10 + Math.random() * 280}px`,
                top: `${Math.random() * 380}px`,
              }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2,
                delay: 0.5 + i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg viewBox="0 0 10 10" width="8" height="8">
                <path d="M 5 0 L 6 4 L 10 5 L 6 6 L 5 10 L 4 6 L 0 5 L 4 4 Z" fill={moliColors.gem} />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* 标题 */}
        <motion.div
          className="absolute bottom-44 left-0 right-0 text-center z-30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-wider">
            <span
              style={{
                background: `linear-gradient(135deg, ${moliColors.hairLight} 0%, ${moliColors.eyePurpleLight} 50%, ${moliColors.ribbon} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              墨璃
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-sm tracking-[0.5em] font-light"
            style={{ color: moliColors.eyePurpleLight }}
          >
            MO LI
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-xs mt-2"
            style={{ color: moliColors.ribbon, opacity: 0.7 }}
          >
            数字花园的守护者
          </motion.p>
        </motion.div>

        {/* 进度条 */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-56 h-[2px] rounded-full overflow-hidden"
          style={{ background: `${moliColors.dressPurple}50` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${moliColors.eyePurpleLight}, ${moliColors.ribbon}, ${moliColors.gem})`,
              boxShadow: `0 0 10px ${moliColors.ribbon}`,
            }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, delay: 1.4, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 底部文字 */}
        <motion.p
          className="absolute bottom-12 left-0 right-0 text-center text-xs tracking-[0.3em]"
          style={{ color: moliColors.eyePurpleLight, opacity: 0.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          ENTERING THE DIGITAL GARDEN
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
