"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useStreamStore } from "@/store/useStreamStore";
import { useSession } from "@/lib/auth-client";
import { 
  Sparkles, 
  Search, 
  Radio, 
  Lock, 
  Sliders, 
  Monitor, 
  Tablet, 
  Flame, 
  Layers, 
  TrendingUp, 
  MessageSquare,
  Gift,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useLanguageStore((state) => state.t);
  const { streams, fetchStreams, loading } = useStreamStore();
  
  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchStreams(activeCategory);
  }, [activeCategory]);

  const filteredStreams = streams.filter((stream) => {
    const text = searchQuery.toLowerCase();
    return (
      stream.title.toLowerCase().includes(text) ||
      (stream.host?.username || "").toLowerCase().includes(text)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative selection:bg-primary/30 pb-16 md:pb-0">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none -z-10 animate-pulse" />

      {/* Header Navigation */}
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar Menu */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* HERO BANNER: ANIME COUPLE ILLUSTRATION & WELCOME */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-accent/5 to-card border border-primary/20 p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-md">
            
            {/* Visual element */}
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/25 border border-primary/30 rounded-full text-xs font-bold text-primary animate-bounce">
                <Sparkles className="h-4 w-4 text-accent anime-sparkle" />
                NVide Live Premium 18+
              </div>
              
              <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-none text-foreground">
                Where <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Anime Dreams</span> Live & Breathe!
              </h1>
              
              <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">
                Connect directly with premium Vtuber models, beautiful cosplay hosts, gaming champions, and interactive ASMR streams. Explore 1-on-1 private rooms and send interactive gifts!
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/streams">
                  <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs rounded-full px-6 h-10 shadow-md">
                    Explore Streams <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs rounded-full px-5 h-10">
                    Setup Preferences
                  </Button>
                </Link>
              </div>
            </div>

            {/* Simulated anime couple image */}
            <div className="relative w-full max-w-sm aspect-video lg:max-w-md rounded-2xl overflow-hidden border border-primary/20 shadow-lg shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640" 
                alt="Anime Live Stream mockup"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  🌸
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Miku & Senpai</p>
                  <p className="text-[9px] text-primary font-black mt-0.5">Gaming & Cosplay Live</p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK PROMOTIONS BAR (CHIBI TAGS) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-primary/10 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                🎮
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Interactive Lovense Toys</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Tipping activates triggers directly!</p>
              </div>
            </div>

            <div className="p-4 bg-card border border-primary/10 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-xl font-bold">
                🎁
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Sweet Anime Gifts</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Send chibi sparkles & hearts!</p>
              </div>
            </div>

            <div className="p-4 bg-card border border-primary/10 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 text-xl font-bold">
                🔒
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">VIP 1-on-1 Rooms</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Spend coins to enter private chats.</p>
              </div>
            </div>
          </div>

          {/* DYNAMIC SEARCH & FILTER PANEL */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-heading font-black text-foreground flex items-center gap-1.5 leading-none">
                <Radio className="h-5 w-5 text-primary animate-pulse" />
                Active Broadcast Studio
              </h2>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search stream or host..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border-primary/20 focus:border-primary rounded-xl text-xs"
                />
              </div>
            </div>

            {/* CATEGORY SWITCHER */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { name: "All Categories", value: "" },
                { name: "Gaming 🎮", value: "gaming" },
                { name: "Talkshow 🎙️", value: "talkshow" },
                { name: "Music 🎵", value: "music" },
                { name: "Cosplay 🎭", value: "cosplay" }
              ].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                    activeCategory === cat.value
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-card border-primary/15 hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* STREAMS GRID */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card border border-primary/15 rounded-3xl animate-pulse h-60" />
                ))}
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="py-12 text-center bg-card border border-primary/10 rounded-2xl max-w-sm mx-auto space-y-2">
                <Radio className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
                <h4 className="text-xs font-black text-foreground">No matching live streams</h4>
                <p className="text-[10px] text-muted-foreground">Try modifying your search or select another category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStreams.map((stream) => {
                  const hasLovense = stream.interactive || stream.title.toLowerCase().includes("lovense") || stream.title.toLowerCase().includes("toy");
                  const isPrivate = stream.room_mode === "private" || stream.title.toLowerCase().includes("private") || stream.title.toLowerCase().includes("vip");

                  return (
                    <Link key={stream.id} href={`/streams/${stream.id}`} className="group block">
                      <Card className="h-full bg-card border border-primary/15 hover:border-primary/30 overflow-hidden transition-all duration-300 rounded-3xl relative flex flex-col justify-between hover:shadow-lg">
                        
                        {/* Stream Thumbnail Frame */}
                        <div className="relative aspect-video w-full bg-muted overflow-hidden">
                          <Image 
                            src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"}
                            alt={stream.title}
                            fill
                            className="object-cover group-hover:scale-103 transition-transform duration-500"
                          />

                          {/* Live Indicator Badges */}
                          <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                            <span className="bg-red-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                              Live
                            </span>

                            {hasLovense && (
                              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                                Lovense
                              </span>
                            )}

                            {isPrivate && (
                              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                                Private
                              </span>
                            )}
                          </div>

                          {/* Format badge */}
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1 text-white border border-white/10">
                            {stream.format === "portrait" ? (
                              <Tablet className="h-3 w-3 text-accent" />
                            ) : (
                              <Monitor className="h-3 w-3 text-primary" />
                            )}
                          </div>

                          {/* Viewers */}
                          <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded-full border border-white/15">
                            {stream.viewer_count || 0} watching
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <CardHeader className="p-4 space-y-2 flex-1">
                          <div className="flex items-center">
                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                              {stream.category || "General"}
                            </span>
                          </div>
                          <CardTitle className="text-xs font-heading font-black line-clamp-1 group-hover:text-primary transition-colors">
                            {stream.title}
                          </CardTitle>
                          <p className="text-muted-foreground text-[10px] font-semibold line-clamp-2 leading-relaxed">
                            {stream.description || "Join the interactive room to interact with the host!"}
                          </p>
                        </CardHeader>

                        {/* Host profile footer */}
                        <CardFooter className="p-4 pt-0 border-t border-primary/5 bg-primary/2.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black uppercase">
                            {stream.host?.username?.charAt(0) || "H"}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-bold leading-none text-foreground">@{stream.host?.username || "Verified Host"}</span>
                            <span className="text-[8px] text-muted-foreground mt-0.5">NVide Partner Star</span>
                          </div>
                        </CardFooter>

                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>
      <BottomNav />
    </div>
  );
}
