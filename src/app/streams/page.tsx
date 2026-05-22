"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStreams } from "@/hooks/useStreams";
import { useSession } from "@/lib/auth-client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Flame, 
  Radio, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Filter, 
  LogIn,
  Sliders,
  Lock,
  Monitor,
  Tablet,
  CheckCircle,
  TrendingUp,
  Heart,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/layout/BottomNav";

export default function StreamsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { t } = useTranslation();
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const { data: streams, isLoading: loading, error, refetch } = useStreams(activeCategory);
  
  // Advanced filters panel
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterFormat, setFilterFormat] = useState<"all" | "landscape" | "portrait">("all");
  const [filterLovense, setFilterLovense] = useState<boolean | null>(null);
  const [filterPrivate, setFilterPrivate] = useState<boolean | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleRefresh = () => {
    refetch();
    toast.success("Active live stream list refreshed! 🌸");
  };

  // Filter logic
  const filteredStreams = (streams || []).filter((stream) => {
    // 1. Text search
    const text = searchQuery.toLowerCase();
    const titleMatch = stream.title.toLowerCase().includes(text);
    const hostMatch = stream.host?.username?.toLowerCase().includes(text);
    const descMatch = (stream.description || "").toLowerCase().includes(text);
    if (searchQuery && !titleMatch && !hostMatch && !descMatch) return false;

    // 2. Format filter
    if (filterFormat === "landscape" && stream.format !== "landscape" && stream.format !== "dual") return false;
    if (filterFormat === "portrait" && stream.format !== "portrait" && stream.format !== "dual") return false;

    // 3. Lovense filter
    if (filterLovense !== null) {
      const hasLovense = stream.interactive || stream.title.toLowerCase().includes("lovense") || stream.title.toLowerCase().includes("toy");
      if (filterLovense && !hasLovense) return false;
      if (!filterLovense && hasLovense) return false;
    }

    // 4. Private Room filter
    if (filterPrivate !== null) {
      const isPrivate = stream.room_mode === "private" || stream.title.toLowerCase().includes("private") || stream.title.toLowerCase().includes("vip");
      if (filterPrivate && !isPrivate) return false;
      if (!filterPrivate && isPrivate) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredStreams.length / itemsPerPage);
  const paginatedStreams = filteredStreams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = [
    { name: t("categories.all", "All"), value: "" },
    { name: t("categories.gaming", "Gaming"), value: "gaming" },
    { name: t("categories.talkshow", "ASMR Chitchat"), value: "talkshow" },
    { name: t("categories.music", "Music Covers"), value: "music" },
    { name: t("categories.cosplay", "Cosplay"), value: "cosplay" },
  ];

  const activeCategoryIndex = categories.findIndex((c) => c.value === activeCategory);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY <= 0 && touchStartY !== null) {
      const deltaY = e.touches[0].clientY - touchStartY;
      if (deltaY > 0) setPullDistance(Math.min(deltaY, 100));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 60) {
        const nextIndex = deltaX < 0 ? activeCategoryIndex + 1 : activeCategoryIndex - 1;
        if (nextIndex >= 0 && nextIndex < categories.length) {
          setActiveCategory(categories[nextIndex].value);
          setCurrentPage(1);
        }
      }
    }
    if (pullDistance > 70) {
      handleRefresh();
    }
    setPullDistance(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative pb-16">
      {/* Anime Theme backgrounds */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/75 border-b border-primary/15 px-6 py-4 flex items-center justify-between shadow-[0_2px_12px_rgba(244,143,177,0.08)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-heading font-black tracking-tight text-primary">
            NVide Live
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!sessionLoading && session ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full py-1 pl-1.5 pr-3 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black uppercase">
                {session.user.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-none text-foreground">{session.user.name}</span>
                <span className="text-[9px] text-accent font-black uppercase tracking-wider mt-0.5">
                  {session.user.role || "user"}
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-bold shadow-md">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pullDistance > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            {pullDistance > 70 ? "Lepas untuk refresh" : "Tarik ke bawah untuk refresh"}
          </div>
        )}
        
        {/* HERO BANNER - ANIME STYLE */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-card border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary animate-bounce">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Live Streaming Art HQ
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-black leading-tight">
              Watch Cute Streams from <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Top Creators</span>
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-lg">
              Interact with anime Vtuber avatars, cosplay showstars, gamer partners and join private rooms. Enjoy low-latency streaming and smart interactions.
            </p>
          </div>

          <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden border border-primary/20 shadow-lg shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"
              alt="Live Anime Stream banner"
              fill
              className="object-cover opacity-90"
            />
            <div className="absolute top-3 left-3 bg-red-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Live Now
            </div>
          </div>
        </div>

        {/* SEARCH, CATEGORIES & ADVANCED PANEL */}
        <div className="space-y-4 bg-card p-5 rounded-3xl border border-primary/15 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stream title, host, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border-primary/25 focus:border-primary rounded-2xl text-xs placeholder:text-muted-foreground"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`border-primary/20 bg-background text-xs font-bold rounded-2xl h-10 ${
                  showAdvanced ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground"
                }`}
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Advanced Filters
              </Button>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="border-primary/20 bg-background text-muted-foreground hover:text-primary hover:bg-primary/5 text-xs font-bold rounded-2xl h-10"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* ADVANCED FILTER DRAWER */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {/* Format selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stream Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["all", "landscape", "portrait"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFilterFormat(fmt)}
                        className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                          filterFormat === fmt 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-primary/15 bg-background text-muted-foreground"
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lovense Toy filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interactive Toys</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "All", value: null },
                      { label: "Lovense Only", value: true },
                      { label: "Standard Only", value: false }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setFilterLovense(opt.value)}
                        className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                          filterLovense === opt.value 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-primary/15 bg-background text-muted-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Private vs Public */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access Room Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "All", value: null },
                      { label: "Paid VIP Private", value: true },
                      { label: "Public Streams", value: false }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setFilterPrivate(opt.value)}
                        className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                          filterPrivate === opt.value 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-primary/15 bg-background text-muted-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.value
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-card border-primary/15 hover:border-primary/30 text-muted-foreground"
              }`}
            >
              {cat.value === "" ? <Layers className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
              {cat.name}
            </button>
          ))}
        </div>

        {/* STREAM LIST GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-primary/15 rounded-3xl overflow-hidden animate-pulse h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-card border border-rose-500/20 rounded-3xl max-w-md mx-auto space-y-3">
            <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-black text-rose-500">Failed to fetch streams</h3>
            <p className="text-xs text-muted-foreground">{error as any}</p>
            <Button onClick={handleRefresh} size="sm" className="bg-primary text-primary-foreground text-xs font-bold rounded-xl">Try Again</Button>
          </div>
        ) : paginatedStreams.length === 0 ? (
          <div className="py-16 text-center bg-card border border-primary/10 rounded-3xl max-w-md mx-auto space-y-3">
            <Radio className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-foreground">No Streams Found</h3>
            <p className="text-xs text-muted-foreground">Try tweaking your search terms or filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedStreams.map((stream) => {
                const hasLovense = stream.interactive || stream.title.toLowerCase().includes("lovense") || stream.title.toLowerCase().includes("toy");
                const isPrivate = stream.room_mode === "private" || stream.title.toLowerCase().includes("private") || stream.title.toLowerCase().includes("vip");

                return (
                  <Link key={stream.id} href={`/streams/${stream.id}`} className="group block">
                    <Card className="h-full bg-card border border-primary/15 hover:border-primary/30 overflow-hidden transition-all duration-300 rounded-3xl relative flex flex-col justify-between hover:shadow-lg">
                      
                      {/* Thumbnail frame */}
                      <div className="relative aspect-video w-full bg-muted overflow-hidden">
                        <Image
                          src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"}
                          alt={stream.title}
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        
                        {/* Live Badge */}
                        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                          <span className="bg-red-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                            Live
                          </span>

                          {/* Lovense badge */}
                          {hasLovense && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                              <Sliders className="h-2.5 w-2.5" /> Lovense
                            </span>
                          )}

                          {/* Private Room badge */}
                          {isPrivate && (
                            <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" /> Private
                            </span>
                          )}
                        </div>

                        {/* Format symbol */}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1 text-white border border-white/10">
                          {stream.format === "portrait" ? (
                            <Tablet className="h-3.5 w-3.5 text-accent" />
                          ) : (
                            <Monitor className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>

                        {/* View count */}
                        <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded-full border border-white/15">
                          {stream.viewer_count || 0} watching
                        </div>
                      </div>

                      <CardHeader className="p-4 space-y-2 flex-1">
                        <div className="flex items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                            {stream.category || "General"}
                          </span>
                        </div>
                        
                        <CardTitle className="text-sm font-heading font-black line-clamp-1 group-hover:text-primary transition-colors">
                          {stream.title}
                        </CardTitle>
                        
                        <p className="text-muted-foreground text-[11px] font-semibold line-clamp-2 leading-relaxed">
                          {stream.description || "Join the interactive stream room now!"}
                        </p>
                      </CardHeader>

                      <CardFooter className="p-4 pt-0 border-t border-primary/5 bg-primary/2.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black uppercase">
                          {stream.host?.username?.charAt(0) || "H"}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold leading-none text-foreground">@{stream.host?.username || "Verified Host"}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">NVide Partner Star</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination numbers */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-3 max-w-xs mx-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-primary/20 text-xs font-bold rounded-xl h-8 px-3"
                >
                  Prev
                </Button>
                <span className="text-xs font-bold text-muted-foreground">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-primary/20 text-xs font-bold rounded-xl h-8 px-3"
                >
                  Next
                </Button>
              </div>
            )}

          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
