export interface Artwork {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  image: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  videoFile?: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface Stat {
  value: number;
  label: string;
  suffix: string;
}

export const artworks: Artwork[] = [];

export const categories = ['全部', '二次元', '古风', '少女风', '温暖风格'];

export const videos: Video[] = [];

export const skills: Skill[] = [
  { name: 'Midjourney', level: 95 },
  { name: 'Stable Diffusion', level: 90 },
  { name: 'ComfyUI', level: 85 },
  { name: 'Photoshop', level: 88 },
  { name: 'Premiere', level: 80 },
  { name: 'After Effects', level: 75 },
];

export const timeline: TimelineItem[] = [
  {
    year: '2023',
    title: '开始AI绘画',
    description: '接触Midjourney，开始探索AI艺术创作',
  },
  {
    year: '2024',
    title: '开始AI视频创作',
    description: '拓展到AI视频领域，学习视频编辑技术',
  },
  {
    year: '2025',
    title: '建立个人品牌',
    description: '成立胡歪歪AI Studio，专注二次元创作',
  },
];

export const stats: Stat[] = [
  { value: 500, label: '作品数量', suffix: '+' },
  { value: 1000, label: '累计创作时长', suffix: '小时' },
  { value: 50, label: '视频数量', suffix: '+' },
  { value: 10000, label: '粉丝数量', suffix: '+' },
];

export const socialLinks = [
  { name: '邮箱', icon: 'Mail', url: 'mailto:hello@huwaiwai.com' },
  { name: '微信', icon: 'MessageCircle', url: '#' },
  { name: 'B站', icon: 'Video', url: '#' },
  { name: '抖音', icon: 'Music', url: '#' },
  { name: '小红书', icon: 'BookOpen', url: '#' },
  { name: 'GitHub', icon: 'Github', url: '#' },
];
