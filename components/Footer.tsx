"use client";

import { motion } from 'framer-motion';
import { Heart, Mail, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="about" className="relative py-16 px-4">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(120, 101, 248, 0.05) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7865F8 0%, #A991FF 100%)',
                  boxShadow: '0 4px 20px rgba(120, 101, 248, 0.3)',
                }}
              >
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #A991FF 0%, #7865F8 50%, #ECE7FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                墨璃画廊
              </span>
            </div>
            <p style={{ color: 'rgba(199, 184, 255, 0.7)', fontSize: '0.9rem' }}>
              探索AI创作的无限可能，每一幅作品都是数字艺术的杰作。
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 style={{ color: '#ECE7FF', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              快速链接
            </h4>
            <ul className="space-y-2">
              {['首页', 'AI绘画', '视频', '关于'].map((link, index) => (
                <li key={link}>
                  <motion.button
                    onClick={() => {
                      const id = index === 0 ? 'home' : index === 1 ? 'artworks' : index === 2 ? 'videos' : 'about';
                      const element = document.getElementById(id);
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm"
                    style={{ color: 'rgba(199, 184, 255, 0.7)' }}
                    whileHover={{ color: '#A991FF', x: 5 }}
                  >
                    {link}
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 style={{ color: '#ECE7FF', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              联系我们
            </h4>
            <div className="flex gap-4">
              {[
                { icon: Mail, href: 'mailto:contact@moligallery.com', label: '邮箱' },
                { icon: Github, href: 'https://github.com', label: 'GitHub' },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: MessageCircle, href: '#', label: '留言' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(120, 101, 248, 0.1)',
                    border: '1px solid rgba(120, 101, 248, 0.2)',
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    background: 'rgba(120, 101, 248, 0.2)',
                    borderColor: 'rgba(120, 101, 248, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  <social.icon className="w-5 h-5" style={{ color: '#A991FF' }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t"
          style={{ borderColor: 'rgba(120, 101, 248, 0.1)' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p style={{ color: 'rgba(199, 184, 255, 0.5)', fontSize: '0.85rem' }}>
              © 2024 墨璃画廊. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(199, 184, 255, 0.5)' }}>
              <span>隐私政策</span>
              <span>服务条款</span>
              <span>使用说明</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
