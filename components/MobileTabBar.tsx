"use client";

import { motion } from "framer-motion";
import { Home, Image, Video, User } from "lucide-react";

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "artworks", label: "作品", icon: Image },
  { id: "videos", label: "视频", icon: Video },
  { id: "about", label: "关于", icon: User },
];

export default function MobileTabBar({
  activeTab,
  onTabChange,
}: MobileTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0A18]/95 backdrop-blur-xl border-t border-white/5">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #7865F8, #A991FF)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon
                  className="w-5 h-5 mb-1"
                  style={{
                    color: isActive ? "#A991FF" : "rgba(199, 184, 255, 0.5)",
                  }}
                />
              </motion.div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? "#A991FF" : "rgba(199, 184, 255, 0.5)",
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
