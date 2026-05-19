"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useClip } from "@/hooks/useClip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HLSPlayer } from "@/components/HLSPlayer";
import {
  ChevronLeft,
  Video,
  Play,
  Share2,
  Download,
  RefreshCw,
  Sparkles,
  Heart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useShare } from "@/hooks/useShare";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StreamClipsPage({ params }: PageProps) {
  const { id: streamId } = use(params);
  
  const {
    clips,
    generating,
    loading,
    error,
    regenerate
  } = useClip(streamId);

  const [activeClipUrl, setActiveClipUrl] = useState<string | null>(null);
  const { share } = useShare();

  const handleRegenerate = async () => {
    try {
      await regenerate();
      toast.success("Klip AI berhasil dihasilkan ulang! ✨");
    } catch (err: any) {
      toast.error(err.message || "Gagal meregenerasi klip AI");
    }
  };

  const handleShare = async (title: string) => {
    const usedNative = await share({
      title: `NVide Clip: ${title}`,
      text: "Lihat klip ini di NVide Live",
      url: window.location.href,
    });
    toast.success(usedNative ? "Klip dibagikan." : `Tautan untuk klip "${title}" berhasil disalin ke papan klip!`);
  };

  const handleDownload = (title: string) => {
    toast.success(`Proses pengunduhan berkas klip "${title}" telah dimulai! 💾`);
  };

  if (loading && clips.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <span className="text-md font-bold text-neutral-400">Menganalisis riwayat rekaman & kliping AI...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/streams/${streamId}`}>
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-purple-900/50 flex items-center gap-1.5 shadow-lg">
              <Video className="h-3.5 w-3.5 animate-pulse" />
              AI Short Clips
            </span>
            <span className="text-sm font-bold text-neutral-300">Klip Pendek Otomatis</span>
          </div>
        </div>

        <Button 
          onClick={handleRegenerate}
          disabled={generating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold text-xs px-5 shadow-lg transition"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5" />
              Proses Komputasi AI...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Hasilkan Ulang Klip
            </>
          )}
        </Button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        
        {/* INLINE MOVIE PLAYER ZONE */}
        {activeClipUrl && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
                Inline Cinema Player
              </span>
              <Button 
                onClick={() => setActiveClipUrl(null)} 
                variant="ghost" 
                className="text-neutral-400 hover:text-white text-xs"
              >
                Tutup Pemutar
              </Button>
            </div>
            <div className="relative aspect-video w-full max-w-[800px] mx-auto bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-850 shadow-inner">
              <HLSPlayer src={activeClipUrl} />
            </div>
          </div>
        )}

        {/* CLIPS GRID */}
        {clips.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="h-12 w-12 text-neutral-800 animate-bounce-short" />
            <span className="text-sm font-bold text-neutral-400">Tidak Ada Klip AI Tersedia</span>
            <span className="text-xs text-neutral-600">Tekan tombol "Hasilkan Ulang Klip" di atas untuk memicu pemrosesan segmentasi AI.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <Card 
                key={clip.id} 
                className="bg-neutral-950 border-neutral-900 rounded-3xl overflow-hidden shadow-xl hover:border-purple-550 group transition duration-300 flex flex-col justify-between"
              >
                {/* Thumbnail Preview overlay */}
                <div className="relative aspect-[9/16] max-h-[300px] w-full overflow-hidden bg-neutral-900 cursor-pointer" onClick={() => setActiveClipUrl(clip.videoUrl)}>
                  <img 
                    src={clip.thumbnailUrl} 
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="w-12 h-12 bg-purple-600/90 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-300">
                      <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300">
                    {clip.duration} Detik
                  </span>
                </div>

                {/* Metadata Details */}
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm leading-snug group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                      {clip.title}
                    </h3>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                        {clip.likes} Likes
                      </span>
                      <span>{clip.createdAt}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-neutral-900 pt-4">
                    <Button 
                      onClick={() => handleShare(clip.title)}
                      className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 rounded-xl font-bold py-4 text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Bagikan
                    </Button>
                    <Button 
                      onClick={() => handleDownload(clip.title)}
                      className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 rounded-xl font-bold py-4 text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
