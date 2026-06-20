"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── 缓动曲线 ───────────────────────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ═════════════════════════════════════════════════════════
//  3D 场景组件
// ═════════════════════════════════════════════════════════

// ─── 核心球体（水晶质感） ────────────────────────────────
function CrystalSphere({ explode }: { explode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#A78BD9') },
      uColor2: { value: new THREE.Color('#5E3D8A') },
      uColor3: { value: new THREE.Color('#D4AF7A') },
      uExplode: { value: 0 },
    }),
    []
  );

  const vertexShader = `
    uniform float uTime;
    uniform float uExplode;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      float noise = snoise(position * 1.5 + uTime * 0.3);
      vNoise = noise;

      vec3 pos = position;
      // 表面微扰动
      pos += normal * noise * 0.08;
      // 爆裂效果
      pos += normal * uExplode * (1.0 + noise * 2.0) * 3.0;

      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uTime;
    uniform float uExplode;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;

    void main() {
      // 极光光带
      float band1 = sin(vPosition.y * 4.0 + uTime * 0.8) * 0.5 + 0.5;
      float band2 = sin(vPosition.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
      float band3 = sin(vPosition.z * 5.0 + uTime * 1.2) * 0.5 + 0.5;

      vec3 color = mix(uColor1, uColor2, band1);
      color = mix(color, uColor3, band2 * 0.3);
      color += uColor1 * band3 * 0.2;

      // Fresnel 边缘发光
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
      color += uColor3 * fresnel * 1.5;

      // 爆裂时发光增强
      color += uColor1 * uExplode * 2.0;

      // 透明度：边缘更透明（水晶感）
      float alpha = 0.35 + fresnel * 0.4;
      alpha *= (1.0 - uExplode * 0.5);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // 爆裂动画
  useEffect(() => {
    if (!materialRef.current) return;
    const target = explode ? 1 : 0;
    const start = materialRef.current.uniforms.uExplode.value;
    const startTime = performance.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (materialRef.current) {
        materialRef.current.uniforms.uExplode.value = start + (target - start) * eased;
      }
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [explode]);

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.8, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── 内部星云 ────────────────────────────────────────────
function NebulaCore() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color1 = new THREE.Color('#A78BD9');
    const color2 = new THREE.Color('#D4AF7A');
    const color3 = new THREE.Color('#5E3D8A');

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixColor = Math.random();
      const c = mixColor < 0.33 ? color1 : mixColor < 0.66 ? color2 : color3;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
      pointsRef.current.rotation.z += 0.001;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 魔法符文环 ──────────────────────────────────────────
function RuneRing({
  radius,
  speed,
  axis,
  particleCount,
  color,
}: {
  radius: number;
  speed: number;
  axis: [number, number, number];
  particleCount: number;
  color: string;
}) {
  const ringRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = 0;
    }
    return pos;
  }, [radius, particleCount]);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = axis[0] * state.clock.elapsedTime * speed;
      ringRef.current.rotation.y = axis[1] * state.clock.elapsedTime * speed;
      ringRef.current.rotation.z = axis[2] * state.clock.elapsedTime * speed;
    }
  });

  return (
    <points ref={ringRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 爆裂粒子（退出时） ──────────────────────────────────
function ExplosionParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(0));
  const particleCount = 2000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const c1 = new THREE.Color('#A78BD9');
    const c2 = new THREE.Color('#D4AF7A');
    const c3 = new THREE.Color('#E8DEED');

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      const mixColor = Math.random();
      const c = mixColor < 0.33 ? c1 : mixColor < 0.66 ? c2 : c3;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useEffect(() => {
    if (active) {
      const vel = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const speed = 0.02 + Math.random() * 0.08;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        vel[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        vel[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        vel[i * 3 + 2] = speed * Math.cos(phi);
      }
      velocities.current = vel;
    }
  }, [active]);

  useFrame(() => {
    if (!active || !pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const vel = velocities.current;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += vel[i * 3];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];
      // 减速
      vel[i * 3] *= 0.995;
      vel[i * 3 + 1] *= 0.995;
      vel[i * 3 + 2] *= 0.995;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 场景组合 ────────────────────────────────────────────
function Scene({ explode }: { explode: boolean }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#A78BD9" />
      <pointLight position={[-5, -3, 5]} intensity={0.3} color="#D4AF7A" />

      <CrystalSphere explode={explode} />
      <NebulaCore />

      {/* 三个符文环，不同轴旋转 */}
      <RuneRing radius={2.8} speed={0.15} axis={[1, 0.3, 0.1]} particleCount={120} color="#A78BD9" />
      <RuneRing radius={3.5} speed={-0.12} axis={[0.2, 1, 0.4]} particleCount={160} color="#D4AF7A" />
      <RuneRing radius={4.2} speed={0.08} axis={[0.1, 0.2, 1]} particleCount={200} color="#C9B3E0" />

      <ExplosionParticles active={explode} />
    </>
  );
}

// ═════════════════════════════════════════════════════════
//  UI 层组件
// ═════════════════════════════════════════════════════════

function PercentageCounter({ delay, duration }: { delay: number; duration: number }) {
  const [display, setDisplay] = useState('000');

  useEffect(() => {
    const start = performance.now() + delay * 1000;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * 100)).padStart(3, '0'));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, duration]);

  return (
    <span
      className="font-mono tabular-nums"
      style={{
        fontSize: 'clamp(36px, 6vw, 72px)',
        fontWeight: 200,
        letterSpacing: '0.08em',
        color: 'rgba(167, 139, 217, 0.6)',
      }}
    >
      {display}
      <span style={{ fontSize: '0.4em', verticalAlign: 'super', marginLeft: '2px', opacity: 0.4 }}>%</span>
    </span>
  );
}

// ═════════════════════════════════════════════════════════
//  主组件
// ═════════════════════════════════════════════════════════

export default function Intro3D({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=idle, 1=enter, 2=hold, 3=explode, 4=exit
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setPhase(3), 4500); // 自动触发爆裂
    const t4 = setTimeout(() => setPhase(4), 5500);
    const t5 = setTimeout(() => onComplete(), 6200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] overflow-hidden"
        style={{ background: '#020105' }}
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.05,
          filter: 'brightness(1.5)',
          transition: { duration: 1.2, ease: EASE_OUT_EXPO },
        }}
      >
        {/* 3D Canvas */}
        <div
          className="absolute inset-0"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 7], fov: 50 }}
            dpr={isMobile ? 1 : 1.5}
            gl={{ antialias: true, alpha: true }}
          >
            <Scene explode={phase >= 3} />
          </Canvas>
        </div>

        {/* UI 层 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-[15%] pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* 百分比 */}
          <div
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          >
            <PercentageCounter delay={2.5} duration={1.5} />
          </div>

          {/* 标题 */}
          <div
            className="flex gap-2 mt-4"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            {['墨', '璃'].map((char, i) => (
              <span
                key={i}
                style={{
                  fontSize: isMobile ? '36px' : '48px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  background: 'linear-gradient(135deg, #E8DEED 0%, #C9B3E0 40%, #A78BD9 70%, #D4AF7A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {char}
              </span>
            ))}
          </div>

          <p
            className="text-xs tracking-[0.5em] font-extralight mt-2"
            style={{
              color: 'rgba(201, 179, 224, 0.5)',
              opacity: phase >= 2 ? 1 : 0,
              transition: 'opacity 0.6s ease 0.5s',
            }}
          >
            MO LI
          </p>

          {/* 点击提示 */}
          <motion.div
            className="mt-8"
            style={{ opacity: phase >= 2 && phase < 3 ? 1 : 0 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-xs tracking-widest" style={{ color: 'rgba(167, 139, 217, 0.3)' }}>
              点击球体唤醒守护者
            </p>
          </motion.div>
        </div>

        {/* 点击触发区域 */}
        {phase >= 1 && phase < 3 && (
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ zIndex: 5 }}
            onClick={() => {
              if (phase >= 2) setPhase(3);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
