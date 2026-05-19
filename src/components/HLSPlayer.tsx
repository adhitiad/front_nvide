"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2, Tv, Minimize2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePiP } from "@/hooks/usePiP";
import { useShare } from "@/hooks/useShare";

interface HLSPlayerProps {
  src?: string;
  poster?: string;
}

export function HLSPlayer({ src, poster }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { isActive: pipActive, enterPiP, exitPiP } = usePiP();
  const { share } = useShare();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasError(false);

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Auto-play might be blocked by browsers if not muted
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true));
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setHasError(true);
              setLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native support (Safari, iOS Chrome)
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true));
        });
      });
      video.addEventListener("error", () => {
        setHasError(true);
        setLoading(false);
      });
    } else {
      setHasError(true);
      setLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl bg-neutral-950 border border-neutral-900 overflow-hidden shadow-2xl group"
    >
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        poster={poster || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* STATE OVERLAYS */}
      {loading && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <span className="text-sm text-neutral-400 font-bold tracking-wide">Mempersiapkan Pemutaran HLS...</span>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center border border-red-900/30 text-red-500">
            <Tv className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-md font-bold text-neutral-200">Gagal Memutar Siaran</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              Mungkin sinyal siaran terputus atau format media tidak didukung di browser ini.
            </p>
          </div>
        </div>
      )}

      {/* CONTROLS OVERLAY (VISIBLE ON HOVER) */}
      {!loading && !hasError && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-white" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5 text-red-500" /> : <Volume2 className="h-4.5 w-4.5" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator */}
            <span className="bg-red-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg shadow-red-500/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live
            </span>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              <Maximize2 className="h-4.5 w-4.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => (pipActive ? exitPiP() : enterPiP(videoRef.current))}
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              {pipActive ? <Minimize2 className="h-4.5 w-4.5" /> : <Tv className="h-4.5 w-4.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => share({ title: "NVide Live Stream", url: typeof window !== "undefined" ? window.location.href : "" })}
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              <Share2 className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
