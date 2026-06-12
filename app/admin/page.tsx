"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import * as worksService from '@/lib/worksService';
import type { Artwork, Video, Skill, TimelineItem, Stat, SocialLink, SiteConfig } from '@/lib/worksService';

interface ArtworkForm {
  title: string;
  category: string;
  tags: string;
  date: string;
  image: string;
}

interface VideoForm {
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  videoFile: string;
  category: string;
}

interface SkillForm {
  name: string;
  level: string;
}

interface TimelineForm {
  year: string;
  title: string;
  description: string;
}

interface StatForm {
  value: string;
  label: string;
  suffix: string;
}

interface SocialLinkForm {
  name: string;
  icon: string;
  url: string;
}

const iconOptions = ['Mail', 'MessageCircle', 'Video', 'Music', 'BookOpen', 'Github', 'Twitter', 'Instagram', 'Linkedin', 'Youtube'];
const ADMIN_PASSWORD = 'ai@studio2024';

type MainTab = 'works' | 'about' | 'social' | 'config';
type WorksTab = 'image' | 'video';
type AboutTab = 'skills' | 'timeline' | 'stats';

// ============= 统一主题样式常量 =============
const THEME = {
  // 卡片背景 - 深紫色毛玻璃
  card: {
    background: 'rgba(26, 22, 40, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(120, 101, 248, 0.15)',
    borderRadius: '1.5rem',
  },
  // 输入框
  input: {
    background: 'rgba(13, 10, 24, 0.6)',
    border: '1px solid rgba(120, 101, 248, 0.15)',
    color: '#ECE7FF',
    placeholderColor: 'rgba(199, 184, 255, 0.4)',
  },
  // 文字颜色
  text: {
    primary: '#ECE7FF',
    secondary: '#C7B8FF',
    muted: 'rgba(199, 184, 255, 0.7)',
    dim: 'rgba(199, 184, 255, 0.5)',
  },
  // 渐变按钮
  gradientBtn: {
    background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
    color: '#F8F7FC',
    boxShadow: '0 4px 20px rgba(120, 101, 248, 0.3)',
  },
  // 普通按钮
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
      style={{
        ...THEME.input,
        fontSize: '0.95rem',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#7865F8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 101, 248, 0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.15)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function ThemedTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${className || ''}`}
      style={{
        ...THEME.input,
        fontSize: '0.95rem',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#7865F8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 101, 248, 0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.15)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function ThemedSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${className || ''}`}
      style={{
        ...THEME.input,
        fontSize: '0.95rem',
      }}
    >
      {children}
    </select>
  );
}

function ThemedButton({
  children,
  onClick,
  type = 'button',
  disabled,
  variant = 'gradient',
  className = '',
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'gradient' | 'ghost';
  className?: string;
  fullWidth?: boolean;
}) {
  const baseStyle = variant === 'gradient' ? THEME.gradientBtn : THEME.ghostBtn;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} py-3 rounded-xl font-medium ${className}`}
      style={{
        ...baseStyle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}

function ThemedCard({
  children,
  className = '',
  initial,
  animate,
}: {
  children: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
}) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      className={`p-6 ${className}`}
      style={THEME.card}
    >
      {children}
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

  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const [imageForm, setImageForm] = useState<ArtworkForm>({
    title: '',
    category: '二次元',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: '',
    description: '',
    duration: '00:00',
    thumbnail: '',
    url: '',
    videoFile: '',
    category: '二次元',
  });
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  const loadAllData = async () => {
    try {
      const [artworks, videos, skillsData, timelineData, statsData, socialLinksData, config] = await Promise.all([
        worksService.getArtworks(),
        worksService.getVideos(),
        worksService.getSkills(),
        worksService.getTimeline(),
        worksService.getStats(),
        worksService.getSocialLinks(),
        worksService.getSiteConfig(),
      ]);
      setUserArtworks(artworks);
      setUserVideos(videos);
      setSkills(skillsData);
      setTimeline(timelineData);
      setStats(statsData);
      setSocialLinks(socialLinksData);
      setSiteConfig(config);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    const storedImg = localStorage.getItem('imageCategories');
    if (storedImg) {
      try {
        const parsed = JSON.parse(storedImg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImageCategories(parsed);
        }
      } catch {
        setImageCategories(defaultImageCategories);
      }
    }
    const storedVid = localStorage.getItem('videoCategories');
    if (storedVid) {
      try {
        const parsed = JSON.parse(storedVid);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVideoCategories(parsed);
        }
      } catch {
        setVideoCategories(defaultVideoCategories);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('imageCategories', JSON.stringify(imageCategories));
  }, [imageCategories]);
  useEffect(() => {
    localStorage.setItem('videoCategories', JSON.stringify(videoCategories));
  }, [videoCategories]);

  const handleAddImageCategory = () => {
    const trimmed = newImageCategory.trim();
    if (!trimmed) {
      alert('请输入分类名称');
      return;
    }
    if (imageCategories.includes(trimmed)) {
      alert('该分类已存在');
      return;
    }
    setImageCategories([...imageCategories, trimmed]);
    setNewImageCategory('');
  };

  const handleAddVideoCategory = () => {
    const trimmed = newVideoCategory.trim();
    if (!trimmed) {
      alert('请输入分类名称');
      return;
    }
    if (videoCategories.includes(trimmed)) {
      alert('该分类已存在');
      return;
    }
    setVideoCategories([...videoCategories, trimmed]);
    setNewVideoCategory('');
  };

  const handleDeleteImageCategory = (category: string) => {
    if (!confirm(`确定要删除图片分类"${category}"吗？`)) return;
    const filtered = imageCategories.filter(c => c !== category);
    setImageCategories(filtered);
    if (imageForm.category === category) {
      setImageForm({ ...imageForm, category: filtered[0] || defaultImageCategories[0] });
    }
  };

  const handleDeleteVideoCategory = (category: string) => {
    if (!confirm(`确定要删除视频分类"${category}"吗？`)) return;
    const filtered = videoCategories.filter(c => c !== category);
    setVideoCategories(filtered);
    if (videoCategory === category) {
      setVideoCategory(filtered[0] || defaultVideoCategories[0]);
    }
  };

  const handleClearAllWorks = async (type: 'image' | 'video') => {
    if (!confirm(`确定要清空所有${type === 'image' ? '图片' : '视频'}作品吗？此操作不可恢复！`)) return;
    if (!confirm('再次确认：所有作品数据将被永久删除！')) return;
    try {
      if (type === 'image') {
        for (const art of userArtworks) {
          await worksService.deleteArtwork(art.id);
        }
        localStorage.removeItem('userArtworks');
        setUserArtworks([]);
      } else {
        for (const vid of userVideos) {
          await worksService.deleteVideo(vid.id);
        }
        localStorage.removeItem('userVideos');
        setUserVideos([]);
      }
      alert('清空完成');
    } catch (error) {
      console.error('Clear failed:', error);
      alert('清空失败：' + (error as Error).message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      setLoginError('');
    } else {
      setLoginError('密码错误，请重试');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageForm({ ...imageForm, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setVideoThumbnailPreview(base64String);
        setVideoForm({ ...videoForm, thumbnail: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('请上传视频文件');
        return;
      }
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('视频文件太大，请上传小于50MB的视频');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setVideoPreview(base64String);
        setVideoForm({ ...videoForm, videoFile: base64String });
        generateThumbnail(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateThumbnail = (videoDataUrl: string) => {
    const video = document.createElement('video');
    video.src = videoDataUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration / 2, 1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setVideoThumbnailPreview(thumbnailDataUrl);
        setVideoForm(prev => ({ ...prev, thumbnail: thumbnailDataUrl }));
      }
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      console.error('视频缩略图生成失败');
    };
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const tagsArray = imageForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      await worksService.createArtwork({
        title: imageForm.title,
        category: imageForm.category,
        tags: tagsArray,
        date: imageForm.date,
        image: imageForm.image,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setImageForm({ title: '', category: '二次元', tags: '', date: new Date().toISOString().split('T')[0], image: '' });
      setImagePreview(null);
      loadAllData();
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error?.message || String(error);
      if (message.includes('Bucket not found') || message.includes('bucket') || message.includes('storage')) {
        alert('上传失败：Supabase 存储桶未配置，请联系管理员检查 media bucket 是否存在。');
      } else if (message.includes('JWT') || message.includes('token') || message.includes('auth') || message.includes('Unauthorized')) {
        alert('上传失败：Supabase 密钥无效，请检查环境变量配置。');
      } else if (message.includes('row-level') || message.includes('permission') || message.includes('policy')) {
        alert('上传失败：Supabase 权限不足，请检查数据库和存储的 RLS 策略。');
      } else if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
        alert('上传失败：网络连接问题，请检查网络后重试。');
      } else {
        alert('上传失败：' + message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      await worksService.createVideo({
        title: videoForm.title,
        description: videoForm.description,
        duration: videoForm.duration,
        thumbnail: videoForm.thumbnail,
        url: videoForm.url,
        videoFile: videoForm.videoFile || undefined,
        category: videoForm.category,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setVideoForm({ title: '', description: '', duration: '00:00', thumbnail: '', url: '', videoFile: '', category: '二次元' });
      setVideoThumbnailPreview(null);
      setVideoPreview(null);
      loadAllData();
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error?.message || String(error);
      if (message.includes('Bucket not found') || message.includes('bucket') || message.includes('storage')) {
        alert('上传失败：Supabase 存储桶未配置，请联系管理员检查 media bucket 是否存在。');
      } else if (message.includes('JWT') || message.includes('token') || message.includes('auth') || message.includes('Unauthorized')) {
        alert('上传失败：Supabase 密钥无效，请检查环境变量配置。');
      } else if (message.includes('row-level') || message.includes('permission') || message.includes('policy')) {
        alert('上传失败：Supabase 权限不足，请检查数据库和存储的 RLS 策略。');
      } else if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
        alert('上传失败：网络连接问题，请检查网络后重试。');
      } else {
        alert('上传失败：' + message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('确定要删除这个作品吗？')) return;
    try {
      await worksService.deleteArtwork(id);
      setUserArtworks(prev => prev.filter(a => a.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await worksService.deleteVideo(id);
      setUserVideos(prev => prev.filter(v => v.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await worksService.updateSkill(editingSkill.id, { name: skillForm.name, level: parseInt(skillForm.level) });
      } else {
        await worksService.createSkill({ name: skillForm.name, level: parseInt(skillForm.level) });
      }
      setSkillForm({ name: '', level: '80' });
      setEditingSkill(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      loadAllData();
    } catch (error) {
      alert('操作失败，请重试');
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, level: skill.level.toString() });
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('确定要删除这个技能吗？')) return;
    try {
      await worksService.deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTimeline) {
        await worksService.updateTimelineItem(editingTimeline.id, timelineForm);
      } else {
        await worksService.createTimelineItem(timelineForm);
      }
      setTimelineForm({ year: '', title: '', description: '' });
      setEditingTimeline(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      loadAllData();
    } catch (error) {
      alert('操作失败，请重试');
    }
  };

  const handleEditTimeline = (item: TimelineItem) => {
    setEditingTimeline(item);
    setTimelineForm({ year: item.year, title: item.title, description: item.description });
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('确定要删除这个时间线项目吗？')) return;
    try {
      await worksService.deleteTimelineItem(id);
      setTimeline(prev => prev.filter(t => t.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStat) {
        await worksService.updateStat(editingStat.id, { value: parseInt(statForm.value), label: statForm.label, suffix: statForm.suffix });
      } else {
        await worksService.createStat({ value: parseInt(statForm.value), label: statForm.label, suffix: statForm.suffix });
      }
      setStatForm({ value: '', label: '', suffix: '' });
      setEditingStat(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      loadAllData();
    } catch (error) {
      alert('操作失败，请重试');
    }
  };

  const handleEditStat = (stat: Stat) => {
    setEditingStat(stat);
    setStatForm({ value: stat.value.toString(), label: stat.label, suffix: stat.suffix });
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm('确定要删除这个统计数据吗？')) return;
    try {
      await worksService.deleteStat(id);
      setStats(prev => prev.filter(s => s.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleSocialLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSocialLink) {
        await worksService.updateSocialLink(editingSocialLink.id, socialLinkForm);
      } else {
        await worksService.createSocialLink(socialLinkForm);
      }
      setSocialLinkForm({ name: '', icon: 'Mail', url: '' });
      setEditingSocialLink(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      loadAllData();
    } catch (error) {
      alert('操作失败，请重试');
    }
  };

  const handleEditSocialLink = (link: SocialLink) => {
    setEditingSocialLink(link);
    setSocialLinkForm({ name: link.name, icon: link.icon, url: link.url });
  };

  const handleDeleteSocialLink = async (id: string) => {
    if (!confirm('确定要删除这个社交链接吗？')) return;
    try {
      await worksService.deleteSocialLink(id);
      setSocialLinks(prev => prev.filter(s => s.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (siteConfig) {
        await worksService.updateSiteConfig(siteConfig);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        alert('配置更新成功！');
      }
    } catch (error) {
      alert('更新失败，请重试');
    }
  };

  // ============= 登录页面 =============
  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{
          background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 50%, #1A1628 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 w-full max-w-md"
          style={THEME.card}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={THEME.gradientBtn}
            >
              <Icons.Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: "'Smiley Sans', sans-serif",
              }}
            >
              墨璃 - 管理后台
            </h1>
            <p style={{ color: THEME.text.muted }}>请输入管理员密码</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: THEME.text.secondary }}>
                密码
              </label>
              <div className="relative">
                <ThemedInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: THEME.text.muted }}
                >
                  {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginError && (
                <p className="text-sm mt-2" style={{ color: '#FF6B7A' }}>
                  {loginError}
                </p>
              )}
            </div>
            <ThemedButton type="submit" fullWidth variant="gradient">
              登录
            </ThemedButton>
          </form>
          {/* 已移除底部密码提示 */}
        </motion.div>
      </div>
    );
  }

  // ============= 主后台界面 =============
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0A0812 0%, #120F1F 50%, #1A1628 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 顶部导航栏 */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(13, 10, 24, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(120, 101, 248, 0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <h1
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontFamily: "'Smiley Sans', sans-serif",
                }}
              >
                墨璃 · MOLI - 管理后台
              </h1>
              <nav className="flex gap-2 flex-wrap">
                {[
                  { key: 'works', label: '作品管理', icon: Icons.Image },
                  { key: 'about', label: '关于页面', icon: Icons.User },
                  { key: 'social', label: '社交链接', icon: Icons.Link },
                  { key: 'config', label: '网站配置', icon: Icons.Settings },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key as MainTab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={
                      mainTab === tab.key
                        ? THEME.gradientBtn
                        : {
                            ...THEME.ghostBtn,
                          }
                    }
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-sm transition-colors"
                style={{ color: THEME.text.muted }}
              >
                返回首页
              </a>
              <ThemedButton onClick={handleLogout} variant="ghost">
                退出登录
              </ThemedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl text-center"
            style={{
              background: 'rgba(82, 196, 26, 0.15)',
              border: '1px solid rgba(82, 196, 26, 0.3)',
              color: '#A6E89B',
            }}
          >
            操作成功！
          </motion.div>
        )}

        {/* ============ 作品管理 ============ */}
        {mainTab === 'works' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setWorksTab('image')}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={worksTab === 'image' ? THEME.gradientBtn : THEME.ghostBtn}
                  >
                    图片作品
                  </button>
                  <button
                    onClick={() => setWorksTab('video')}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={worksTab === 'video' ? THEME.gradientBtn : THEME.ghostBtn}
                  >
                    视频作品
                  </button>
                </div>

                {worksTab === 'image' && (
                  <form onSubmit={handleImageSubmit} className="space-y-4">
                    <ThemedInput
                      type="text"
                      value={imageForm.title}
                      onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                      placeholder="作品标题"
                      required
                    />
                    <div className="space-y-2">
                      <ThemedSelect
                        value={imageForm.category}
                        onChange={(e) => setImageForm({ ...imageForm, category: e.target.value })}
                      >
                        {imageCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </ThemedSelect>
                      <div
                        className="rounded-xl p-3 space-y-2"
                        style={{
                          border: '1px solid rgba(120, 101, 248, 0.15)',
                          background: 'rgba(13, 10, 24, 0.4)',
                        }}
                      >
                        <p className="text-sm font-medium" style={{ color: THEME.text.secondary }}>
                          管理图片分类标签
                        </p>
                        <div className="flex gap-2">
                          <ThemedInput
                            type="text"
                            value={newImageCategory}
                            onChange={(e) => setNewImageCategory(e.target.value)}
                            placeholder="新分类名称"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageCategory(); } }}
                          />
                          <ThemedButton onClick={handleAddImageCategory} variant="gradient">
                            添加
                          </ThemedButton>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {imageCategories.map(cat => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{
                                background: 'rgba(120, 101, 248, 0.15)',
                                color: '#A991FF',
                              }}
                            >
                              {cat}
                              <button
                                type="button"
                                onClick={() => handleDeleteImageCategory(cat)}
                                className="rounded-full p-0.5 hover:bg-purple-500/20"
                              >
                                <Icons.X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ThemedInput
                      type="text"
                      value={imageForm.tags}
                      onChange={(e) => setImageForm({ ...imageForm, tags: e.target.value })}
                      placeholder="标签（逗号分隔）"
                    />
                    <ThemedInput
                      type="date"
                      value={imageForm.date}
                      onChange={(e) => setImageForm({ ...imageForm, date: e.target.value })}
                    />
                    <div
                      className="w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
                      style={{
                        borderColor: 'rgba(120, 101, 248, 0.25)',
                      }}
                      onClick={() => document.getElementById('image-upload')?.click()}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7865F8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.25)')}
                    >
                      <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Icons.Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#A991FF' }} />
                      <p className="text-sm" style={{ color: THEME.text.muted }}>上传图片</p>
                    </div>
                    {imagePreview && (
                      <div className="relative rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full" />
                        <button
                          type="button"
                          onClick={() => { setImageForm({ ...imageForm, image: '' }); setImagePreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: 'rgba(13, 10, 24, 0.85)',
                            color: '#ECE7FF',
                            border: '1px solid rgba(120, 101, 248, 0.3)',
                          }}
                        >
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <ThemedButton type="submit" disabled={!imageForm.image || uploading} fullWidth variant="gradient">
                      {uploading ? '上传中...' : '上传图片'}
                    </ThemedButton>
                  </form>
                )}

                {worksTab === 'video' && (
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <ThemedInput
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      placeholder="视频标题"
                      required
                    />
                    <div className="space-y-2">
                      <ThemedSelect
                        value={videoForm.category}
                        onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                      >
                        {videoCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </ThemedSelect>
                      <div
                        className="rounded-xl p-3 space-y-2"
                        style={{
                          border: '1px solid rgba(120, 101, 248, 0.15)',
                          background: 'rgba(13, 10, 24, 0.4)',
                        }}
                      >
                        <p className="text-sm font-medium" style={{ color: THEME.text.secondary }}>
                          管理视频分类标签
                        </p>
                        <div className="flex gap-2">
                          <ThemedInput
                            type="text"
                            value={newVideoCategory}
                            onChange={(e) => setNewVideoCategory(e.target.value)}
                            placeholder="新分类名称"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideoCategory(); } }}
                          />
                          <ThemedButton onClick={handleAddVideoCategory} variant="gradient">
                            添加
                          </ThemedButton>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {videoCategories.map(cat => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{
                                background: 'rgba(120, 101, 248, 0.15)',
                                color: '#A991FF',
                              }}
                            >
                              {cat}
                              <button
                                type="button"
                                onClick={() => handleDeleteVideoCategory(cat)}
                                className="rounded-full p-0.5 hover:bg-purple-500/20"
                              >
                                <Icons.X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ThemedTextarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      placeholder="视频描述"
                      rows={2}
                    />
                    <ThemedInput
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      placeholder="时长"
                    />
                    <div
                      className="w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
                      style={{
                        borderColor: 'rgba(120, 101, 248, 0.25)',
                      }}
                      onClick={() => document.getElementById('video-file-upload')?.click()}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7865F8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(120, 101, 248, 0.25)')}
                    >
                      <input id="video-file-upload" type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                      <Icons.Video className="w-8 h-8 mx-auto mb-2" style={{ color: '#A991FF' }} />
                      <p className="text-sm" style={{ color: THEME.text.muted }}>上传视频文件</p>
                    </div>
                    {videoPreview && (
                      <div className="relative rounded-xl overflow-hidden">
                        <video src={videoPreview} controls className="w-full" />
                        <button
                          type="button"
                          onClick={() => { setVideoForm({ ...videoForm, videoFile: '', thumbnail: '' }); setVideoPreview(null); setVideoThumbnailPreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: 'rgba(13, 10, 24, 0.85)',
                            color: '#ECE7FF',
                            border: '1px solid rgba(120, 101, 248, 0.3)',
                          }}
                        >
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <ThemedInput
                      type="url"
                      value={videoForm.url}
                      onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                      placeholder="YouTube链接（可选）"
                    />
                    <ThemedButton
                      type="submit"
                      disabled={(!videoForm.thumbnail || (!videoForm.videoFile && !videoForm.url)) || uploading}
                      fullWidth
                      variant="gradient"
                    >
                      {uploading ? '上传中...' : '上传视频'}
                    </ThemedButton>
                  </form>
                )}
              </ThemedCard>
            </div>

            {/* 作品列表 */}
            <div className="lg:col-span-2">
              <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: THEME.text.primary }}>
                    {worksTab === 'image' ? `图片作品 (${userArtworks.length})` : `视频作品 (${userVideos.length})`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleClearAllWorks(worksTab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    style={{
                      background: 'rgba(255, 77, 79, 0.12)',
                      color: '#FF7878',
                      border: '1px solid rgba(255, 77, 79, 0.25)',
                    }}
                  >
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                    清空所有
                  </button>
                </div>
                {worksTab === 'image' ? (
                  userArtworks.length === 0 ? (
                    <p className="text-center py-8" style={{ color: THEME.text.muted }}>暂无图片作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {userArtworks.map(artwork => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-xl overflow-hidden group"
                          style={{ border: '1px solid rgba(120, 101, 248, 0.15)' }}
                        >
                          <img src={artwork.image} alt={artwork.title} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              className="p-2 rounded-full"
                              style={{ background: '#FF4D4F', color: '#fff' }}
                            >
                              <Icons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div
                            className="absolute bottom-0 left-0 right-0 p-2"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
                          >
                            <p className="text-white text-sm truncate">{artwork.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  userVideos.length === 0 ? (
                    <p className="text-center py-8" style={{ color: THEME.text.muted }}>暂无视频作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {userVideos.map(video => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-xl overflow-hidden group"
                          style={{ border: '1px solid rgba(120, 101, 248, 0.15)' }}
                        >
                          <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 rounded-full"
                              style={{ background: '#FF4D4F', color: '#fff' }}
                            >
                              <Icons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div
                            className="absolute bottom-0 left-0 right-0 p-2"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
                          >
                            <p className="text-white text-sm truncate">{video.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </ThemedCard>
            </div>
          </div>
        )}

        {/* ============ 关于页面管理 ============ */}
        {mainTab === 'about' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ThemedCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex gap-2 mb-6">
                  {[
                    { key: 'skills', label: '技能' },
                    { key: 'timeline', label: '时间线' },
                    { key: 'stats', label: '统计数据' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setAboutTab(tab.key as AboutTab); setEditingSkill(null); setEditingTimeline(null); setEditingStat(null); }}
                      className="flex-1 py-2 rounded-lg font-medium transition-all"
                      style={aboutTab === tab.key ? THEME.gradientBtn : THEME.ghostBtn}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {aboutTab === 'skills' && (
                  <form onSubmit={handleSkillSubmit} className="space-y-4">
                    <ThemedInput
                      type="text"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="技能名称"
                      required
                    />
                    <ThemedInput
                      type="number"
                      min="0"
                      max="100"
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                      placeholder="熟练度 (0-100)"
                      required
                    />
                    <ThemedButton type="submit" fullWidth variant="gradient">
                      {editingSkill ? '更新技能' : '添加技能'}
                    </ThemedButton>
                  </form>
                )}

                {aboutTab === 'timeline' && (
                  <form onSubmit={handleTimelineSubmit} className="space-y-4">
                    <ThemedInput
                      type="text"
                      value={timelineForm.year}
                      onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })}
                      placeholder="年份"
                      required
                    />
                    <ThemedInput
                      type="text"
                      value={timelineForm.title}
                      onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                      placeholder="标题"
                      required
                    />
                    <ThemedTextarea
                      value={timelineForm.description}
                      onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                      placeholder="描述"
                      rows={3}
                    />
                    <ThemedButton type="submit" fullWidth variant="gradient">
                      {editingTimeline ? '更新时间线' : '添加时间线'}
                    </ThemedButton>
                  </form>
                )}

                {aboutTab === 'stats' && (
                  <form onSubmit={handleStatSubmit} className="space-y-4">
                    <ThemedInput
                      type="number"
                      value={statForm.value}
                      onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                      placeholder="数值"
                      required
                    />
                    <ThemedInput
                      type="text"
                      value={statForm.label}
                      onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                      placeholder="标签"
                      required
                    />
                    <ThemedInput
                      type="text"
                      value={statForm.suffix}
                      onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                      placeholder="后缀（如：+、小时）"
                    />
                    <ThemedButton type="submit" fullWidth variant="gradient">
                      {editingStat ? '更新统计' : '添加统计'}
                    </ThemedButton>
                  </form>
                )}
              </ThemedCard>
            </div>

            <div>
              <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>
                  {aboutTab === 'skills' ? `技能列表 (${skills.length})` :
                    aboutTab === 'timeline' ? `时间线 (${timeline.length})` :
                      `统计数据 (${stats.length})`}
                </h3>

                {aboutTab === 'skills' && (
                  <div className="space-y-3">
                    {skills.length === 0 ? (
                      <p className="text-center py-8" style={{ color: THEME.text.muted }}>暂无技能</p>
                    ) : (
                      skills.map(skill => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-3 rounded-xl"
                          style={{
                            background: 'rgba(13, 10, 24, 0.4)',
                            border: '1px solid rgba(120, 101, 248, 0.1)',
                          }}
                        >
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: THEME.text.primary }}>{skill.name}</p>
                            <div
                              className="h-2 rounded-full mt-1 overflow-hidden"
                              style={{ background: 'rgba(120, 101, 248, 0.1)' }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: 'linear-gradient(90deg, #7865F8 0%, #A991FF 100%)',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <p className="text-xs mt-1" style={{ color: THEME.text.dim }}>{skill.level}%</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSkill(skill)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#8AB4FF' }}
                            >
                              <Icons.Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#FF7878' }}
                            >
                              <Icons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {aboutTab === 'timeline' && (
                  <div className="space-y-3">
                    {timeline.length === 0 ? (
                      <p className="text-center py-8" style={{ color: THEME.text.muted }}>暂无时间线</p>
                    ) : (
                      timeline.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl"
                          style={{
                            background: 'rgba(13, 10, 24, 0.4)',
                            border: '1px solid rgba(120, 101, 248, 0.1)',
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span
                              className="text-2xl font-bold"
                              style={{
                                background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: 'transparent',
                              }}
                            >
                              {item.year}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTimeline(item)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: '#8AB4FF' }}
                              >
                                <Icons.Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTimeline(item.id)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: '#FF7878' }}
                              >
                                <Icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-medium" style={{ color: THEME.text.primary }}>{item.title}</h4>
                          <p className="text-sm mt-1" style={{ color: THEME.text.muted }}>{item.description}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {aboutTab === 'stats' && (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.length === 0 ? (
                      <p className="col-span-2 text-center py-8" style={{ color: THEME.text.muted }}>暂无统计数据</p>
                    ) : (
                      stats.map(stat => (
                        <motion.div
                          key={stat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl text-center relative group"
                          style={{
                            background: 'rgba(120, 101, 248, 0.08)',
                            border: '1px solid rgba(120, 101, 248, 0.15)',
                          }}
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => handleEditStat(stat)}
                              className="p-1 rounded transition-colors"
                              style={{ color: '#8AB4FF' }}
                            >
                              <Icons.Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteStat(stat.id)}
                              className="p-1 rounded transition-colors"
                              style={{ color: '#FF7878' }}
                            >
                              <Icons.Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p
                            className="text-2xl font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              color: 'transparent',
                            }}
                          >
                            {stat.value}{stat.suffix}
                          </p>
                          <p className="text-sm mt-1" style={{ color: THEME.text.muted }}>{stat.label}</p>
                        </motion.div>
                      ))
                    )}
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
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>
                添加社交链接
              </h3>
              <form onSubmit={handleSocialLinkSubmit} className="space-y-4">
                <ThemedInput
                  type="text"
                  value={socialLinkForm.name}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, name: e.target.value })}
                  placeholder="名称（如：微信、B站）"
                  required
                />
                <ThemedSelect
                  value={socialLinkForm.icon}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, icon: e.target.value })}
                >
                  {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </ThemedSelect>
                <ThemedInput
                  type="url"
                  value={socialLinkForm.url}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, url: e.target.value })}
                  placeholder="链接地址"
                  required
                />
                <ThemedButton type="submit" fullWidth variant="gradient">
                  {editingSocialLink ? '更新链接' : '添加链接'}
                </ThemedButton>
              </form>
            </ThemedCard>

            <ThemedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.text.primary }}>
                社交链接列表 ({socialLinks.length})
              </h3>
              {socialLinks.length === 0 ? (
                <p className="text-center py-8" style={{ color: THEME.text.muted }}>暂无社交链接</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map(link => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl relative group"
                      style={{
                        background: 'rgba(13, 10, 24, 0.4)',
                        border: '1px solid rgba(120, 101, 248, 0.1)',
                      }}
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEditSocialLink(link)}
                          className="p-2 rounded-lg"
                          style={{ color: '#8AB4FF' }}
                        >
                          <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="p-2 rounded-lg"
                          style={{ color: '#FF7878' }}
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
                          }}
                        >
                          {getIcon(link.icon)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: THEME.text.primary }}>{link.name}</p>
                          <p className="text-sm truncate" style={{ color: THEME.text.muted }}>{link.url}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ThemedCard>
          </div>
        )}

        {/* ============ 网站配置管理 ============ */}
        {mainTab === 'config' && siteConfig && (
          <ThemedCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: THEME.text.primary }}>网站配置</h3>
            <form onSubmit={handleConfigSubmit} className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: THEME.text.secondary }}>Hero 区域</h4>
                <ThemedInput
                  type="text"
                  value={siteConfig.heroTitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroTitle: e.target.value } : null)}
                  placeholder="网站标题"
                />
                <ThemedInput
                  type="text"
                  value={siteConfig.heroSubtitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroSubtitle: e.target.value } : null)}
                  placeholder="副标题"
                />
                <ThemedTextarea
                  value={siteConfig.heroDescription}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroDescription: e.target.value } : null)}
                  placeholder="描述"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: THEME.text.secondary }}>关于区域</h4>
                <ThemedInput
                  type="text"
                  value={siteConfig.aboutTitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTitle: e.target.value } : null)}
                  placeholder="关于标题"
                />
                <ThemedInput
                  type="text"
                  value={siteConfig.aboutName}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutName: e.target.value } : null)}
                  placeholder="姓名"
                />
                <ThemedTextarea
                  value={siteConfig.aboutDescription}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutDescription: e.target.value } : null)}
                  placeholder="个人描述"
                  rows={3}
                />
                <ThemedInput
                  type="text"
                  value={siteConfig.aboutTags}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTags: e.target.value } : null)}
                  placeholder="标签（逗号分隔）"
                />
                <ThemedInput
                  type="text"
                  value={siteConfig.avatarUrl}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, avatarUrl: e.target.value } : null)}
                  placeholder="头像链接"
                />
              </div>

              <div className="lg:col-span-2">
                <ThemedButton type="submit" fullWidth variant="gradient">
                  保存配置
                </ThemedButton>
              </div>
            </form>
          </ThemedCard>
        )}
      </div>
    </div>
  );
}

function getIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    Mail: <Icons.Mail className="w-5 h-5 text-white" />,
    MessageCircle: <Icons.MessageCircle className="w-5 h-5 text-white" />,
    Video: <Icons.Video className="w-5 h-5 text-white" />,
    Music: <Icons.Music className="w-5 h-5 text-white" />,
    BookOpen: <Icons.BookOpen className="w-5 h-5 text-white" />,
    Github: <Icons.Github className="w-5 h-5 text-white" />,
    Twitter: <Icons.Twitter className="w-5 h-5 text-white" />,
    Instagram: <Icons.Instagram className="w-5 h-5 text-white" />,
    Linkedin: <Icons.Linkedin className="w-5 h-5 text-white" />,
    Youtube: <Icons.Youtube className="w-5 h-5 text-white" />,
  };
  return iconMap[iconName] || <Icons.Mail className="w-5 h-5 text-white" />;
}
