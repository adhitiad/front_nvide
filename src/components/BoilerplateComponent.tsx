"use client";

import React from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 🎨 TIPE DATA (TypeScript Interfaces)
 * Mendefinisikan tipe data props komponen secara eksplisit untuk menjaga keamanan kode (Type-safety).
 */
export interface BoilerplateComponentProps {
  title: string;
  description: string;
  badgeText?: string;
  isLoading?: boolean;
  onClickAction?: () => void;
}

/**
 * 🏆 PREMIUM BOILERPLATE COMPONENT
 * Menggunakan gaya modern Glassmorphism, harmoni warna gelap HSL, hover micro-animations,
 * dan dukungan responsif penuh untuk memukau pengguna.
 */
export function BoilerplateComponent({
  title,
  description,
  badgeText = "Feature",
  isLoading = false,
  onClickAction,
}: BoilerplateComponentProps) {
  
  // 1. STATE LOADING SKELETON
  // Menggunakan skeleton loader transparan yang halus untuk transisi UX yang premium.
  if (isLoading) {
    return (
      <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-md space-y-4 animate-pulse select-none">
        <div className="flex justify-between items-center">
          <div className="h-5 w-20 bg-neutral-800 rounded-full"></div>
          <div className="h-4 w-12 bg-neutral-800 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-neutral-850 rounded-lg"></div>
          <div className="h-4 w-full bg-neutral-850 rounded-md"></div>
          <div className="h-4 w-5/6 bg-neutral-850 rounded-md"></div>
        </div>
        <div className="h-10 w-full bg-neutral-800 rounded-xl pt-2"></div>
      </div>
    );
  }

  // 2. MAIN COMPONENT RENDER
  return (
    <div className="group w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900/90 to-neutral-950 border border-neutral-850 hover:border-indigo-500/30 transition-all duration-300 shadow-xl hover:shadow-indigo-950/10 backdrop-blur-md relative overflow-hidden select-none">
      
      {/* Efek Gradasi Bersinar Latar Belakang (Micro-interactions) */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all duration-500 pointer-events-none"></div>

      {/* Konten Komponen */}
      <div className="space-y-4 relative z-10">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase tracking-wider">
            {badgeText}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" /> Updated
          </span>
        </div>

        {/* Judul & Deskripsi */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tombol Interaktif (Hover effects & Transitions) */}
        <Button
          onClick={onClickAction}
          className="w-full bg-neutral-900 hover:bg-indigo-600 border border-neutral-800 hover:border-indigo-500 text-white font-medium rounded-xl h-10 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-inner cursor-pointer"
        >
          <span>Jelajahi Fitur</span>
          <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-200" />
        </Button>

      </div>
    </div>
  );
}
