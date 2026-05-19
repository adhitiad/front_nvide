"use client";

import Link from "next/link";
import { useRecommendation } from "@/hooks/useRecommendation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Radio, Users } from "lucide-react";
import Image from "next/image";

export function AIRecommendations() {
  const { recommendedStreams, loading, error } = useRecommendation();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <h2 className="text-xl font-black">Rekomendasi Pintar AI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-neutral-950 rounded-2xl border border-neutral-900 h-[260px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendedStreams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-bounce-short" />
          <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Rekomendasi Untuk Anda
          </h2>
        </div>
        <span className="text-[10px] text-purple-400 font-extrabold uppercase bg-purple-950 border border-purple-900/40 px-2 py-0.5 rounded-md">
          AI Engine V2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedStreams.map((stream) => (
          <Link key={stream.id} href={`/streams/${stream.id}`} className="group block">
            <Card className="h-full bg-neutral-950 border-neutral-900 hover:border-purple-600/50 overflow-hidden transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-purple-500/5 relative rounded-2xl">
              
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-neutral-900">
                <Image
                  src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"}
                  alt={stream.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                
                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                  <span className="bg-red-650 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                  <Users className="h-3 w-3 text-purple-400" />
                  {stream.viewer_count || 0}
                </div>
              </div>

              {/* Title & Description */}
              <CardHeader className="p-4 flex-1 space-y-2">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-purple-400 block">
                  {stream.category || "General"}
                </span>
                <CardTitle className="text-sm font-bold group-hover:text-purple-400 transition-colors line-clamp-1 leading-snug">
                  {stream.title}
                </CardTitle>
              </CardHeader>

              {/* Host info */}
              <CardFooter className="p-4 pt-0 border-t border-neutral-900 bg-neutral-950 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold uppercase">
                  {stream.host?.username?.charAt(0) || "H"}
                </div>
                <span className="text-[10px] font-bold text-neutral-300">{stream.host?.username || "Host"}</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
