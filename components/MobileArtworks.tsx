"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtworks } from '@/lib/worksService';
import type { Artwork } from '@/lib/worksService';
import { Copy, Check, X, Sparkles, Heart, Bookmark, Eye, ChevronDown, ChevronUp } from 'lucide-react';

// 标签配色方案
const TAG_PALETTE = [
  { bg: 'rgba(120, 101, 248, 0.9)', text: '#FFF' },
  { bg: 'rgba(236, 72, 153, 0.9)', text: '#FFF' },
  { bg: 'rgba(34, 197, 94, 0.9)', text: '#FFF' },
  { bg: 'rgba(251, 146, 60, 0.9)', text: '#FFF' },
  { bg: 'rgba(14, 165, 233, 0.9)', text: '#FFF' },
  { bg: 'rgba(168, 85, 247, 0.9)', text: '#FFF' },
  { bg: 'rgba(245, 158, 11, 0.9)', text: '#1A1628' },
  { bg: 'rgba(244, 63, 94, 0.9)', text: '#FFF' },
  { bg: 'rgba(20, 184, 166, 0.9)', text: '#FFF' },
  { bg: 'rgba(99, 102, 241, 0.9)', text: '#FFF' },
];

const CATEGORY_PALETTE = [
  { bg: 'rgba(120, 101, 248, 0.9)', text: '#FFF' },
  { bg: 'rgba(34, 197, 94, 0.9)', text: '#FFF' },
  { bg: 'rgba(251, 146, 60, 0.9)', text: '#FFF' },
  { bg: 'rgba(14, 165, 233, 0.9)', text: '#FFF' },
  { bg: 'rgba(236, 72, 153, 0.9)', text: '#FFF' },
];

function hashIndex(str: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function getTagColor(tag: string): React.CSSProperties {
  const c = TAG_PALETTE[hashIndex(tag, TAG_PALETTE.length)];
  return { backgroundColor: c.bg, color: c.text };
}

function getCategoryColor(category: string): React.CSSProperties {
  const c = CATEGORY_PALETTE[hashIndex(category, CATEGORY_PALETTE.length)];
  return { backgroundColor: c.bg, color: c.text };
}

// 瀑布流列分配
function distributeToColumns(works: Artwork[], colCount: number): Artwork[][] {
  const cols: Artwork[][] = Array.from({ length: colCount }, () => []);
  const colHeights = new Array(colCount).fill(0);

  works.forEach((work) => {
    // 找到最短列
    let minCol = 0;
    for (let i = 1; i < colCount; i++) {
      if (colHeights[i] < colHeights[minCol]) minCol = i;
    }
    cols[minCol].push(work);
    // 估算高度（根据图片比例，默认 1.3）
    colHeights[minCol] += 1.3;
  });

  return cols;
}

export default function MobileArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedWork, setSelectedWork] = useState<Artwork | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const data = await getArtworks();
      setArtworks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  // 监听 admin 更新
  useEffect(() => {
    const handler = () => fetchArtworks();
    window.addEventListener('artworks-updated', handler);
    return () => window.removeEventListener('artworks-updated', handler);
  }, []);

  const categories = ['全部', ...Array.from(new Set(
    artworks.flatMap(w => w.categories || (w.category ? [w.category] : []))
  ))];

  const filteredArtworks = activeCategory === '全部'
    ? artworks
    : artworks.filter(w => {
        const cats = w.categories || (w.category ? [w.category] : []);
        return cats.includes(activeCategory);
      });

  const columns = distributeToColumns(filteredArtworks, 2);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  return (
    <section id="artworks" className="pb-24 bg-[#0D0A18]">
      {/* 标题 */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-[#A991FF]/60 text-xs font-medium tracking-[0.2em] uppercase mb-1">
          AI Art Gallery
        </p>
        <h2 className="text-xl font-bold text-white mb-1">AI绘画作品</h2>
        <p className="text-[#C7B8FF]/40 text-xs">探索二次元美学与梦幻表达</p>
      </div>

      {/* 分类筛选 - 横向滚动 */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: activeCategory === cat
                ? 'linear-gradient(135deg, #7865F8, #A991FF)'
                : 'rgba(255,255,255,0.06)',
              color: activeCategory === cat ? '#FFF' : 'rgba(199,184,255,0.6)',
            }}
            whileTap={{ scale: 0.92 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* 2列瀑布流 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#7865F8]/20 border-t-[#7865F8] rounded-full"
          />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#C7B8FF]/40 text-sm">暂无作品</p>
        </div>
      ) : (
        <div className="flex gap-2 px-2">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-2">
              {col.map((work) => (
                <motion.div
                  key={work.id}
                  className="rounded-xl overflow-hidden relative"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setSelectedWork(work)}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full object-cover"
                    style={{ display: 'block' }}
                    loading="lazy"
                  />
                  {/* 底部渐变 + 标题 */}
                  <div className="absolute bottom-0 left-0 right-0 p-2"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    }}
                  >
                    <p className="text-white text-xs font-medium truncate">{work.title}</p>
                    {(work.categories?.[0] || work.category) && (
                      <span
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5"
                        style={getCategoryColor(work.categories?.[0] || work.category || '')}
                      >
                        {work.categories?.[0] || work.category}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 作品详情弹窗 - 移动端单列布局 */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-[#0D0A18]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* 顶部导航栏 */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0D0A18]/95 backdrop-blur-xl border-b border-white/5">
              <motion.button
                onClick={() => { setSelectedWork(null); setPromptExpanded(false); }}
                className="p-2 -ml-2"
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <X className="w-5 h-5 text-[#C7B8FF]/60" />
              </motion.button>
              <span className="text-sm font-medium text-white truncate max-w-[200px]">
                {selectedWork.title}
              </span>
              <motion.a
                href={`/artwork/${selectedWork.id}`}
                className="p-2 -mr-2"
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Eye className="w-5 h-5 text-[#A991FF]" />
              </motion.a>
            </div>

            {/* 滚动内容区 */}
            <div className="flex-1 overflow-y-auto">
              {/* 大图 */}
              <img
                src={selectedWork.image}
                alt={selectedWork.title}
                className="w-full object-cover"
                style={{ maxHeight: '60vh' }}
              />

              <div className="px-4 py-4 space-y-4">
                {/* 标题和分类 */}
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">{selectedWork.title}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedWork.categories || (selectedWork.category ? [selectedWork.category] : []))
                      .map((cat) => (
                        <span
                          key={cat}
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={getCategoryColor(cat)}
                        >
                          {cat}
                        </span>
                      ))}
                  </div>
                </div>

                {/* 互动按钮 */}
                <div className="flex gap-2">
                  <motion.button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(199,184,255,0.7)' }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <Heart className="w-3.5 h-3.5" /> 0
                  </motion.button>
                  <motion.button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(199,184,255,0.7)' }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <Bookmark className="w-3.5 h-3.5" /> 收藏
                  </motion.button>
                </div>

                {/* 描述 */}
                {selectedWork.description && (
                  <p className="text-sm text-[#C7B8FF]/70 leading-relaxed">
                    {selectedWork.description}
                  </p>
                )}

                {/* 标签 */}
                {selectedWork.tags && selectedWork.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWork.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={getTagColor(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 创作信息卡片 */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#A991FF]" />
                    <span className="text-xs font-medium text-[#A991FF]">创作信息</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {selectedWork.date && (
                      <div className="flex justify-between">
                        <span className="text-[#C7B8FF]/50">日期</span>
                        <span className="text-[#C7B8FF]/80">{selectedWork.date}</span>
                      </div>
                    )}
                    {selectedWork.model && (
                      <div className="flex justify-between">
                        <span className="text-[#C7B8FF]/50">模型</span>
                        <span className="text-[#C7B8FF]/80">{selectedWork.model}</span>
                      </div>
                    )}
                    {selectedWork.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-[#C7B8FF]/50">尺寸</span>
                        <span className="text-[#C7B8FF]/80">{selectedWork.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prompt 折叠模块 */}
                {(selectedWork.prompt || selectedWork.negativePrompt) && (
                  <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <motion.button
                      onClick={() => setPromptExpanded(!promptExpanded)}
                      className="w-full flex items-center justify-between px-3 py-3"
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A991FF]" />
                        <span className="text-xs font-medium text-[#A991FF]">Prompt</span>
                      </div>
                      {promptExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#C7B8FF]/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#C7B8FF]/40" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {promptExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-3">
                            {selectedWork.prompt && (
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A991FF]">Positive</span>
                                  <motion.button
                                    onClick={() => copyToClipboard(selectedWork.prompt!, 'pos')}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                                    style={{
                                      background: copiedField === 'pos' ? 'rgba(120,101,248,0.2)' : 'rgba(120,101,248,0.08)',
                                      color: copiedField === 'pos' ? '#A991FF' : 'rgba(199,184,255,0.6)',
                                    }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                  >
                                    {copiedField === 'pos' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                                  </motion.button>
                                </div>
                                <p className="text-xs text-[#C7B8FF]/70 font-mono leading-relaxed p-2 rounded-lg"
                                  style={{ background: 'rgba(120,101,248,0.06)' }}>
                                  {selectedWork.prompt}
                                </p>
                              </div>
                            )}
                            {selectedWork.negativePrompt && (
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FF7878]">Negative</span>
                                  <motion.button
                                    onClick={() => copyToClipboard(selectedWork.negativePrompt!, 'neg')}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                                    style={{
                                      background: copiedField === 'neg' ? 'rgba(255,120,120,0.2)' : 'rgba(255,120,120,0.08)',
                                      color: copiedField === 'neg' ? '#FF7878' : 'rgba(199,184,255,0.6)',
                                    }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                  >
                                    {copiedField === 'neg' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                                  </motion.button>
                                </div>
                                <p className="text-xs text-[#C7B8FF]/70 font-mono leading-relaxed p-2 rounded-lg"
                                  style={{ background: 'rgba(255,120,120,0.04)' }}>
                                  {selectedWork.negativePrompt}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
