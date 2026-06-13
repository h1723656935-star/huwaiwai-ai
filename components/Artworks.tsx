"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Sparkles, Heart, Bookmark, Eye } from 'lucide-react';
import { getArtworks } from '@/lib/worksService';
import type { Artwork } from '@/lib/worksService';

// 标签配色方案 - 让不同标签有不同颜色突出
const TAG_PALETTE = [
  { bg: 'rgba(120, 101, 248, 0.95)', text: '#FFFFFF', shadow: 'rgba(120, 101, 248, 0.4)' },     // 紫 #7865F8
  { bg: 'rgba(236, 72, 153, 0.95)', text: '#FFFFFF', shadow: 'rgba(236, 72, 153, 0.4)' },          // 粉 #EC4899
  { bg: 'rgba(34, 197, 94, 0.95)', text: '#FFFFFF', shadow: 'rgba(34, 197, 94, 0.4)' },            // 绿 #22C55E
  { bg: 'rgba(251, 146, 60, 0.95)', text: '#FFFFFF', shadow: 'rgba(251, 146, 60, 0.4)' },          // 橙 #FB923C
  { bg: 'rgba(14, 165, 233, 0.95)', text: '#FFFFFF', shadow: 'rgba(14, 165, 233, 0.4)' },          // 蓝 #0EA5E9
  { bg: 'rgba(168, 85, 247, 0.95)', text: '#FFFFFF', shadow: 'rgba(168, 85, 247, 0.4)' },          // 紫红 #A855F7
  { bg: 'rgba(245, 158, 11, 0.95)', text: '#1A1628', shadow: 'rgba(245, 158, 11, 0.4)' },          // 黄 #F59E0B
  { bg: 'rgba(244, 63, 94, 0.95)', text: '#FFFFFF', shadow: 'rgba(244, 63, 94, 0.4)' },            // 玫红 #F43F5E
  { bg: 'rgba(20, 184, 166, 0.95)', text: '#FFFFFF', shadow: 'rgba(20, 184, 166, 0.4)' },          // 青 #14B8A6
  { bg: 'rgba(99, 102, 241, 0.95)', text: '#FFFFFF', shadow: 'rgba(99, 102, 241, 0.4)' },          // 蓝紫 #6366F1
];

// 分类配色（用于作品分类）
const CATEGORY_PALETTE = [
  { bg: 'rgba(120, 101, 248, 0.9)', text: '#FFFFFF' },   // 紫色
  { bg: 'rgba(34, 197, 94, 0.9)', text: '#FFFFFF' },     // 绿色
  { bg: 'rgba(251, 146, 60, 0.9)', text: '#FFFFFF' },    // 橙色
  { bg: 'rgba(14, 165, 233, 0.9)', text: '#FFFFFF' },    // 蓝色
  { bg: 'rgba(236, 72, 153, 0.9)', text: '#FFFFFF' },    // 粉色
];

// 基于字符串 hash 稳定地选择一个颜色
function hashIndex(str: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function getTagColor(tag: string) {
  return TAG_PALETTE[hashIndex(tag, TAG_PALETTE.length)];
}

function getCategoryColor(category: string) {
  return CATEGORY_PALETTE[hashIndex(category, CATEGORY_PALETTE.length)];
}

interface CardProps {
  work: Artwork;
  index: number;
  onClick: () => void;
}

function ArtworkCard({ work, index, onClick }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 30;
      const rotateY = (centerX - e.clientX) / 30;
      setTransform({
        rotateX: Math.max(-15, Math.min(15, rotateX)),
        rotateY: Math.max(-15, Math.min(15, rotateY)),
        translateY: -8,
      });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0, translateY: 0 });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      key={work.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-moli overflow-hidden cursor-pointer artwork-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        rotateX: transform.rotateX,
        rotateY: transform.rotateY,
        y: transform.translateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ transform: 'translateZ(20px)' }}
      >
        <motion.img
          src={work.image}
          alt={work.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* 底部渐变蒙层 - hover 时显示 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark/95 via-dark/60 to-transparent pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* hover 时显示的标签条 - 底部 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 p-4 pointer-events-none"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <p className="text-foreground text-sm font-semibold truncate mb-2" style={{ letterSpacing: '-0.01em' }}>
            {work.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(work.categories && work.categories.length > 0
              ? work.categories
              : work.category
                ? [work.category]
                : []
            ).map((cat) => {
              const color = getCategoryColor(cat);
              return (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: color.bg,
                    backdropFilter: 'blur(8px)',
                    color: color.text,
                    boxShadow: `0 2px 8px ${color.bg.replace('0.9', '0.3')}`,
                  }}
                >
                  {cat}
                </span>
              );
            })}
            {work.tags && work.tags.slice(0, 2).map((tag) => {
              const color = getTagColor(tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: color.bg,
                    backdropFilter: 'blur(8px)',
                    color: color.text,
                    boxShadow: `0 2px 8px ${color.shadow}`,
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="p-5" style={{ transform: 'translateZ(10px)' }}>
        <motion.h3
          className="font-semibold text-lg text-foreground truncate"
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {work.title}
        </motion.h3>
        {work.categories && work.categories.length > 0 ? (
          <motion.div
            className="flex items-center gap-1.5 mt-2 flex-wrap"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {work.categories.map((cat) => {
              const color = getCategoryColor(cat);
              return (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: color.bg.replace('0.9', '0.15'),
                    color: color.bg.replace('0.9', '1'),
                  }}
                >
                  {cat}
                </span>
              );
            })}
            {work.tags && work.tags.slice(0, 3).map((tag) => {
              const color = getTagColor(tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: color.bg.replace('0.95', '0.12'),
                    color: color.bg.replace('0.95', '1'),
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </motion.div>
        ) : work.category ? (
          <motion.div
            className="flex items-center gap-1.5 mt-2 flex-wrap"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const color = getCategoryColor(work.category);
              return (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: color.bg.replace('0.9', '0.15'),
                    color: color.bg.replace('0.9', '1'),
                  }}
                >
                  {work.category}
                </span>
              );
            })()}
            {work.tags && work.tags.slice(0, 3).map((tag) => {
              const color = getTagColor(tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: color.bg.replace('0.95', '0.12'),
                    color: color.bg.replace('0.95', '1'),
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Artworks() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedWork, setSelectedWork] = useState<Artwork | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  // 当弹窗打开时，初始化点赞/收藏状态
  useEffect(() => {
    if (selectedWork) {
      setIsLiked(selectedWork.liked || false);
      setIsBookmarked(false);
    }
  }, [selectedWork]);

  useEffect(() => {
    fetchArtworks();
  }, []);

  // 监听上传事件 - admin 上传/编辑/删除后自动刷新首页
  useEffect(() => {
    const handleArtworksUpdated = () => {
      fetchArtworks();
    };
    window.addEventListener('artworks-updated', handleArtworksUpdated);
    window.addEventListener('storage', (e) => {
      if (e.key === 'userArtworks' || e.key === null) fetchArtworks();
    });
    return () => {
      window.removeEventListener('artworks-updated', handleArtworksUpdated);
    };
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const dbArtworks = await getArtworks();
      const stored = localStorage.getItem('userArtworks');
      const localArtworks: Artwork[] = stored ? JSON.parse(stored) : [];
      const artworkMap = new Map<string, Artwork>();
      localArtworks.forEach(a => artworkMap.set(a.id, a));
      dbArtworks.forEach(a => artworkMap.set(a.id, a));
      setArtworks(Array.from(artworkMap.values()));
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      const stored = localStorage.getItem('userArtworks');
      setArtworks(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const getDynamicCategories = (): string[] => {
    const cats = new Set<string>();
    cats.add('全部');
    artworks.forEach(w => { if (w.category) cats.add(w.category); });
    try {
      const stored = localStorage.getItem('imageCategories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: string) => cats.add(c));
        }
      }
    } catch { /* ignore */ }
    return Array.from(cats);
  };

  const categories = getDynamicCategories();

  const filteredArtworks = activeCategory === '全部'
    ? artworks
    : artworks.filter((work) => {
        const cats = work.categories || (work.category ? [work.category] : []);
        return cats.includes(activeCategory);
      });

  return (
    <section id="artworks" className="py-24 px-4 gradient-bg-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-secondary font-medium mb-4 text-lg tracking-wider"
          >
            AI Art Gallery
          </motion.p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-title mb-4">
            AI绘画作品
          </h2>
          <p className="text-foreground-subtle max-w-2xl mx-auto text-lg">
            探索二次元美学与梦幻表达，每一幅作品都承载着独特的创作灵感
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <motion.a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-foreground-muted hover:text-foreground hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>+</span> 上传作品
            </motion.a>
            <motion.button
              onClick={fetchArtworks}
              className="inline-flex items-center gap-2 px-6 py-3 card-moli text-foreground-muted hover:text-foreground hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              ↻ 刷新
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'gradient-btn shadow-lg'
                  : 'card-moli text-foreground-muted hover:text-foreground hover:border-primary'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <motion.div
              className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArtworks.map((work, index) => (
              <ArtworkCard
                key={work.id}
                work={work}
                index={index}
                onClick={() => setSelectedWork(work)}
              />
            ))}
          </motion.div>
        )}

        {!loading && filteredArtworks.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-foreground-subtle mt-12 text-lg"
          >
            {activeCategory === '全部' ? '暂无作品，快去上传吧！' : `暂无"${activeCategory}"分类的作品`}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(13, 10, 24, 0.92)', backdropFilter: 'blur(16px)' }}
            onClick={() => setSelectedWork(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-7xl h-[90vh] max-h-[900px] rounded-2xl overflow-hidden flex flex-col md:flex-row"
              style={{
                background: 'linear-gradient(180deg, #1A1628 0%, #120F1F 100%)',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(120, 101, 248, 0.1)',
                border: '1px solid rgba(120, 101, 248, 0.2)',
              }}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(13, 10, 24, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(120, 101, 248, 0.3)',
                  color: '#ECE7FF',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* ============ 左侧：大图 (65%) ============ */}
              <div
                className="md:flex-[1.857] flex-shrink-0 flex items-center justify-center p-6 md:p-8"
                style={{ background: 'rgba(0, 0, 0, 0.4)' }}
              >
                <motion.img
                  src={selectedWork.image}
                  alt={selectedWork.title}
                  className="w-full h-full max-h-full object-contain rounded-xl"
                  style={{ maxHeight: 'calc(90vh - 64px)' }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* ============ 右侧：作品信息 (35%) ============ */}
              <div
                className="md:flex-1 md:max-w-md flex-shrink-0 overflow-y-auto p-6 md:p-8 space-y-5"
                style={{
                  borderLeft: '1px solid rgba(120, 101, 248, 0.12)',
                  background: 'rgba(13, 10, 24, 0.5)',
                }}
              >
                {/* 标题 */}
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #ECE7FF 0%, #A991FF 50%, #7865F8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {selectedWork.title}
                  </h2>

                  <div className="flex flex-wrap gap-1.5">
                    {(selectedWork.categories && selectedWork.categories.length > 0
                      ? selectedWork.categories
                      : selectedWork.category
                        ? [selectedWork.category]
                        : []
                    ).map((cat) => {
                      const color = getCategoryColor(cat);
                      return (
                        <span
                          key={cat}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: color.bg,
                            color: color.text,
                            boxShadow: `0 2px 8px ${color.bg.replace('0.9', '0.3')}`,
                          }}
                        >
                          {cat}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 描述 */}
                {selectedWork.description && (
                  <p className="text-sm leading-relaxed" style={{ color: '#C7B8FF' }}>
                    {selectedWork.description}
                  </p>
                )}

                {/* 互动按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: isLiked ? 'rgba(255, 118, 118, 0.15)' : 'rgba(120, 101, 248, 0.1)',
                      border: `1px solid ${isLiked ? 'rgba(255, 118, 118, 0.4)' : 'rgba(120, 101, 248, 0.25)'}`,
                      color: isLiked ? '#FF7676' : '#ECE7FF',
                    }}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{(selectedWork.likes || 0) + (isLiked && !selectedWork.liked ? 1 : 0)}</span>
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: isBookmarked ? 'rgba(120, 101, 248, 0.2)' : 'rgba(120, 101, 248, 0.08)',
                      border: `1px solid ${isBookmarked ? 'rgba(120, 101, 248, 0.4)' : 'rgba(120, 101, 248, 0.2)'}`,
                      color: '#A991FF',
                    }}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>收藏</span>
                  </button>
                  <a
                    href={`/artwork/${selectedWork.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: 'rgba(120, 101, 248, 0.08)',
                      border: '1px solid rgba(120, 101, 248, 0.2)',
                      color: '#ECE7FF',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>详情页</span>
                  </a>
                </div>

                {/* 创作信息 */}
                {(selectedWork.model || selectedWork.dimensions || (selectedWork.tags && selectedWork.tags.length > 0)) && (
                  <div
                    className="rounded-xl p-3 space-y-2"
                    style={{
                      background: 'rgba(120, 101, 248, 0.05)',
                      border: '1px solid rgba(120, 101, 248, 0.12)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: '#A991FF' }} />
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: '#A991FF' }}>
                        创作信息
                      </p>
                    </div>
                    {selectedWork.model && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'rgba(199, 184, 255, 0.7)' }}>模型</span>
                        <span style={{ color: '#ECE7FF' }}>{selectedWork.model}</span>
                      </div>
                    )}
                    {selectedWork.dimensions && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'rgba(199, 184, 255, 0.7)' }}>尺寸</span>
                        <span style={{ color: '#ECE7FF' }}>{selectedWork.dimensions}</span>
                      </div>
                    )}
                    {selectedWork.date && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'rgba(199, 184, 255, 0.7)' }}>日期</span>
                        <span style={{ color: '#ECE7FF' }}>{selectedWork.date}</span>
                      </div>
                    )}
                    {selectedWork.tags && selectedWork.tags.length > 0 && (
                      <div className="flex items-start justify-between text-xs gap-2">
                        <span style={{ color: 'rgba(199, 184, 255, 0.7)' }}>标签</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                          {selectedWork.tags.map((tag) => {
                            const color = getTagColor(tag);
                            return (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                style={{
                                  background: color.bg,
                                  color: color.text,
                                }}
                              >
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 正向 Prompt */}
                {selectedWork.prompt && (
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(13, 10, 24, 0.6)',
                      border: '1px solid rgba(120, 101, 248, 0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: '#A991FF' }}>
                        Positive Prompt
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedWork.prompt!, 'positive')}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                        style={{
                          background: copiedField === 'positive' ? 'rgba(120, 101, 248, 0.2)' : 'rgba(120, 101, 248, 0.08)',
                          color: copiedField === 'positive' ? '#A991FF' : 'rgba(199, 184, 255, 0.8)',
                          border: '1px solid rgba(120, 101, 248, 0.25)',
                        }}
                      >
                        {copiedField === 'positive' ? (
                          <><Check className="w-3 h-3" /> 已复制</>
                        ) : (
                          <><Copy className="w-3 h-3" /> 复制</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed font-mono" style={{ color: 'rgba(236, 231, 255, 0.85)' }}>
                      {selectedWork.prompt}
                    </p>
                  </div>
                )}

                {/* 负向 Prompt */}
                {selectedWork.negativePrompt && (
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(255, 120, 120, 0.04)',
                      border: '1px solid rgba(255, 120, 120, 0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: '#FF7878' }}>
                        Negative Prompt
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedWork.negativePrompt!, 'negative')}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                        style={{
                          background: copiedField === 'negative' ? 'rgba(255, 120, 120, 0.2)' : 'rgba(120, 101, 248, 0.08)',
                          color: copiedField === 'negative' ? '#FF7878' : 'rgba(199, 184, 255, 0.8)',
                          border: '1px solid rgba(255, 120, 120, 0.3)',
                        }}
                      >
                        {copiedField === 'negative' ? (
                          <><Check className="w-3 h-3" /> 已复制</>
                        ) : (
                          <><Copy className="w-3 h-3" /> 复制</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed font-mono" style={{ color: 'rgba(236, 231, 255, 0.7)' }}>
                      {selectedWork.negativePrompt}
                    </p>
                  </div>
                )}

                {/* 提示：没有完整信息时显示 */}
                {!selectedWork.prompt && !selectedWork.description && !selectedWork.model && (
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{
                      background: 'rgba(120, 101, 248, 0.05)',
                      border: '1px dashed rgba(120, 101, 248, 0.2)',
                    }}
                  >
                    <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: '#A991FF' }} />
                    <p className="text-xs" style={{ color: 'rgba(199, 184, 255, 0.7)' }}>
                      该作品暂无详细创作信息
                    </p>
                    <a
                      href={`/artwork/${selectedWork.id}`}
                      className="inline-block mt-2 text-xs"
                      style={{ color: '#A991FF', textDecoration: 'underline' }}
                    >
                      在详情页查看完整信息 →
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
