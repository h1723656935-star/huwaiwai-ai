"use client";

import { useState, useEffect } from 'react';

// 移动端检测 Hook - 使用 matchMedia 避免 SSR 水合闪烁
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  // SSR 期间返回 false，避免水合不匹配
  if (!mounted) return false;
  return isMobile;
}

// 检测是否为触屏设备
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isNoHover = window.matchMedia('(hover: none)').matches;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch((isCoarse || isNoHover) && hasTouch);
  }, []);

  if (!mounted) return false;
  return isTouch;
}
