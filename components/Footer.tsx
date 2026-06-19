"use client";

import { motion } from 'framer-motion';

export default function Footer() {
  const navLinks = [
    { label: '首页', href: '#home' },
    { label: 'AI绘画', href: '#artworks' },
    { label: 'AI视频', href: '#videos' },
  ];

  return (
    <footer
      className="relative py-16 px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(12, 10, 20, 0.8) 30%, #0C0A14 100%)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] gradient-divider" />

      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <h3
            className="text-3xl mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, var(--light) 0%, var(--secondary) 50%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HUWAIWAI
          </h3>

          <p
            className="mb-8"
            style={{
              fontFamily: 'var(--font-en)',
              fontSize: '0.95rem',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.1em',
              color: 'var(--light-dim)',
            }}
          >
            AI Creator & Digital Artist
          </p>

          {/* 导航链接 */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative group py-1 transition-colors duration-300 hover:text-white"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                  color: 'var(--light-dim)',
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-400"
                  style={{
                    background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                  }}
                />
              </a>
            ))}
          </div>

          {/* 分割线 */}
          <div className="w-full max-w-xs mx-auto h-[1px] mb-8" style={{ background: 'var(--border)' }} />

          {/* 版权 */}
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: 'var(--light-dim)',
              opacity: 0.6,
            }}
          >
            &copy; 2026 HUWAIWAI AI Studio. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
