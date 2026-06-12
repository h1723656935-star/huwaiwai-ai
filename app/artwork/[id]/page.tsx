"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Bookmark, Maximize2, ZoomIn, X, ChevronDown, Share2, Eye, Sparkles } from 'lucide-react';
import { Artwork, getArtworks } from '@/lib/worksService';

// 墨璃推荐文案
const MOLI_RECOMMENDS = [
  '这幅作品展现了细腻的光影处理，值得细细品味。',
  '优雅的配色与精致的细节相得益彰。',
  '紫晶般的氛围，令人沉醉其中。',
  '创作者巧妙地运用了色彩渐变，营造出梦幻般的效果。',
  '每一笔都充满了艺术的灵感与匠心。',
];

// 主题样式常量
const THEME = {
  card: {
    background: 'rgba(26, 22, 40, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(120, 101, 248, 0.15)',
    borderRadius: '20px',
  },
  gradientBtn: {
    background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
    color: '#F8F7FC',
    boxShadow: '0 4px 20px rgba(120, 101, 248, 0.3)',
  },
  text: {
    primary: '#ECE7FF',
    secondary: '#C7B8FF',
    muted: 'rgba(199, 184, 255, 0.7)',
  },
};

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArtworkDetail({ params }: DetailPageProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);
  const [relatedWorks, setRelatedWorks] = useState<Artwork[]>([]);
  const [moliRecommend, setMoliRecommend] = useState('');
  const [isHoveringImage, setIsHoveringImage] = useState(false);

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
        
        // 量化颜色
        const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      // 获取最常见的6种颜色
      const sorted = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      const colors = sorted.map(([key]) => {
        const [r, g, b] = key.split(',').map(x => parseInt(x) * 32 + 16);
        return `rgb(${r}, ${g}, ${b})`;
      });

      setPalette(colors);
    } catch {
      // 默认颜色
      setPalette(['#7865F8', '#A991FF', '#C7B8FF', '#1A1628', '#120F1F', '#0A0812']);
    }
  }, []);

  // 点赞处理
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  // 返回按钮
  const handleBack = () => {
    window.history.back();
  };

  // 缩放控制
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 100%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 100%)' }}>
        <p className="text-xl mb-4" style={{ color: THEME.text.primary }}>作品未找到</p>
        <button onClick={handleBack} className="px-6 py-2 rounded-xl" style={THEME.gradientBtn}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 50%, #1A1628 100%)' }}>
      {/* 返回按钮 */}
      <motion.button
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(13, 10, 24, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(120, 101, 248, 0.3)',
          color: THEME.text.primary,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回</span>
      </motion.button>

      {/* ============ Hero展示区 ============ */}
      <section className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* 左侧：大图展示 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative group"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
            >
              <div
                className="relative rounded-2xl overflow-hidden cursor-zoom-in"
                style={{
                  aspectRatio: '4/5',
                  boxShadow: '0 25px 80px rgba(13, 10, 24, 0.6), 0 0 60px rgba(120, 101, 248, 0.15)',
                  border: '1px solid rgba(120, 101, 248, 0.2)',
                }}
                onClick={() => setShowFullscreen(true)}
              >
                <motion.img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.3s ease' }}
                  animate={{ scale: isHoveringImage ? 1.05 : 1 }}
                />
                
                {/* 放大提示 */}
                <AnimatePresence>
                  {isHoveringImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(13, 10, 24, 0.3)' }}
                    >
                      <div className="flex items-center gap-2 px-6 py-3 rounded-full" style={{ background: 'rgba(120, 101, 248, 0.9)' }}>
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">点击放大</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 悬浮操作按钮 */}
              <div className="flex justify-center gap-3 mt-4">
                <motion.button
                  onClick={handleZoomIn}
                  className="p-3 rounded-full"
                  style={{
                    background: 'rgba(26, 22, 40, 0.7)',
                    border: '1px solid rgba(120, 101, 248, 0.3)',
                    color: THEME.text.primary,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="放大"
                >
                  <ZoomIn className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setShowFullscreen(true)}
                  className="p-3 rounded-full"
                  style={{
                    background: 'rgba(26, 22, 40, 0.7)',
                    border: '1px solid rgba(120, 101, 248, 0.3)',
                    color: THEME.text.primary,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="全屏"
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* 右侧：作品信息 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* 标题 */}
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #ECE7FF 0%, #A991FF 50%, #7865F8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
                  }}
                >
                  {artwork.title}
                </h1>
                
                {/* 分类标签 */}
                <div className="flex flex-wrap gap-2">
                  {artwork.categories?.length > 0 ? (
                    artwork.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          background: 'rgba(120, 101, 248, 0.15)',
                          color: '#A991FF',
                          border: '1px solid rgba(120, 101, 248, 0.3)',
                        }}
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        background: 'rgba(120, 101, 248, 0.15)',
                        color: '#A991FF',
                        border: '1px solid rgba(120, 101, 248, 0.3)',
                      }}
                    >
                      {artwork.category}
                    </span>
                  )}
                </div>
              </div>

              {/* 日期 */}
              <p className="text-sm" style={{ color: THEME.text.muted }}>
                创建于 {artwork.date}
              </p>

              {/* 简介 */}
              {artwork.description && (
                <p className="leading-relaxed" style={{ color: THEME.text.secondary }}>
                  {artwork.description}
                </p>
              )}

              {/* 互动按钮 */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl"
                  style={{
                    background: isLiked ? 'rgba(255, 118, 118, 0.15)' : 'rgba(120, 101, 248, 0.15)',
                    border: `1px solid ${isLiked ? 'rgba(255, 118, 118, 0.4)' : 'rgba(120, 101, 248, 0.3)'}`,
                    color: isLiked ? '#FF7676' : THEME.text.primary,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likeCount}</span>
                </motion.button>

                <motion.button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl"
                  style={{
                    background: isBookmarked ? 'rgba(120, 101, 248, 0.2)' : 'rgba(120, 101, 248, 0.1)',
                    border: '1px solid rgba(120, 101, 248, 0.3)',
                    color: isBookmarked ? '#A991FF' : THEME.text.primary,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="font-medium">收藏</span>
                </motion.button>

                <motion.button
                  className="flex items-center gap-2 px-5 py-3 rounded-xl"
                  style={{
                    background: 'rgba(120, 101, 248, 0.1)',
                    border: '1px solid rgba(120, 101, 248, 0.3)',
                    color: THEME.text.primary,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">分享</span>
                </motion.button>
              </div>

              {/* 浏览量 */}
              <div className="flex items-center gap-2 text-sm" style={{ color: THEME.text.muted }}>
                <Eye className="w-4 h-4" />
                <span>{artwork.views || 0} 次浏览</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 创作信息卡片 ============ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6"
            style={THEME.card}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: THEME.text.primary }}>
              创作信息
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 模型 */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(13, 10, 24, 0.4)' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.text.muted }}>
                  模型
                </p>
                <p className="font-medium" style={{ color: THEME.text.primary }}>
                  {artwork.model || '未指定'}
                </p>
              </div>

              {/* 尺寸 */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(13, 10, 24, 0.4)' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.text.muted }}>
                  尺寸
                </p>
                <p className="font-medium" style={{ color: THEME.text.primary }}>
                  {artwork.dimensions || '未指定'}
                </p>
              </div>

              {/* 分类 */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(13, 10, 24, 0.4)' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.text.muted }}>
                  分类
                </p>
                <p className="font-medium" style={{ color: '#A991FF' }}>
                  {artwork.categories?.join(', ') || artwork.category}
                </p>
              </div>

              {/* 标签 */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(13, 10, 24, 0.4)' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.text.muted }}>
                  标签
                </p>
                <p className="font-medium" style={{ color: THEME.text.primary }}>
                  {artwork.tags.join(', ') || '无'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 创作思路模块 ============ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6"
            style={THEME.card}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: '#A991FF' }} />
              <h2 className="text-xl font-bold" style={{ color: THEME.text.primary }}>
                创作思路
              </h2>
            </div>

            <div className="relative pl-8 border-l-2" style={{ borderColor: 'rgba(120, 101, 248, 0.3)' }}>
              <div className="absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-[7px]" style={{ background: '#7865F8' }} />
              <p className="leading-relaxed" style={{ color: THEME.text.secondary }}>
                {artwork.description || '作者尚未添加创作思路...'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ Prompt展示模块 ============ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6"
            style={THEME.card}
          >
            <motion.button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-xl font-bold" style={{ color: THEME.text.primary }}>
                Prompt
              </h2>
              <motion.div
                animate={{ rotate: showPrompt ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: THEME.text.secondary }} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {/* 正向Prompt */}
                    {artwork.prompt && (
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#A991FF' }}>
                          正向 Prompt
                        </p>
                        <div
                          className="p-4 rounded-xl text-sm leading-relaxed"
                          style={{
                            background: 'rgba(13, 10, 24, 0.6)',
                            border: '1px solid rgba(120, 101, 248, 0.2)',
                            color: THEME.text.primary,
                          }}
                        >
                          {artwork.prompt}
                        </div>
                      </div>
                    )}

                    {/* 负向Prompt */}
                    {artwork.negativePrompt && (
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#FF7878' }}>
                          负向 Prompt
                        </p>
                        <div
                          className="p-4 rounded-xl text-sm leading-relaxed"
                          style={{
                            background: 'rgba(255, 120, 120, 0.08)',
                            border: '1px solid rgba(255, 120, 120, 0.2)',
                            color: THEME.text.primary,
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

      {/* ============ 主色板 ============ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6"
            style={THEME.card}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: THEME.text.primary }}>
              主色板
            </h2>

            <div className="flex gap-3">
              {palette.map((color, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 h-16 rounded-xl cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                  onClick={() => navigator.clipboard.writeText(color)}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="text-white text-xs font-medium">{color}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 墨璃推荐 ============ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6"
            style={{
              ...THEME.card,
              background: 'linear-gradient(135deg, rgba(120,101,248,0.1) 0%, rgba(169,145,255,0.05) 100%)',
            }}
          >
            <div className="flex items-start gap-4">
              {/* 墨璃头像 */}
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: '2px solid rgba(120,101,248,0.4)' }}
              >
                <img
                  src="/moli/moli-standby.png"
                  alt="墨璃"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 22%' }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium" style={{ color: THEME.text.primary }}>墨璃</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(120,101,248,0.2)', color: '#A991FF' }}>
                    AI 助手
                  </span>
                </div>
                <p className="text-sm italic" style={{ color: THEME.text.secondary }}>
                  {moliRecommend}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 相关推荐 ============ */}
      {relatedWorks.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold" style={{ color: THEME.text.primary }}>
                相关推荐
              </h2>
              <p className="text-sm mt-2" style={{ color: THEME.text.muted }}>
                基于分类和标签推荐的作品
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedWorks.map((work, index) => (
                <motion.a
                  key={work.id}
                  href={`/artwork/${work.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      aspectRatio: '4/5',
                      border: '1px solid rgba(120, 101, 248, 0.15)',
                    }}
                  >
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium truncate">
                        {work.title}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {work.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: 'rgba(120,101,248,0.6)',
                              color: '#ECE7FF',
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
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'rgba(120, 101, 248, 0.1)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm" style={{ color: THEME.text.muted }}>
            © 2025 胡歪歪 AI Studio. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ============ 全屏图片查看器 ============ */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(13, 10, 24, 0.98)' }}
            onClick={() => setShowFullscreen(false)}
          >
            <motion.button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-6 right-6 p-2 rounded-full"
              style={{
                background: 'rgba(26, 22, 40, 0.8)',
                border: '1px solid rgba(120, 101, 248, 0.3)',
                color: THEME.text.primary,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <div className="flex gap-4 absolute bottom-6 left-1/2 -translate-x-1/2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                className="p-3 rounded-full"
                style={{
                  background: 'rgba(26, 22, 40, 0.8)',
                  border: '1px solid rgba(120, 101, 248, 0.3)',
                  color: THEME.text.primary,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="w-5 h-5 rotate-180" />
              </motion.button>
              <span className="px-4 py-3 rounded-full text-sm" style={{ background: 'rgba(26, 22, 40, 0.8)', color: THEME.text.primary }}>
                {Math.round(imageZoom * 100)}%
              </span>
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                className="p-3 rounded-full"
                style={{
                  background: 'rgba(26, 22, 40, 0.8)',
                  border: '1px solid rgba(120, 101, 248, 0.3)',
                  color: THEME.text.primary,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.img
              src={artwork.image}
              alt={artwork.title}
              className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-in"
              style={{ transform: `scale(${imageZoom})`, transition: 'transform 0.3s ease' }}
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: imageZoom, opacity: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
