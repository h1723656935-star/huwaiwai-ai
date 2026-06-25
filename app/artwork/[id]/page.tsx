export const runtime = 'edge';

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Bookmark, Share2, Eye, Sparkles,
  ChevronDown, ChevronUp, Copy, Check, X, Maximize2, MessageCircle, Send
} from 'lucide-react';
import { Artwork, getArtworks } from '@/lib/worksService';

// 墨璃推荐文案
const MOLI_RECOMMENDS = [
  '这幅作品展现了细腻的光影处理，值得细细品味。',
  '优雅的配色与精致的细节相得益彰。',
  '紫晶般的氛围，令人沉醉其中。',
  '创作者巧妙地运用了色彩渐变，营造出梦幻般的效果。',
  '每一笔都充满了艺术的灵感与匠心。',
  '构图严谨、色彩克制，是近期难得的佳作。',
];

// 浅色艺术展览风格主题
const THEME = {
  bg: '#F8F7FC',
  surface: 'rgba(255, 255, 255, 0.65)',
  surfaceSolid: '#FFFFFF',
  border: 'rgba(120, 101, 248, 0.12)',
  borderStrong: 'rgba(120, 101, 248, 0.25)',
  primary: '#7865F8',
  primaryLight: '#A991FF',
  text: {
    primary: '#1A1628',
    secondary: '#5C5470',
    muted: '#9089A0',
    onPrimary: '#FFFFFF',
  },
  shadow: {
    sm: '0 2px 8px rgba(120, 101, 248, 0.06)',
    md: '0 8px 32px rgba(120, 101, 248, 0.08)',
    lg: '0 24px 60px rgba(120, 101, 248, 0.12)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  },
};

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArtworkDetail({ params }: DetailPageProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showMoliPanel, setShowMoliPanel] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);
  const [relatedWorks, setRelatedWorks] = useState<Artwork[]>([]);
  const [moliRecommend, setMoliRecommend] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 获取作品详情
  useEffect(() => {
    const fetchArtwork = async () => {
      const { id } = await params;
      const works = await getArtworks();
      const found = works.find(w => w.id === id);
      if (found) {
        setArtwork(found);
        setIsLiked(found.liked || false);
        setLikeCount(found.likes || 0);

        extractPalette(found.image);

        const related = works.filter(w =>
          w.id !== id &&
          (w.category === found.category ||
           w.categories?.some(c => found.categories?.includes(c)) ||
           w.tags.some(t => found.tags.includes(t)))
        ).slice(0, 6);
        setRelatedWorks(related);

        setMoliRecommend(MOLI_RECOMMENDS[Math.floor(Math.random() * MOLI_RECOMMENDS.length)]);
      }
      setIsLoading(false);
    };
    fetchArtwork();
  }, [params]);

  // 滚动监听（导航栏毛玻璃效果）
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 提取图片主色板
  const extractPalette = useCallback(async (imageUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 32;
      canvas.height = 32;
      ctx.drawImage(img, 0, 0, 32, 32);

      const imageData = ctx.getImageData(0, 0, 32, 32);
      const pixels = imageData.data;
      const colorCount: Record<string, number> = {};

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (a < 128) continue;
        const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      const sorted = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      const colors = sorted.map(([key]) => {
        const [r, g, b] = key.split(',').map(x => parseInt(x) * 32 + 16);
        return `rgb(${r}, ${g}, ${b})`;
      });

      setPalette(colors);
    } catch {
      setPalette(['#7865F8', '#A991FF', '#C7B8FF', '#E8E3FF', '#F8F7FC', '#FFFFFF']);
    }
  }, []);

  // 复制到剪贴板
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // 点赞处理
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  // 分享
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedField('share');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEME.bg }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${THEME.primary} transparent ${THEME.primary} ${THEME.primary}` }}
        />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: THEME.bg }}>
        <p className="text-xl mb-6" style={{ color: THEME.text.primary, fontWeight: 500 }}>作品未找到</p>
        <a href="/" className="px-6 py-2.5 rounded-full text-sm" style={{
          background: THEME.primary,
          color: THEME.text.onPrimary,
          boxShadow: THEME.shadow.md,
        }}>
          返回首页
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: THEME.bg, color: THEME.text.primary }}>
      {/* ============ 顶部导航 ============ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          ...THEME.glass,
          borderBottom: scrolled ? `1px solid ${THEME.border}` : '1px solid transparent',
          transition: 'border-color 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              boxShadow: THEME.shadow.sm,
            }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ color: THEME.text.primary }}>
              墨璃 AI Studio
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: THEME.text.secondary }}>
            <a href="/" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>作品</a>
            <a href="/" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>视频</a>
            <a href="/" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>关于</a>
          </div>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${THEME.border}`,
              color: THEME.text.secondary,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回</span>
          </button>
        </div>
      </motion.nav>

      {/* ============ Hero 展示区 (65% / 35%) ============ */}
      <section className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.857fr_1fr] gap-8 lg:gap-12 items-start">
            {/* 左侧：大图展示 (65%) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <div
                className="relative rounded-2xl overflow-hidden cursor-zoom-in"
                style={{
                  aspectRatio: '4/5',
                  background: THEME.surfaceSolid,
                  boxShadow: THEME.shadow.lg,
                  border: `1px solid ${THEME.border}`,
                }}
                onClick={() => setShowFullscreen(true)}
              >
                <motion.img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.6s ease' }}
                  animate={{ scale: isImageHovered ? 1.03 : 1 }}
                />

                {/* 悬浮信息层 */}
                <AnimatePresence>
                  {isImageHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
                      }}
                    >
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <div>
                          <p className="text-white text-xs uppercase tracking-widest mb-1.5 opacity-80">
                            {artwork.date}
                          </p>
                          <h2 className="text-white text-2xl font-semibold" style={{ letterSpacing: '-0.01em' }}>
                            {artwork.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white" style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(12px)',
                        }}>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>查看大图</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* 右侧：作品信息 (35%) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-7"
            >
              {/* 标题与分类 */}
              <div>
                <h1
                  className="text-3xl md:text-[2.5rem] font-semibold mb-3 leading-tight"
                  style={{
                    color: THEME.text.primary,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {artwork.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  {artwork.categories?.length > 0 ? (
                    artwork.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(120, 101, 248, 0.1)',
                          color: THEME.primary,
                        }}
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(120, 101, 248, 0.1)',
                        color: THEME.primary,
                      }}
                    >
                      {artwork.category}
                    </span>
                  )}
                </div>
              </div>

              {/* 简介 */}
              {artwork.description && (
                <p className="leading-relaxed text-[15px]" style={{ color: THEME.text.secondary }}>
                  {artwork.description}
                </p>
              )}

              {/* 提示词预览（右侧） */}
              {artwork.prompt && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    ...THEME.glass,
                    boxShadow: THEME.shadow.sm,
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: THEME.primary }} />
                      <p className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: THEME.primary }}>
                        Prompt
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(artwork.prompt!, 'prompt-side')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
                      style={{
                        background: copiedField === 'prompt-side' ? `${THEME.primary}15` : 'rgba(120, 101, 248, 0.05)',
                        color: copiedField === 'prompt-side' ? THEME.primary : THEME.text.secondary,
                        border: `1px solid ${copiedField === 'prompt-side' ? `${THEME.primary}40` : THEME.border}`,
                      }}
                    >
                      {copiedField === 'prompt-side' ? (
                        <><Check className="w-3 h-3" /> 已复制</>
                      ) : (
                        <><Copy className="w-3 h-3" /> 复制</>
                      )}
                    </button>
                  </div>
                  <p
                    className="text-[13px] leading-relaxed font-mono line-clamp-4"
                    style={{ color: THEME.text.secondary }}
                  >
                    {artwork.prompt}
                  </p>
                </div>
              )}

              {/* 互动操作 */}
              <div className="flex items-center gap-2.5">
                <motion.button
                  onClick={handleLike}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    background: isLiked ? THEME.primary : 'rgba(120, 101, 248, 0.08)',
                    color: isLiked ? THEME.text.onPrimary : THEME.primary,
                    border: `1px solid ${isLiked ? THEME.primary : 'transparent'}`,
                  }}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </motion.button>

                <motion.button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    background: isBookmarked ? `${THEME.primary}15` : 'rgba(120, 101, 248, 0.05)',
                    color: THEME.primary,
                    border: `1px solid ${isBookmarked ? `${THEME.primary}40` : THEME.border}`,
                  }}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>收藏</span>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(120, 101, 248, 0.05)',
                    color: THEME.text.secondary,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  {copiedField === 'share' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedField === 'share' ? '已复制' : '分享'}</span>
                </motion.button>
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-5 pt-2 text-xs" style={{ color: THEME.text.muted }}>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{artwork.views || 0} 次浏览</span>
                </div>
                <div className="w-px h-3" style={{ background: THEME.border }} />
                <span>创建于 {artwork.date}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 创作信息卡片 ============ */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { label: 'MODEL', value: artwork.model || '未指定' },
              { label: 'DIMENSIONS', value: artwork.dimensions || '未指定' },
              { label: 'CATEGORY', value: artwork.categories?.join(', ') || artwork.category || '未指定' },
              { label: 'TAGS', value: artwork.tags.join(', ') || '无' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl transition-shadow"
                style={{
                  ...THEME.glass,
                  boxShadow: THEME.shadow.sm,
                }}
              >
                <p className="text-[10px] uppercase tracking-[0.15em] mb-2 font-medium" style={{ color: THEME.text.muted }}>
                  {item.label}
                </p>
                <p className="text-sm font-medium leading-snug" style={{ color: THEME.text.primary }}>
                  {item.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 创作思路模块 ============ */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 md:p-10"
            style={{
              ...THEME.glass,
              boxShadow: THEME.shadow.md,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: THEME.text.primary, letterSpacing: '-0.01em' }}>
                创作思路
              </h2>
            </div>

            <div className="relative pl-6 border-l-2" style={{ borderColor: `${THEME.primary}30` }}>
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full" style={{ background: THEME.primary }} />
              <p className="text-[15px] leading-[1.85]" style={{ color: THEME.text.secondary }}>
                {artwork.description || '作者尚未添加创作思路...'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ Prompt 展示模块（可折叠） ============ */}
      {(artwork.prompt || artwork.negativePrompt) && (
        <section className="py-8 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden"
              style={{
                ...THEME.glass,
                boxShadow: THEME.shadow.md,
              }}
            >
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: THEME.primary }} />
                  <h2 className="text-lg font-semibold" style={{ color: THEME.text.primary, letterSpacing: '-0.01em' }}>
                    Prompt
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: 'rgba(120, 101, 248, 0.1)',
                    color: THEME.primary,
                  }}>
                    点击展开
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showPrompt ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: THEME.text.secondary }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showPrompt && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4">
                      {/* 正向 Prompt */}
                      {artwork.prompt && (
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <p className="text-xs uppercase tracking-[0.15em] font-medium" style={{ color: THEME.primary }}>
                              Positive Prompt
                            </p>
                            <button
                              onClick={() => copyToClipboard(artwork.prompt!, 'positive')}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
                              style={{
                                background: copiedField === 'positive' ? `${THEME.primary}15` : 'rgba(120, 101, 248, 0.05)',
                                color: copiedField === 'positive' ? THEME.primary : THEME.text.secondary,
                                border: `1px solid ${copiedField === 'positive' ? `${THEME.primary}40` : THEME.border}`,
                              }}
                            >
                              {copiedField === 'positive' ? (
                                <><Check className="w-3 h-3" /> 已复制</>
                              ) : (
                                <><Copy className="w-3 h-3" /> 复制</>
                              )}
                            </button>
                          </div>
                          <div
                            className="p-4 rounded-xl text-sm leading-relaxed font-mono"
                            style={{
                              background: 'rgba(248, 247, 252, 0.8)',
                              border: `1px solid ${THEME.border}`,
                              color: THEME.text.primary,
                            }}
                          >
                            {artwork.prompt}
                          </div>
                        </div>
                      )}

                      {/* 负向 Prompt */}
                      {artwork.negativePrompt && (
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <p className="text-xs uppercase tracking-[0.15em] font-medium" style={{ color: '#FF7878' }}>
                              Negative Prompt
                            </p>
                            <button
                              onClick={() => copyToClipboard(artwork.negativePrompt!, 'negative')}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
                              style={{
                                background: copiedField === 'negative' ? 'rgba(255, 120, 120, 0.1)' : 'rgba(120, 101, 248, 0.05)',
                                color: copiedField === 'negative' ? '#FF7878' : THEME.text.secondary,
                                border: `1px solid ${copiedField === 'negative' ? 'rgba(255, 120, 120, 0.3)' : THEME.border}`,
                              }}
                            >
                              {copiedField === 'negative' ? (
                                <><Check className="w-3 h-3" /> 已复制</>
                              ) : (
                                <><Copy className="w-3 h-3" /> 复制</>
                              )}
                            </button>
                          </div>
                          <div
                            className="p-4 rounded-xl text-sm leading-relaxed font-mono"
                            style={{
                              background: 'rgba(255, 120, 120, 0.04)',
                              border: '1px solid rgba(255, 120, 120, 0.15)',
                              color: THEME.text.secondary,
                            }}
                          >
                            {artwork.negativePrompt}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============ 主色板 ============ */}
      {palette.length > 0 && (
        <section className="py-8 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-8"
              style={{
                ...THEME.glass,
                boxShadow: THEME.shadow.md,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: THEME.text.primary, letterSpacing: '-0.01em' }}>
                    作品色板
                  </h2>
                  <p className="text-xs mt-1" style={{ color: THEME.text.muted }}>
                    自动提取 · 点击复制
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 h-20">
                {palette.map((color, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="flex-1 rounded-xl cursor-pointer relative group overflow-hidden"
                    style={{
                      backgroundColor: color,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                    }}
                    onClick={() => copyToClipboard(color, `color-${index}`)}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{
                      background: 'rgba(0, 0, 0, 0.55)',
                      backdropFilter: 'blur(8px)',
                    }}>
                      {copiedField === `color-${index}` ? (
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px]">已复制</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono">{color}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============ 墨璃推荐 ============ */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-7"
            style={{
              ...THEME.glass,
              boxShadow: THEME.shadow.md,
              background: `linear-gradient(135deg, ${THEME.surface} 0%, rgba(120, 101, 248, 0.05) 100%)`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  border: `2px solid ${THEME.primary}`,
                  boxShadow: `0 0 0 4px ${THEME.primary}15`,
                }}
              >
                <img
                  src="/moli/moli-standby.png"
                  alt="墨璃"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 22%' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm" style={{ color: THEME.text.primary }}>墨璃</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium" style={{
                    background: `${THEME.primary}15`,
                    color: THEME.primary,
                  }}>
                    AI 助手
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed italic" style={{ color: THEME.text.secondary }}>
                  "{moliRecommend}"
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 相关推荐 ============ */}
      {relatedWorks.length > 0 && (
        <section className="py-12 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-2 font-medium" style={{ color: THEME.primary }}>
                Related Works
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: THEME.text.primary, letterSpacing: '-0.02em' }}>
                相关推荐
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedWorks.map((work, index) => (
                <motion.a
                  key={work.id}
                  href={`/artwork/${work.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group block"
                >
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: '4/5',
                      boxShadow: THEME.shadow.sm,
                      border: `1px solid ${THEME.border}`,
                      background: THEME.surfaceSolid,
                    }}
                  >
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
                      }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium truncate" style={{ letterSpacing: '-0.01em' }}>
                        {work.title}
                      </p>
                      <div className="flex gap-1.5 mt-2">
                        {work.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px]"
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(8px)',
                              color: '#FFFFFF',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 页脚 ============ */}
      <footer className="py-10 px-4 md:px-6 mt-8" style={{ borderTop: `1px solid ${THEME.border}` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: THEME.text.muted }}>
          <p>© 2025 胡歪歪 AI Studio. All rights reserved.</p>
          <p>由墨璃倾情推荐 · Crafted with care</p>
        </div>
      </footer>

      {/* ============ 右下角悬浮墨璃助手头像 ============ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="fixed bottom-6 right-6 z-30"
      >
        <AnimatePresence>
          {showMoliPanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-72 rounded-2xl overflow-hidden"
              style={{
                ...THEME.glass,
                boxShadow: THEME.shadow.lg,
                border: `1px solid ${THEME.borderStrong}`,
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: THEME.border }}>
                <div className="flex items-center gap-2.5">
                  <img
                    src="/moli/moli-standby.png"
                    alt="墨璃"
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ objectPosition: '50% 22%' }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: THEME.text.primary }}>墨璃</p>
                    <p className="text-[10px]" style={{ color: THEME.text.muted }}>在线 · AI 助手</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="rounded-xl p-3 mb-3" style={{
                  background: 'rgba(120, 101, 248, 0.06)',
                  border: `1px solid ${THEME.border}`,
                }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: THEME.text.secondary }}>
                    {moliRecommend}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="和墨璃聊一聊..."
                    className="flex-1 px-3 py-1.5 rounded-full text-xs outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: `1px solid ${THEME.border}`,
                      color: THEME.text.primary,
                    }}
                  />
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: THEME.primary, color: THEME.text.onPrimary }}
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowMoliPanel(!showMoliPanel)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full overflow-hidden"
          style={{
            border: `2px solid ${THEME.primary}`,
            boxShadow: `0 8px 24px ${THEME.primary}30, 0 0 0 4px ${THEME.primary}10`,
            background: THEME.surfaceSolid,
          }}
        >
          <img
            src="/moli/moli-standby.png"
            alt="墨璃助手"
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 22%' }}
          />
          <span
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#22C55E',
              boxShadow: '0 0 0 2px white',
            }}
          />
        </motion.button>
      </motion.div>

      {/* ============ 全屏图片查看器 ============ */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(248, 247, 252, 0.98)' }}
            onClick={() => setShowFullscreen(false)}
          >
            <motion.button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${THEME.border}`,
                color: THEME.text.primary,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <motion.img
              src={artwork.image}
              alt={artwork.title}
              className="max-w-full max-h-full object-contain rounded-xl"
              style={{ boxShadow: THEME.shadow.lg }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
