"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as worksService from '@/lib/worksService';
import * as Icons from 'lucide-react';
import type { SocialLink } from '@/lib/worksService';

export default function Contact() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const links = await worksService.getSocialLinks();
      setSocialLinks(links);
    } catch (error) {
      console.error('Failed to load social links:', error);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            联系我
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            欢迎与我交流合作，期待与你一起探索AI创作的无限可能
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg hover:shadow-glow transition-all duration-300 group"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {getIcon(link.icon)}
              <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-600 text-sm whitespace-nowrap">
                {link.name}
              </span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-6 gradient-text">
            给我留言
          </h3>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="你的名字"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                placeholder="留言主题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none"
                placeholder="想说些什么..."
              />
            </div>
            <motion.button
              type="submit"
              className="w-full gradient-btn text-white py-4 rounded-xl font-medium text-lg shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              发送留言
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function getIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    Mail: <Icons.Mail className="w-6 h-6" />,
    MessageCircle: <Icons.MessageCircle className="w-6 h-6" />,
    Video: <Icons.Video className="w-6 h-6" />,
    Music: <Icons.Music className="w-6 h-6" />,
    BookOpen: <Icons.BookOpen className="w-6 h-6" />,
    Github: <Icons.Github className="w-6 h-6" />,
    Twitter: <Icons.Twitter className="w-6 h-6" />,
    Instagram: <Icons.Instagram className="w-6 h-6" />,
    Linkedin: <Icons.Linkedin className="w-6 h-6" />,
    Youtube: <Icons.Youtube className="w-6 h-6" />,
  };
  return iconMap[iconName] || <Icons.Mail className="w-6 h-6" />;
}
