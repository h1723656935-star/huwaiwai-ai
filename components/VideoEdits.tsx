"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Film,
  Clock,
  Eye,
  Heart,
  Play,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Monitor,
  Scissors,
  Clapperboard,
  Star,
} from "lucide-react";
import * as worksService from "@/lib/worksService";
import type { VideoEdit } from "@/lib/worksService";

// ─── 软件图标映射 ────────────────────────────────────────
const SOFTWARE_ICONS: Record<string, React.ReactNode> = {
  "Premiere Pro": <Monitor size={14} />,
  "After Effects": <Sparkles size={14} />,
  "DaVinci Resolve": <Film size={14} />,
  "Final Cut Pro": <Clapperboard size={14} />,
  "剪映": <Scissors size={14} />,
  "CapCut": <Scissors size={14} />,
  default: <Layers size={14} />,
};

// ─── 分类配色 ──────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "MV剪辑": "#E8A87C",
  "Vlog": "#C4B5FD",
  "广告片": "#D4AF7A",
  "短片": "#A78BD9",
  "混剪": "#8B7AE0",
  "特效": "#5E3D8A",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || "#7865F8";
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231A1628'/%3E%3Cstop offset='100%25' stop-color='%232A1E40'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%235E3D8A' font-size='14' font-family='sans-serif'%3E视频加载中...%3C/text%3E%3C/svg%3E`;

const EASE = [0.16, 1, 0.3, 1] as const;

// ═══════════════════════════════════════════════════════════
//  PC端 VideoEditDetail 详情弹窗
// ═══════════════════════════════════════════════════════════
function VideoEditDetailPC({
  edit,
  onClose,
  allEdits,
}: {
  edit: VideoEdit;
  onClose: () => void;
  allEdits: VideoEdit[];
}) {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const related = useMemo(() => {
    return allEdits.filter((e) => e.id !== edit.id && e.category === edit.category).slice(0, 3);
  }, [allEdits, edit]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #141220 0%, #0C0A14 100%)",
          border: "1px solid rgba(120,101,248,0.12)",
        }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
        >
          <X size={18} className="text-white/60" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* 左侧：视频播放器 */}
          <div className="lg:w-2/3">
            <div className="relative w-full aspect-video bg-black rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none overflow-hidden">
              {!videoPlaying ? (
                <>
                  <img
                    src={edit.thumbnail || PLACEHOLDER_SVG}
                    alt={edit.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SVG; }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVideoPlaying(true)}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(120,101,248,0.9)",
                        boxShadow: "0 0 40px rgba(120,101,248,0.5)",
                      }}
                    >
                      <Play size={32} className="text-white ml-1" fill="white" />
                    </motion.button>
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-sm text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <Clock size={14} className="inline mr-1" />
                    {edit.duration}
                  </div>
                </>
              ) : (
                <video
                  src={edit.videoFile || edit.videoUrl || ''}
                  controls
                  autoPlay
                  preload="auto"
                  playsInline
                  className="w-full h-full"
                  poster={edit.thumbnail}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement;
                    console.error('Video playback error:', {
                      src: video.src,
                      error: video.error,
                      networkState: video.networkState,
                      readyState: video.readyState,
                    });
                  }}
                />
              )}
            </div>
          </div>

          {/* 右侧：信息面板 */}
          <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-medium tracking-wide"
                style={{
                  background: `${getCategoryColor(edit.category)}15`,
                  color: getCategoryColor(edit.category),
                  border: `1px solid ${getCategoryColor(edit.category)}30`,
                }}
              >
                {edit.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {edit.title}
            </h2>
            {edit.description && (
              <p className="text-sm text-white/40 leading-relaxed mb-4">{edit.description}</p>
            )}

            {/* 元信息 */}
            <div className="flex items-center gap-4 mb-5 text-sm text-white/30">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {edit.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {edit.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(edit.created_at || Date.now()).toLocaleDateString("zh-CN")}
              </span>
            </div>

            {/* 软件标签 */}
            {edit.software && edit.software.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] uppercase tracking-wider text-white/20 mb-2">使用软件</p>
                <div className="flex flex-wrap gap-2">
                  {edit.software.map((sw) => (
                    <span
                      key={sw}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {SOFTWARE_ICONS[sw] || SOFTWARE_ICONS.default}
                      {sw}
                    </span>
                  ))}
                </div>
              </div>
            )}



            {/* 标签 */}
            {edit.tags && edit.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {edit.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "rgba(120,101,248,0.08)", color: "#A78BD9" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 相关推荐 */}
            {related.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[11px] uppercase tracking-wider text-white/20 mb-3">相关推荐</p>
                <div className="space-y-2">
                  {related.map((rel) => (
                    <div key={rel.id} className="flex gap-3 cursor-pointer group" onClick={() => { setVideoPlaying(false); }}>
                      <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={rel.thumbnail || PLACEHOLDER_SVG} alt={rel.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate group-hover:text-white/80 transition-colors">{rel.title}</p>
                        <p className="text-[10px] text-white/20">{rel.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PC端 VideoEdits 主组件
// ═══════════════════════════════════════════════════════════

export default function VideoEdits() {
  const [edits, setEdits] = useState<VideoEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedEdit, setSelectedEdit] = useState<VideoEdit | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const categories = useMemo(() => {
    const set = new Set(edits.map((e) => e.category).filter(Boolean));
    return ["全部", ...Array.from(set)];
  }, [edits]);

  const filteredEdits = useMemo(() => {
    if (activeCategory === "全部") return edits;
    return edits.filter((e) => e.category === activeCategory);
  }, [edits, activeCategory]);

  const featured = useMemo(() => edits.slice(0, 3), [edits]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await worksService.getVideoEdits();
        setEdits(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section
      id="video-edits"
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(120,101,248,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* ─── Section Header ─── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(120,101,248,0.1)", border: "1px solid rgba(120,101,248,0.15)" }}>
              <Film size={20} className="text-[#C4B5FD]" />
            </div>
            <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(196,181,253,0.5)", fontFamily: "var(--font-en)" }}>
              Video Editing
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-light mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #E8DEED 0%, #C4B5FD 50%, #A78BD9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            视频剪辑作品
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-sm leading-relaxed">
            每一帧都是叙事，每一刀都是节奏。探索影视后期的创作世界，从剪辑思路到成片的全过程。
          </p>
        </motion.div>

        {/* ─── Featured 横向电影卡片 ─── */}
        {!loading && featured.length > 0 && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#D4AF7A]" />
                <h3 className="text-lg font-medium text-white/70" style={{ fontFamily: "var(--font-display)" }}>
                  精选作品
                </h3>
              </div>
              <span className="text-xs text-white/20">{featured.length} 部精选</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((edit, i) => (
                <motion.div
                  key={edit.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "16/10" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}
                  onClick={() => setSelectedEdit(edit)}
                  onMouseEnter={() => setHoveredId(edit.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <img
                    src={edit.thumbnail || PLACEHOLDER_SVG}
                    alt={edit.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SVG; }}
                  />
                  {/* 渐变遮罩 */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: hoveredId === edit.id
                        ? "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)"
                        : "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)",
                    }}
                  />
                  {/* 播放按钮 */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredId === edit.id ? "opacity-100" : "opacity-0"}`}>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(120,101,248,0.9)",
                        boxShadow: "0 0 30px rgba(120,101,248,0.4)",
                      }}
                    >
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  {/* 底部信息 */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${getCategoryColor(edit.category)}25`,
                          color: getCategoryColor(edit.category),
                          border: `1px solid ${getCategoryColor(edit.category)}40`,
                        }}
                      >
                        {edit.category}
                      </span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Clock size={10} />
                        {edit.duration}
                      </span>
                    </div>
                    <h4 className="text-base font-medium text-white mb-1 truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {edit.title}
                    </h4>
                    <p className="text-xs text-white/30 line-clamp-1">{edit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── 分类筛选 ─── */}
        <motion.div
          className="flex justify-center gap-2 mb-10 flex-wrap"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat ? "rgba(120,101,248,0.15)" : "rgba(255,255,255,0.03)",
                color: activeCategory === cat ? "#C4B5FD" : "rgba(255,255,255,0.4)",
                border: activeCategory === cat ? "1px solid rgba(120,101,248,0.25)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* ─── 作品列表（横向卡片） ─── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-[#7865F8]/20 border-t-[#7865F8] rounded-full"
            />
          </div>
        ) : filteredEdits.length === 0 ? (
          <div className="text-center py-20">
            <Film size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30">暂无视频剪辑作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEdits.map((edit, i) => (
              <motion.div
                key={edit.id}
                className="group flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.04]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: EASE }}
                onClick={() => setSelectedEdit(edit)}
              >
                {/* 缩略图 */}
                <div className="flex-shrink-0 w-40 h-24 rounded-xl overflow-hidden relative">
                  <img
                    src={edit.thumbnail || PLACEHOLDER_SVG}
                    alt={edit.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SVG; }}
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                    {edit.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
                    <Play size={20} className="text-white" fill="white" />
                  </div>
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${getCategoryColor(edit.category)}15`,
                        color: getCategoryColor(edit.category),
                      }}
                    >
                      {edit.category}
                    </span>
                    {edit.software && edit.software[0] && (
                      <span className="text-[10px] text-white/20 flex items-center gap-1">
                        {SOFTWARE_ICONS[edit.software[0]] || SOFTWARE_ICONS.default}
                        {edit.software[0]}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-[#C4B5FD] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                    {edit.title}
                  </h4>
                  {edit.description && (
                    <p className="text-xs text-white/25 mt-1 line-clamp-1">{edit.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/15 flex items-center gap-1">
                      <Eye size={10} />
                      {edit.views || 0}
                    </span>
                    <span className="text-[10px] text-white/15 flex items-center gap-1">
                      <Heart size={10} />
                      {edit.likes || 0}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 详情弹窗 ─── */}
      <AnimatePresence>
        {selectedEdit && (
          <VideoEditDetailPC
            edit={selectedEdit}
            onClose={() => setSelectedEdit(null)}
            allEdits={edits}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
