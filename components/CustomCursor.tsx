"use client";

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const lightTrailRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const lightBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = false;
    let currentTarget: 'default' | 'button' | 'work' | 'link' | 'moli' = 'default';

    const applyPosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX - 12}px, ${currentY - 12}px, 0)`;
      }
      if (lightTrailRef.current) {
        lightTrailRef.current.style.transform = `translate3d(${currentX - 60}px, ${currentY - 8}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${currentX + 20}px, ${currentY - 8}px, 0)`;
      }
    };

    const animate = () => {
      // 跟手系数 0.85 — 非常跟手
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.85;
      currentY += dy * 0.85;
      applyPosition();
      rafId = requestAnimationFrame(animate);
    };

    const updateLabel = () => {
      const labels: Record<string, string> = {
        default: '',
        button: '',
        work: 'OPEN',
        link: 'VISIT',
        moli: '墨璃',
      };
      const text = labels[currentTarget];
      if (labelTextRef.current) {
        labelTextRef.current.textContent = text;
      }
      if (labelRef.current) {
        labelRef.current.style.display = text ? 'block' : 'none';
      }
      if (lightBarRef.current) {
        lightBarRef.current.style.display = currentTarget === 'button' ? 'flex' : 'none';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
        if (labelRef.current) labelRef.current.style.opacity = '1';
        if (lightTrailRef.current) lightTrailRef.current.style.opacity = '1';
      }

      const target = e.target as HTMLElement;
      let newTarget: typeof currentTarget = 'default';
      if (target.closest('button') || target.tagName === 'BUTTON') {
        newTarget = 'button';
      } else if (target.closest('.artwork-card') || target.closest('.video-card')) {
        newTarget = 'work';
      } else if (target.closest('a') || target.tagName === 'A') {
        newTarget = 'link';
      } else if (target.closest('.moli-character')) {
        newTarget = 'moli';
      }

      if (newTarget !== currentTarget) {
        currentTarget = newTarget;
        updateLabel();
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      if (labelRef.current) labelRef.current.style.opacity = '0';
      if (lightTrailRef.current) lightTrailRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* 按钮悬停光带 */}
      <div
        ref={lightTrailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          opacity: 0,
          willChange: 'transform',
        }}
      >
        <div
          ref={lightBarRef}
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(90deg, rgba(120,101,248,0.15) 0%, rgba(169,145,255,0.08) 100%)',
            backdropFilter: 'blur(8px)',
            padding: '4px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(120,101,248,0.2)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '2px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(120,101,248,0.8) 0%, rgba(169,145,255,0.4) 100%)',
            }}
          />
        </div>
      </div>

      {/* 主光标 */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          opacity: 0,
          willChange: 'transform',
          filter: 'drop-shadow(0 0 8px rgba(120, 101, 248, 0.5))',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z"
            fill="#F8F7FC"
            stroke="#7865F8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 标签 */}
      <div
        ref={labelRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          display: 'none',
          opacity: 0,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'rgba(13,10,24,0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(120,101,248,0.3)',
            color: '#F8F7FC',
            boxShadow: '0 4px 20px rgba(120,101,248,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          <span ref={labelTextRef}></span>
        </div>
      </div>
    </>
  );
}
