"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Sparkles } from "lucide-react";
import Image from "next/image";

export type VIPLevel = "svip" | "mvp" | "king" | "none";

export interface VIPEntryEvent {
  id: string;
  username: string;
  avatarUrl?: string;
  level: VIPLevel;
  message: string;
  effectUrl?: string;
}

interface VIPEntryEffectProps {
  event: VIPEntryEvent | null;
  onAnimationComplete: (id: string) => void;
}

export default function VIPEntryEffect({ event, onAnimationComplete }: VIPEntryEffectProps) {
  
  // Auto dismiss after animation
  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => {
        onAnimationComplete(event.id);
      }, 4000); // 4 seconds total screen time
      
      return () => clearTimeout(timer);
    }
  }, [event, onAnimationComplete]);

  if (!event || event.level === "none") return null;

  const getStyleForLevel = (level: VIPLevel) => {
    switch (level) {
      case "king":
        return {
          bg: "from-amber-400 via-yellow-300 to-amber-600",
          border: "border-yellow-200",
          text: "text-amber-950",
          glow: "shadow-[0_0_40px_rgba(251,191,36,0.8)]",
          icon: <Crown className="w-8 h-8 text-amber-950" />
        };
      case "svip":
        return {
          bg: "from-purple-600 via-fuchsia-500 to-pink-600",
          border: "border-pink-300",
          text: "text-white",
          glow: "shadow-[0_0_30px_rgba(217,70,239,0.8)]",
          icon: <Star className="w-8 h-8 text-white fill-white" />
        };
      case "mvp":
        return {
          bg: "from-blue-500 via-cyan-400 to-blue-600",
          border: "border-cyan-200",
          text: "text-white",
          glow: "shadow-[0_0_20px_rgba(34,211,238,0.8)]",
          icon: <Sparkles className="w-8 h-8 text-white" />
        };
      default:
        return null;
    }
  };

  const style = getStyleForLevel(event.level);
  if (!style) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-x-0 top-1/4 z-50 pointer-events-none flex justify-center">
        
        {/* Full width light sweep effect for King */}
        {event.level === "king" && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: [0, 0.5, 0.5, 0], x: ["-100%", "0%", "0%", "100%"] }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="fixed inset-y-0 w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent skew-x-12"
          />
        )}

        <motion.div
          initial={{ x: "-150%", opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: "150%", opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 12
          }}
          className={`flex items-center gap-3 bg-gradient-to-r ${style.bg} ${style.border} border-2 rounded-full p-2 pr-6 ${style.glow} relative`}
        >
          {/* Avatar with ring */}
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full animate-spin border-2 border-dashed ${style.border} opacity-70`} style={{ animationDuration: '3s' }} />
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white relative z-10 bg-black/20 flex items-center justify-center">
              {event.avatarUrl ? (
                <Image src={event.avatarUrl} alt={event.username} fill className="object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">{event.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {/* Level Icon Badge */}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md z-20 anime-pulse-hover">
              {React.cloneElement(style.icon, { className: "w-4 h-4 " + style.icon.props.className })}
            </div>
          </div>

          {/* Text Content */}
          <div className={`flex flex-col ${style.text}`}>
            <div className="flex items-center gap-1">
              <span className="font-heading font-black text-lg leading-tight uppercase italic tracking-wider">
                {event.level}
              </span>
              <span className="font-bold text-sm leading-tight ml-1">
                {event.username}
              </span>
            </div>
            <span className="text-[10px] font-semibold opacity-90">
              {event.message}
            </span>
          </div>

          {/* Sparkles around the banner */}
          <Sparkles className="absolute -top-3 -right-2 w-5 h-5 text-white anime-sparkle" />
          <Sparkles className="absolute -bottom-2 left-10 w-4 h-4 text-white anime-sparkle" style={{ animationDelay: '0.5s' }} />

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
