"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const INTRO_IMAGE = '/moli/moli-intro.png';

// ─── 缓动曲线 ───────────────────────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];

// ─── SVG 魔法阵路径（预计算，避免 hydration mismatch） ──
// 外圈六芒星线条坐标
const HEX_LINES = [
  { x1: 375, y1: 50, x2: 700, y2: 375 },
  { x1: 700, y1: 375, x2: 375, y2: 700 },
  { x1: 375, y1: 700, x2: 50, y2: 375 },
  { x1: 50, y1: 375, x2: 375, y2: 50 },
  { x1: 375, y1: 50, x2: 50, y2: 375 },
  { x1: 50, y1: 375, x2: 700, y2: 375 },
  { x1: 700, y1: 375, x2: 375, y2: 700 },
  { x1: 375, y1: 700, x2: 375, y2: 50 },
];

// 内圈装饰
const INNER_MARKS = [
  { x: 375, y: 130 },
  { x: 570, y: 252 },
  { x: 570, y: 498 },
  { x: 375, y: 620 },
  { x: 180, y: 498 },
  { x: 180, y: 252 },
];

// ─── 百分比计数器组件 ────────────────────────────────────
function PercentageCounter({ delay, duration }: { delay: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('000');

  useEffect(() => {
    const start = performance.now() + delay * 1000;
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * 100);
      setDisplay(String(value).padStart(3, '0'));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, duration]);

  return (
    <span
      ref={ref}
      className="font-mono tabular-nums"
      style={{
        fontSize: 'clamp(48px, 8vw, 96px)',
        fontWeight: 200,
        letterSpacing: '0.08em',
        color: 'rgba(167, 139, 217, 0.7)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {display}
      <span style={{ fontSize: '0.4em', verticalAlign: 'super', marginLeft: '2px', opacity: 0.5 }}>%</span>
    </span>
  );
}

// ─── 主组件 ──────────────────────────────────────────────
export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isMobile, setIsMobile] = useState(false);
  const [phase, setPhase] = useState(0); // 0=idle, 1=draw, 2=reveal, 3=hold, 4=exit

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // 精心编排的时序
    const t1 = setTimeout(() => setPhase(1), 200);   // 开始描绘魔法阵
    const t2 = setTimeout(() => setPhase(2), 1800);  // 角色浮现 + 光脉冲
    const t3 = setTimeout(() => setPhase(3), 3200);  // 文字显现 + 计数器
    const t4 = setTimeout(() => setPhase(4), 4200);  // 退出过渡
    const t5 = setTimeout(() => onComplete(), 5200);  // 完成

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{ background: '#05030A' }}
        initial={{ clipPath: 'circle(150% at 50% 50%)' }}
        exit={{
          clipPath: 'circle(0% at 50% 50%)',
          transition: { duration: 1.0, ease: EASE_IN_OUT },
        }}
      >
        {/* ─── Phase 1: 魔法阵描绘 ─── */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 750 750"
            className="absolute"
            style={{
              width: isMobile ? '85vw' : '600px',
              height: isMobile ? '85vw' : '600px',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {/* 外圈 */}
            <circle
              cx="375"
              cy="375"
              r="340"
              fill="none"
              stroke="#A78BD9"
              strokeWidth="0.8"
              strokeDasharray="2136"
              strokeDashoffset="2136"
              style={{
                transition: `stroke-dashoffset 1.4s ${EASE_OUT_EXPO.join(',')} 0.2s`,
                ...(phase >= 1 ? { strokeDashoffset: '0' } : {}),
              }}
            />

            {/* 中圈 */}
            <circle
              cx="375"
              cy="375"
              r="270"
              fill="none"
              stroke="#C9B3E0"
              strokeWidth="0.5"
              strokeDasharray="1696"
              strokeDashoffset="1696"
              style={{
                transition: `stroke-dashoffset 1.2s ${EASE_OUT_EXPO.join(',')} 0.5s`,
                ...(phase >= 1 ? { strokeDashoffset: '0' } : {}),
              }}
            />

            {/* 内圈 */}
            <circle
              cx="375"
              cy="375"
              r="200"
              fill="none"
              stroke="#5E3D8A"
              strokeWidth="0.4"
              strokeDasharray="1257"
              strokeDashoffset="1257"
              style={{
                transition: `stroke-dashoffset 1.0s ${EASE_OUT_EXPO.join(',')} 0.7s`,
                ...(phase >= 1 ? { strokeDashoffset: '0' } : {}),
              }}
            />

            {/* 六芒星线条 */}
            {HEX_LINES.map((line, i) => (
              <line
                key={`hex-${i}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={i < 4 ? '#D4AF7A' : '#A78BD9'}
                strokeWidth="0.6"
                strokeDasharray="458"
                strokeDashoffset="458"
                opacity="0.5"
                style={{
                  transition: `stroke-dashoffset 0.8s ${EASE_OUT_EXPO.join(',')} ${0.9 + i * 0.08}s`,
                  ...(phase >= 1 ? { strokeDashoffset: '0' } : {}),
                }}
              />
            ))}

            {/* 六个节点标记 */}
            {INNER_MARKS.map((mark, i) => (
              <g key={`mark-${i}`} style={{ opacity: phase >= 1 ? 1 : 0, transition: `opacity 0.4s ease ${1.2 + i * 0.1}s` }}>
                <circle cx={mark.x} cy={mark.y} r="4" fill="none" stroke="#D4AF7A" strokeWidth="0.6" opacity="0.6" />
                <circle cx={mark.x} cy={mark.y} r="1.5" fill="#D4AF7A" opacity="0.8" />
              </g>
            ))}
          </svg>
        </div>

        {/* ─── Phase 2: 中心光脉冲 + 角色浮现 ─── */}
        {/* 光脉冲 - 从中心扩散 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '100px',
            height: '100px',
            top: '50%',
            left: '50%',
            background: 'radial-gradient(circle, rgba(167,139,217,0.8) 0%, rgba(120,101,248,0.3) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={
            phase >= 2
              ? { x: '-50%', y: '-50%', scale: [0, 8, 12], opacity: [0, 0.6, 0] }
              : { x: '-50%', y: '-50%', scale: 0, opacity: 0 }
          }
          transition={{ duration: 1.5, ease: EASE_OUT_EXPO }}
        />

        {/* 第二波光脉冲 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '60px',
            height: '60px',
            top: '50%',
            left: '50%',
            background: 'radial-gradient(circle, rgba(212,175,122,0.6) 0%, transparent 60%)',
            filter: 'blur(15px)',
          }}
          initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
          animate={
            phase >= 2
              ? { x: '-50%', y: '-50%', scale: [0, 6, 10], opacity: [0, 0.5, 0] }
              : { x: '-50%', y: '-50%', scale: 0, opacity: 0 }
          }
          transition={{ duration: 1.5, ease: EASE_OUT_EXPO, delay: 0.15 }}
        />

        {/* 角色立绘 */}
        <motion.div
          className="relative z-20 flex items-center justify-center"
          style={{
            width: isMobile ? '260px' : '340px',
            height: isMobile ? '400px' : '520px',
          }}
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
          animate={
            phase >= 2
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, scale: 0.85, filter: 'blur(12px)' }
          }
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.3 }}
        >
          {/* 角色底部光晕 */}
          <motion.div
            className="absolute"
            style={{
              width: '120%',
              height: '50%',
              bottom: '-5%',
              left: '-10%',
              background: 'radial-gradient(ellipse at center bottom, rgba(94,61,138,0.4) 0%, transparent 60%)',
              filter: 'blur(30px)',
            }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />

          <img
            src={INTRO_IMAGE}
            alt="墨璃 - MOLI"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: 'drop-shadow(0 20px 50px rgba(13,10,24,0.8)) drop-shadow(0 0 80px rgba(94,61,138,0.2))',
            }}
            draggable={false}
          />
        </motion.div>

        {/* ─── Phase 3: 文字 + 计数器 ─── */}
        <div
          className="absolute z-30 flex flex-col items-center"
          style={{
            bottom: isMobile ? '15%' : '18%',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          {/* 百分比计数器 */}
          <div className="mb-6">
            <PercentageCounter delay={3.2} duration={1.0} />
          </div>

          {/* 主标题 - clip-path 逐字裁切显现 */}
          <div className="flex gap-1 mb-3">
            {['墨', '璃'].map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{
                  fontSize: isMobile ? '40px' : '56px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  background: 'linear-gradient(135deg, #E8DEED 0%, #C9B3E0 40%, #A78BD9 70%, #D4AF7A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  clipPath: phase >= 3 ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                  transition: `clip-path 0.8s ${EASE_OUT_EXPO.join(',')} ${i * 0.15}s`,
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* 英文副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={phase >= 3 ? { opacity: 0.6, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.5 }}
            className="text-xs tracking-[0.5em] font-extralight"
            style={{ color: '#C9B3E0' }}
          >
            MO LI
          </motion.p>

          {/* 极简分隔线 */}
          <motion.div
            className="h-[1px] mt-4"
            style={{
              width: '120px',
              background: 'linear-gradient(90deg, transparent, rgba(167,139,217,0.4), transparent)',
            }}
            initial={{ scaleX: 0 }}
            animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT, delay: 0.6 }}
          />
        </div>

        {/* ─── 持续的微弱粒子（极简） ─── */}
        {phase >= 1 && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '3px',
                height: '3px',
                top: '30%',
                left: '25%',
                background: '#A78BD9',
                boxShadow: '0 0 6px #A78BD980',
              }}
              animate={{ opacity: [0, 0.7, 0], y: [0, -30, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '2px',
                height: '2px',
                top: '60%',
                left: '70%',
                background: '#D4AF7A',
                boxShadow: '0 0 6px #D4AF7A80',
              }}
              animate={{ opacity: [0, 0.5, 0], y: [0, -20, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '2px',
                height: '2px',
                top: '45%',
                left: '80%',
                background: '#C9B3E0',
                boxShadow: '0 0 4px #C9B3E060',
              }}
              animate={{ opacity: [0, 0.6, 0], y: [0, -25, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2.0 }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '2px',
                height: '2px',
                top: '35%',
                left: '15%',
                background: '#9D7CFF',
                boxShadow: '0 0 4px #9D7CFF60',
              }}
              animate={{ opacity: [0, 0.5, 0], y: [0, -20, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '3px',
                height: '3px',
                top: '70%',
                left: '40%',
                background: '#D4AF7A',
                boxShadow: '0 0 6px #D4AF7A60',
              }}
              animate={{ opacity: [0, 0.4, 0], y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
