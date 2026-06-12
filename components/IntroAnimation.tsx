"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

// 从角色设计稿提取的配色
const colors = {
  primary: '#6B4E8F',
  secondary: '#8B6FB0',
  accent: '#D4A857',
  light: '#E8DEED',
  hairLight: '#9B8BB5',
  hairDark: '#5A4672',
  dress: '#2A1F3D',
  pink: '#FFB6C1',
};

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 0.8,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #FDF5F3 0%, #F8F0F5 30%, #E8DEED 60%, #D8CCE0 100%)`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.1,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* 背景光斑 */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.light}80 0%, ${colors.secondary}30 30%, transparent 70%)`,
            top: '50%',
            left: '50%',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.3, 1],
            opacity: [0, 0.8, 0.4],
            rotate: [0, 180],
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />

        {/* 第二层光晕 */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.pink}40 0%, transparent 60%)`,
            top: '50%',
            left: '50%',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: [0, 1.8, 1.3],
            opacity: [0, 0.6, 0.3],
          }}
          transition={{ duration: 2.2, delay: 0.3, ease: 'easeOut' }}
        />

        {/* 旋转魔法阵 */}
        <motion.div
          className="absolute"
          style={{ top: '50%', left: '50%', width: '500px', height: '500px' }}
          animate={{ rotate: 360, x: '-50%', y: '-50%' }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.1, 1],
              opacity: [0, 0.5, 0.2],
            }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 500 500" className="w-full h-full">
              <circle cx="250" cy="250" r="220" fill="none" stroke={colors.accent} strokeWidth="1" strokeDasharray="8 4" opacity="0.6" />
              <circle cx="250" cy="250" r="180" fill="none" stroke={colors.secondary} strokeWidth="0.8" opacity="0.5" />
              <circle cx="250" cy="250" r="140" fill="none" stroke={colors.primary} strokeWidth="0.6" strokeDasharray="4 4" opacity="0.4" />
              <circle cx="250" cy="250" r="100" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.3" />

              {/* 八角星装饰 */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 250 250)`}>
                  <line x1="250" y1="40" x2="250" y2="60" stroke={colors.primary} strokeWidth="2" />
                  <circle cx="250" cy="40" r="4" fill={colors.accent} />
                </g>
              ))}

              {/* 四角花 */}
              {[45, 135, 225, 315].map((angle) => (
                <g key={`flower-${angle}`} transform={`translate(${250 + 180 * Math.cos((angle * Math.PI) / 180)}, ${250 + 180 * Math.sin((angle * Math.PI) / 180)})`}>
                  {[0, 72, 144, 216, 288].map((petalAngle, i) => (
                    <ellipse
                      key={i}
                      cx={Math.cos((petalAngle * Math.PI) / 180) * 6}
                      cy={Math.sin((petalAngle * Math.PI) / 180) * 6}
                      rx="4"
                      ry="7"
                      fill={colors.secondary}
                      transform={`rotate(${petalAngle})`}
                      opacity="0.7"
                    />
                  ))}
                  <circle cx="0" cy="0" r="3" fill={colors.accent} />
                </g>
              ))}
            </svg>
          </motion.div>
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
              border: `2px solid ${i % 2 === 0 ? colors.accent : colors.secondary}`,
            }}
            initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0.8 }}
            animate={{
              x: '-50%',
              y: '-50%',
              scale: [0, 20 + i * 5],
              opacity: [0.8, 0.2, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.25,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* 飘浮粒子 - 紫色和金色 */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.id % 3 === 0 ? colors.accent : p.id % 3 === 1 ? colors.secondary : colors.pink,
              boxShadow: `0 0 ${p.size * 2}px ${p.id % 3 === 0 ? colors.accent : colors.secondary}80`,
            }}
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 1, 0],
              y: [0, -80 - Math.random() * 100],
              x: [(Math.random() - 0.5) * 60],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2.5,
              delay: 0.2 + p.delay,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* ============ 二次元少女角色 - 入场动画 ============ */}
        <motion.div
          className="relative z-20"
          style={{ width: '180px', height: '250px' }}
          initial={{ opacity: 0, y: 80, scale: 0.5, rotate: -10 }}
          animate={{
            opacity: [0, 1, 1],
            y: [80, -10, 0],
            scale: [0.5, 1.08, 1],
            rotate: [-10, 3, 0],
          }}
          transition={{
            duration: 1.4,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* 角色光环 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.light}60 0%, transparent 60%)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1.1], opacity: [0, 0.7, 0.3] }}
            transition={{ duration: 1.8, delay: 0.4, ease: 'easeOut' }}
          />

          {/* SVG 角色形象 */}
          <svg viewBox="0 0 180 250" className="w-full h-full relative z-10"
            style={{
              filter: `drop-shadow(0 10px 25px ${colors.primary}40)`,
            }}
          >
            <defs>
              <linearGradient id="introHair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.hairLight} />
                <stop offset="50%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.hairDark} />
              </linearGradient>
              <linearGradient id="introSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDF5F3" />
                <stop offset="100%" stopColor="#F5E6E8" />
              </linearGradient>
              <linearGradient id="introDress" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.dress} />
                <stop offset="100%" stopColor="#1A1228" />
              </linearGradient>
              <linearGradient id="introRobe" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5F0F8" />
                <stop offset="50%" stopColor={colors.light} />
                <stop offset="100%" stopColor="#D8CCE0" />
              </linearGradient>
              <linearGradient id="introGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.accent} />
                <stop offset="100%" stopColor="#B8954A" />
              </linearGradient>
              <linearGradient id="introRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.primary} />
              </linearGradient>
            </defs>

            {/* 投影 */}
            <ellipse cx="90" cy="240" rx="35" ry="7" fill={`${colors.primary}30`} />

            {/* 长发 - 左右后层 */}
            <path d="M 25 80 Q 10 130 18 180 Q 15 220 30 245 L 50 240 Q 45 200 55 155 Q 62 115 55 85 Z" fill="url(#introHair)" />
            <path d="M 155 80 Q 170 130 162 180 Q 165 220 150 245 L 130 240 Q 135 200 125 155 Q 118 115 125 85 Z" fill="url(#introHair)" />

            {/* 外袍 */}
            <path d="M 32 145 Q 15 170 10 210 Q 8 235 15 245 L 55 245 Q 52 215 55 195 Q 60 165 55 150 Z" fill="url(#introRobe)" stroke={colors.primary} strokeWidth="0.5" />
            <path d="M 148 145 Q 165 170 170 210 Q 172 235 165 245 L 125 245 Q 128 215 125 195 Q 120 165 125 150 Z" fill="url(#introRobe)" stroke={colors.primary} strokeWidth="0.5" />

            {/* 外袍金边 */}
            <path d="M 32 145 Q 20 175 13 210" stroke="url(#introGold)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M 148 145 Q 160 175 167 210" stroke="url(#introGold)" strokeWidth="1.5" fill="none" opacity="0.7" />

            {/* 胸前花 */}
            <g transform="translate(125, 140)">
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse key={i} cx={Math.cos((angle * Math.PI) / 180) * 4} cy={Math.sin((angle * Math.PI) / 180) * 4} rx="3" ry="4" fill={colors.secondary} transform={`rotate(${angle})`} />
              ))}
              <circle cx="0" cy="0" r="2.5" fill={colors.accent} />
            </g>

            {/* 连衣裙主体 */}
            <path d="M 50 132 Q 55 127 90 127 Q 125 127 130 132 L 135 180 Q 138 215 122 232 L 58 232 Q 42 215 45 180 Z" fill="url(#introDress)" stroke={colors.primary} strokeWidth="0.5" />

            {/* 胸前金色装饰 */}
            <path d="M 68 132 L 68 148 L 90 155 L 112 148 L 112 132" fill="none" stroke="url(#introGold)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="90" cy="148" r="2" fill={colors.accent} />

            {/* 颈部丝带 */}
            <path d="M 60 115 Q 90 123 120 115 L 112 132 Q 90 138 68 132 Z" fill="url(#introDress)" stroke={colors.accent} strokeWidth="0.5" />
            <circle cx="90" cy="125" r="2" fill={colors.accent} />

            {/* 腰部丝带 */}
            <path d="M 48 175 Q 90 183 132 175 L 132 183 Q 90 188 48 183 Z" fill="url(#introRibbon)" />
            <path d="M 85 183 L 82 210 L 95 205 L 98 183" fill="url(#introRibbon)" />
            <circle cx="90" cy="180" r="2" fill={colors.accent} />

            {/* 手臂和手 */}
            <path d="M 45 142 Q 32 160 28 182 Q 26 195 35 198 L 42 195 Q 45 170 55 155 Z" fill="url(#introDress)" />
            <ellipse cx="32" cy="198" rx="5" ry="6" fill="url(#introSkin)" />
            <path d="M 135 142 Q 148 160 152 182 Q 154 195 145 198 L 138 195 Q 135 170 125 155 Z" fill="url(#introDress)" />
            <ellipse cx="148" cy="198" rx="5" ry="6" fill="url(#introSkin)" />

            {/* 脖子 */}
            <ellipse cx="90" cy="112" rx="9" ry="11" fill="url(#introSkin)" />

            {/* 头部 */}
            <ellipse cx="90" cy="72" rx="30" ry="33" fill="url(#introSkin)" />

            {/* 头顶头发 */}
            <path d="M 58 55 Q 55 25 90 22 Q 125 25 122 55 Q 125 65 118 72 Q 112 58 105 55 Q 100 65 95 58 Q 90 65 85 58 Q 80 65 75 55 Q 68 58 62 72 Q 55 65 58 55 Z" fill="url(#introHair)" />

            {/* 刘海 */}
            <path d="M 60 58 Q 65 78 72 83 Q 78 72 82 68 Q 88 82 92 68 Q 98 72 102 83 Q 108 78 115 58 Q 108 50 90 50 Q 72 50 60 58 Z" fill="url(#introHair)" />

            {/* 侧边发丝 */}
            <path d="M 58 62 Q 48 95 55 132 L 63 130 Q 60 98 68 68 Z" fill="url(#introHair)" />
            <path d="M 122 62 Q 132 95 125 132 L 117 130 Q 120 98 112 68 Z" fill="url(#introHair)" />

            {/* 花饰 */}
            <g transform="translate(55, 38)">
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse key={`intro-petal-${i}`} cx={Math.cos((angle * Math.PI) / 180) * 4} cy={Math.sin((angle * Math.PI) / 180) * 4} rx="3" ry="5" fill={colors.secondary} transform={`rotate(${angle})`} />
              ))}
              <circle cx="0" cy="0" r="3" fill={colors.accent} />
              {[36, 108, 180, 252, 324].map((angle, i) => (
                <ellipse key={`intro-petal2-${i}`} cx={Math.cos((angle * Math.PI) / 180) * 7} cy={Math.sin((angle * Math.PI) / 180) * 7} rx="2" ry="4" fill={colors.primary} transform={`rotate(${angle})`} opacity="0.8" />
              ))}
            </g>

            {/* 丝带发饰 */}
            <path d="M 48 42 Q 40 48 45 55 L 52 50 Q 56 45 53 40 Z" fill={colors.primary} />
            <path d="M 45 50 L 38 62 L 42 66 L 48 58 Z" fill={colors.primary} opacity="0.8" />

            {/* 眼睛 */}
            <ellipse cx="75" cy="75" rx="5.5" ry="6.5" fill="#fff" />
            <ellipse cx="75" cy="76" rx="4.5" ry="5.5" fill={colors.primary} />
            <ellipse cx="75" cy="76" rx="3" ry="4" fill={colors.hairDark} />
            <circle cx="76" cy="73" r="1.8" fill="#fff" />
            <circle cx="73" cy="78" r="0.8" fill="#fff" opacity="0.7" />

            <ellipse cx="105" cy="75" rx="5.5" ry="6.5" fill="#fff" />
            <ellipse cx="105" cy="76" rx="4.5" ry="5.5" fill={colors.primary} />
            <ellipse cx="105" cy="76" rx="3" ry="4" fill={colors.hairDark} />
            <circle cx="106" cy="73" r="1.8" fill="#fff" />
            <circle cx="103" cy="78" r="0.8" fill="#fff" opacity="0.7" />

            {/* 眉毛 */}
            <path d="M 68 62 Q 75 58 82 62" stroke={colors.hairDark} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M 98 62 Q 105 58 112 62" stroke={colors.hairDark} strokeWidth="1.3" fill="none" strokeLinecap="round" />

            {/* 腮红 */}
            <ellipse cx="65" cy="90" rx="6" ry="3.5" fill="#F5B8C8" opacity="0.55" />
            <ellipse cx="115" cy="90" rx="6" ry="3.5" fill="#F5B8C8" opacity="0.55" />

            {/* 鼻子 */}
            <path d="M 90 85 L 88 90 L 92 90 Z" fill={colors.accent} opacity="0.25" />

            {/* 嘴唇 */}
            <path d="M 82 98 Q 90 102 98 98 Q 96 104 90 104 Q 84 104 82 98 Z" fill="#D4787C" />
            <path d="M 82 98 Q 90 95 98 98" stroke="#B8555A" strokeWidth="0.5" fill="none" />

            {/* 金色图案 */}
            <path d="M 90 160 L 88 172 L 90 182 L 92 172 Z" fill="url(#introGold)" opacity="0.5" />
          </svg>

          {/* 角色周围闪烁星光 */}
          {[
            { x: -15, y: 20, size: 8, delay: 0.8 },
            { x: 160, y: 30, size: 6, delay: 1 },
            { x: -10, y: 180, size: 7, delay: 1.2 },
            { x: 155, y: 160, size: 5, delay: 1.4 },
            { x: 80, y: -10, size: 10, delay: 0.6 },
          ].map((s, i) => (
            <motion.div
              key={`intro-spark-${i}`}
              className="absolute"
              style={{
                left: `${s.x}px`,
                top: `${s.y}px`,
                width: `${s.size}px`,
                height: `${s.size}px`,
              }}
              animate={{
                scale: [0, 1.3, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2,
                delay: s.delay,
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

        {/* ============ 标题文本 ============ */}
        <motion.div
          className="absolute bottom-48 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 40%, ${colors.accent} 70%, ${colors.pink} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              胡歪歪
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-lg font-medium"
            style={{ color: colors.primary }}
          >
            AI Studio
          </motion.p>
        </motion.div>

        {/* ============ 分隔线 ============ */}
        <motion.div
          className="absolute bottom-40 left-1/2 h-[2px] bg-gradient-to-r w-36"
          style={{
            transform: 'translateX(-50%)',
            background: `linear-gradient(90deg, transparent, ${colors.secondary}, ${colors.accent}, ${colors.secondary}, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.4, ease: 'easeInOut' }}
        />

        {/* ============ 副标题 ============ */}
        <motion.p
          className="absolute bottom-28 left-0 right-0 text-center text-sm font-medium tracking-wider"
          style={{ color: colors.hairDark }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          AI 绘画 · 视频创作 · 二次元美学
        </motion.p>

        {/* ============ 进度条 ============ */}
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full overflow-hidden"
          style={{ background: `${colors.light}80` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent}, ${colors.pink})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, delay: 1.2, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ============ 底部文字 ============ */}
        <motion.p
          className="absolute bottom-10 left-0 right-0 text-center text-xs tracking-[0.3em]"
          style={{ color: colors.secondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          LOADING YOUR EXPERIENCE...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
