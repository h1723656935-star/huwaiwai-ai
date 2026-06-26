"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Clock,
  Eye,
  Heart,
  Play,
  X,
  ChevronRight,
  Sparkles,
  Wand2,
  Layers,
  Monitor,
  Scissors,
  Clapperboard,
  Star,
  TrendingUp,
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

// ─── 图片加载 Hook ─────────────────────────────────────
function useImageLoad(src: string) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;
  }, [src]);
  return status;
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231A1628'/%3E%3Cstop offset='100%25' stop-color='%232A1E40'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%235E3D8A' font-size='14' font-family='sans-serif'%3E视频加载中...%3C/text%3E%3C/svg%3E`;

// ═══════════════════════════════════════════════════════════
//  VideoEditDetail 详情弹窗
// ═══════════════════════════════════════════════════════════
function VideoEditDetail({
  edit,
  onClose,
  allEdits,
}: {
  edit: VideoEdit;
  onClose: () => void;
  allEdits: VideoEdit[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "prompt" | "workflow">("overview");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const related = useMemo(() => {
    return allEdits
      .filter((e) => e.id !== edit.id && e.category === edit.category)
      .slice(0, 4);
  }, [allEdits, edit]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* 内容面板 */}
      <motion.div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl"
        style={{
          background: "linear-gradient(180deg, #141220 0%, #0C0A14 100%)",
          borderTop: "1px solid rgba(120,101,248,0.15)",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
        >
          <X size={16} className="text-white/60" />
        </button>

        {/* 视频播放器区域 */}
        <div className="relative w-full aspect-video bg-black">
          {!videoPlaying ? (
            <>
              <img
                src={edit.thumbnail || PLACEHOLDER_SVG}
                alt={edit.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
                }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setVideoPlaying(true)}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(120,101,248,0.9)",
                    boxShadow: "0 0 30px rgba(120,101,248,0.4)",
                  }}
                >
                  <Play size={28} className="text-white ml-1" fill="white" />
                </motion.button>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                <Clock size={12} className="inline mr-1" />
                {edit.duration}
              </div>
            </>
          ) : (
            <video
              src={edit.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              poster={edit.thumbnail}
            />
          )}
        </div>

        {/* 标题与元信息 */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide"
              style={{
                background: `${getCategoryColor(edit.category)}20`,
                color: getCategoryColor(edit.category),
                border: `1px solid ${getCategoryColor(edit.category)}40`,
              }}
            >
              {edit.category}
            </span>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Eye size={12} />
              <span>{edit.views || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Heart size={12} />
              <span>{edit.likes || 0}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {edit.title}
          </h2>
          {edit.description && (
            <p className="text-sm text-white/50 mt-2 leading-relaxed">{edit.description}</p>
          )}
        </div>

        {/* 软件标签 */}
        {edit.software && edit.software.length > 0 && (
          <div className="px-5 pb-3">
            <div className="flex flex-wrap gap-2">
              {edit.software.map((sw) => (
                <span
                  key={sw}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {SOFTWARE_ICONS[sw] || SOFTWARE_ICONS.default}
                  {sw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 导航 */}
        <div className="px-5 pb-2">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["overview", "prompt", "workflow"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: activeTab === tab ? "rgba(120,101,248,0.2)" : "transparent",
                  color: activeTab === tab ? "#C4B5FD" : "rgba(255,255,255,0.4)",
                  border: activeTab === tab ? "1px solid rgba(120,101,248,0.3)" : "1px solid transparent",
                }}
              >
                {tab === "overview" ? "概览" : tab === "prompt" ? "Prompt" : "Workflow"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="px-5 pb-4 min-h-[120px]">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tags */}
                {edit.tags && edit.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-white/30 mb-2">标签</p>
                    <div className="flex flex-wrap gap-2">
                      {edit.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-md"
                          style={{ background: "rgba(120,101,248,0.1)", color: "#A78BD9" }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* 创作时间 */}
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Clock size={12} />
                  <span>创作于 {new Date(edit.created_at || Date.now()).toLocaleDateString("zh-CN")}</span>
                </div>
              </motion.div>
            )}

            {activeTab === "prompt" && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {edit.prompt ? (
                  <div>
                    <div
                      className="text-sm leading-relaxed rounded-xl p-4"
                      style={{
                        background: "rgba(120,101,248,0.05)",
                        border: "1px solid rgba(120,101,248,0.1)",
                        color: "rgba(196,181,253,0.9)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <p className={`${promptExpanded ? "" : "line-clamp-4"}`}>{edit.prompt}</p>
                    </div>
                    {edit.prompt.length > 120 && (
                      <button
                        onClick={() => setPromptExpanded(!promptExpanded)}
                        className="mt-2 text-xs flex items-center gap-1"
                        style={{ color: "#7865F8" }}
                      >
                        {promptExpanded ? "收起" : "展开更多"}
                        <motion.span animate={{ rotate: promptExpanded ? 180 : 0 }}>
                          <ChevronRight size={12} className="rotate-90" />
                        </motion.span>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 text-center py-8">暂无 Prompt 信息</p>
                )}
              </motion.div>
            )}

            {activeTab === "workflow" && (
              <motion.div
                key="workflow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {edit.workflow && edit.workflow.length > 0 ? (
                  <div className="space-y-0">
                    {edit.workflow.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        {/* 时间线 */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: "rgba(120,101,248,0.2)",
                              border: "1px solid rgba(120,101,248,0.4)",
                              color: "#C4B5FD",
                            }}
                          >
                            {i + 1}
                          </div>
                          {i < edit.workflow!.length - 1 && (
                            <div className="w-px flex-1 mt-1" style={{ background: "rgba(120,101,248,0.15)" }} />
                          )}
                        </div>
                        {/* 步骤内容 */}
                        <div className="pb-4 flex-1">
                          <p className="text-sm text-white/70">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 text-center py-8">暂无 Workflow 信息</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div className="px-5 pb-6 pt-2">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#C4B5FD]" />
              <p className="text-sm font-medium text-white/70">相关推荐</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {related.map((rel) => (
                <motion.div
                  key={rel.id}
                  className="flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setVideoPlaying(false);
                    // 父组件会重新渲染选中项
                  }}
                >
                  <div className="relative aspect-video">
                    <img
                      src={rel.thumbnail || PLACEHOLDER_SVG}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
                      }}
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                      {rel.duration}
                    </div>
                  </div>
                  <p className="text-xs text-white/60 px-2 py-1.5 truncate">{rel.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MobileVideoEdits 主组件
// ═══════════════════════════════════════════════════════════

export default function MobileVideoEdits() {
  const [edits, setEdits] = useState<VideoEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedEdit, setSelectedEdit] = useState<VideoEdit | null>(null);
  const [featuredEdit, setFeaturedEdit] = useState<VideoEdit | null>(null);

  const categories = useMemo(() => {
    const set = new Set(edits.map((e) => e.category).filter(Boolean));
    return ["全部", ...Array.from(set)];
  }, [edits]);

  const filteredEdits = useMemo(() => {
    if (activeCategory === "全部") return edits;
    return edits.filter((e) => e.category === activeCategory);
  }, [edits, activeCategory]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await worksService.getVideoEdits();
        setEdits(data);
        if (data.length > 0) setFeaturedEdit(data[0]);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #0C0A14 0%, #141220 100%)" }}>
      {/* ─── 电影级 Hero ─── */}
      <div className="relative w-full overflow-hidden" style={{ height: "50vh", minHeight: 320 }}>
        {/* 背景图 */}
        {featuredEdit ? (
          <div className="absolute inset-0">
            <img
              src={featuredEdit.thumbnail}
              alt={featuredEdit.title}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.4)" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,10,20,0.3) 0%, rgba(12,10,20,0.1) 40%, rgba(12,10,20,0.95) 100%)",
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1628 0%, #0C0A14 100%)" }} />
        )}

        {/* Hero 内容 */}
        <div className="relative z-10 flex flex-col justify-end h-full px-5 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(120,101,248,0.2)" }}>
                <Film size={16} className="text-[#C4B5FD]" />
              </div>
              <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(196,181,253,0.6)" }}>
                Video Editing
              </span>
            </div>
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 2px 20px rgba(120,101,248,0.3)",
              }}
            >
              视频剪辑作品
            </h1>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              每一帧都是叙事，每一刀都是节奏。探索影视后期的创作世界。
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── 分类筛选 ─── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background:
                  activeCategory === cat
                    ? "rgba(120,101,248,0.2)"
                    : "rgba(255,255,255,0.04)",
                color: activeCategory === cat ? "#C4B5FD" : "rgba(255,255,255,0.4)",
                border:
                  activeCategory === cat
                    ? "1px solid rgba(120,101,248,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ─── 横向电影卡片（Featured） ─── */}
      {!loading && filteredEdits.length > 0 && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-[#D4AF7A]" />
            <p className="text-sm font-medium text-white/70">精选作品</p>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredEdits.slice(0, 5).map((edit, i) => (
              <motion.div
                key={edit.id}
                className="flex-shrink-0 w-64 rounded-2xl overflow-hidden relative cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  aspectRatio: "16/10",
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedEdit(edit)}
              >
                <img
                  src={edit.thumbnail || PLACEHOLDER_SVG}
                  alt={edit.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
                  }}
                />
                {/* 渐变遮罩 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)",
                  }}
                />
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(120,101,248,0.9)",
                      boxShadow: "0 0 20px rgba(120,101,248,0.4)",
                    }}
                  >
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                {/* 底部信息 */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${getCategoryColor(edit.category)}30`,
                        color: getCategoryColor(edit.category),
                      }}
                    >
                      {edit.category}
                    </span>
                    <span className="text-[9px] text-white/40 flex items-center gap-0.5">
                      <Clock size={8} />
                      {edit.duration}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{edit.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 作品列表 ─── */}
      <div className="px-5 pt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">
            {activeCategory === "全部" ? "全部作品" : activeCategory}
          </p>
          <span className="text-xs text-white/30">{filteredEdits.length} 部作品</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#7865F8]/20 border-t-[#7865F8] rounded-full"
            />
          </div>
        ) : filteredEdits.length === 0 ? (
          <div className="text-center py-16">
            <Film size={40} className="mx-auto mb-3 text-white/10" />
            <p className="text-sm text-white/30">暂无视频剪辑作品</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEdits.map((edit, i) => (
              <motion.div
                key={edit.id}
                className="flex gap-3 p-3 rounded-2xl cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.06)" }}
                onClick={() => setSelectedEdit(edit)}
              >
                {/* 缩略图 */}
                <div className="flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden relative">
                  <img
                    src={edit.thumbnail || PLACEHOLDER_SVG}
                    alt={edit.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
                    }}
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                    {edit.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                    <Play size={16} className="text-white" fill="white" />
                  </div>
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${getCategoryColor(edit.category)}20`,
                        color: getCategoryColor(edit.category),
                      }}
                    >
                      {edit.category}
                    </span>
                    {edit.software && edit.software[0] && (
                      <span className="text-[9px] text-white/25 flex items-center gap-0.5">
                        {SOFTWARE_ICONS[edit.software[0]] || SOFTWARE_ICONS.default}
                        {edit.software[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{edit.title}</p>
                  {edit.description && (
                    <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{edit.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-white/20 flex items-center gap-0.5">
                      <Eye size={10} />
                      {edit.views || 0}
                    </span>
                    <span className="text-[10px] text-white/20 flex items-center gap-0.5">
                      <Heart size={10} />
                      {edit.likes || 0}
                    </span>
                  </div>
                </div>

                {/* 箭头 */}
                <div className="flex-shrink-0 flex items-center">
                  <ChevronRight size={16} className="text-white/15" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 详情弹窗 ─── */}
      <AnimatePresence>
        {selectedEdit && (
          <VideoEditDetail
            edit={selectedEdit}
            onClose={() => setSelectedEdit(null)}
            allEdits={edits}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
