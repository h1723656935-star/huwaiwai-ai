"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Palette, Video, User, Settings, Home } from 'lucide-react';

const navLinks = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'artworks', label: 'AI绘画', icon: Palette },
  { id: 'videos', label: '视频', icon: Video },
  { id: 'about', label: '关于', icon: User },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // 检测当前激活的部分
      const sections = ['home', 'artworks', 'videos', 'about'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: scrolled ? 'rgba(13, 10, 24, 0.9)' : 'transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(120, 101, 248, 0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'rgba(120, 101, 248, 0.1)',
                boxShadow: '0 4px 20px rgba(120, 101, 248, 0.2)',
                border: '1px solid rgba(120, 101, 248, 0.2)',
              }}
            >
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-8 h-8 object-contain" 
              />
            </div>
            <span
              className="text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
              }}
            >
              墨璃
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="relative px-4 py-2 rounded-lg font-medium text-sm overflow-hidden"
                style={{
                  color: activeSection === link.id ? '#A991FF' : 'rgba(199, 184, 255, 0.7)',
                  background: activeSection === link.id ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                }}
                whileHover={{ scale: 1.05, color: '#ECE7FF' }}
                whileTap={{ scale: 0.98 }}
              >
                {activeSection === link.id && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                    style={{
                      width: '60%',
                      background: 'linear-gradient(90deg, #7865F8 0%, #A991FF 100%)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {link.label}
              </motion.button>
            ))}

            <motion.a
              href="/admin"
              className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(120, 101, 248, 0.2) 0%, rgba(169, 145, 255, 0.1) 100%)',
                border: '1px solid rgba(120, 101, 248, 0.3)',
                color: '#A991FF',
              }}
              whileHover={{ scale: 1.05, background: 'rgba(120, 101, 248, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-4 h-4" />
              后台
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#ECE7FF' }}
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{
              background: 'rgba(13, 10, 24, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(120, 101, 248, 0.1)',
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    color: activeSection === link.id ? '#A991FF' : '#ECE7FF',
                    background: activeSection === link.id ? 'rgba(120, 101, 248, 0.1)' : 'transparent',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </motion.button>
              ))}
              <motion.a
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(120, 101, 248, 0.1)',
                  color: '#A991FF',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-5 h-5" />
                管理后台
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// 需要导入 AnimatePresence
import { AnimatePresence } from 'framer-motion';
