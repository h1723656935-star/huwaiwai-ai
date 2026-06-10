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

export const artworks: Artwork[] = [
  {
    id: '1',
    title: '樱花少女',
    category: '二次元',
    tags: ['少女', '樱花', '唯美'],
    date: '2025-01-15',
    image: 'https://picsum.photos/seed/sakura/400/500',
  },
  {
    id: '2',
    title: '古风庭院',
    category: '古风',
    tags: ['古风', '庭院', '水墨'],
    date: '2025-01-10',
    image: 'https://picsum.photos/seed/garden/400/400',
  },
  {
    id: '3',
    title: '星空下的梦',
    category: '少女风',
    tags: ['星空', '梦幻', '少女'],
    date: '2025-01-08',
    image: 'https://picsum.photos/seed/starry/400/600',
  },
  {
    id: '4',
    title: '温暖午后',
    category: '温暖风格',
    tags: ['温暖', '阳光', '治愈'],
    date: '2025-01-05',
    image: 'https://picsum.photos/seed/sunny/400/450',
  },
  {
    id: '5',
    title: '魔法少女',
    category: '二次元',
    tags: ['魔法', '少女', '奇幻'],
    date: '2025-01-03',
    image: 'https://picsum.photos/seed/magic/400/550',
  },
  {
    id: '6',
    title: '山水画卷',
    category: '古风',
    tags: ['山水', '古风', '意境'],
    date: '2024-12-28',
    image: 'https://picsum.photos/seed/landscape/400/400',
  },
  {
    id: '7',
    title: '猫咪咖啡馆',
    category: '温暖风格',
    tags: ['猫咪', '治愈', '日常'],
    date: '2024-12-25',
    image: 'https://picsum.photos/seed/cat/400/500',
  },
  {
    id: '8',
    title: '花之精灵',
    category: '少女风',
    tags: ['精灵', '花朵', '唯美'],
    date: '2024-12-20',
    image: 'https://picsum.photos/seed/flower/400/600',
  },
];

export const categories = ['全部', '二次元', '古风', '少女风', '温暖风格'];

export const videos: Video[] = [
  {
    id: '1',
    title: 'AI绘画创作过程',
    description: '从构思到成品，展示AI绘画的完整创作流程',
    duration: '15:30',
    thumbnail: 'https://picsum.photos/seed/video1/600/340',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: '二次元角色设计',
    description: '使用AI设计原创二次元角色的技巧分享',
    duration: '12:15',
    thumbnail: 'https://picsum.photos/seed/video2/600/340',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'AI视频制作教程',
    description: '从零开始学习AI视频生成与编辑',
    duration: '20:00',
    thumbnail: 'https://picsum.photos/seed/video3/600/340',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

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
