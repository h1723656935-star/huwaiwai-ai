"use client";

import { motion } from 'framer-motion';
import { skills, timeline, stats } from '@/data/works';

export default function About() {
  return (
    <section id="about" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            关于我
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            探索AI创作的无限可能，用技术与艺术创造美好
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 animate-pulse-soft" />
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src="https://picsum.photos/seed/avatar/300/300"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-white text-2xl">★</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">胡歪歪</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              热爱二次元文化的AI创作者，专注于AI绘画与视频创作领域。通过Midjourney、Stable Diffusion等工具，探索数字艺术的无限可能。
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              相信技术与艺术的结合能够创造出令人惊叹的作品，致力于用AI技术将想象变为现实。
            </p>
            <div className="flex flex-wrap gap-3">
              {['AI创作', '二次元', '数字艺术', '视频制作'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-secondary rounded-full text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-10 gradient-text">
            技能展示
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <span className="text-primary font-semibold">{skill.level}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-10 gradient-text">
            成长历程
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-accent to-primary/30 hidden md:block" />
            <div className="space-y-8 md:space-y-0">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:ml-auto'}`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all duration-300 relative">
                    <div className={`absolute ${index % 2 === 0 ? 'md:-right-3' : 'md:-left-3'} top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-white shadow-lg hidden md:block`} />
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {item.year}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-500">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 text-center"
            >
              <StatNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      className="text-3xl md:text-4xl font-bold gradient-text"
      key={displayValue}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
    >
      {displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
}

import React from 'react';
