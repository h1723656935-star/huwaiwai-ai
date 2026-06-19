"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '首页', href: '#home' },
    { label: 'AI绘画', href: '#artworks' },
    { label: 'AI视频', href: '#videos' },
    { label: '关于', href: '#about' },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-3 group"
        >
          <span
            className="text-xl tracking-wider transition-all duration-300 group-hover:opacity-80"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, var(--light) 0%, var(--secondary) 50%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            墨璃
          </span>
          <span
            className="text-xs tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity"
            style={{
              fontFamily: 'var(--font-en)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--light-subtle)',
            }}
          >
            MOLI
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative group py-1"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.85rem',
                fontWeight: 400,
                letterSpacing: '0.08em',
                color: 'var(--light-muted)',
              }}
            >
              <span className="transition-colors duration-300 group-hover:text-white">
                {item.label}
              </span>
              <span
                className="absolute -bottom-0.5 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-400"
                style={{
                  background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                }}
              />
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1.5">
            <span
              className="block h-[1px] w-full transition-all duration-300"
              style={{
                background: 'var(--light-muted)',
                transform: menuOpen ? 'rotate(45deg) translateY(4px)' : 'none',
              }}
            />
            <span
              className="block h-[1px] w-full transition-all duration-300"
              style={{
                background: 'var(--light-muted)',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-[1px] w-full transition-all duration-300"
              style={{
                background: 'var(--light-muted)',
                transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : 'none',
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 transition-colors duration-300 hover:text-white"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.06em',
                    color: 'var(--light-muted)',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
