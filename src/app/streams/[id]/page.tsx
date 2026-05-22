"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStreamStore } from "@/store/useStreamStore";
import { useStreamById, useLikeStream } from "@/hooks/useStreams";
import { useChat } from "@/hooks/useChat";
import { useSession } from "@/lib/auth-client";
import { HLSPlayer } from "@/components/HLSPlayer";
import { GiftPanel } from "@/components/GiftPanel";
import { CoinRain } from "@/components/CoinRain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Users,
  Heart,
  Share2,
  Gift,
  Send,
  MoreVertical,
  Star,
  Swords,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Import new Overhaul components
import PKBattleUI from "@/components/live/PKBattleUI";
import LuckyBag from "@/components/live/LuckyBag";
import WheelOfFortune from "@/components/live/WheelOfFortune";
import VIPEntryEffect, { VIPEntryEvent } from "@/components/live/VIPEntryEffect";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StreamDetailPage({ params }: PageProps) {
  const { id: streamId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const {
    chatMessages,
    viewerCount,
    likes,
    setLikes
  } = useStreamStore();

  const { data: currentStream, isLoading: loading } = useStreamById(streamId);
  const { mutate: likeStreamMutate } = useLikeStream();

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New Overhaul States
  const [isPKActive, setIsPKActive] = useState(false);
  const [pkTime, setPkTime] = useState(300);
  const [hostScore, setHostScore] = useState(0);
  const [challengerScore, setChallengerScore] = useState(0);
  
  const [showLuckyBag, setShowLuckyBag] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [vipEvent, setVipEvent] = useState<VIPEntryEvent | null>(null);

  const { isConnected, sendMessage, sendLike } = useChat({
    streamId,
    userId: session?.user?.id,
    username: session?.user?.name,
  });

  useEffect(() => {
    // Current stream fetched via useStreamById hook
  }, [streamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleLike = () => {
    sendLike();
    likeStreamMutate(streamId);
    setLikes(likes + 1);
    
    // Simulate VIP entrance occasionally when liking for demo purposes
    if (Math.random() > 0.8 && !vipEvent) {
      const levels: Array<"svip" | "mvp" | "king"> = ["svip", "mvp", "king"];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      setVipEvent({
        id: Date.now().toString(),
        username: `RichViewer${Math.floor(Math.random() * 99)}`,
        level: randomLevel,
        message: "has entered the room!"
      });
    }
  };

  // Mock functions for new features
  const handleClaimLuckyBag = async () => {
    return new Promise<{ success: boolean; coins: number; message: string }>((resolve) => {
      setTimeout(() => {
        const win = Math.random() > 0.3;
        resolve({
          success: win,
          coins: win ? Math.floor(Math.random() * 500) + 50 : 0,
          message: win ? "Success" : "Empty bag!"
        });
      }, 800);
    });
  };

  const handleSpinWheel = async () => {
    return new Promise<{ prizeId: string; message: string }>((resolve) => {
      setTimeout(() => {
        resolve({ prizeId: "p2", message: "Success" }); // Force win item 2 for demo
      }, 500);
    });
  };

  if (loading || !currentStream) {
    return <div className="h-screen bg-black" />;
  }

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col font-sans">
      
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 bg-neutral-900">
        <HLSPlayer
          src={currentStream.mux_playback_url || `https://stream.mux.com/${currentStream.playback_id}.m3u8`}
          poster={currentStream.thumbnail_url}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* OVERLAY UI LAYER */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        
        {/* Header (Top) */}
        <div className="p-4 flex items-start justify-between pointer-events-auto">
          {/* Host Info */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 pr-4 border border-white/10">
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary">
              <Image src={currentStream.host?.avatar_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100"} alt="Host" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold leading-tight">{currentStream.host?.username || "HostName"}</span>
              <span className="text-primary text-[9px] font-black uppercase tracking-wider">Level 42</span>
            </div>
            <Button size="sm" className="ml-2 h-6 px-3 bg-primary hover:bg-primary/90 text-white text-[10px] rounded-full font-bold">
              Follow
            </Button>
          </div>

          {/* Top Right Stats */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[8px] text-white font-bold z-10">
                    V{i}
                  </div>
                ))}
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 text-white border border-white/10">
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-bold">{viewerCount}</span>
              </div>
            </div>
            
            {/* Quick action icons */}
            <div className="flex gap-2">
              <button onClick={() => setIsPKActive(!isPKActive)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:text-primary transition">
                <Swords className="w-4 h-4" />
              </button>
              <button onClick={() => setShowLuckyBag(true)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:text-primary transition">
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Components */}
        <PKBattleUI 
          isActive={isPKActive}
          hostScore={hostScore}
          challengerScore={challengerScore}
          challengerInfo={{ username: "RivalHost_99", avatarUrl: "" }}
          timeRemaining={pkTime}
          onGiftHost={() => setHostScore(s => s + 100)}
          onGiftChallenger={() => setChallengerScore(s => s + 100)}
        />

        <LuckyBag 
          isVisible={showLuckyBag}
          onClaim={handleClaimLuckyBag}
          onClose={() => setShowLuckyBag(false)}
        />

        <WheelOfFortune 
          isVisible={showWheel}
          onClose={() => setShowWheel(false)}
          onSpin={handleSpinWheel}
          costPerSpin={100}
          prizes={[
            { id: "p1", name: "1000 Coins", color: "#FDE047", type: "coin", value: 1000 },
            { id: "p2", name: "SVIP 1 Day", color: "#F472B6", type: "item", value: 0 },
            { id: "p3", name: "50 Coins", color: "#60A5FA", type: "coin", value: 50 },
            { id: "p4", name: "Try Again", color: "#9CA3AF", type: "empty", value: 0 },
            { id: "p5", name: "500 EXP", color: "#A78BFA", type: "exp", value: 500 },
            { id: "p6", name: "10 Coins", color: "#34D399", type: "coin", value: 10 },
          ]}
        />

        <VIPEntryEffect 
          event={vipEvent}
          onAnimationComplete={() => setVipEvent(null)}
        />

        {/* Chat Area (Bottom Left) */}
        <div className="flex-1 flex items-end p-4 pb-20 pointer-events-auto w-full md:w-2/3 lg:w-1/3">
          <div className="w-full h-64 overflow-y-auto scrollbar-hide space-y-2 relative" style={{ maskImage: "linear-gradient(to top, black 80%, transparent 100%)" }}>
            
            {/* System welcome message */}
            <div className="bg-primary/20 backdrop-blur-md rounded-xl p-2 text-[11px] text-white border border-primary/30 font-semibold shadow-sm">
              <Sparkles className="inline w-3 h-3 text-primary mr-1" />
              Welcome to the official broadcast! Please follow the community guidelines.
            </div>

            {chatMessages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-[11px]"
              >
                <div className="bg-black/40 backdrop-blur-md rounded-xl px-2.5 py-1.5 flex gap-1.5 items-center border border-white/5">
                  {/* VIP Badge mock */}
                  {i % 5 === 0 && <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-[8px] font-black px-1 rounded-sm text-black">SVIP</span>}
                  
                  <span className="font-bold text-blue-300">{msg.username || "User"}:</span>
                  <span className="text-white drop-shadow-md font-semibold">{msg.content}</span>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-0 flex items-center gap-2 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent">
          <form onSubmit={handleSendChat} className="flex-1 relative">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say something..."
              className="w-full bg-black/40 border-white/20 text-white placeholder:text-white/50 rounded-full h-10 text-xs pl-4 pr-10 backdrop-blur-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Action Buttons */}
          <button onClick={() => setShowWheel(true)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition shrink-0">
            <span className="text-xl anime-spin">🎡</span>
          </button>
          
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition shrink-0">
            <Share2 className="w-5 h-5" />
          </button>

          <GiftPanel 
            receiverId={currentStream.host_id}
            roomId={currentStream.id}
            trigger={
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-primary flex items-center justify-center text-white shadow-[0_0_15px_var(--primary)] hover:scale-105 transition shrink-0 anime-pulse-hover">
                <Gift className="w-5 h-5" />
              </button>
            }
          />
        </div>

        {/* Floating Likes (Right side) */}
        <div className="absolute bottom-20 right-4 pointer-events-auto flex flex-col items-center gap-4 z-20">
          <button onClick={handleLike} className="relative group">
            <div className="absolute inset-0 bg-primary/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition" />
            <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-white border border-white/20 shadow-lg active:scale-90 transition">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-white font-black text-[10px] drop-shadow-md">
              {likes}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
