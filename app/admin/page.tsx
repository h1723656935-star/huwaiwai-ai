"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ArtworkForm {
  title: string;
  category: string;
  tags: string;
  date: string;
  image: string;
}

const categories = ['二次元', '古风', '少女风', '温暖风格'];

export default function AdminPage() {
  const [form, setForm] = useState<ArtworkForm>({
    title: '',
    category: '二次元',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [artworkCount, setArtworkCount] = useState(0);

  useEffect(() => {
    const existingArtworks = localStorage.getItem('artworks');
    if (existingArtworks) {
      setArtworkCount(JSON.parse(existingArtworks).length);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArtwork = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()),
      id: Date.now().toString(),
    };
    
    const existingArtworks = localStorage.getItem('artworks');
    const artworks = existingArtworks ? JSON.parse(existingArtworks) : [];
    artworks.push(newArtwork);
    localStorage.setItem('artworks', JSON.stringify(artworks));
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    
    setForm({
      title: '',
      category: '二次元',
      tags: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold gradient-text">作品管理</h1>
            <a href="/" className="text-gray-500 hover:text-primary transition-colors">
              返回首页
            </a>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-center"
            >
              作品上传成功！
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作品标题
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="输入作品标题"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="标签1, 标签2, 标签3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发布日期
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片链接
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {form.image && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/20"
              >
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="w-full gradient-btn text-white py-4 rounded-xl font-medium text-lg shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-5 h-5" />
              上传作品
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-4 bg-secondary/50 rounded-xl"
          >
            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              已有作品 ({artworkCount})
            </h3>
            <p className="text-sm text-gray-500">
              作品存储在本地浏览器中。如需持久化存储，建议连接数据库。
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
