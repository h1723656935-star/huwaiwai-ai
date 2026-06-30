"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
//  PC端动态背景 - 极光粒子星河（全屏增强版）
//  与月光紫藤花园主题完美融合，覆盖整个页面
// ═══════════════════════════════════════════════════════════

// ─── 全屏流动背景着色器 ──────────────────────────────────
const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

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
    float t = uTime * 0.05;
    vec2 uv = vUv;

    float n1 = snoise(vec3(uv * 1.5, t)) * 0.5 + 0.5;
    float n2 = snoise(vec3(uv * 2.5 + 10.0, t * 0.7)) * 0.5 + 0.5;
    float n3 = snoise(vec3(uv * 0.8 + 20.0, t * 0.5)) * 0.5 + 0.5;

    vec3 deepPurple = vec3(0.047, 0.039, 0.078);
    vec3 purple1 = vec3(0.078, 0.063, 0.157);
    vec3 purple2 = vec3(0.11, 0.086, 0.20);
    vec3 violet = vec3(0.137, 0.11, 0.25);

    vec3 color = mix(deepPurple, purple1, n1);
    color = mix(color, purple2, n2 * 0.4);
    color = mix(color, violet, n3 * 0.2);

    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── 极光光带着色器 ──────────────────────────────────────
const auroraVertexShader = `
  varying vec2 vUv;
  varying float vY;
  void main() {
    vUv = uv;
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const auroraFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vY;

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
    float t = uTime * 0.15;

    float n1 = snoise(vec3(vUv.x * 2.0, vUv.y * 1.5, t)) * 0.5 + 0.5;
    float n2 = snoise(vec3(vUv.x * 3.5 + 1.0, vUv.y * 2.0 + 0.5, t * 0.8)) * 0.5 + 0.5;
    float n3 = snoise(vec3(vUv.x * 1.5 + 2.0, vUv.y * 3.0, t * 1.2)) * 0.5 + 0.5;

    float verticalFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.6, vUv.y);

    float wave = sin(vUv.x * 6.28 + t * 2.0) * 0.3 + 0.7;
    float wave2 = sin(vUv.x * 4.0 - t * 1.5 + 1.0) * 0.2 + 0.8;

    vec3 color = mix(uColor1, uColor2, n1);
    color = mix(color, uColor3, n2 * 0.4);
    color += uColor2 * n3 * 0.3;

    float intensity = n1 * wave * wave2 * verticalFade * uIntensity;

    float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
    intensity *= edgeFade;

    gl_FragColor = vec4(color, intensity * 0.3);
  }
`;

// ─── 全屏流动背景层 ──────────────────────────────────────
function FlowBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -8]}>
      <planeGeometry args={[40, 30]} />
      <shaderMaterial
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── 极光光带组件 ────────────────────────────────────────
function AuroraBands() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);
  const meshRef4 = useRef<THREE.Mesh>(null);
  const meshRef5 = useRef<THREE.Mesh>(null);

  const uniforms1 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#8B7AE0") },
      uColor2: { value: new THREE.Color("#C4B5FD") },
      uColor3: { value: new THREE.Color("#D4AF7A") },
      uIntensity: { value: 1.0 },
    }),
    []
  );

  const uniforms2 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#5E3D8A") },
      uColor2: { value: new THREE.Color("#A78BD9") },
      uColor3: { value: new THREE.Color("#E8DEED") },
      uIntensity: { value: 0.7 },
    }),
    []
  );

  const uniforms3 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#3D2B6B") },
      uColor2: { value: new THREE.Color("#8B7AE0") },
      uColor3: { value: new THREE.Color("#C9B3E0") },
      uIntensity: { value: 0.5 },
    }),
    []
  );

  const uniforms4 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#6B5AC9") },
      uColor2: { value: new THREE.Color("#A99AF0") },
      uColor3: { value: new THREE.Color("#E8D5A3") },
      uIntensity: { value: 0.4 },
    }),
    []
  );

  const uniforms5 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#4A3D7A") },
      uColor2: { value: new THREE.Color("#9B8BE0") },
      uColor3: { value: new THREE.Color("#D4C5E8") },
      uIntensity: { value: 0.35 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef1.current) {
      (meshRef1.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      meshRef1.current.position.y = Math.sin(t * 0.1) * 0.08 + 0.5;
    }
    if (meshRef2.current) {
      (meshRef2.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t * 0.8;
      meshRef2.current.position.y = Math.sin(t * 0.12 + 1.0) * 0.06 + 0.1;
    }
    if (meshRef3.current) {
      (meshRef3.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t * 1.1;
      meshRef3.current.position.y = Math.sin(t * 0.08 + 2.0) * 0.05 - 0.3;
    }
    if (meshRef4.current) {
      (meshRef4.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t * 0.9;
      meshRef4.current.position.y = Math.sin(t * 0.15 + 3.0) * 0.07 - 0.8;
    }
    if (meshRef5.current) {
      (meshRef5.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t * 0.7;
      meshRef5.current.position.y = Math.sin(t * 0.11 + 4.0) * 0.04 - 1.3;
    }
  });

  return (
    <>
      <mesh ref={meshRef1} position={[0, 0.5, -2]}>
        <planeGeometry args={[6, 2.0, 32, 16]} />
        <shaderMaterial
          vertexShader={auroraVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={uniforms1}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={meshRef2} position={[0.3, 0.1, -2.2]}>
        <planeGeometry args={[6.5, 1.8, 32, 16]} />
        <shaderMaterial
          vertexShader={auroraVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={uniforms2}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={meshRef3} position={[-0.2, -0.3, -2.4]}>
        <planeGeometry args={[6, 1.6, 32, 16]} />
        <shaderMaterial
          vertexShader={auroraVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={uniforms3}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={meshRef4} position={[0.1, -0.8, -2.6]}>
        <planeGeometry args={[7, 1.5, 32, 16]} />
        <shaderMaterial
          vertexShader={auroraVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={uniforms4}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={meshRef5} position={[-0.1, -1.3, -2.8]}>
        <planeGeometry args={[6.5, 1.3, 32, 16]} />
        <shaderMaterial
          vertexShader={auroraVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={uniforms5}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

// ─── 浮动粒子（近景） ────────────────────────────────────
function FloatingParticles({ count = 150 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return [pos];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(t * 0.2 + i * 0.3) * 0.0002;
      pos[idx] += Math.cos(t * 0.15 + i * 0.2) * 0.00015;

      if (pos[idx + 1] > 5) pos[idx + 1] = -5;
      if (pos[idx + 1] < -5) pos[idx + 1] = 5;
      if (pos[idx] > 6) pos[idx] = -6;
      if (pos[idx] < -6) pos[idx] = 6;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.003;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#C9B3E0"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 远景星尘 ────────────────────────────────────────────
function DistantStars({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#E8DEED"
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── 光晕脉冲 ────────────────────────────────────────────
function PulsingGlow() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef1.current) {
      const breathe = 1 + Math.sin(t * 0.4) * 0.1;
      meshRef1.current.scale.set(breathe, breathe, 1);
    }
    if (meshRef2.current) {
      const breathe = 1 + Math.sin(t * 0.3 + 2.0) * 0.08;
      meshRef2.current.scale.set(breathe, breathe, 1);
    }
  });

  return (
    <>
      <mesh ref={meshRef1} position={[0, 0.5, -4]}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial
          color="#8B7AE0"
          transparent
          opacity={0.008}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={meshRef2} position={[-2, -1, -4.5]}>
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial
          color="#C4B5FD"
          transparent
          opacity={0.006}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── 场景组合 ────────────────────────────────────────────
function Scene() {
  return (
    <>
      <FlowBackground />
      <AuroraBands />
      <FloatingParticles count={150} />
      <DistantStars count={500} />
      <PulsingGlow />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  主组件
// ═══════════════════════════════════════════════════════════

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const canvasEl = canvas.querySelector("canvas");
        if (canvasEl) {
          (canvasEl as HTMLCanvasElement).style.visibility = entry.isIntersecting
            ? "visible"
            : "hidden";
        }
      },
      { threshold: 0 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
