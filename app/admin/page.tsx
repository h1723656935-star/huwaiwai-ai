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

const defaultCategories = ['二次元', '古风', '少女风', '温暖风格'];
const iconOptions = ['Mail', 'MessageCircle', 'Video', 'Music', 'BookOpen', 'Github', 'Twitter', 'Instagram', 'Linkedin', 'Youtube'];
const ADMIN_PASSWORD = 'ai@studio2024';

type MainTab = 'works' | 'about' | 'social' | 'config';
type WorksTab = 'image' | 'video';
type AboutTab = 'skills' | 'timeline' | 'stats';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // 主标签页
  const [mainTab, setMainTab] = useState<MainTab>('works');
  const [worksTab, setWorksTab] = useState<WorksTab>('image');
  const [aboutTab, setAboutTab] = useState<AboutTab>('skills');
  
  // 作品数据
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  
  // 关于页面数据
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  
  // 社交链接数据
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  // 网站配置
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  
  // 图片表单
  const [imageForm, setImageForm] = useState<ArtworkForm>({
    title: '',
    category: '二次元',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 视频表单
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
  
  // 技能表单
  const [skillForm, setSkillForm] = useState<SkillForm>({ name: '', level: '80' });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  
  // 时间线表单
  const [timelineForm, setTimelineForm] = useState<TimelineForm>({ year: '', title: '', description: '' });
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  
  // 统计表单
  const [statForm, setStatForm] = useState<StatForm>({ value: '', label: '', suffix: '' });
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  
  // 社交链接表单
  const [socialLinkForm, setSocialLinkForm] = useState<SocialLinkForm>({ name: '', icon: 'Mail', url: '' });
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null);
  
  // 自定义分类标签
  const [customCategories, setCustomCategories] = useState<string[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState('');
  const [videoCategory, setVideoCategory] = useState('二次元');

  // 状态
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

  // 加载自定义分类
  useEffect(() => {
    const stored = localStorage.getItem('customCategories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomCategories(parsed);
        }
      } catch {
        setCustomCategories(defaultCategories);
      }
    }
  }, []);

  // 保存自定义分类到localStorage
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // 添加自定义分类
  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      alert('请输入分类名称');
      return;
    }
    if (customCategories.includes(trimmed)) {
      alert('该分类已存在');
      return;
    }
    setCustomCategories([...customCategories, trimmed]);
    setNewCategory('');
  };

  // 删除自定义分类
  const handleDeleteCategory = (category: string) => {
    if (!confirm(`确定要删除分类"${category}"吗？`)) return;
    const filtered = customCategories.filter(c => c !== category);
    setCustomCategories(filtered);
    // 如果当前选中的分类被删除，重置为默认第一个
    if (imageForm.category === category) {
      setImageForm({ ...imageForm, category: filtered[0] || defaultCategories[0] });
    }
    if (videoCategory === category) {
      setVideoCategory(filtered[0] || defaultCategories[0]);
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

  // 图片上传处理
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

  // 缩略图上传处理
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

  // 视频文件上传处理
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('请上传视频文件');
        return;
      }
      // 检查文件大小（限制为50MB）
      const maxSize = 50 * 1024 * 1024; // 50MB
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
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
        setVideoThumbnailPreview(thumbnailDataUrl);
        setVideoForm(prev => ({ ...prev, thumbnail: thumbnailDataUrl }));
      }
    };
  };

  // 图片作品提交
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
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 视频作品提交
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
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 删除图片作品
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

  // 删除视频作品
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

  // 技能管理
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

  // 时间线管理
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

  // 统计管理
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

  // 社交链接管理
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

  // 网站配置管理
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Icons.Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">作品管理</h1>
            <p className="text-gray-500 mt-2">请输入管理员密码</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
            <motion.button
              type="submit"
              className="w-full gradient-btn text-white py-4 rounded-xl font-medium text-lg shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              登录
            </motion.button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">密码：ai@studio2024</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold gradient-text">胡歪歪 AI Studio - 管理后台</h1>
              <nav className="flex gap-2">
                {[
                  { key: 'works', label: '作品管理', icon: Icons.Image },
                  { key: 'about', label: '关于页面', icon: Icons.User },
                  { key: 'social', label: '社交链接', icon: Icons.Link },
                  { key: 'config', label: '网站配置', icon: Icons.Settings },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key as MainTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      mainTab === tab.key
                        ? 'gradient-btn text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-500 hover:text-primary transition-colors">返回首页</a>
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                退出登录
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-center"
          >
            操作成功！
          </motion.div>
        )}

        {/* 作品管理 */}
        {mainTab === 'works' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 上传表单 */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setWorksTab('image')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      worksTab === 'image' ? 'gradient-btn text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    图片作品
                  </button>
                  <button
                    onClick={() => setWorksTab('video')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      worksTab === 'video' ? 'gradient-btn text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    视频作品
                  </button>
                </div>

                {worksTab === 'image' && (
                  <form onSubmit={handleImageSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={imageForm.title}
                      onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="作品标题"
                      required
                    />
                    <div className="space-y-2">
                      <select
                        value={imageForm.category}
                        onChange={(e) => setImageForm({ ...imageForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {customCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      {/* 分类管理 */}
                      <div className="border border-primary/20 rounded-xl p-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">管理分类标签</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            placeholder="新分类名称"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                          >
                            添加
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {customCategories.map(cat => (
                            <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {cat}
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <Icons.X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={imageForm.tags}
                      onChange={(e) => setImageForm({ ...imageForm, tags: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="标签（逗号分隔）"
                    />
                    <input
                      type="date"
                      value={imageForm.date}
                      onChange={(e) => setImageForm({ ...imageForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <div
                      className="w-full border-2 border-dashed border-primary/20 rounded-xl p-4 text-center cursor-pointer hover:border-primary/40"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Icons.Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-gray-600">上传图片</p>
                    </div>
                    {imagePreview && (
                      <div className="relative rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full" />
                        <button
                          type="button"
                          onClick={() => { setImageForm({ ...imageForm, image: '' }); setImagePreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                        >
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <motion.button
                      type="submit"
                      disabled={!imageForm.image || uploading}
                      className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploading ? '上传中...' : '上传图片'}
                    </motion.button>
                  </form>
                )}

                {worksTab === 'video' && (
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="视频标题"
                      required
                    />
                    <select
                      value={videoForm.category}
                      onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      {customCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <textarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="视频描述"
                      rows={2}
                    />
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="时长"
                    />
                    <div
                      className="w-full border-2 border-dashed border-primary/20 rounded-xl p-4 text-center cursor-pointer hover:border-primary/40"
                      onClick={() => document.getElementById('video-file-upload')?.click()}
                    >
                      <input id="video-file-upload" type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                      <Icons.Video className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-gray-600">上传视频文件</p>
                    </div>
                    {videoPreview && (
                      <div className="relative rounded-xl overflow-hidden">
                        <video src={videoPreview} controls className="w-full" />
                        <button
                          type="button"
                          onClick={() => { setVideoForm({ ...videoForm, videoFile: '', thumbnail: '' }); setVideoPreview(null); setVideoThumbnailPreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                        >
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <input
                      type="url"
                      value={videoForm.url}
                      onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="YouTube链接（可选）"
                    />
                    <motion.button
                      type="submit"
                      disabled={(!videoForm.thumbnail || (!videoForm.videoFile && !videoForm.url)) || uploading}
                      className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploading ? '上传中...' : '上传视频'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </div>

            {/* 作品列表 */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {worksTab === 'image' ? `图片作品 (${userArtworks.length})` : `视频作品 (${userVideos.length})`}
                </h3>
                {worksTab === 'image' ? (
                  userArtworks.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无图片作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {userArtworks.map(artwork => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-xl overflow-hidden group"
                        >
                          <img src={artwork.image} alt={artwork.title} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              className="p-2 bg-red-500 rounded-full text-white"
                            >
                              <Icons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-sm truncate">{artwork.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  userVideos.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无视频作品</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {userVideos.map(video => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-xl overflow-hidden group"
                        >
                          <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 bg-red-500 rounded-full text-white"
                            >
                              <Icons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-sm truncate">{video.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* 关于页面管理 */}
        {mainTab === 'about' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 表单区域 */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex gap-2 mb-6">
                  {[
                    { key: 'skills', label: '技能' },
                    { key: 'timeline', label: '时间线' },
                    { key: 'stats', label: '统计数据' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setAboutTab(tab.key as AboutTab); setEditingSkill(null); setEditingTimeline(null); setEditingStat(null); }}
                      className={`flex-1 py-2 rounded-lg font-medium ${
                        aboutTab === tab.key ? 'gradient-btn text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {aboutTab === 'skills' && (
                  <form onSubmit={handleSkillSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="技能名称"
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="熟练度 (0-100)"
                      required
                    />
                    <motion.button
                      type="submit"
                      className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingSkill ? '更新技能' : '添加技能'}
                    </motion.button>
                  </form>
                )}

                {aboutTab === 'timeline' && (
                  <form onSubmit={handleTimelineSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={timelineForm.year}
                      onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="年份"
                      required
                    />
                    <input
                      type="text"
                      value={timelineForm.title}
                      onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="标题"
                      required
                    />
                    <textarea
                      value={timelineForm.description}
                      onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="描述"
                      rows={3}
                    />
                    <motion.button
                      type="submit"
                      className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingTimeline ? '更新时间线' : '添加时间线'}
                    </motion.button>
                  </form>
                )}

                {aboutTab === 'stats' && (
                  <form onSubmit={handleStatSubmit} className="space-y-4">
                    <input
                      type="number"
                      value={statForm.value}
                      onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="数值"
                      required
                    />
                    <input
                      type="text"
                      value={statForm.label}
                      onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="标签"
                      required
                    />
                    <input
                      type="text"
                      value={statForm.suffix}
                      onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="后缀（如：+、小时）"
                    />
                    <motion.button
                      type="submit"
                      className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingStat ? '更新统计' : '添加统计'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </div>

            {/* 列表区域 */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {aboutTab === 'skills' ? `技能列表 (${skills.length})` : 
                   aboutTab === 'timeline' ? `时间线 (${timeline.length})` : 
                   `统计数据 (${stats.length})`}
                </h3>

                {aboutTab === 'skills' && (
                  <div className="space-y-3">
                    {skills.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">暂无技能</p>
                    ) : (
                      skills.map(skill => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{skill.name}</p>
                            <div className="h-2 bg-gray-200 rounded-full mt-1">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{skill.level}%</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditSkill(skill)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg">
                              <Icons.Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteSkill(skill.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
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
                      <p className="text-center text-gray-500 py-8">暂无时间线</p>
                    ) : (
                      timeline.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-2xl font-bold gradient-text">{item.year}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditTimeline(item)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg">
                                <Icons.Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteTimeline(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                                <Icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-800">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {aboutTab === 'stats' && (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.length === 0 ? (
                      <p className="col-span-2 text-center text-gray-500 py-8">暂无统计数据</p>
                    ) : (
                      stats.map(stat => (
                        <motion.div
                          key={stat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-center relative group"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => handleEditStat(stat)} className="p-1 text-blue-500 hover:bg-blue-100 rounded">
                              <Icons.Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDeleteStat(stat.id)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                              <Icons.Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-2xl font-bold gradient-text">{stat.value}{stat.suffix}</p>
                          <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* 社交链接管理 */}
        {mainTab === 'social' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">添加社交链接</h3>
              <form onSubmit={handleSocialLinkSubmit} className="space-y-4">
                <input
                  type="text"
                  value={socialLinkForm.name}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="名称（如：微信、B站）"
                  required
                />
                <select
                  value={socialLinkForm.icon}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, icon: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
                <input
                  type="url"
                  value={socialLinkForm.url}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="链接地址"
                  required
                />
                <motion.button
                  type="submit"
                  className="w-full gradient-btn text-white py-3 rounded-xl font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingSocialLink ? '更新链接' : '添加链接'}
                </motion.button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">社交链接列表 ({socialLinks.length})</h3>
              {socialLinks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无社交链接</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map(link => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-xl relative group"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => handleEditSocialLink(link)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg">
                          <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteSocialLink(link.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                          <Icons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          {getIcon(link.icon)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{link.name}</p>
                          <p className="text-sm text-gray-500 truncate">{link.url}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 网站配置管理 */}
        {mainTab === 'config' && siteConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">网站配置</h3>
            <form onSubmit={handleConfigSubmit} className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Hero 区域</h4>
                <input
                  type="text"
                  value={siteConfig.heroTitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroTitle: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="网站标题"
                />
                <input
                  type="text"
                  value={siteConfig.heroSubtitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroSubtitle: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="副标题"
                />
                <textarea
                  value={siteConfig.heroDescription}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, heroDescription: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="描述"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">关于区域</h4>
                <input
                  type="text"
                  value={siteConfig.aboutTitle}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTitle: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="关于标题"
                />
                <input
                  type="text"
                  value={siteConfig.aboutName}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutName: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="姓名"
                />
                <textarea
                  value={siteConfig.aboutDescription}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutDescription: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="个人描述"
                  rows={3}
                />
                <input
                  type="text"
                  value={siteConfig.aboutTags}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, aboutTags: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="标签（逗号分隔）"
                />
                <input
                  type="text"
                  value={siteConfig.avatarUrl}
                  onChange={(e) => setSiteConfig(prev => prev ? { ...prev, avatarUrl: e.target.value } : null)}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="头像链接"
                />
              </div>

              <div className="lg:col-span-2">
                <motion.button
                  type="submit"
                  className="w-full gradient-btn text-white py-4 rounded-xl font-medium text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  保存配置
                </motion.button>
              </div>
            </form>
          </motion.div>
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
