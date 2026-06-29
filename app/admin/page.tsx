"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import COS from 'cos-js-sdk-v5';
import * as worksService from '@/lib/worksService';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '@/lib/worksService';
import type { Artwork, Video, Skill, TimelineItem, Stat, SocialLink, SiteConfig } from '@/lib/worksService';

interface ArtworkForm {
  title: string;
  categories: string[];
  tags: string;
  date: string;
  image: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  dimensions: string;
  description: string;
  status: 'draft' | 'published';
}

interface VideoForm {
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  videoFile: string;
  category: string;
  orientation: 'auto' | 'vertical' | 'horizontal';
}

interface VideoEditForm {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  videoFile: string;
  duration: string;
  category: string;
  tags: string;
  software: string;
  status: 'draft' | 'published';
}

interface SkillForm { name: string; level: string; }
interface TimelineForm { year: string; title: string; description: string; }
interface StatForm { value: string; label: string; suffix: string; }
interface SocialLinkForm { name: string; icon: string; url: string; }

const iconOptions = ['Mail', 'MessageCircle', 'Video', 'Music', 'BookOpen', 'Github', 'Twitter', 'Instagram', 'Linkedin', 'Youtube'];
const ADMIN_PASSWORD = 'ai@studio2024';

type MainTab = 'works' | 'categories' | 'about' | 'social' | 'config' | 'stats';
type WorksTab = 'image' | 'video' | 'videoEdit';
type AboutTab = 'skills' | 'timeline' | 'stats';
type EditorMode = 'edit' | 'preview';

// ============= 统一主题样式常量 =============
const THEME = {
  card: {
    background: 'rgba(26, 22, 40, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(120, 101, 248, 0.15)',
    borderRadius: '1.5rem',
  },
  input: {
    background: 'rgba(13, 10, 24, 0.6)',
    border: '1px solid rgba(120, 101, 248, 0.15)',
    color: '#ECE7FF',
    placeholderColor: 'rgba(199, 184, 255, 0.4)',
  },
  text: {
    primary: '#ECE7FF',
    secondary: '#C7B8FF',
    muted: 'rgba(199, 184, 255, 0.7)',
    dim: 'rgba(199, 184, 255, 0.5)',
  },
  gradientBtn: {
    background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
    color: '#F8F7FC',
    boxShadow: '0 4px 20px rgba(120, 101, 248, 0.3)',
  },
  ghostBtn: {
    background: 'rgba(120, 101, 248, 0.08)',
    color: '#C7B8FF',
    border: '1px solid rgba(120, 101, 248, 0.15)',
  },
};

// ============= 通用样式组件 =============
function ThemedInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${className || ''}`}
      style={{ ...THEME.input, fontSize: '0.95rem' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#7865F8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 101, 248, 0.2)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function ThemedTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${className || ''}`}
      style={{ ...THEME.input, fontSize: '0.95rem' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#7865F8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 101, 248, 0.2)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

// 自动增长 Textarea
function AutoGrowTextarea({ value, onChange, placeholder, rows = 3, minRows = 3, className = '' }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number; minRows?: number; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, []);
  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => { onChange(e); }}
      placeholder={placeholder}
      rows={minRows}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${className}`}
      style={{ ...THEME.input, fontSize: '0.95rem', minHeight: `${minRows * 48}px` }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#7865F8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 101, 248, 0.2)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function ThemedSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${className || ''}`} style={{ ...THEME.input, fontSize: '0.95rem' }}>
      {children}
    </select>
  );
}

function ThemedButton({ children, onClick, type = 'button', disabled, variant = 'gradient', className = '', fullWidth = false }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit';
  disabled?: boolean; variant?: 'gradient' | 'ghost' | 'danger'; className?: string; fullWidth?: boolean;
}) {
  const styles: Record<string, any> = {
    gradient: THEME.gradientBtn,
    ghost: THEME.ghostBtn,
    danger: { background: 'rgba(255,77,79,0.15)', color: '#FF7878', border: '1px solid rgba(255,77,79,0.3)' },
  };
  const baseStyle = styles[variant] || styles.ghost;
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} py-3 rounded-xl font-medium ${className}`}
      style={{ ...baseStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}

function ThemedCard({ children, className = '', initial, animate }: {
  children: React.ReactNode; className?: string; initial?: any; animate?: any;
}) {
  return (
    <motion.div initial={initial} animate={animate} className={`p-6 ${className}`} style={THEME.card}>
      {children}
    </motion.div>
  );
}

// ============= 分类多选组件 =============
function CategoryMultiSelect({ categories, selectedCategories, onChange }: {
  categories: string[]; selectedCategories: string[]; onChange: (categories: string[]) => void;
}) {
  const toggle = (cat: string) => {
    onChange(selectedCategories.includes(cat) ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat]);
  };
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: THEME.text.secondary }}>
        选择分类（可多选）({selectedCategories.length}个)
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <motion.button key={cat} type="button" onClick={() => toggle(cat)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: selectedCategories.includes(cat) ? 'rgba(120, 101, 248, 0.3)' : 'rgba(13, 10, 24, 0.4)',
              color: selectedCategories.includes(cat) ? '#A991FF' : THEME.text.muted,
              border: `1px solid ${selectedCategories.includes(cat) ? 'rgba(120, 101, 248, 0.5)' : 'rgba(120, 101, 248, 0.15)'}`,
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {selectedCategories.includes(cat) && <Icons.Check className="w-3 h-3 inline-block mr-1" />}
            {cat}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============= 作品信息卡片 =============
function ArtworkCard({ artwork, onEdit, onDelete, isVideo = false }: {
  artwork: Artwork | Video; onEdit: () => void; onDelete: () => void; isVideo?: boolean;
}) {
  const img = 'image' in artwork ? artwork.image : (artwork as Video).thumbnail;
  const cat = 'category' in artwork ? artwork.category : (artwork as any).categories?.[0] || '';
  const date = 'date' in artwork ? artwork.date : '';
  const status = 'status' in artwork ? (artwork as Artwork).status : undefined;
  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden group"
      style={{ border: '1px solid rgba(120, 101, 248, 0.15)', background: 'rgba(13, 10, 24, 0.4)' }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <img src={img} alt={(artwork as any).title} className="w-full h-28 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 rounded-full" style={{ background: '#7865F8', color: '#fff' }}>
              <Icons.Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-2 rounded-full" style={{ background: '#FF4D4F', color: '#fff' }}>
              <Icons.Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {isVideo && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.7)', color: '#FFF' }}>
            <Icons.Video className="w-3 h-3 inline mr-1" />视频
          </div>
        )}
        {status === 'draft' && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(250,173,20,0.85)', color: '#FFF' }}>
            草稿
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate" style={{ color: THEME.text.primary }}>{(artwork as any).title}</p>
        <div className="flex items-center justify-between mt-1.5">
          {cat && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(120,101,248,0.2)', color: '#A991FF' }}>
              {cat}
            </span>
          )}
          {date && <span className="text-[10px]" style={{ color: THEME.text.dim }}>{date}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ============= 主组件 =============
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [mainTab, setMainTab] = useState<MainTab>('works');
  const [worksTab, setWorksTab] = useState<WorksTab>('image');
  const [aboutTab, setAboutTab] = useState<AboutTab>('skills');
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');

  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const [imageForm, setImageForm] = useState<ArtworkForm>({
    title: '', categories: [], tags: '', date: new Date().toISOString().split('T')[0],
    image: '', prompt: '', negativePrompt: '', model: '', dimensions: '', description: '',
    status: 'published',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: '', description: '', duration: '00:00', thumbnail: '', url: '', videoFile: '', category: '二次元', orientation: 'auto',
  });
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDragOver, setVideoDragOver] = useState(false);

  // 视频剪辑状态
  const [videoEditForm, setVideoEditForm] = useState<VideoEditForm>({
    title: '', description: '', thumbnail: '', videoUrl: '', videoFile: '', duration: '00:00', category: 'MV剪辑', tags: '', software: '', status: 'published',
  });
  const [editingVideoEdit, setEditingVideoEdit] = useState<worksService.VideoEdit | null>(null);
  const [videoEditList, setVideoEditList] = useState<worksService.VideoEdit[]>([]);
  const [videoEditThumbnailPreview, setVideoEditThumbnailPreview] = useState<string | null>(null);
  const [videoEditPreview, setVideoEditPreview] = useState<string | null>(null);
  const [videoEditFile, setVideoEditFile] = useState<File | null>(null);
  const [videoEditUploading, setVideoEditUploading] = useState(false);
  const [videoEditUploadProgress, setVideoEditUploadProgress] = useState(0);
  const [videoEditDragOver, setVideoEditDragOver] = useState(false);
  const [videoEditFileDragOver, setVideoEditFileDragOver] = useState(false);
  const [videoEditCategory, setVideoEditCategory] = useState('MV剪辑');
  const defaultVideoEditCategories = ['MV剪辑', 'Vlog', '广告片', '短片', '混剪', '特效'];
  const [videoEditCategories, setVideoEditCategories] = useState<string[]>(defaultVideoEditCategories);
  const [newVideoEditCategory, setNewVideoEditCategory] = useState('');

  const [skillForm, setSkillForm] = useState<SkillForm>({ name: '', level: '80' });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [timelineForm, setTimelineForm] = useState<TimelineForm>({ year: '', title: '', description: '' });
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  const [statForm, setStatForm] = useState<StatForm>({ value: '', label: '', suffix: '' });
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [socialLinkForm, setSocialLinkForm] = useState<SocialLinkForm>({ name: '', icon: 'Mail', url: '' });
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null);

  const defaultImageCategories = ['二次元', '古风', '少女风', '温暖风格', '人像'];
  const defaultVideoCategories = ['二次元', '古风', '少女风', '温暖风格', '人像'];
  const [imageCategories, setImageCategories] = useState<string[]>(defaultImageCategories);
  const [videoCategories, setVideoCategories] = useState<string[]>(defaultVideoCategories);
  const [newImageCategory, setNewImageCategory] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('');
  const [videoCategory, setVideoCategory] = useState('二次元');

  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 搜索过滤
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => { if (isLoggedIn) loadAllData(); }, [isLoggedIn]);

  const loadAllData = async () => {
    try {
      const [artworks, videos, videoEdits, skillsData, timelineData, statsData, socialLinksData, config] = await Promise.all([
        worksService.getArtworks(), worksService.getVideos(), worksService.getVideoEdits(), worksService.getSkills(),
        worksService.getTimeline(), worksService.getStats(), worksService.getSocialLinks(), worksService.getSiteConfig(),
      ]);
      setUserArtworks(artworks); setUserVideos(videos); setVideoEditList(videoEdits); setSkills(skillsData);
      setTimeline(timelineData); setStats(statsData); setSocialLinks(socialLinksData); setSiteConfig(config);
    } catch (error) { console.error('Failed to load data:', error); }
  };

  useEffect(() => {
    const storedImg = getLocalStorageItem('imageCategories');
    if (storedImg) { try { const p = JSON.parse(storedImg); if (Array.isArray(p) && p.length > 0) setImageCategories(p); } catch { setImageCategories(defaultImageCategories); } }
    const storedVid = getLocalStorageItem('videoCategories');
    if (storedVid) { try { const p = JSON.parse(storedVid); if (Array.isArray(p) && p.length > 0) setVideoCategories(p); } catch { setVideoCategories(defaultVideoCategories); } }
  }, []);

  useEffect(() => { setLocalStorageItem('imageCategories', JSON.stringify(imageCategories)); }, [imageCategories]);
  useEffect(() => { setLocalStorageItem('videoCategories', JSON.stringify(videoCategories)); }, [videoCategories]);

  // 分类管理
  const handleAddImageCategory = () => {
    const t = newImageCategory.trim();
    if (!t) return alert('请输入分类名称');
    if (imageCategories.includes(t)) return alert('该分类已存在');
    setImageCategories([...imageCategories, t]); setNewImageCategory('');
  };
  const handleAddVideoCategory = () => {
    const t = newVideoCategory.trim();
    if (!t) return alert('请输入分类名称');
    if (videoCategories.includes(t)) return alert('该分类已存在');
    setVideoCategories([...videoCategories, t]); setNewVideoCategory('');
  };
  const handleDeleteImageCategory = (cat: string) => {
    if (!confirm(`确定要删除图片分类"${cat}"吗？`)) return;
    setImageCategories(imageCategories.filter(c => c !== cat));
    setImageForm(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };
  const handleDeleteVideoCategory = (cat: string) => {
    if (!confirm(`确定要删除视频分类"${cat}"吗？`)) return;
    const f = videoCategories.filter(c => c !== cat);
    setVideoCategories(f);
    if (videoCategory === cat) setVideoCategory(f[0] || defaultVideoCategories[0]);
  };

  const handleClearAllWorks = async (type: 'image' | 'video' | 'videoEdit') => {
    const typeLabel = type === 'image' ? '图片' : type === 'videoEdit' ? '视频剪辑' : '视频';
    if (!confirm(`确定要清空所有${typeLabel}作品吗？此操作不可恢复！`)) return;
    if (!confirm('再次确认：所有作品数据将被永久删除！')) return;
    try {
      if (type === 'image') {
        for (const art of userArtworks) await worksService.deleteArtwork(art.id);
        removeLocalStorageItem('userArtworks'); setUserArtworks([]);
      } else if (type === 'videoEdit') {
        for (const edit of videoEditList) await worksService.deleteVideoEdit(edit.id);
        setVideoEditList([]);
      } else {
        for (const vid of userVideos) await worksService.deleteVideo(vid.id);
        removeLocalStorageItem('userVideos'); setUserVideos([]);
      }
      alert('清空完成');
    } catch (error) { console.error('Clear failed:', error); alert('清空失败：' + (error as Error).message); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setIsLoggedIn(true); sessionStorage.setItem('adminLoggedIn', 'true'); setLoginError(''); }
    else setLoginError('密码错误，请重试');
  };
  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem('adminLoggedIn'); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('请上传图片文件');
      const reader = new FileReader();
      reader.onloadend = () => { const b = reader.result as string; setImagePreview(b); setImageForm({ ...imageForm, image: b }); };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('请上传图片文件');
      const reader = new FileReader();
      reader.onloadend = () => { const b = reader.result as string; setVideoThumbnailPreview(b); setVideoForm({ ...videoForm, thumbnail: b }); };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) return alert('请上传视频文件');
      if (file.size > 50 * 1024 * 1024) return alert('视频文件太大，请上传小于50MB的视频');
      const reader = new FileReader();
      reader.onloadend = () => { const b = reader.result as string; setVideoPreview(b); setVideoForm({ ...videoForm, videoFile: b }); generateThumbnail(b); };
      reader.readAsDataURL(file);
    }
  };

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const generateThumbnail = (videoDataUrl: string) => {
    const video = document.createElement('video');
    video.src = videoDataUrl; video.crossOrigin = 'anonymous'; video.muted = true; video.playsInline = true;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration / 2, 1);
      // 自动提取时长
      setVideoForm(prev => ({ ...prev, duration: formatDuration(video.duration) }));
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 340;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const t = canvas.toDataURL('image/jpeg', 0.8);
        setVideoThumbnailPreview(t); setVideoForm(prev => ({ ...prev, thumbnail: t }));
      }
      URL.revokeObjectURL(video.src);
    };
  };

  // 拖拽上传 - 图片
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImageDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('请拖入图片文件');
    const reader = new FileReader();
    reader.onloadend = () => { const b = reader.result as string; setImagePreview(b); setImageForm({ ...imageForm, image: b }); };
    reader.readAsDataURL(file);
  };

  // 拖拽上传 - 视频
  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVideoDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return alert('请拖入视频文件');
    if (file.size > 50 * 1024 * 1024) return alert('视频文件太大，请上传小于50MB的视频');
    const reader = new FileReader();
    reader.onloadend = () => { const b = reader.result as string; setVideoPreview(b); setVideoForm({ ...videoForm, videoFile: b }); generateThumbnail(b); };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  // 从 File 对象生成缩略图并提取时长
  const generateThumbnailFromFile = (file: File) => {
    return new Promise<{ thumbnail: string | null; duration: string }>((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url; video.muted = true; video.playsInline = true; video.preload = 'metadata';
      let durationStr = '00:00';
      video.onloadedmetadata = () => {
        durationStr = formatDuration(video.duration);
        video.currentTime = Math.min(video.duration / 2, 1);
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 340;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve({ thumbnail: canvas.toDataURL('image/jpeg', 0.8), duration: durationStr });
          } else { resolve({ thumbnail: null, duration: durationStr }); }
        } catch { resolve({ thumbnail: null, duration: durationStr }); }
        URL.revokeObjectURL(url);
      };
      video.onerror = () => { resolve({ thumbnail: null, duration: durationStr }); URL.revokeObjectURL(url); };
    });
  };

  // 视频剪辑 - 处理视频文件选择（保存 File 对象，不转 Base64）
  const processVideoEditFile = async (file: File) => {
    if (!file.type.startsWith('video/')) return alert('请上传视频文件');
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) return alert('视频文件不能超过 2GB');
    setVideoEditFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoEditPreview(previewUrl);
    // 自动生成缩略图和提取时长
    const result = await generateThumbnailFromFile(file);
    const thumb = result.thumbnail;
    if (thumb) {
      setVideoEditThumbnailPreview(thumb);
      setVideoEditForm(prev => ({ ...prev, thumbnail: thumb, duration: result.duration }));
    } else {
      setVideoEditForm(prev => ({ ...prev, duration: result.duration }));
    }
  };

  const handleVideoEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processVideoEditFile(file);
  };

  // 视频剪辑 - 拖拽上传视频
  const handleVideoEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVideoEditFileDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processVideoEditFile(file);
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageForm.categories.length === 0) return alert('️ 请先选择至少一个分类');
    if (!imageForm.title.trim()) return alert('⚠️ 请输入作品标题');
    if (!imageForm.image) return alert('⚠️ 请上传图片');
    setUploading(true);
    try {
      const tagsArray = imageForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const primaryCategory = imageForm.categories[0] || '二次元';
      const isLocalArtwork = editingArtwork && editingArtwork.id?.toString().startsWith('local-');
      let result: any = null;
      if (editingArtwork && !isLocalArtwork) {
        result = await worksService.updateArtwork(editingArtwork.id, {
          title: imageForm.title, category: primaryCategory, categories: imageForm.categories, tags: tagsArray,
          date: imageForm.date, image: imageForm.image, prompt: imageForm.prompt, negativePrompt: imageForm.negativePrompt,
          model: imageForm.model, dimensions: imageForm.dimensions, description: imageForm.description,
          status: imageForm.status,
        });
        // 直接更新本地 state，不依赖 loadAllData()（Supabase SELECT 可能被 RLS 阻止）
        if (result) {
          setUserArtworks(prev => prev.map(a => a.id === editingArtwork.id ? result : a));
        }
        setEditingArtwork(null);
      } else {
        result = await worksService.createArtwork({
          title: imageForm.title, category: primaryCategory, categories: imageForm.categories, tags: tagsArray,
          date: imageForm.date, image: imageForm.image, prompt: imageForm.prompt, negativePrompt: imageForm.negativePrompt,
          model: imageForm.model, dimensions: imageForm.dimensions, description: imageForm.description,
          status: imageForm.status,
        });
        // 直接添加到本地 state
        if (result) {
          setUserArtworks(prev => [result, ...prev]);
        }
        if (isLocalArtwork) setEditingArtwork(null);
      }
      setSubmitted(true); setTimeout(() => setSubmitted(false), 3000);
      setImageForm({ title: '', categories: [], tags: '', date: new Date().toISOString().split('T')[0], image: '', prompt: '', negativePrompt: '', model: '', dimensions: '', description: '', status: 'published' });
      setImagePreview(null);
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error: any) {
      console.error('Upload error:', error);
      const msg = error?.message || String(error);
      if (msg.includes('Bucket not found') || msg.includes('bucket') || msg.includes('storage')) alert('上传失败：Supabase 存储桶未配置');
      else if (msg.includes('JWT') || msg.includes('token') || msg.includes('auth')) alert('上传失败：Supabase 密钥无效');
      else if (msg.includes('row-level') || msg.includes('permission') || msg.includes('policy')) alert('上传失败：Supabase 权限不足');
      else if (error?.code === 'PGRST116' || msg.includes('Cannot coerce')) {
        if (editingArtwork) { alert('⚠️ 找不到要更新的作品（可能仅存于本地）。\n\n点击"取消编辑"，然后重新上传此作品。'); setEditingArtwork(null); return; }
        else alert('上传失败：数据库返回空结果。');
      }
      else if (msg.includes('network') || msg.includes('fetch')) alert('上传失败：网络连接问题');
      else alert('上传失败：' + msg);
    } finally { setUploading(false); }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      // 计算最终 orientation：auto 时根据视频文件自动判断
      let finalOrientation: 'vertical' | 'horizontal' | undefined = undefined;
      if (videoForm.orientation === 'auto') {
        // 尝试从视频文件获取宽高比
        if (videoForm.videoFile) {
          finalOrientation = await detectVideoOrientation(videoForm.videoFile);
        } else if (videoForm.url) {
          finalOrientation = await detectVideoOrientation(videoForm.url);
        }
      } else {
        finalOrientation = videoForm.orientation === 'vertical' ? 'vertical' : 'horizontal';
      }

      if (editingVideo) {
        const result = await worksService.updateVideo(editingVideo.id, { 
          title: videoForm.title, description: videoForm.description, duration: videoForm.duration, 
          url: videoForm.url, category: videoForm.category, 
          videoFile: videoForm.videoFile || undefined, thumbnail: videoForm.thumbnail || undefined,
          orientation: finalOrientation,
        });
        if (result) {
          setUserVideos(prev => prev.map(v => v.id === editingVideo.id ? result : v));
        }
        setEditingVideo(null);
      } else {
        const result = await worksService.createVideo({ 
          title: videoForm.title, description: videoForm.description, duration: videoForm.duration, 
          thumbnail: videoForm.thumbnail, url: videoForm.url, 
          videoFile: videoForm.videoFile || undefined, category: videoForm.category,
          orientation: finalOrientation,
        });
        if (result) {
          setUserVideos(prev => [result, ...prev]);
        }
      }
      setSubmitted(true); setTimeout(() => setSubmitted(false), 3000);
      setVideoForm({ title: '', description: '', duration: '00:00', thumbnail: '', url: '', videoFile: '', category: '二次元', orientation: 'auto' });
      setVideoThumbnailPreview(null); setVideoPreview(null);
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error: any) {
      console.error('Upload error:', error);
      const msg = error?.message || String(error);
      if (msg.includes('Bucket not found') || msg.includes('bucket') || msg.includes('storage')) alert('上传失败：Supabase 存储桶未配置');
      else if (msg.includes('JWT') || msg.includes('token') || msg.includes('auth')) alert('上传失败：Supabase 密钥无效');
      else if (msg.includes('row-level') || msg.includes('permission') || msg.includes('policy')) alert('上传失败：Supabase 权限不足');
      else if (msg.includes('network') || msg.includes('fetch')) alert('上传失败：网络连接问题');
      else alert('上传失败：' + msg);
    } finally { setUploading(false); }
  };

  // 自动检测视频方向
  const detectVideoOrientation = (src: string): Promise<'vertical' | 'horizontal' | undefined> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const orientation: 'vertical' | 'horizontal' = video.videoHeight > video.videoWidth ? 'vertical' : 'horizontal';
        resolve(orientation);
      };
      video.onerror = () => resolve(undefined);
      video.src = src;
    });
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('确定要删除这个作品吗？')) return;
    try {
      await worksService.deleteArtwork(id); setUserArtworks(prev => prev.filter(a => a.id !== id));
      if (editingArtwork?.id === id) { setEditingArtwork(null); setImageForm({ title: '', categories: [], tags: '', date: new Date().toISOString().split('T')[0], image: '', prompt: '', negativePrompt: '', model: '', dimensions: '', description: '', status: 'published' }); setImagePreview(null); }
      alert('删除成功！'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error) { alert('删除失败，请重试'); }
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setImageForm({ 
      title: artwork.title, 
      categories: artwork.categories || (artwork.category ? [artwork.category] : []), 
      tags: (artwork.tags || []).join(', '), 
      date: artwork.date, 
      image: artwork.image, 
      prompt: artwork.prompt || '', 
      negativePrompt: artwork.negativePrompt || '', 
      model: artwork.model || '', 
      dimensions: artwork.dimensions || '', 
      description: artwork.description || '',
      status: artwork.status || 'published'
    });
    setImagePreview(artwork.image); setWorksTab('image'); setEditorMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingArtwork(null); setEditingVideo(null); setEditingVideoEdit(null);
    setImageForm({ title: '', categories: [], tags: '', date: new Date().toISOString().split('T')[0], image: '', prompt: '', negativePrompt: '', model: '', dimensions: '', description: '', status: 'published' });
    setImagePreview(null);
    setVideoForm({ title: '', description: '', duration: '00:00', thumbnail: '', url: '', videoFile: '', category: '二次元', orientation: 'auto' });
    setVideoThumbnailPreview(null); setVideoPreview(null);
    setVideoEditForm({ title: '', description: '', thumbnail: '', videoUrl: '', videoFile: '', duration: '00:00', category: 'MV剪辑', tags: '', software: '', status: 'published' });
    setVideoEditThumbnailPreview(null); setVideoEditPreview(null);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({ 
      title: video.title, 
      description: video.description || '', 
      duration: video.duration || '00:00', 
      thumbnail: video.thumbnail || '', 
      url: video.url || '', 
      videoFile: video.videoFile || '', 
      category: video.category || '二次元',
      orientation: video.orientation || 'auto',
    });
    setVideoThumbnailPreview(video.thumbnail || null); setVideoPreview(video.videoFile || null);
    setWorksTab('video'); setEditorMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await worksService.deleteVideo(id); setUserVideos(prev => prev.filter(v => v.id !== id));
      if (editingVideo?.id === id) { setEditingVideo(null); setVideoForm({ title: '', description: '', duration: '00:00', thumbnail: '', url: '', videoFile: '', category: '二次元', orientation: 'auto' }); setVideoThumbnailPreview(null); setVideoPreview(null); }
      alert('删除成功！'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error) { alert('删除失败，请重试'); }
  };

  const uploadVideoToCOS = async (file: File): Promise<string> => {
    const res = await fetch('/api/cos-sts');
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || '获取临时密钥失败');
    }
    const stsData = await res.json();
    const { credentials, bucket, region } = stsData;

    if (!credentials || !bucket || !region) {
      throw new Error('STS 返回数据不完整: ' + JSON.stringify(stsData));
    }
    if (!credentials.tmpSecretId || !credentials.tmpSecretKey) {
      throw new Error('STS 凭证不完整: ' + JSON.stringify(credentials));
    }

    const cos = new COS({
      getAuthorization: function (options, callback) {
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          SecurityToken: credentials.sessionToken,
          ExpiredTime: credentials.expiredTime,
          StartTime: credentials.startTime || Math.floor(Date.now() / 1000),
        });
      },
    });

    const ext = file.name.split('.').pop() || 'mp4';
    const key = `video_edits/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    return new Promise((resolve, reject) => {
      (cos as any).sliceUploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: file,
          onProgress: (progressData: any) => {
            const percent = Math.round((progressData.loaded / progressData.total) * 100);
            setVideoEditUploadProgress(percent);
          },
        },
        (err: any, data: any) => {
          if (err) {
            console.error('COS upload error:', err);
            reject(err);
          } else {
            const url = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
            resolve(url);
          }
        }
      );
    });
  };

  // 视频剪辑 CRUD
  const handleSubmitVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 如果有本地视频文件，先上传到腾讯云 COS
      let videoFileUrl = videoEditForm.videoFile || '';
      if (videoEditFile) {
        setVideoEditUploading(true);
        setVideoEditUploadProgress(0);
        try {
          videoFileUrl = await uploadVideoToCOS(videoEditFile);
        } catch (err: any) {
          console.error('Upload error detail:', err);
          let msg = err?.message || err?.error || err?.Error?.Message || err?.Message;
          if (!msg && err?.error?.Message) {
            msg = err.error.Message;
          }
          if (!msg && typeof err === 'object') {
            try { msg = JSON.stringify(err, null, 2); } catch { msg = String(err); }
          }
          alert('视频上传失败：' + (msg || '未知错误'));
          setVideoEditUploading(false);
          return;
        }
      }

      const data = {
        title: videoEditForm.title,
        description: videoEditForm.description,
        thumbnail: videoEditForm.thumbnail,
        videoUrl: videoEditForm.videoUrl,
        videoFile: videoFileUrl,
        duration: videoEditForm.duration,
        category: videoEditForm.category,
        tags: videoEditForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        software: videoEditForm.software.split(',').map(t => t.trim()).filter(Boolean),
        status: videoEditForm.status,
      };
      if (editingVideoEdit) {
        await worksService.updateVideoEdit(editingVideoEdit.id, data);
      } else {
        await worksService.createVideoEdit(data);
      }
      setVideoEditForm({ title: '', description: '', thumbnail: '', videoUrl: '', videoFile: '', duration: '00:00', category: 'MV剪辑', tags: '', software: '', status: 'published' });
      setEditingVideoEdit(null); setVideoEditThumbnailPreview(null); setVideoEditPreview(null);
      setVideoEditFile(null); setVideoEditUploading(false); setVideoEditUploadProgress(0);
      setSubmitted(true); setTimeout(() => setSubmitted(false), 3000);
      loadAllData();
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error) {
      setVideoEditUploading(false);
      alert('操作失败，请重试');
    }
  };

  const handleEditVideoEdit = (edit: worksService.VideoEdit) => {
    setEditingVideoEdit(edit);
    setVideoEditForm({
      title: edit.title,
      description: edit.description || '',
      thumbnail: edit.thumbnail || '',
      videoUrl: edit.videoUrl || '',
      videoFile: edit.videoFile || '',
      duration: edit.duration || '00:00',
      category: edit.category || 'MV剪辑',
      tags: (edit.tags || []).join(', '),
      software: (edit.software || []).join(', '),
      status: edit.status || 'published',
    });
    setVideoEditThumbnailPreview(edit.thumbnail || null);
    setVideoEditPreview(edit.videoFile || null);
    setWorksTab('videoEdit'); setEditorMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideoEdit = async (id: string) => {
    if (!confirm('确定要删除这个视频剪辑作品吗？')) return;
    try {
      await worksService.deleteVideoEdit(id);
      setVideoEditList(prev => prev.filter(e => e.id !== id));
      if (editingVideoEdit?.id === id) {
        setEditingVideoEdit(null);
        setVideoEditForm({ title: '', description: '', thumbnail: '', videoUrl: '', videoFile: '', duration: '00:00', category: 'MV剪辑', tags: '', software: '', status: 'published' });
        setVideoEditThumbnailPreview(null); setVideoEditPreview(null);
      }
      alert('删除成功！');
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('artworks-updated'));
    } catch (error) { alert('删除失败，请重试'); }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) await worksService.updateSkill(editingSkill.id, { name: skillForm.name, level: parseInt(skillForm.level) });
      else await worksService.createSkill({ name: skillForm.name, level: parseInt(skillForm.level) });
      setSkillForm({ name: '', level: '80' }); setEditingSkill(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); loadAllData();
    } catch (error) { alert('操作失败，请重试'); }
  };
  const handleEditSkill = (skill: Skill) => { setEditingSkill(skill); setSkillForm({ name: skill.name, level: skill.level.toString() }); };
  const handleDeleteSkill = async (id: string) => { if (!confirm('确定要删除这个技能吗？')) return; try { await worksService.deleteSkill(id); setSkills(prev => prev.filter(s => s.id !== id)); alert('删除成功！'); } catch { alert('删除失败'); } };

  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTimeline) await worksService.updateTimelineItem(editingTimeline.id, timelineForm);
      else await worksService.createTimelineItem(timelineForm);
      setTimelineForm({ year: '', title: '', description: '' }); setEditingTimeline(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); loadAllData();
    } catch { alert('操作失败'); }
  };
  const handleEditTimeline = (item: TimelineItem) => { setEditingTimeline(item); setTimelineForm({ year: item.year, title: item.title, description: item.description }); };
  const handleDeleteTimeline = async (id: string) => { if (!confirm('确定要删除？')) return; try { await worksService.deleteTimelineItem(id); setTimeline(prev => prev.filter(t => t.id !== id)); alert('删除成功！'); } catch { alert('删除失败'); } };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStat) await worksService.updateStat(editingStat.id, { value: parseInt(statForm.value), label: statForm.label, suffix: statForm.suffix });
      else await worksService.createStat({ value: parseInt(statForm.value), label: statForm.label, suffix: statForm.suffix });
      setStatForm({ value: '', label: '', suffix: '' }); setEditingStat(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); loadAllData();
    } catch { alert('操作失败'); }
  };
  const handleEditStat = (stat: Stat) => { setEditingStat(stat); setStatForm({ value: stat.value.toString(), label: stat.label, suffix: stat.suffix }); };
  const handleDeleteStat = async (id: string) => { if (!confirm('确定要删除？')) return; try { await worksService.deleteStat(id); setStats(prev => prev.filter(s => s.id !== id)); alert('删除成功！'); } catch { alert('删除失败'); } };

  const handleSocialLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSocialLink) await worksService.updateSocialLink(editingSocialLink.id, socialLinkForm);
      else await worksService.createSocialLink(socialLinkForm);
      setSocialLinkForm({ name: '', icon: 'Mail', url: '' }); setEditingSocialLink(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); loadAllData();
    } catch { alert('操作失败'); }
  };
  const handleEditSocialLink = (link: SocialLink) => { setEditingSocialLink(link); setSocialLinkForm({ name: link.name, icon: link.icon, url: link.url }); };
  const handleDeleteSocialLink = async (id: string) => { if (!confirm('确定要删除？')) return; try { await worksService.deleteSocialLink(id); setSocialLinks(prev => prev.filter(s => s.id !== id)); alert('删除成功！'); } catch { alert('删除失败'); } };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { if (siteConfig) { await worksService.updateSiteConfig(siteConfig); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); alert('配置更新成功！'); } }
    catch { alert('更新失败'); }
  };

  // 过滤作品列表
  const filteredArtworks = userArtworks.filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.category || '').includes(searchQuery));
  const filteredVideos = userVideos.filter(v => !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.category || '').includes(searchQuery));

  // ============= 登录页面 =============
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 50%, #1A1628 100%)', backgroundAttachment: 'fixed' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 w-full max-w-md" style={THEME.card}>
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={THEME.gradientBtn}>
              <Icons.Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', fontFamily: "'Smiley Sans', sans-serif" }}>
              墨璃 - 管理后台
            </h1>
            <p style={{ color: THEME.text.muted }}>请输入管理员密码</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: THEME.text.secondary }}>密码</label>
              <div className="relative">
                <ThemedInput type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: THEME.text.muted }}>
                  {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginError && <p className="text-sm mt-2" style={{ color: '#FF6B7A' }}>{loginError}</p>}
            </div>
            <ThemedButton type="submit" fullWidth variant="gradient">登录</ThemedButton>
          </form>
        </motion.div>
      </div>
    );
  }

  const navTabs: { key: MainTab; label: string; icon: any }[] = [
    { key: 'works', label: '作品管理', icon: Icons.Image },
    { key: 'categories', label: '分类管理', icon: Icons.Tags },
    { key: 'about', label: '关于页面', icon: Icons.User },
    { key: 'social', label: '社交链接', icon: Icons.Link },
    { key: 'stats', label: '数据统计', icon: Icons.BarChart3 },
    { key: 'config', label: '网站配置', icon: Icons.Settings },
  ];

  // ============= 主后台界面 =============
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 50%, #1A1628 100%)', backgroundAttachment: 'fixed' }}>
      {/* 中部柔和紫色光晕 */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(120, 101, 248, 0.06) 0%, transparent 70%)',
      }} />

      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50" style={{ background: 'rgba(13, 10, 24, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(120, 101, 248, 0.15)' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', fontFamily: "'Smiley Sans', sans-serif" }}>
                墨璃 · MOLI - 管理后台
              </h1>
              <nav className="flex gap-1.5 flex-wrap">
                {navTabs.map((tab) => (
                  <motion.button key={tab.key} onClick={() => setMainTab(tab.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={mainTab === tab.key ? THEME.gradientBtn : { ...THEME.ghostBtn, fontSize: '0.85rem' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" className="text-sm transition-colors" style={{ color: THEME.text.muted }}>返回首页</a>
              <ThemedButton onClick={handleLogout} variant="ghost">退出登录</ThemedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6 relative z-10" style={{ paddingBottom: '100px' }}>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl text-center text-sm" style={{ background: 'rgba(82, 196, 26, 0.15)', border: '1px solid rgba(82, 196, 26, 0.3)', color: '#A6E89B' }}>
            操作成功！
          </motion.div>
        )}

        {/* ============ 作品管理 ============ */}
        {mainTab === 'works' && (
          <div className="grid gap-6" style={{ gridTemplateColumns: '65% 1fr' }}>
            {/* 编辑区 65% */}
            <div>
              <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Tab 切换 + 编辑/预览模式 */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex gap-2">
                    <button onClick={() => setWorksTab('image')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={worksTab === 'image' ? THEME.gradientBtn : THEME.ghostBtn}>
                      图片作品
                    </button>
                    <button onClick={() => setWorksTab('video')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={worksTab === 'video' ? THEME.gradientBtn : THEME.ghostBtn}>
                      视频作品
                    </button>
                    <button onClick={() => setWorksTab('videoEdit')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={worksTab === 'videoEdit' ? THEME.gradientBtn : THEME.ghostBtn}>
                      视频剪辑
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: THEME.text.dim }}>模式：</span>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(120,101,248,0.2)' }}>
                      <button onClick={() => setEditorMode('edit')} className="px-3 py-1.5 text-xs font-medium transition-all" style={editorMode === 'edit' ? { background: '#7865F8', color: '#fff' } : { background: 'transparent', color: THEME.text.muted }}>
                        <Icons.Edit3 className="w-3 h-3 inline mr-1" />编辑
                      </button>
                      <button onClick={() => setEditorMode('preview')} className="px-3 py-1.5 text-xs font-medium transition-all" style={editorMode === 'preview' ? { background: '#7865F8', color: '#fff' } : { background: 'transparent', color: THEME.text.muted }}>
                        <Icons.Eye className="w-3 h-3 inline mr-1" />预览
                      </button>
                    </div>
                  </div>
                </div>

                {editorMode === 'preview' ? (
                  /* ===== 预览模式 ===== */
                  <div className="space-y-4">
                    {worksTab === 'image' ? (
                      imagePreview ? (
                        <div className="space-y-4">
                          <div className="rounded-xl overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>标题</p>
                              <p className="text-sm font-medium" style={{ color: THEME.text.primary }}>{imageForm.title || '未填写'}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>分类</p>
                              <div className="flex flex-wrap gap-1">
                                {imageForm.categories.map(c => (
                                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(120,101,248,0.2)', color: '#A991FF' }}>{c}</span>
                                ))}
                                {imageForm.categories.length === 0 && <span className="text-xs" style={{ color: THEME.text.dim }}>未选择</span>}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>日期</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{imageForm.date}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>标签</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{imageForm.tags || '未填写'}</p>
                            </div>
                          </div>
                          {imageForm.prompt && (
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>正向 Prompt</p>
                              <div className="p-3 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'rgba(13,10,24,0.6)', color: THEME.text.secondary, border: '1px solid rgba(120,101,248,0.1)' }}>
                                {imageForm.prompt}
                              </div>
                            </div>
                          )}
                          {imageForm.negativePrompt && (
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>负向 Prompt</p>
                              <div className="p-3 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'rgba(13,10,24,0.6)', color: THEME.text.muted, border: '1px solid rgba(120,101,248,0.1)' }}>
                                {imageForm.negativePrompt}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>模型</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{imageForm.model || '未填写'}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>尺寸</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{imageForm.dimensions || '未填写'}</p>
                            </div>
                          </div>
                          {imageForm.description && (
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>创作描述</p>
                              <p className="text-sm" style={{ color: THEME.text.secondary }}>{imageForm.description}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <Icons.Image className="w-12 h-12 mx-auto mb-3" style={{ color: THEME.text.dim }} />
                          <p className="text-sm" style={{ color: THEME.text.muted }}>请先上传图片</p>
                        </div>
                      )
                    ) : worksTab === 'videoEdit' ? (
                      <div className="text-center py-16">
                        <Icons.Film className="w-12 h-12 mx-auto mb-3" style={{ color: THEME.text.dim }} />
                        <p className="text-sm" style={{ color: THEME.text.muted }}>视频剪辑预览</p>
                      </div>
                    ) : (
                      videoPreview ? (
                        <div className="space-y-4">
                          <div className="rounded-xl overflow-hidden">
                            <video src={videoPreview} controls className="w-full" style={{ maxHeight: '400px' }} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>标题</p>
                              <p className="text-sm font-medium" style={{ color: THEME.text.primary }}>{videoForm.title || '未填写'}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>分类</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{videoForm.category}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>时长</p>
                              <p className="text-sm" style={{ color: THEME.text.primary }}>{videoForm.duration}</p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>链接</p>
                              <p className="text-sm truncate" style={{ color: THEME.text.primary }}>{videoForm.url || '无'}</p>
                            </div>
                          </div>
                          {videoForm.description && (
                            <div>
                              <p className="text-xs mb-1" style={{ color: THEME.text.dim }}>描述</p>
                              <p className="text-sm" style={{ color: THEME.text.secondary }}>{videoForm.description}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <Icons.Video className="w-12 h-12 mx-auto mb-3" style={{ color: THEME.text.dim }} />
                          <p className="text-sm" style={{ color: THEME.text.muted }}>请先上传视频</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  /* ===== 编辑模式 ===== */
                  worksTab === 'image' ? (
                    <form id="image-upload-form" onSubmit={handleImageSubmit} className="space-y-4">
                      {editingArtwork && (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{
                          background: editingArtwork.id?.toString().startsWith('local-') ? 'rgba(255,153,0,0.1)' : 'rgba(120,101,248,0.1)',
                          border: `1px solid ${editingArtwork.id?.toString().startsWith('local-') ? 'rgba(255,153,0,0.3)' : 'rgba(120,101,248,0.3)'}`,
                        }}>
                          <span className="text-sm font-medium" style={{ color: editingArtwork.id?.toString().startsWith('local-') ? '#FFA940' : '#A991FF' }}>
                            <Icons.Edit3 className="w-4 h-4 inline-block mr-1" />正在编辑：{editingArtwork.title}
                          </span>
                          <button type="button" onClick={handleCancelEdit} className="text-xs px-3 py-1 rounded-full transition-all" style={THEME.ghostBtn}>取消编辑</button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>作品标题 *</label>
                          <ThemedInput type="text" value={imageForm.title} onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })} placeholder="作品标题" required />
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>日期</label>
                          <ThemedInput type="date" value={imageForm.date} onChange={(e) => setImageForm({ ...imageForm, date: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>发布状态</label>
                        <ThemedSelect value={imageForm.status} onChange={(e) => setImageForm({ ...imageForm, status: e.target.value as 'draft' | 'published' })}>
                          <option value="published">已发布</option>
                          <option value="draft">草稿</option>
                        </ThemedSelect>
                      </div>

                      <CategoryMultiSelect categories={imageCategories} selectedCategories={imageForm.categories} onChange={(categories) => setImageForm({ ...imageForm, categories })} />

                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>标签（逗号分隔）</label>
                        <ThemedInput type="text" value={imageForm.tags} onChange={(e) => setImageForm({ ...imageForm, tags: e.target.value })} placeholder="标签（逗号分隔）" />
                      </div>

                      {/* Prompt 区域 - 可展开，最小350px */}
                      <PromptEditor imageForm={imageForm} setImageForm={setImageForm} />

                      {!editingArtwork && (
                        <div
                          className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                          style={{
                            borderColor: imageDragOver ? '#7865F8' : 'rgba(120, 101, 248, 0.25)',
                            background: imageDragOver ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                          }}
                          onClick={() => document.getElementById('image-upload')?.click()}
                          onDragOver={handleDragOver}
                          onDragEnter={() => setImageDragOver(true)}
                          onDragLeave={() => setImageDragOver(false)}
                          onDrop={handleImageDrop}
                        >
                          <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          <Icons.Upload className="w-10 h-10 mx-auto mb-2" style={{ color: '#A991FF' }} />
                          <p className="text-sm" style={{ color: imageDragOver ? '#A991FF' : THEME.text.muted }}>
                            {imageDragOver ? '松开以上传图片' : '点击或拖拽上传图片'}
                          </p>
                        </div>
                      )}
                      {imagePreview && (
                        <div className="relative rounded-xl overflow-hidden">
                          <img src={imagePreview} alt="Preview" className="w-full" style={{ maxHeight: '300px', objectFit: 'contain' }} />
                          <button type="button" onClick={() => { setImageForm({ ...imageForm, image: '' }); setImagePreview(null); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,10,24,0.85)', color: '#ECE7FF', border: '1px solid rgba(120,101,248,0.3)' }}>
                            <Icons.X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </form>
                  ) : worksTab === 'videoEdit' ? (
                    <form id="video-edit-form" onSubmit={handleSubmitVideoEdit} className="space-y-4">
                      {editingVideoEdit && (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(120,101,248,0.15)', border: '1px solid rgba(120,101,248,0.3)' }}>
                          <span className="text-sm" style={{ color: THEME.text.primary }}>✏️ 正在编辑视频剪辑：<strong>{editingVideoEdit.title}</strong></span>
                          <button type="button" onClick={handleCancelEdit} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,77,79,0.2)', color: '#FF4D4F' }}>取消编辑</button>
                        </div>
                      )}
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>标题 *</label>
                        <ThemedInput type="text" value={videoEditForm.title} onChange={(e) => setVideoEditForm({ ...videoEditForm, title: e.target.value })} placeholder="作品标题" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>分类</label>
                          <ThemedSelect value={videoEditForm.category} onChange={(e) => setVideoEditForm({ ...videoEditForm, category: e.target.value })}>
                            {videoEditCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </ThemedSelect>
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>时长（自动提取）</label>
                          <ThemedInput type="text" value={videoEditForm.duration} readOnly placeholder="上传视频后自动填写" className="opacity-60" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>标签</label>
                        <ThemedInput type="text" value={videoEditForm.tags} onChange={(e) => setVideoEditForm({ ...videoEditForm, tags: e.target.value })} placeholder="逗号分隔" />
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>软件</label>
                        <ThemedInput type="text" value={videoEditForm.software} onChange={(e) => setVideoEditForm({ ...videoEditForm, software: e.target.value })} placeholder="逗号分隔，如 Premiere Pro, After Effects" />
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>视频文件</label>
                        {!videoEditPreview ? (
                          <div
                            className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                            style={{
                              borderColor: videoEditFileDragOver ? '#7865F8' : 'rgba(120,101,248,0.25)',
                              background: videoEditFileDragOver ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                            }}
                            onClick={() => document.getElementById('video-edit-file-upload')?.click()}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setVideoEditFileDragOver(true)}
                            onDragLeave={() => setVideoEditFileDragOver(false)}
                            onDrop={handleVideoEditDrop}
                          >
                            <input id="video-edit-file-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoEditFileUpload} />
                            <Icons.Video className="w-10 h-10 mx-auto mb-2" style={{ color: '#A991FF' }} />
                            <p className="text-sm" style={{ color: videoEditFileDragOver ? '#A991FF' : THEME.text.muted }}>
                              {videoEditFileDragOver ? '松开以上传' : videoEditUploading ? '上传中...' : videoEditFile ? `已选择: ${videoEditFile.name} (${(videoEditFile.size / 1024 / 1024).toFixed(1)}MB)` : '点击或拖拽上传视频（最大2GB）'}
                            </p>
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden">
                            <video src={videoEditPreview} controls className="w-full" style={{ maxHeight: '300px' }} />
                            <button type="button" onClick={() => { setVideoEditForm({ ...videoEditForm, videoFile: '', thumbnail: '' }); setVideoEditPreview(null); setVideoEditThumbnailPreview(null); setVideoEditFile(null); }}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,10,24,0.85)', color: '#ECE7FF', border: '1px solid rgba(120,101,248,0.3)' }}>
                              <Icons.X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>视频链接（可选，用于外部视频）</label>
                        <ThemedInput type="url" value={videoEditForm.videoUrl} onChange={(e) => setVideoEditForm({ ...videoEditForm, videoUrl: e.target.value })} placeholder="视频文件URL" />
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>封面图</label>
                        {!videoEditThumbnailPreview ? (
                          <div
                            className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                            style={{
                              borderColor: videoEditDragOver ? '#7865F8' : 'rgba(120,101,248,0.25)',
                              background: videoEditDragOver ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                            }}
                            onClick={() => document.getElementById('video-edit-thumbnail-upload')?.click()}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setVideoEditDragOver(true)}
                            onDragLeave={() => setVideoEditDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setVideoEditDragOver(false);
                              const file = e.dataTransfer.files[0];
                              if (!file) return;
                              if (!file.type.startsWith('image/')) return alert('请拖入图片文件');
                              const reader = new FileReader();
                              reader.onloadend = () => { const b = reader.result as string; setVideoEditThumbnailPreview(b); setVideoEditForm(prev => ({ ...prev, thumbnail: b })); };
                              reader.readAsDataURL(file);
                            }}
                          >
                            <input id="video-edit-thumbnail-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!file.type.startsWith('image/')) return alert('请上传图片文件');
                                const reader = new FileReader();
                                reader.onloadend = () => { const b = reader.result as string; setVideoEditThumbnailPreview(b); setVideoEditForm(prev => ({ ...prev, thumbnail: b })); };
                                reader.readAsDataURL(file);
                              }
                            }} />
                            <Icons.Image className="w-10 h-10 mx-auto mb-2" style={{ color: '#A991FF' }} />
                            <p className="text-sm" style={{ color: videoEditDragOver ? '#A991FF' : THEME.text.muted }}>
                              {videoEditDragOver ? '松开以上传封面' : '点击或拖拽上传封面图'}
                            </p>
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden">
                            <img src={videoEditThumbnailPreview} alt="Preview" className="w-full" style={{ maxHeight: '300px', objectFit: 'contain' }} />
                            <button type="button" onClick={() => { setVideoEditForm({ ...videoEditForm, thumbnail: '' }); setVideoEditThumbnailPreview(null); }}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,10,24,0.85)', color: '#ECE7FF', border: '1px solid rgba(120,101,248,0.3)' }}>
                              <Icons.X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>发布状态</label>
                        <ThemedSelect value={videoEditForm.status} onChange={(e) => setVideoEditForm({ ...videoEditForm, status: e.target.value as 'draft' | 'published' })}>
                          <option value="published">已发布</option>
                          <option value="draft">草稿</option>
                        </ThemedSelect>
                      </div>
                    </form>
                  ) : (
                    <form id="video-upload-form" onSubmit={handleVideoSubmit} className="space-y-4">
                      {editingVideo && (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(120,101,248,0.15)', border: '1px solid rgba(120,101,248,0.3)' }}>
                          <span className="text-sm" style={{ color: THEME.text.primary }}>✏️ 正在编辑视频：<strong>{editingVideo.title}</strong></span>
                          <button type="button" onClick={handleCancelEdit} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,77,79,0.2)', color: '#FF4D4F' }}>取消编辑</button>
                        </div>
                      )}
                      <ThemedInput type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="视频标题" required />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>分类</label>
                          <ThemedSelect value={videoForm.category} onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}>
                            {videoCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </ThemedSelect>
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>时长（自动提取）</label>
                          <ThemedInput type="text" value={videoForm.duration} readOnly placeholder="上传视频后自动填写" className="opacity-60" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>视频方向</label>
                        <div className="flex gap-3">
                          {[
                            { value: 'auto' as const, label: '自动识别' },
                            { value: 'vertical' as const, label: '竖屏 9:16' },
                            { value: 'horizontal' as const, label: '横屏 16:9' },
                          ].map(opt => (
                            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm" style={{ color: THEME.text.primary }}>
                              <input type="radio" name="orientation" value={opt.value} checked={videoForm.orientation === opt.value} onChange={() => setVideoForm({ ...videoForm, orientation: opt.value })} style={{ accentColor: '#7865F8' }} />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>视频描述</label>
                        <AutoGrowTextarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="视频描述..." minRows={2} />
                      </div>
                      <div
                        className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                        style={{
                          borderColor: videoDragOver ? '#7865F8' : 'rgba(120,101,248,0.25)',
                          background: videoDragOver ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                        }}
                        onClick={() => document.getElementById('video-file-upload')?.click()}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setVideoDragOver(true)}
                        onDragLeave={() => setVideoDragOver(false)}
                        onDrop={handleVideoDrop}
                      >
                        <input id="video-file-upload" type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                        <Icons.Video className="w-10 h-10 mx-auto mb-2" style={{ color: '#A991FF' }} />
                        <p className="text-sm" style={{ color: videoDragOver ? '#A991FF' : THEME.text.muted }}>
                          {videoDragOver ? '松开以上传视频' : '点击或拖拽上传视频（最大50MB）'}
                        </p>
                      </div>
                      {videoPreview && (
                        <div className="relative rounded-xl overflow-hidden">
                          <video src={videoPreview} controls className="w-full" style={{ maxHeight: '300px' }} />
                          <button type="button" onClick={() => { setVideoForm({ ...videoForm, videoFile: '', thumbnail: '' }); setVideoPreview(null); setVideoThumbnailPreview(null); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,10,24,0.85)', color: '#ECE7FF', border: '1px solid rgba(120,101,248,0.3)' }}>
                            <Icons.X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <ThemedInput type="url" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} placeholder="YouTube链接（可选）" />
                    </form>
                  )
                )}
              </ThemedCard>
            </div>

            {/* 作品列表 35% */}
            <div>
              <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold" style={{ color: THEME.text.primary }}>
                    {worksTab === 'image' ? `图片作品 (${userArtworks.length})` : worksTab === 'videoEdit' ? `视频剪辑 (${videoEditList.length})` : `视频作品 (${userVideos.length})`}
                  </h3>
                  <button type="button" onClick={() => handleClearAllWorks(worksTab)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1" style={{ background: 'rgba(255,77,79,0.12)', color: '#FF7878', border: '1px solid rgba(255,77,79,0.25)' }}>
                    <Icons.Trash2 className="w-3 h-3" />清空
                  </button>
                </div>

                {/* 搜索 */}
                <div className="mb-4">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: THEME.text.dim }} />
                    <ThemedInput type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索作品..." className="pl-9 py-2.5" style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                {worksTab === 'image' ? (
                  userArtworks.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无图片作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(120,101,248,0.3) transparent' }}>
                      {filteredArtworks.map(artwork => (
                        <ArtworkCard key={artwork.id} artwork={artwork} onEdit={() => handleEditArtwork(artwork)} onDelete={() => handleDeleteArtwork(artwork.id)} />
                      ))}
                    </div>
                  )
                ) : worksTab === 'videoEdit' ? (
                  videoEditList.length === 0 ? (
                    <div className="text-center py-12">
                      <Icons.Film className="w-12 h-12 mx-auto mb-3" style={{ color: THEME.text.dim }} />
                      <p className="text-sm" style={{ color: THEME.text.muted }}>暂无视频剪辑作品</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {videoEditList.map((edit) => (
                        <motion.div key={edit.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <img src={edit.thumbnail} className="w-16 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: THEME.text.primary }}>{edit.title}</p>
                            <p className="text-[10px]" style={{ color: THEME.text.dim }}>{edit.category} · {edit.duration}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleEditVideoEdit(edit)} className="p-1.5 rounded-lg" style={{ background: 'rgba(120,101,248,0.15)' }}><Icons.Edit3 size={14} style={{ color: '#A991FF' }} /></button>
                            <button onClick={() => handleDeleteVideoEdit(edit.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,77,79,0.15)' }}><Icons.Trash2 size={14} style={{ color: '#FF4D4F' }} /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  userVideos.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无视频作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(120,101,248,0.3) transparent' }}>
                      {filteredVideos.map(video => (
                        <ArtworkCard key={video.id} artwork={video} onEdit={() => handleEditVideo(video)} onDelete={() => handleDeleteVideo(video.id)} isVideo />
                      ))}
                    </div>
                  )
                )}
              </ThemedCard>
            </div>
          </div>
        )}

        {/* ============ 分类管理（独立页面） ============ */}
        {mainTab === 'categories' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: THEME.text.primary }}>
                <Icons.Image className="w-5 h-5" style={{ color: '#A991FF' }} />
                图片分类管理
              </h3>
              <div className="flex gap-2 mb-4">
                <ThemedInput type="text" value={newImageCategory} onChange={(e) => setNewImageCategory(e.target.value)} placeholder="新分类名称"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageCategory(); } }} />
                <ThemedButton onClick={handleAddImageCategory} variant="gradient">添加</ThemedButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {imageCategories.map(cat => (
                  <motion.span key={cat} layout className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                    style={{ background: 'rgba(120,101,248,0.15)', color: '#A991FF', border: '1px solid rgba(120,101,248,0.2)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {cat}
                    <button type="button" onClick={() => handleDeleteImageCategory(cat)} className="rounded-full p-0.5 hover:bg-purple-500/20 transition-colors">
                      <Icons.X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: THEME.text.dim }}>共 {imageCategories.length} 个分类</p>
            </ThemedCard>

            <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: THEME.text.primary }}>
                <Icons.Video className="w-5 h-5" style={{ color: '#A991FF' }} />
                视频分类管理
              </h3>
              <div className="flex gap-2 mb-4">
                <ThemedInput type="text" value={newVideoCategory} onChange={(e) => setNewVideoCategory(e.target.value)} placeholder="新分类名称"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideoCategory(); } }} />
                <ThemedButton onClick={handleAddVideoCategory} variant="gradient">添加</ThemedButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {videoCategories.map(cat => (
                  <motion.span key={cat} layout className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                    style={{ background: 'rgba(120,101,248,0.15)', color: '#A991FF', border: '1px solid rgba(120,101,248,0.2)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {cat}
                    <button type="button" onClick={() => handleDeleteVideoCategory(cat)} className="rounded-full p-0.5 hover:bg-purple-500/20 transition-colors">
                      <Icons.X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: THEME.text.dim }}>共 {videoCategories.length} 个分类</p>
            </ThemedCard>
          </div>
        )}

        {/* ============ 关于页面管理 ============ */}
        {mainTab === 'about' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex gap-2 mb-6">
                  {[{ key: 'skills', label: '技能' }, { key: 'timeline', label: '时间线' }, { key: 'stats', label: '统计数据' }].map((tab) => (
                    <button key={tab.key} onClick={() => { setAboutTab(tab.key as AboutTab); setEditingSkill(null); setEditingTimeline(null); setEditingStat(null); }}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all" style={aboutTab === tab.key ? THEME.gradientBtn : THEME.ghostBtn}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {aboutTab === 'skills' && (
                  <form onSubmit={handleSkillSubmit} className="space-y-4">
                    <ThemedInput type="text" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="技能名称" required />
                    <ThemedInput type="number" min="0" max="100" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })} placeholder="熟练度 (0-100)" required />
                    <ThemedButton type="submit" fullWidth variant="gradient">{editingSkill ? '更新技能' : '添加技能'}</ThemedButton>
                  </form>
                )}
                {aboutTab === 'timeline' && (
                  <form onSubmit={handleTimelineSubmit} className="space-y-4">
                    <ThemedInput type="text" value={timelineForm.year} onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })} placeholder="年份" required />
                    <ThemedInput type="text" value={timelineForm.title} onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })} placeholder="标题" required />
                    <ThemedTextarea value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })} placeholder="描述" rows={3} />
                    <ThemedButton type="submit" fullWidth variant="gradient">{editingTimeline ? '更新时间线' : '添加时间线'}</ThemedButton>
                  </form>
                )}
                {aboutTab === 'stats' && (
                  <form onSubmit={handleStatSubmit} className="space-y-4">
                    <ThemedInput type="number" value={statForm.value} onChange={(e) => setStatForm({ ...statForm, value: e.target.value })} placeholder="数值" required />
                    <ThemedInput type="text" value={statForm.label} onChange={(e) => setStatForm({ ...statForm, label: e.target.value })} placeholder="标签" required />
                    <ThemedInput type="text" value={statForm.suffix} onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })} placeholder="后缀（如：+、小时）" />
                    <ThemedButton type="submit" fullWidth variant="gradient">{editingStat ? '更新统计' : '添加统计'}</ThemedButton>
                  </form>
                )}
              </ThemedCard>
            </div>
            <div>
              <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>
                  {aboutTab === 'skills' ? `技能列表 (${skills.length})` : aboutTab === 'timeline' ? `时间线 (${timeline.length})` : `统计数据 (${stats.length})`}
                </h3>
                {aboutTab === 'skills' && (
                  <div className="space-y-3">
                    {skills.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无技能</p> :
                      skills.map(skill => (
                        <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(13,10,24,0.4)', border: '1px solid rgba(120,101,248,0.1)' }}>
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: THEME.text.primary }}>{skill.name}</p>
                            <div className="h-2 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(120,101,248,0.1)' }}>
                              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7865F8 0%, #A991FF 100%)' }} initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.5 }} />
                            </div>
                            <p className="text-xs mt-1" style={{ color: THEME.text.dim }}>{skill.level}%</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditSkill(skill)} className="p-2 rounded-lg transition-colors" style={{ color: '#8AB4FF' }}><Icons.Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteSkill(skill.id)} className="p-2 rounded-lg transition-colors" style={{ color: '#FF7878' }}><Icons.Trash2 className="w-4 h-4" /></button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
                {aboutTab === 'timeline' && (
                  <div className="space-y-3">
                    {timeline.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无时间线</p> :
                      timeline.map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: 'rgba(13,10,24,0.4)', border: '1px solid rgba(120,101,248,0.1)' }}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{item.year}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditTimeline(item)} className="p-2 rounded-lg transition-colors" style={{ color: '#8AB4FF' }}><Icons.Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteTimeline(item.id)} className="p-2 rounded-lg transition-colors" style={{ color: '#FF7878' }}><Icons.Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm" style={{ color: THEME.text.primary }}>{item.title}</h4>
                          <p className="text-xs mt-1" style={{ color: THEME.text.muted }}>{item.description}</p>
                        </motion.div>
                      ))}
                  </div>
                )}
                {aboutTab === 'stats' && (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.length === 0 ? <p className="col-span-2 text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无统计数据</p> :
                      stats.map(stat => (
                        <motion.div key={stat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl text-center relative group" style={{ background: 'rgba(120,101,248,0.08)', border: '1px solid rgba(120,101,248,0.15)' }}>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => handleEditStat(stat)} className="p-1 rounded transition-colors" style={{ color: '#8AB4FF' }}><Icons.Edit className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteStat(stat.id)} className="p-1 rounded transition-colors" style={{ color: '#FF7878' }}><Icons.Trash2 className="w-3 h-3" /></button>
                          </div>
                          <p className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{stat.value}{stat.suffix}</p>
                          <p className="text-sm mt-1" style={{ color: THEME.text.muted }}>{stat.label}</p>
                        </motion.div>
                      ))}
                  </div>
                )}
              </ThemedCard>
            </div>
          </div>
        )}

        {/* ============ 社交链接管理 ============ */}
        {mainTab === 'social' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>添加社交链接</h3>
              <form onSubmit={handleSocialLinkSubmit} className="space-y-4">
                <ThemedInput type="text" value={socialLinkForm.name} onChange={(e) => setSocialLinkForm({ ...socialLinkForm, name: e.target.value })} placeholder="名称（如：微信、B站）" required />
                <ThemedSelect value={socialLinkForm.icon} onChange={(e) => setSocialLinkForm({ ...socialLinkForm, icon: e.target.value })}>
                  {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </ThemedSelect>
                <ThemedInput type="url" value={socialLinkForm.url} onChange={(e) => setSocialLinkForm({ ...socialLinkForm, url: e.target.value })} placeholder="链接地址" required />
                <ThemedButton type="submit" fullWidth variant="gradient">{editingSocialLink ? '更新链接' : '添加链接'}</ThemedButton>
              </form>
            </ThemedCard>
            <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>社交链接列表 ({socialLinks.length})</h3>
              {socialLinks.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: THEME.text.muted }}>暂无社交链接</p> : (
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map(link => (
                    <motion.div key={link.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl relative group" style={{ background: 'rgba(13,10,24,0.4)', border: '1px solid rgba(120,101,248,0.1)' }}>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => handleEditSocialLink(link)} className="p-2 rounded-lg" style={{ color: '#8AB4FF' }}><Icons.Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSocialLink(link.id)} className="p-2 rounded-lg" style={{ color: '#FF7878' }}><Icons.Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)' }}>{getIcon(link.icon)}</div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: THEME.text.primary }}>{link.name}</p>
                          <p className="text-xs truncate" style={{ color: THEME.text.muted }}>{link.url}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ThemedCard>
          </div>
        )}

        {/* ============ 数据统计 ============ */}
        {mainTab === 'stats' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '图片作品', value: userArtworks.length, icon: Icons.Image, color: '#7865F8' },
              { label: '视频作品', value: userVideos.length, icon: Icons.Video, color: '#A991FF' },
              { label: '技能数量', value: skills.length, icon: Icons.Zap, color: '#8AB4FF' },
              { label: '时间线', value: timeline.length, icon: Icons.Clock, color: '#C7B8FF' },
              { label: '社交链接', value: socialLinks.length, icon: Icons.Link, color: '#FFB86B' },
              { label: '图片分类', value: imageCategories.length, icon: Icons.Tags, color: '#FF7878' },
              { label: '视频分类', value: videoCategories.length, icon: Icons.Tag, color: '#A6E89B' },
              { label: '统计数据', value: stats.length, icon: Icons.BarChart3, color: '#FFD93D' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl text-center" style={{ background: 'rgba(26,22,40,0.7)', border: '1px solid rgba(120,101,248,0.15)' }}>
                <item.icon className="w-6 h-6 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-3xl font-bold" style={{ color: THEME.text.primary }}>{item.value}</p>
                <p className="text-xs mt-1" style={{ color: THEME.text.muted }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ============ 网站配置管理 ============ */}
        {mainTab === 'config' && siteConfig && (
          <ThemedCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: THEME.text.primary }}>网站配置</h3>
            <form onSubmit={handleConfigSubmit} className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: THEME.text.secondary }}>Hero 区域</h4>
                <ThemedInput type="text" value={siteConfig.heroTitle} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroTitle: e.target.value } : null)} placeholder="网站标题" />
                <ThemedInput type="text" value={siteConfig.heroSubtitle} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroSubtitle: e.target.value } : null)} placeholder="副标题" />
                <ThemedTextarea value={siteConfig.heroDescription} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroDescription: e.target.value } : null)} placeholder="描述" rows={3} />
              </div>
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: THEME.text.secondary }}>关于区域</h4>
                <ThemedInput type="text" value={siteConfig.aboutTitle} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTitle: e.target.value } : null)} placeholder="关于标题" />
                <ThemedInput type="text" value={siteConfig.aboutName} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutName: e.target.value } : null)} placeholder="姓名" />
                <ThemedTextarea value={siteConfig.aboutDescription} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutDescription: e.target.value } : null)} placeholder="个人描述" rows={3} />
                <ThemedInput type="text" value={siteConfig.aboutTags} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTags: e.target.value } : null)} placeholder="标签（逗号分隔）" />
                <ThemedInput type="text" value={siteConfig.avatarUrl} onChange={(e) => setSiteConfig(prev => prev ? { ...prev, avatarUrl: e.target.value } : null)} placeholder="头像链接" />
              </div>
              <div className="lg:col-span-2">
                <ThemedButton type="submit" fullWidth variant="gradient">保存配置</ThemedButton>
              </div>
            </form>
          </ThemedCard>
        )}
      </div>

      {/* ============ 固定底部操作栏 ============ */}
      {mainTab === 'works' && editorMode === 'edit' && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ background: 'rgba(13,10,24,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(120,101,248,0.15)' }}
        >
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {editingArtwork && (
                  <span className="text-sm" style={{ color: THEME.text.muted }}>
                    编辑中：<strong style={{ color: THEME.text.primary }}>{editingArtwork.title}</strong>
                  </span>
                )}
                {editingVideo && (
                  <span className="text-sm" style={{ color: THEME.text.muted }}>
                    编辑中：<strong style={{ color: THEME.text.primary }}>{editingVideo.title}</strong>
                  </span>
                )}
                {editingVideoEdit && (
                  <span className="text-sm" style={{ color: THEME.text.muted }}>
                    编辑中：<strong style={{ color: THEME.text.primary }}>{editingVideoEdit.title}</strong>
                  </span>
                )}
                {!editingArtwork && !editingVideo && !editingVideoEdit && (
                  <span className="text-sm" style={{ color: THEME.text.dim }}>
                    {worksTab === 'image' ? '图片作品' : worksTab === 'videoEdit' ? '视频剪辑' : '视频作品'} · 编辑模式
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {(editingArtwork || editingVideo || editingVideoEdit) && (
                  <ThemedButton onClick={handleCancelEdit} variant="ghost">取消编辑</ThemedButton>
                )}
                <ThemedButton onClick={() => setEditorMode('preview')} variant="ghost">
                  <Icons.Eye className="w-4 h-4 inline mr-1" />预览
                </ThemedButton>
                <ThemedButton
                  onClick={() => {
                    if (worksTab === 'image') {
                      handleImageSubmit({ preventDefault: () => {} } as any);
                    } else if (worksTab === 'videoEdit') {
                      handleSubmitVideoEdit({ preventDefault: () => {} } as any);
                    } else {
                      handleVideoSubmit({ preventDefault: () => {} } as any);
                    }
                  }}
                  disabled={uploading}
                  variant="gradient"
                >
                  {uploading || videoEditUploading ? '上传中...' : (editingArtwork || editingVideo || editingVideoEdit ? '保存修改' : (worksTab === 'image' ? '上传图片' : worksTab === 'videoEdit' ? '上传视频剪辑' : '上传视频'))}
                </ThemedButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============= Prompt 编辑器组件 =============
function PromptEditor({ imageForm, setImageForm }: {
  imageForm: ArtworkForm; setImageForm: React.Dispatch<React.SetStateAction<ArtworkForm>>;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(120,101,248,0.04)', border: '1px solid rgba(120,101,248,0.15)' }}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 transition-colors"
        style={{ background: expanded ? 'rgba(120,101,248,0.08)' : 'transparent' }}>
        <div className="flex items-center gap-2">
          <Icons.Sparkles className="w-4 h-4" style={{ color: '#A991FF' }} />
          <span className="text-sm font-semibold" style={{ color: THEME.text.primary }}>作品提示词（Prompt）</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Icons.ChevronDown className="w-4 h-4" style={{ color: THEME.text.muted }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>正向 Prompt</label>
                <AutoGrowTextarea value={imageForm.prompt} onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                  placeholder="描述你想要的画面，例如：masterpiece, best quality, 1girl, white dress..." minRows={6} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>负向 Prompt</label>
                <AutoGrowTextarea value={imageForm.negativePrompt} onChange={(e) => setImageForm({ ...imageForm, negativePrompt: e.target.value })}
                  placeholder="不希望出现的元素，例如：lowres, bad anatomy, blurry..." minRows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>模型</label>
                  <ThemedInput type="text" value={imageForm.model} onChange={(e) => setImageForm({ ...imageForm, model: e.target.value })} placeholder="如：SDXL / Midjourney" />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>尺寸</label>
                  <ThemedInput type="text" value={imageForm.dimensions} onChange={(e) => setImageForm({ ...imageForm, dimensions: e.target.value })} placeholder="如：1024x1536" />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: THEME.text.muted }}>创作描述（简介）</label>
                <AutoGrowTextarea value={imageForm.description} onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                  placeholder="这幅作品的创作思路..." minRows={3} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    Mail: <Icons.Mail className="w-5 h-5 text-white" />, MessageCircle: <Icons.MessageCircle className="w-5 h-5 text-white" />,
    Video: <Icons.Video className="w-5 h-5 text-white" />, Music: <Icons.Music className="w-5 h-5 text-white" />,
    BookOpen: <Icons.BookOpen className="w-5 h-5 text-white" />, Github: <Icons.Github className="w-5 h-5 text-white" />,
    Twitter: <Icons.Twitter className="w-5 h-5 text-white" />, Instagram: <Icons.Instagram className="w-5 h-5 text-white" />,
    Linkedin: <Icons.Linkedin className="w-5 h-5 text-white" />, Youtube: <Icons.Youtube className="w-5 h-5 text-white" />,
  };
  return iconMap[iconName] || <Icons.Link className="w-5 h-5 text-white" />;
}
