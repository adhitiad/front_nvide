"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStreamStore } from "@/store/useStreamStore";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Flame, Radio, RefreshCw, Layers, Sparkles, Filter, LogIn } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AIRecommendations } from "@/components/AIRecommendations";

const categories = [
  { name: "Semua", value: "" },
  { name: "Gaming", value: "gaming" },
  { name: "Talkshow", value: "talkshow" },
  { name: "Musik", value: "music" },
  { name: "Kecantikan", value: "beauty" },
  { name: "Edukasi", value: "education" },
  { name: "Lainnya", value: "other" },
];

export default function StreamsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { streams, fetchStreams, loading, error } = useStreamStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchStreams(activeCategory);
  }, [fetchStreams, activeCategory]);

  const handleRefresh = () => {
    fetchStreams(activeCategory);
    toast.success("Daftar siaran berhasil diperbarui");
  };

  // Filter berdasarkan pencarian
  const filteredStreams = streams.filter((stream) => {
    const titleMatch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
    const hostMatch = stream.host?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = stream.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || hostMatch || categoryMatch;
  });

  // Pagination client-side
  const totalPages = Math.ceil(filteredStreams.length / itemsPerPage);
  const paginatedStreams = filteredStreams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-600 selection:text-white">
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent tracking-tight">
            NVide Live
          </span>
        </Link>

        {/* PROFILE/LOGIN ACTION */}
        <div className="flex items-center gap-4">
          {!sessionLoading && session ? (
            <div className="flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 rounded-full py-1.5 pl-3 pr-4 hover:border-neutral-700 transition">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold uppercase ring-2 ring-purple-600/30">
                {session.user.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">{session.user.name}</span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  {session.user.role || "user"}
                </span>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold shadow-lg shadow-purple-500/20 transition-all duration-300">
                <LogIn className="h-4 w-4 mr-2" />
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* HERO HERO VIBES */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-900 px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="space-y-6 max-w-xl text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-semibold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              Seni Live Streaming Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Tonton Siaran Langsung dari <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">Kreator Berbakat</span>
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              Jelajahi dunia live streaming imersif dengan video HLS beresolusi tinggi, donasi gift interaktif, chat berkecepatan tinggi, dan interaksi panggilan pribadi.
            </p>
          </div>

          <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"
              alt="Gaming stream mockup"
              fill
              className="object-cover opacity-85 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-red-600 text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Live Sekarang
            </div>
          </div>
        </div>

        {/* REKOMENDASI AI */}
        <AIRecommendations />

        {/* SEARCH, CATEGORIES & CONTROL BAR */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-between bg-neutral-950 p-6 rounded-2xl border border-neutral-900">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <Input
              type="text"
              placeholder="Cari stream, host, atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-900 border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-neutral-200 placeholder:text-neutral-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.value);
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border whitespace-nowrap ${
                activeCategory === cat.value
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg shadow-purple-500/25"
                  : "bg-neutral-950 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {cat.value === "" ? <Layers className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
              {cat.name}
            </button>
          ))}
        </div>

        {/* STREAM CARDS GRID / LOADERS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden animate-pulse h-[350px]">
                <div className="bg-neutral-900 w-full h-[200px]" />
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-neutral-900 rounded w-3/4" />
                  <div className="h-3 bg-neutral-900 rounded w-1/2" />
                  <div className="flex items-center gap-3 pt-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-900" />
                    <div className="h-3 bg-neutral-900 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-neutral-950 rounded-3xl border border-red-900/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center text-red-500 border border-red-900/30">
              <Radio className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-red-400">Gagal Memuat Daftar Stream</h3>
            <p className="text-neutral-400 max-w-md">{error}</p>
            <Button onClick={handleRefresh} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800">
              Coba Lagi
            </Button>
          </div>
        ) : paginatedStreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-neutral-950 rounded-3xl border border-neutral-900 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-800">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-200">Tidak Ada Siaran Aktif</h3>
            <p className="text-neutral-400 max-w-sm">
              {searchQuery ? "Coba ganti kata kunci pencarian Anda." : "Saat ini tidak ada siaran langsung yang aktif. Silakan kembali nanti!"}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedStreams.map((stream) => (
                <Link key={stream.id} href={`/streams/${stream.id}`} className="group block">
                  <Card className="h-full bg-neutral-950 border-neutral-900 hover:border-purple-900/50 overflow-hidden transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-purple-500/5 relative rounded-2xl">
                    
                    {/* THUMBNAIL WRAPPER */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-neutral-900">
                      <Image
                        src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"}
                        alt={stream.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* LIVE & VIEWER BADGES */}
                      <div className="absolute top-4 left-4 flex gap-2 items-center">
                        <span className="bg-red-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg shadow-red-600/30 flex items-center gap-1">
                          <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                          Live
                        </span>
                        {stream.room_mode && (
                          <span className="bg-purple-900/80 backdrop-blur-md text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-purple-500/20">
                            {stream.room_mode}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {stream.viewer_count || 0} penonton
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <CardHeader className="p-5 flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400 bg-purple-950/50 border border-purple-900/40 px-2 py-0.5 rounded-md">
                          {stream.category || "General"}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-purple-400 transition-colors line-clamp-1 leading-snug">
                        {stream.title}
                      </CardTitle>
                      <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                        {stream.description || "Siaran langsung interaktif seru. Gabung obrolan sekarang!"}
                      </p>
                    </CardHeader>

                    {/* HOST FOOTER */}
                    <CardFooter className="p-5 pt-0 border-t border-neutral-900 bg-neutral-950 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold uppercase shadow">
                        {stream.host?.username?.charAt(0) || "H"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-200">{stream.host?.username || "Host Terverifikasi"}</span>
                        <span className="text-[9px] text-neutral-500">Kreator NVide</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 bg-neutral-950 border border-neutral-900 py-3.5 rounded-xl max-w-sm mx-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="hover:bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  Sebelumnya
                </Button>
                <span className="text-sm font-bold text-neutral-300">
                  {currentPage} dari {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="hover:bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
