"use client";

import React, { useState, useRef, useEffect } from "react";
import ShortVideoPlayer from "@/components/shorts/ShortVideoPlayer";
import { useShorts } from "@/hooks/useShorts";
import { Loader2 } from "lucide-react";

export default function ShortsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: shorts, isLoading } = useShorts();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeIndex]);

  return (
    <div className="h-screen w-full bg-black relative">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-6 flex items-center justify-between pointer-events-none">
        <h1 className="text-white font-heading font-black text-xl drop-shadow-md">
          Shorts
        </h1>
        <div className="flex gap-4 text-white drop-shadow-md font-bold text-sm">
          <span className="opacity-50">Following</span>
          <span className="border-b-2 border-white pb-1">For You</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : shorts && shorts.length > 0 ? (
        /* Snap Scrolling Container */
        <div 
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
          {shorts.map((short, index) => (
            <div key={short.id} className="h-full w-full snap-start snap-always relative">
              <ShortVideoPlayer 
                {...short} 
                isActive={index === activeIndex} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-white/50 space-y-2">
          <div className="text-4xl">📭</div>
          <p className="font-bold">No Shorts available.</p>
        </div>
      )}
    </div>
  );
}
