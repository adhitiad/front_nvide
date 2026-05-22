"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Gift, Plus, Sparkles, User, Play } from "lucide-react";
import Image from "next/image";

interface ShortVideoProps {
  id: string;
  url: string;
  poster: string;
  host: {
    username: string;
    avatar: string;
    isFollowed: boolean;
  };
  description: string;
  likes: number;
  comments: number;
  isActive: boolean; // Tells if this video is currently in view
}

export default function ShortVideoPlayer({ 
  id, url, poster, host, description, likes: initialLikes, comments, isActive 
}: ShortVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [showHeart, setShowHeart] = useState<{x: number, y: number} | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play/pause based on intersection (isActive)
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
    } else {
      setIsPlaying(false);
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0; // reset
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play().catch(e => console.log("Play prevented", e));
      setIsPlaying(true);
    }
  };

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(prev => prev + 1);
    } else {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  // Double tap to like logic
  const lastTapRef = useRef<number>(0);
  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Get relative coordinates
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      setShowHeart({ x, y });
      if (!isLiked) {
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
      
      setTimeout(() => setShowHeart(null), 1000);
    } else {
      // Single tap
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          togglePlay();
        }
      }, DOUBLE_TAP_DELAY);
    }
    
    lastTapRef.current = now;
  };

  return (
    <div className="relative w-full h-full bg-black flex justify-center overflow-hidden">
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        loop
        playsInline
        muted={false} // Would normally be true on first load to allow autoplay, then unmuted
        className="w-full h-full object-cover"
        onClick={handleTouch}
        onTouchEnd={handleTouch}
      />

      {/* Play indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, rotate: -20, opacity: 1 }}
            animate={{ scale: 1.5, rotate: 0, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, y: -100 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="absolute pointer-events-none z-30 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            style={{ left: showHeart.x - 50, top: showHeart.y - 50 }}
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500" />
            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 anime-sparkle" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 drop-shadow-md">
          {description}
        </h3>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white border border-white/10 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Featured Short
          </div>
          <span className="text-white/80 text-[10px] font-semibold drop-shadow">Original Sound - @{host.username}</span>
        </div>
      </div>

      {/* Right Actions Bar */}
      <div className="absolute bottom-4 right-2 flex flex-col items-center gap-6 pb-2">
        {/* Profile */}
        <div className="relative group cursor-pointer" onClick={() => console.log("Profile clicked")}>
          <div className="w-10 h-10 rounded-full border border-white bg-white/20 overflow-hidden relative shadow-lg">
            <Image src={host.avatar} alt={host.username} fill className="object-cover" />
          </div>
          {!host.isFollowed && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary rounded-full p-0.5 shadow-md">
              <Plus className="w-3 h-3 text-white stroke-[3]" />
            </div>
          )}
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-active:scale-90 transition">
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-white font-bold text-[10px] drop-shadow-md">{likes}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-active:scale-90 transition">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-[10px] drop-shadow-md">{comments}</span>
        </button>

        {/* Gift */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-[0_0_10px_var(--primary)] group-active:scale-90 transition anime-pulse-hover">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-[10px] drop-shadow-md">Gift</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-active:scale-90 transition">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-[10px] drop-shadow-md">Share</span>
        </button>
      </div>
      
    </div>
  );
}
