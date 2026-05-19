"use client";

import { useState } from "react";
import Link from "next/link";
import { useVOD } from "@/hooks/useVOD";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Crown, 
  Eye, 
  Clock, 
  Video,
  ChevronLeft,
  Sparkles,
  Loader2
} from "lucide-react";

export default function VODListPage() {
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const { vodList, loading, fetchVODList } = useVOD();

  const handleFilterChange = (newFilter: "all" | "free" | "premium") => {
    setFilter(newFilter);
    fetchVODList(newFilter);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}j ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/streams">
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-purple-900/50 flex items-center gap-1.5 shadow-lg">
              <Video className="h-3.5 w-3.5" />
              NVide VOD
            </span>
            <span className="text-sm font-bold text-neutral-300">Video on Demand</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        
        {/* TOP FILTER TABS */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
          <div className="flex gap-2">
            {(["all", "free", "premium"] as const).map((opt) => (
              <Button
                key={opt}
                onClick={() => handleFilterChange(opt)}
                className={`rounded-full px-5 py-2.5 text-xs font-black uppercase border transition ${
                  filter === opt
                    ? "bg-purple-600 border-purple-500 hover:bg-purple-600 text-white"
                    : "bg-neutral-950 border-neutral-900 hover:bg-neutral-900 text-neutral-400"
                }`}
              >
                {opt === "all" ? "Semua Video" : opt === "free" ? "Gratis" : "Premium 👑"}
              </Button>
            ))}
          </div>

          <span className="text-xs text-neutral-500 font-mono">Total: {vodList.length} Rekaman</span>
        </div>

        {/* VOD GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-neutral-950 border-neutral-900 h-64 rounded-3xl animate-pulse">
                <CardContent className="h-full bg-neutral-900/40 rounded-3xl" />
              </Card>
            ))}
          </div>
        ) : vodList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <Video className="h-12 w-12 text-neutral-800" />
            <span className="text-sm font-bold text-neutral-400">Tidak Ada Video</span>
            <span className="text-xs text-neutral-600">Belum ada video rekaman siaran yang tersedia untuk filter ini.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vodList.map((vod) => (
              <Link key={vod.id} href={`/vod/${vod.id}`}>
                <Card className="bg-neutral-950 border-neutral-900 rounded-3xl overflow-hidden shadow-xl hover:border-purple-600/50 group transition duration-300 cursor-pointer h-full flex flex-col">
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                    <img 
                      src={vod.thumbnailUrl} 
                      alt={vod.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Duration badge */}
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple-400" />
                      {formatDuration(vod.duration)}
                    </span>

                    {/* Premium icon badge */}
                    {vod.isPremium ? (
                      <span className="absolute top-3 left-3 bg-amber-500 text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Crown className="h-3 w-3 fill-black" />
                        Premium
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 bg-neutral-900 text-neutral-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-neutral-800">
                        Gratis
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-sm leading-snug group-hover:text-purple-400 transition-colors duration-300">
                        {vod.title}
                      </h3>
                      <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                        {vod.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-neutral-900 pt-3 text-[10px]">
                      <span className="font-bold text-neutral-400">{vod.host?.username}</span>
                      
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-neutral-500 font-mono">
                          <Eye className="h-3 w-3" /> {vod.views.toLocaleString()}
                        </span>

                        {vod.isPremium ? (
                          <span className="font-extrabold text-amber-400 font-mono">Rp {vod.priceIDR.toLocaleString()}</span>
                        ) : (
                          <span className="font-extrabold text-emerald-400 font-mono">GRATIS</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
