"use client";

import { useRef, useMemo, useState, useEffect, useCallback, MouseEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── 缓动曲线 ───────────────────────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT_CUBIC: [number, number, number, number] = [0.65, 0, 0.35, 1];

// ═════════════════════════════════════════════════════════
//  3D 场景 - 深空星云背景
// ═══════════════════════════════════════════════════════════

// ─── 星空粒子（远景点缀） ────────────────────────────────
function StarField({ count = 600 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // 球形分布，远处更密集
      const r = 8 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = 0.5 + Math.random() * 2.0;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.008;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#C9B3E0"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 星云雾气（柔和光团） ────────────────────────────────
function NebulaClouds({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const items = [];
    const colors = ['#8B7AE0', '#5E3D8A', '#D4AF7A', '#C4B5FD', '#3D2B6B'];
    for (let i = 0; i < 12; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          -5 - Math.random() * 10,
        ] as [number, number, number],
        scale: 2 + Math.random() * 4,
        color: colors[i % colors.length],
        speed: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const cloud = clouds[i];
        const mesh = child as THREE.Mesh;
        const t = state.clock.elapsedTime;
        mesh.position.x = cloud.position[0] + Math.sin(t * cloud.speed + cloud.offset) * 0.5;
        mesh.position.y = cloud.position[1] + Math.cos(t * cloud.speed * 0.7 + cloud.offset) * 0.3;
        mesh.rotation.z = t * 0.02 * cloud.speed;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <planeGeometry args={[cloud.scale, cloud.scale]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={0.03 + progress * 0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 流星粒子（划过效果） ────────────────────────────────
function ShootingStars({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);

  const starCount = 8;

  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = -10 + Math.random() * 20;
      pos[i * 3 + 1] = 5 + Math.random() * 8;
      pos[i * 3 + 2] = -2 + Math.random() * 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!active || !starsRef.current) return;
    const pos = starsRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < starCount; i++) {
      // 从右上向左下划过
      const speed = 0.03 + (i % 3) * 0.01;
      pos[i * 3] -= speed;
      pos[i * 3 + 1] -= speed * 0.6;
      // 重置到起始位置
      if (pos[i * 3] < -12) {
        pos[i * 3] = 8 + Math.random() * 6;
        pos[i * 3 + 1] = 5 + Math.random() * 6;
        pos[i * 3 + 2] = -2 + Math.random() * 4;
      }
    }
    starsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#E8DEED"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 中心光晕（呼吸脉动） ────────────────────────────────
function CenterGlow({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const breathe = 1 + Math.sin(t * 0.8) * 0.15;
      meshRef.current.scale.set(breathe, breathe, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <circleGeometry args={[3, 64]} />
      <meshBasicMaterial
        color="#8B7AE0"
        transparent
        opacity={0.02 + progress * 0.03}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── 场景组合 ────────────────────────────────────────────
function CosmicScene({ progress }: { progress: number }) {
  return (
    <>
      <StarField count={500} />
      <NebulaClouds progress={progress} />
      <CenterGlow progress={progress} />
      <ShootingStars active={progress > 0.3} />
    </>
  );
}

// ═════════════════════════════════════════════════════════
//  UI 层 - 电影级排版
// ═══════════════════════════════════════════════════════════

// ─── 分隔线装饰 ──────────────────────────────────────────
function DecorativeLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="w-16 h-px mx-auto"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(139,122,224,0.4), transparent)',
      }}
    />
  );
}

// ─── 单字动画 ────────────────────────────────────────────
function AnimatedChar({
  char,
  delay,
  fontSize,
}: {
  char: string;
  delay: number;
  fontSize: string;
}) {
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.4, delay, ease: EASE_OUT_EXPO }}
      style={{
        fontSize,
        fontWeight: 200,
        letterSpacing: '0.35em',
        color: 'rgba(232, 222, 237, 0.95)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {char}
    </motion.span>
  );
}

// ─── 超大英文标题（逐字展开） ────────────────────────────
function HeroTitle({ visible, onEnter, onSkip }: { visible: boolean; onEnter: () => void; onSkip: (e?: React.MouseEvent) => void }) {
  const title = "M O  L I";
  const chars = title.split('');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
          transition={{ duration: 0.8, ease: EASE_IN_OUT_CUBIC }}
        >
          {/* 上方小字 */}
          <motion.p
            className="text-xs tracking-[0.6em] font-light uppercase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.8, ease: EASE_OUT_EXPO }}
            style={{
              color: 'rgba(167, 139, 217, 0.5)',
              fontFamily: 'var(--font-en)',
            }}
          >
            Digital Art & AI Creation Studio
          </motion.p>

          {/* 装饰线 */}
          <DecorativeLine delay={1.0} />

          {/* 主标题 - 逐字展开 */}
          <div className="flex items-center justify-center">
            {chars.map((char, i) => (
              <AnimatedChar
                key={i}
                char={char}
                delay={1.2 + i * 0.12}
                fontSize="clamp(48px, 10vw, 120px)"
              />
            ))}
          </div>

          {/* 中文副标题 */}
          <motion.p
            className="text-sm tracking-[0.4em] font-light"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 2.4, ease: EASE_OUT_EXPO }}
            style={{
              color: 'rgba(201, 179, 224, 0.45)',
              fontFamily: 'var(--font-body)',
            }}
          >
            墨璃 · 数字艺术与 AI 创作工作室
          </motion.p>

          {/* 装饰线 */}
          <DecorativeLine delay={2.6} />

          {/* CTA 按钮 - 幽灵描边风格 */}
          <motion.button
            className="group relative mt-4 px-10 py-4 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 3.0, ease: EASE_OUT_EXPO }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            style={{
              border: '1px solid rgba(139, 122, 224, 0.3)',
              borderRadius: '2px',
              background: 'transparent',
            }}
          >
            <span
              className="text-xs tracking-[0.5em] uppercase block transition-colors duration-500 group-hover:text-[#D4AF7A]"
              style={{
                color: 'rgba(232, 222, 237, 0.7)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Enter the Studio
            </span>
            {/* hover 光晕 */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(139,122,224,0.08) 0%, transparent 70%)',
                borderRadius: '2px',
              }}
            />
          </motion.button>

          {/* 次要链接 */}
          <motion.button
            className="mt-6 text-xs tracking-[0.3em] cursor-pointer bg-transparent border-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 3.5, ease: EASE_OUT_EXPO }}
            style={{
              color: 'rgba(167, 139, 217, 0.25)',
              fontFamily: 'var(--font-ui)',
            }}
            whileHover={{ color: 'rgba(167, 139, 217, 0.5)' }}
            onClick={(e) => onSkip(e)}
          >
            skip intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── 底部进度条 ──────────────────────────────────────────
function LoadingBar({ progress }: { progress: number }) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-[1px]"
      style={{ zIndex: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 0 ? 1 : 0 }}
    >
      <motion.div
        className="h-full"
        style={{
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #5E3D8A, #8B7AE0, #D4AF7A)',
          boxShadow: '0 0 12px rgba(139, 122, 224, 0.5)',
        }}
        transition={{ duration: 0.3, ease: 'linear' }}
      />
    </motion.div>
  );
}

// ─── 侧边装饰 - 垂直文字 ──────────────────────────────────
function SideDecoration({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed right-6 top-1/2 -translate-y-1/2 hidden lg:block"
          style={{ zIndex: 15 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 1.0, delay: 2.8, ease: EASE_OUT_EXPO }}
        >
          <p
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{
              color: 'rgba(167, 139, 217, 0.2)',
              fontFamily: 'var(--font-ui)',
              writingMode: 'vertical-rl',
            }}
          >
            Est. 2024
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── 左上角 Logo ──────────────────────────────────────────
function IntroLogo({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-8 left-8"
          style={{ zIndex: 15 }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.8, delay: 2.6, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-lg font-bold"
              style={{
                color: 'rgba(232, 222, 237, 0.8)',
                fontFamily: 'var(--font-display)',
              }}
            >
              墨璃
            </span>
            <span
              className="text-[10px] italic tracking-[0.3em]"
              style={{
                color: 'rgba(167, 139, 217, 0.4)',
                fontFamily: 'var(--font-en)',
              }}
            >
              MOLI
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════
//  主组件 - 电影级进入动画
// ═══════════════════════════════════════════════════════════

export default function Intro3D({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  // phase: 0=暗场, 1=星空渐现, 2=文字入场, 3=等待交互, 4=退出
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [exiting, setExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 加载进度模拟
  useEffect(() => {
    const startTime = performance.now();
    const duration = 2800;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setLoadProgress(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 阶段控制
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // 星空渐现
      setTimeout(() => setPhase(2), 1200),   // 文字开始入场
      setTimeout(() => setPhase(3), 3600),   // 交互就绪
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // 退出处理
  const handleEnter = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setPhase(4);
    // 短暂延迟后通知完成
    setTimeout(() => onComplete(), 800);
  }, [exiting, onComplete]);

  // skip 按钮
  const handleSkip = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setPhase(4);
    setTimeout(() => onComplete(), 400);
  }, [exiting, onComplete]);

  // 自动超时（8秒后自动进入）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase >= 3 && !exiting) {
        handleEnter();
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [phase, exiting, handleEnter]);

  return (
    <AnimatePresence>
      {!exiting || phase === 4 ? (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 overflow-hidden"
          style={{
            zIndex: 100,
            background: '#05030A',
          }}
          animate={
            phase === 4
              ? {
                  opacity: 0,
                  filter: 'brightness(1.8) blur(4px)',
                }
              : {}
          }
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          {/* ─── 3D 深空背景 ─── */}
          <div
            className="absolute inset-0"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 8], fov: 55 }}
              dpr={isMobile ? 1 : 1.5}
              gl={{ antialias: false, alpha: true }}
            >
              <CosmicScene progress={loadProgress} />
            </Canvas>
          </div>

          {/* ─── 径向渐变叠加层（增加深度感） ─── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(5,3,10,0.4) 60%, rgba(5,3,10,0.85) 100%)',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 2s ease',
            }}
          />

          {/* ─── 顶部和底部渐变遮罩 ─── */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(5,3,10,0.8), transparent)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(5,3,10,0.6), transparent)',
            }}
          />

          {/* ─── UI 层 ─── */}
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ zIndex: 10 }}
            onClick={handleEnter}
          >
            <HeroTitle visible={phase >= 2} onEnter={handleEnter} onSkip={(e) => { e?.stopPropagation?.(); handleSkip(); }} />
          </div>

          {/* ─── 装饰元素 ─── */}
          <IntroLogo visible={phase >= 2} />
          <SideDecoration visible={phase >= 2} />

          {/* ─── 进度条 ─── */}
          <LoadingBar progress={loadProgress} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
