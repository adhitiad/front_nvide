"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useStreams } from "@/hooks/useStreams";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  Flame,
  Gamepad2,
  Mic2,
  Heart,
  ChevronRight,
  TrendingUp,
  Radio,
  Search,
  Zap,
  Star,
  Users,
  Sparkles,
  Crown,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const { data: streams, isLoading: loading } = useStreams(activeCategory);

  const filteredStreams = (streams || []).filter((stream) => {
    const text = searchQuery.toLowerCase();
    return (
      stream.title.toLowerCase().includes(text) ||
      (stream.host?.username || "").toLowerCase().includes(text)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative font-sans overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-40 left-0 h-[200px] w-[200px] rounded-full bg-accent/20 blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="px-4 md:px-8 pt-6 pb-2 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center anime-sparkle">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-heading font-black tracking-tight">
            NVide<span className="text-primary">Live</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder={t('common.search.placeholder', 'Search...')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 h-8 bg-card border-primary/20 focus:border-primary rounded-full text-xs w-32 sm:w-48 md:w-64 focus:w-40 sm:focus:w-56 md:focus:w-72 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="p-4 md:px-8 md:py-6 space-y-6">
        
        {/* Banner Carousel */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-40 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-lg border border-primary/20 group cursor-pointer"
        >
          <Image 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800" 
            alt="Event Banner"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <span className="bg-primary/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm inline-block mb-1">
              {t('home.banner.badge', 'Top Event')}
            </span>
            <h2 className="text-white font-heading font-bold leading-tight line-clamp-2 shadow-sm">
              {t('home.banner.title', 'Summer Cosplay Festival 2026! Win exclusive SVIP badges.')}
            </h2>
          </div>
        </motion.div>

        {/* VIP / Royal Family Entrance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/vip">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-amber-200 to-amber-500 rounded-2xl p-3 relative overflow-hidden shadow-md">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <Crown className="w-16 h-16 text-black" />
              </div>
              <h3 className="text-amber-950 font-black text-sm flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> {t('home.vip.title', 'VIP Center')}
              </h3>
              <p className="text-amber-900/80 text-[10px] font-bold mt-1">{t('home.vip.subtitle', 'Get exclusive entry effects!')}</p>
            </motion.div>
          </Link>
          <Link href="/family">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl p-3 relative overflow-hidden shadow-md">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-white font-black text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-300" /> {t('home.family.title', 'Royal Family')}
              </h3>
              <p className="text-indigo-100 text-[10px] font-bold mt-1">{t('home.family.subtitle', 'Join the elite club')}</p>
            </motion.div>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "", label: t('home.categories.hot', 'Hot'), icon: Flame, color: "text-red-500" },
            { id: "gaming", label: t('home.categories.gaming', 'Gaming'), icon: Gamepad2, color: "text-blue-500" },
            { id: "talkshow", label: t('home.categories.talk', 'Talk'), icon: Mic2, color: "text-emerald-500" },
            { id: "cosplay", label: t('home.categories.cosplay', 'Cosplay'), icon: Heart, color: "text-pink-500" },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-all ${
                activeCategory === cat.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
              }`}
            >
              <div className={`h-10 w-10 rounded-full bg-card shadow-sm flex items-center justify-center ${activeCategory === cat.id ? "anime-pulse-hover" : ""}`}>
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
              </div>
              <span className={`text-[10px] font-bold ${activeCategory === cat.id ? "text-primary" : "text-muted-foreground"}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Live Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="font-heading font-bold text-sm">{t('home.live.title', 'Live Now')}</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />)
            ) : filteredStreams.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-xs text-muted-foreground font-semibold">{t('home.live.noStreams', 'No streams found.')}</p>
              </div>
            ) : (
              filteredStreams.map((stream, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={stream.id}
                >
                  <Link href={`/streams/${stream.id}`} className="block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-primary/10 shadow-sm">
                      <Image 
                        src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400"}
                        alt={stream.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          {stream.viewer_count || 0}
                        </span>
                        
                        {(stream.title.toLowerCase().includes("pk") || stream.category === "pk") && (
                          <span className="bg-gradient-to-r from-blue-500 to-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            PK
                          </span>
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-[11px] font-bold line-clamp-2 leading-tight">
                          {stream.title}
                        </h3>
                        <p className="text-white/70 text-[9px] font-semibold mt-0.5 truncate">
                          @{stream.host?.username || t('home.live.hostFallback', 'Host')}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
