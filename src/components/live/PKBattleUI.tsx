"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Heart, Sparkles, Timer } from "lucide-react";

interface PKBattleProps {
  isActive: boolean;
  hostScore: number;
  challengerScore: number;
  challengerInfo: {
    username: string;
    avatarUrl: string;
  };
  timeRemaining: number; // in seconds
  onGiftHost: () => void;
  onGiftChallenger: () => void;
}

export default function PKBattleUI({
  isActive,
  hostScore,
  challengerScore,
  challengerInfo,
  timeRemaining,
  onGiftHost,
  onGiftChallenger
}: PKBattleProps) {
  
  if (!isActive) return null;

  const totalScore = hostScore + challengerScore;
  const hostPercentage = totalScore === 0 ? 50 : (hostScore / totalScore) * 100;
  const challengerPercentage = 100 - hostPercentage;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-x-0 top-20 z-30 pointer-events-none">
      
      {/* VS Animation Center */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="absolute left-1/2 -translate-x-1/2 top-4 z-40"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-400 blur-md rounded-full opacity-70 animate-pulse" />
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,200,0,0.8)] flex items-center justify-center relative overflow-hidden">
            <span className="text-white font-black italic text-xl drop-shadow-md">VS</span>
            <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          <Zap className="absolute -right-3 -top-2 w-6 h-6 text-yellow-300 drop-shadow-lg anime-sparkle" />
        </div>
      </motion.div>

      {/* Progress Bar Container */}
      <div className="px-4 mt-10">
        <div className="relative h-6 w-full rounded-full overflow-hidden flex border-2 border-white/20 shadow-lg backdrop-blur-md">
          
          {/* Host Side (Blue) */}
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 flex items-center px-2 pointer-events-auto cursor-pointer"
            initial={{ width: "50%" }}
            animate={{ width: `${hostPercentage}%` }}
            transition={{ type: "tween", ease: "easeOut" }}
            onClick={onGiftHost}
          >
            <span className="text-white text-[10px] font-black drop-shadow-md">{hostScore.toLocaleString()}</span>
          </motion.div>

          {/* Challenger Side (Red) */}
          <motion.div 
            className="h-full bg-gradient-to-l from-red-600 to-pink-500 flex items-center justify-end px-2 pointer-events-auto cursor-pointer"
            initial={{ width: "50%" }}
            animate={{ width: `${challengerPercentage}%` }}
            transition={{ type: "tween", ease: "easeOut" }}
            onClick={onGiftChallenger}
          >
            <span className="text-white text-[10px] font-black drop-shadow-md">{challengerScore.toLocaleString()}</span>
          </motion.div>

          {/* Sparkles on the leading edge */}
          <motion.div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] z-10"
            initial={{ left: "50%" }}
            animate={{ left: `${hostPercentage}%` }}
            transition={{ type: "tween", ease: "easeOut" }}
          >
            <div className="absolute -left-1 -top-1 w-3 h-3 bg-white rounded-full blur-sm" />
          </motion.div>
        </div>

        {/* Info row */}
        <div className="flex justify-between mt-1 px-1">
          <div className="text-[9px] font-black text-blue-300 drop-shadow uppercase tracking-wider">Host</div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
            <Timer className="w-3 h-3 text-yellow-400" />
            <span className="text-white text-[10px] font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-[9px] font-black text-red-300 drop-shadow uppercase tracking-wider">{challengerInfo.username}</div>
        </div>
      </div>
      
    </div>
  );
}
