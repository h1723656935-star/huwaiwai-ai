import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '胡歪歪 AI Studio - AI Creator & Digital Artist',
  description: '探索AI绘画与视频创作，探索二次元美学与梦幻表达',
  keywords: ['AI绘画', 'AI视频', '二次元', '数字艺术', 'Midjourney', 'Stable Diffusion'],
  authors: [{ name: '胡歪歪' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
