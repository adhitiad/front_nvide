"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getAccessToken } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Settings, Users, MessageSquare, ExternalLink, Pin, Crown, ShieldAlert, VolumeX, Ban, Gift, Heart, Scissors, Download, Share2, Sparkles, Lock, Check, Loader2 } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CoinRain } from "@/components/CoinRain";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export default function WebRTCStreamRoom() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  
  const [isLive, setIsLive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // States & hooks for AI Clip highlight generation
  const [showEndSummary, setShowEndSummary] = useState(false);
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [clipGenerated, setClipGenerated] = useState<any>(null);
  const { activeSubscription, deductQuota } = useSubscriptionStore();

  // Chat & Moderation State
  const [messages, setMessages] = useState<any[]>([]);
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const currentUserRef = useRef<any>(null);
  currentUserRef.current = currentUser;
  const [messageInput, setMessageInput] = useState("");
  const [triggerCoinRain, setTriggerCoinRain] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatSettings, setChatSettings] = useState<any>({
    chat_mode: "public",
    slow_mode_seconds: 0,
    min_level_to_chat: 1
  });
  const [showModPanel, setShowModPanel] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Hook for Broadcaster
  const { isConnected: isWebRTCConnected } = useWebRTC({
    streamId,
    role: 'host',
    localStream: isLive ? localStream : null
  });

  // Setup Kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        setLocalStream(stream);
      } catch (err) {
        console.error("Gagal mengakses kamera/mikrofon", err);
      }
    }
    setupCamera();

    // Get current user profile
    api.get("/auth/me").then((res: any) => setCurrentUser(res)).catch(console.error);

    // Fetch info stream & sinkronisasi status live
    api.get(`/streams/${streamId}`)
      .then((res: any) => {
        setStreamInfo(res);
        if (res.status === "ended") {
          toast.error("Sesi siaran ini telah berakhir.");
          router.push("/dashboard/streams");
          return;
        }
        if (res.status === "live") {
          setIsLive(true);
        }
        if (res.chat_mode) {
          setChatSettings({
            chat_mode: res.chat_mode || "public",
            slow_mode_seconds: res.chat_slow_mode_seconds || 0,
            min_level_to_chat: res.min_level_to_enter || 1
          });
        }
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi data stream:", err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update video element srcObject when localStream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup WebSocket untuk Live Chat Room & Moderasi
  useEffect(() => {
    if (!streamId) return;

    let isMounted = true;
    let socket: WebSocket | null = null;

    const connectChat = async () => {
      try {
        const t = await getAccessToken();
        if (!isMounted) return;

        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
        socket = new WebSocket(t
          ? `${WS_URL}/ws/rooms/${streamId}?token=${encodeURIComponent(t)}`
          : `${WS_URL}/ws/rooms/${streamId}`);
        
        socket.onmessage = (event) => {
          try {
            const lines = event.data.split('\n');
            for (const line of lines) {
              if (!line.trim()) continue;
              const msg = JSON.parse(line);
              
              // Handle Event Moderasi khusus
              if (msg.type === "message_pinned") {
                setPinnedMessage(msg.payload?.content);
              } else if (msg.type === "chat_settings_updated") {
                setChatSettings({
                  chat_mode: msg.payload?.chat_mode,
                  slow_mode_seconds: msg.payload?.slow_mode_seconds,
                  min_level_to_chat: msg.payload?.min_level_to_chat
                });
              } else if (msg.type === "force_disconnect" && currentUserRef.current?.id === msg.payload?.target_user_id) {
                alert(`Siaran telah dihentikan secara paksa oleh sistem. Alasan: ${msg.payload?.reason || "Pelanggaran aturan keselamatan."}`);
                handleEndBroadcast();
                return;
              }

              setMessages((prev) => [...prev, msg]);
              
              // Trigger Hujan Koin jika ada Gift Mahal (> 10rb)
              if (msg.type === "gift" && (msg.payload?.total_price || 0) >= 10000) {
                setTriggerCoinRain(true);
                setTimeout(() => setTriggerCoinRain(false), 5000);
              }
            }

            setTimeout(() => {
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } catch (err) {
            console.error("Gagal membaca pesan", err);
          }
        };

        wsRef.current = socket;
      } catch (err) {
        console.error("[WS Rooms] Failed to get access token", err);
      }
    };

    connectChat();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
    };
  }, [streamId]);

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const handleStartBroadcast = async () => {
    try {
      const data = await api.post(`/streams/${streamId}/start`) as any;
      setIsLive(true);
      setStreamInfo(data);
      setMessages(prev => [...prev, { system: true, message: "Siaran langsung telah dimulai!" }]);
    } catch (err) {
      console.error("Gagal memulai broadcast", err);
      alert("Gagal terhubung ke server. Pastikan stream valid.");
    }
  };

  const handleGenerateAIClip = async () => {
    if (!activeSubscription || activeSubscription.quotaRemaining <= 0) {
      toast.error("Kuota habis, upgrade ke VIP lebih tinggi");
      return;
    }
    
    setIsGeneratingClip(true);
    // Simulate API call for generating AI clip
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Deduct quota
    const success = deductQuota(1);
    setIsGeneratingClip(false);
    
    if (success) {
      setClipGenerated({
        id: "clip_" + Math.random().toString(36).substring(7),
        title: streamInfo?.title ? `Sorotan Terbaik: ${streamInfo.title}` : "Momen Sorotan Terbaik 🌸",
        duration: "0:45",
        views: 0,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // dummy movie
      });
      toast.success("AI Clip berhasil dibuat! 🌸✨");
    } else {
      toast.error("Gagal mengurangi kuota AI Clip.");
    }
  };

  const handleEndBroadcast = async () => {
    try {
      await api.post(`/streams/${streamId}/end`);
      setIsLive(false);
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      setShowEndSummary(true);
    } catch (err) {
      console.error("Gagal mengakhiri broadcast", err);
      setShowEndSummary(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !wsRef.current) return;

    const payload = {
      type: "chat",
      payload: messageInput,
    };

    wsRef.current.send(JSON.stringify(payload));
    setMessageInput("");
  };

  // Moderator Action Dispatchers
  const sendModeratorCommand = (type: string, targetUserId: string, extraPayload: any = {}) => {
    if (!wsRef.current) return;
    const payload = {
      type: type,
      payload: {
        target_user_id: targetUserId,
        ...extraPayload
      }
    };
    wsRef.current.send(JSON.stringify(payload));
    setSelectedUser(null);
  };

  const updateChatSettings = (newSettings: any) => {
    if (!wsRef.current) return;
    const payload = {
      type: "chat_settings",
      payload: newSettings
    };
    wsRef.current.send(JSON.stringify(payload));
  };

  const renderLevelBadge = (level: number) => {
    if (level < 10) {
      return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 uppercase">Lvl {level}</span>;
    } else if (level < 25) {
      return <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-1.5 shadow-[0_0_5px_rgba(6,182,212,0.4)]">Lvl {level}</span>;
    } else if (level < 50) {
      return <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-1.5 shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse">Lvl {level}</span>;
    } else {
      return <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded mr-1.5 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)] animate-bounce">👑 Lvl {level}</span>;
    }
  };

  if (showEndSummary) {
    return (
      <div className="h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-black text-white min-h-screen">
        <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-2 p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-black border border-indigo-500/20 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[10px] font-black bg-indigo-500/20 text-indigo-400 rounded-bl-2xl">
              BROADCAST LOG SUMMARY
            </div>
            <h1 className="text-3xl font-bold text-indigo-400 flex items-center justify-center gap-2 animate-bounce">
              Siaran Anda Telah Berakhir! 🌸
            </h1>
            <p className="text-xs text-neutral-400 font-semibold">
              Terima kasih telah berbagi momen indah bersama pemirsa setia Anda. Berikut adalah ringkasan performa streaming Anda.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Durasi Siaran", value: "02:15:40", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
              { label: "Pemirsa Puncak", value: "1,250 👤", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Suka Diterima", value: "8,400 ❤️", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
              { label: "Hadiah Diterima", value: "120 🎁", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 bg-neutral-900/60 rounded-2xl border ${stat.color} flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">{stat.label}</span>
                <p className="text-xl font-black mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* AI CLIP SECTION */}
          <div className="p-6 bg-neutral-900/50 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
              <h3 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-purple-400 animate-sparkle" />
                AI Clip Highlight Generator
              </h3>
              {activeSubscription && (
                <span className="text-xs font-bold text-neutral-400 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                  Sisa Kuota: {activeSubscription.quotaRemaining} / {activeSubscription.quotaTotal} Clip
                </span>
              )}
            </div>

            {/* If no subscription or quota is 0 */}
            {(!activeSubscription || activeSubscription.quotaRemaining <= 0) && !clipGenerated && !isGeneratingClip ? (
              <div className="p-8 border border-dashed border-red-500/30 bg-red-500/5 rounded-2xl text-center space-y-4 relative">
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 space-y-3 z-10">
                  <div className="h-12 w-12 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center text-red-500 font-black text-xl">
                    ⚠️
                  </div>
                  <h4 className="text-sm font-black text-red-500 uppercase">Kuota habis, upgrade ke VIP lebih tinggi</h4>
                  <p className="text-xs text-neutral-400 max-w-md font-semibold leading-relaxed">
                    Silakan beli paket VIP atau tingkatkan ke paket VIP yang lebih tinggi untuk menikmati fitur klip sorotan otomatis berbasis AI.
                  </p>
                  <Button 
                    onClick={() => router.push("/clip-subscription")}
                    className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-2xl px-6 text-xs h-9.5 shadow-md border border-indigo-500/25"
                  >
                    Upgrade VIP
                  </Button>
                </div>
                <div className="opacity-10 pointer-events-none space-y-2">
                  <p className="text-sm font-bold">Generate automated clip highlights</p>
                  <div className="h-8 bg-neutral-800 rounded-xl"></div>
                </div>
              </div>
            ) : null}

            {/* State 1: Ready to generate */}
            {!clipGenerated && !isGeneratingClip && (activeSubscription && activeSubscription.quotaRemaining > 0) && (
              <div className="py-6 text-center space-y-4">
                <p className="text-xs text-neutral-400 max-w-lg mx-auto font-semibold leading-relaxed">
                  Gunakan kecerdasan buatan kami untuk memindai siaran langsung Anda, memotong klip terbaik secara otomatis dengan visual 1080p, dan menambahkan suara/efek transisi anime yang mengagumkan!
                </p>
                <Button 
                  onClick={handleGenerateAIClip}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl px-8 py-3 text-xs h-11 shadow-lg animate-pulse-hover border border-indigo-500/20"
                >
                  <Sparkles className="h-4.5 w-4.5 mr-2" />
                  Generate AI Clip
                </Button>
              </div>
            )}

            {/* State 2: Generating Clip (Loading Animation) */}
            {isGeneratingClip && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-indigo-400 flex items-center gap-1.5 justify-center">
                    AI sedang memindai rekaman siaran Anda... 🧠⚡️✨
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold">
                    Mengekstrak momen paling seru dan mendeteksi reaksi pemirsa teraktif. Mohon tunggu.
                  </p>
                </div>
                <div className="w-64 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            )}

            {/* State 3: Clip Generated Success */}
            {clipGenerated && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">AI Highlight Berhasil Dibuat!</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Klip sorotan telah disimpan ke galeri studio Anda dan siap dibagikan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Clip Player Preview */}
                  <div className="aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-indigo-500/20 relative shadow-md">
                    <video 
                      src={clipGenerated.videoUrl} 
                      controls 
                      className="w-full h-full object-cover" 
                      poster="https://api.dicebear.com/7.x/shapes/svg?seed=highlight"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      ⏱️ {clipGenerated.duration}
                    </div>
                  </div>

                  {/* Clip Actions */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">JUDUL KLIP</span>
                      <h4 className="text-sm font-black text-white">{clipGenerated.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => toast.success("Klip berhasil dibagikan ke Feed Sosial Anda! 🌸")}
                        className="flex-1 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl h-10 text-xs shadow-md border border-indigo-500/20"
                      >
                        <Share2 className="h-4 w-4 mr-1.5" /> Bagikan ke Feed
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => toast.success("Klip berhasil diunduh ke penyimpanan lokal Anda! 📥")}
                        className="border-indigo-500/20 hover:bg-indigo-500/5 font-bold rounded-xl h-10 text-xs text-indigo-400"
                      >
                        <Download className="h-4 w-4 mr-1.5" /> Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Grid Pendek Clip Lain (Hasil Klip) */}
                <div className="space-y-3 pt-4 border-t border-indigo-500/10">
                  <h4 className="text-xs font-bold text-neutral-450 uppercase tracking-wider">
                    Hasil Klip AI Studio Anda
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { title: "Momen Chibi Sparkle", duration: "0:30", views: 2400 },
                      { title: "Hot Private Room Intro", duration: "0:50", views: 4100 },
                      { title: "Epic Lovense Reaction", duration: "0:45", views: 1800 },
                      { title: "Final Wave Senpai", duration: "0:25", views: 950 }
                    ].map((c, i) => (
                      <div key={i} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl hover:border-indigo-500/30 transition-all text-left">
                        <div className="aspect-video bg-neutral-950 rounded-xl overflow-hidden mb-2 relative border border-neutral-850 flex items-center justify-center">
                          <span className="text-lg">🎬</span>
                          <span className="absolute bottom-1 right-1 bg-black/75 text-[8px] font-black px-1.5 py-0.5 rounded text-white">
                            {c.duration}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-white truncate">{c.title}</p>
                        <p className="text-[8px] text-neutral-500 mt-0.5">👁️ {c.views.toLocaleString()} views</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => router.push("/dashboard/streams")}
              className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold rounded-2xl px-6 text-xs h-10 border border-neutral-850"
            >
              Kembali ke Dashboard Studio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-black text-white min-h-screen">
      <CoinRain active={triggerCoinRain} />
      
      {/* KIRI: VIDEO PLAYER UTAMA & KONTROL */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col gap-4 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Studio Siaran: <span className="text-indigo-400 font-mono">{streamId.slice(0, 8)}</span>
                {isLive && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-md">
                    LIVE BROADCASTING
                  </span>
                )}
              </h1>
              <p className="text-xs text-neutral-400 mt-1">Status kamera aktif. Pastikan pencahayaan cukup untuk wow efek!</p>
            </div>
            <div className="flex gap-2">
              {isLive && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/dashboard/streams/${streamId}/watch`, '_blank')}
                  className="border-neutral-700 text-neutral-300 rounded-full hover:bg-neutral-800"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lihat Room
                </Button>
              )}
              {!isLive ? (
                <Button onClick={handleStartBroadcast} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 font-bold shadow-lg shadow-emerald-900/40">
                  Mulai Siaran
                </Button>
              ) : (
                <Button onClick={handleEndBroadcast} variant="destructive" className="rounded-full px-6 font-bold shadow-lg shadow-red-900/40">
                  Akhiri Siaran
                </Button>
              )}
            </div>
          </div>

          {isLive && streamInfo?.stream_key && (
            <div className="mt-4 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-3">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Kredensial Mux OBS (Broadcasting Eksternal)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase">RTMP Server URL</p>
                  <code className="text-xs text-white bg-black/60 p-2.5 rounded-lg block mt-1 border border-neutral-800">rtmp://global-live.mux.com:5222/app</code>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase">Stream Key</p>
                  <code className="text-xs text-amber-400 bg-black/60 p-2.5 rounded-lg block mt-1 border border-neutral-800 font-bold">{streamInfo.stream_key}</code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden aspect-video shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-300 ${!cameraEnabled ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
              <VideoOff className="h-20 w-20 text-neutral-700 animate-pulse" />
            </div>
          )}

          {/* Floating Controls Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-neutral-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-700 shadow-2xl z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleMic}
              className={`rounded-full h-12 w-12 border-0 transition-colors ${micEnabled ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-red-900/50 hover:bg-red-900/80 text-red-400'}`}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleCamera}
              className={`rounded-full h-12 w-12 border-0 transition-colors ${cameraEnabled ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-red-900/50 hover:bg-red-900/80 text-red-400'}`}
            >
              {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-0 bg-neutral-800 hover:bg-neutral-700 text-white"
              onClick={toggleCamera}
            >
              <MonitorUp className={`h-5 w-5 ${!cameraEnabled ? 'text-red-500' : ''}`} />
            </Button>
            
            <div className="w-px h-8 bg-neutral-700 mx-2"></div>

            <Button 
              variant="destructive" 
              size="icon" 
              onClick={handleEndBroadcast}
              className="rounded-full h-12 w-12 shadow-lg shadow-red-950/50 scale-105"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* KANAN: STUDIO CHAT & VIEWERS */}
      <div className="w-full lg:w-96 flex flex-col gap-4 relative">
        <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-2xl relative">
          <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0 bg-neutral-900/80 backdrop-blur-md z-10">
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
              Obrolan Studio
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowModPanel(!showModPanel)} 
                className={`h-8 w-8 rounded-full ${showModPanel ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <span className="text-[10px] text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono">
                {chatSettings.chat_mode.toUpperCase()}
              </span>
            </div>
          </CardHeader>

          {/* Moderation Settings Panel */}
          {showModPanel && (
            <div className="absolute top-[60px] inset-x-0 bg-neutral-950 border-b border-neutral-800 p-4 z-20 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Konfigurasi Pembatasan Chat</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400">Mode Chat</label>
                  <select 
                    value={chatSettings.chat_mode}
                    onChange={(e) => updateChatSettings({ ...chatSettings, chat_mode: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 p-1.5 rounded text-white mt-1"
                  >
                    <option value="public">Semua Bebas</option>
                    <option value="slow">Slow Mode</option>
                    <option value="level_gate">Level Gate</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">Slow Mode Delay</label>
                  <select 
                    value={chatSettings.slow_mode_seconds}
                    onChange={(e) => updateChatSettings({ ...chatSettings, slow_mode_seconds: parseInt(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 p-1.5 rounded text-white mt-1"
                  >
                    <option value="0">Off</option>
                    <option value="5">5 Detik</option>
                    <option value="10">10 Detik</option>
                    <option value="30">30 Detik</option>
                  </select>
                </div>
              </div>

              {chatSettings.chat_mode === "level_gate" && (
                <div className="pt-1">
                  <label className="text-[10px] text-neutral-400 block mb-1">Level Minimal Chat</label>
                  <Input 
                    type="number" 
                    value={chatSettings.min_level_to_chat} 
                    onChange={(e) => updateChatSettings({ ...chatSettings, min_level_to_chat: parseInt(e.target.value) || 1 })}
                    className="bg-neutral-900 border-neutral-800 h-8 text-xs text-white" 
                  />
                </div>
              )}
            </div>
          )}

          <CardContent className="flex-1 p-0 flex flex-col relative overflow-hidden">
            {/* Pinned Message */}
            {pinnedMessage && (
              <div className="bg-indigo-950/80 border-b border-indigo-800/40 p-3 flex items-start gap-2 backdrop-blur-md animate-in slide-in-from-top-1 z-10">
                <Pin className="h-4 w-4 text-indigo-400 rotate-45 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-indigo-300 block uppercase tracking-wider mb-0.5">Disematkan</span>
                  <p className="text-xs text-indigo-100 font-medium truncate">{pinnedMessage}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setPinnedMessage(null)} 
                  className="h-5 w-5 text-indigo-400 hover:text-white rounded-full shrink-0"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Chat List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 bg-neutral-900/10">
              <div className="text-[11px] text-center text-neutral-500 py-1 bg-neutral-950 rounded-full border border-neutral-800 mb-2">
                🎥 Studio Streaming Aktif
              </div>

              {messages.map((msg, idx) => {
                const isGift = msg.type === "gift";
                const isSystem = msg.type === "system";
                const isUserMuted = msg.type === "user_muted";
                const isUserKicked = msg.type === "user_kicked";
                const isLevelUp = msg.type === "level_up";
                const isCustomError = msg.type === "error";

                if (isSystem) {
                  return (
                    <div key={idx} className="text-center my-3 py-1.5 px-3 bg-neutral-950/50 border border-neutral-800/50 rounded-xl">
                      <p className="text-[11px] text-neutral-500 font-medium italic">{msg.payload?.content || msg.message}</p>
                    </div>
                  );
                }

                if (isUserMuted || isUserKicked) {
                  return (
                    <div key={idx} className="text-center my-3 py-2 px-4 bg-red-950/10 border border-red-500/10 rounded-xl flex items-center justify-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <p className="text-[11px] text-red-400 font-bold">{msg.payload?.message || msg.message}</p>
                    </div>
                  );
                }

                if (isLevelUp) {
                  return (
                    <div key={idx} className="my-4 p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border border-amber-500/20 rounded-xl text-center shadow-lg shadow-amber-950/20 animate-bounce">
                      <p className="text-xs font-black text-amber-400 tracking-wider">LEVEL UP ALERT</p>
                      <p className="text-[11px] text-yellow-100 font-medium mt-1">
                        User <span className="font-extrabold text-white">{msg.payload?.username}</span> naik ke <span className="text-amber-400 font-bold">Level {msg.payload?.new_level}</span>!
                      </p>
                    </div>
                  );
                }

                if (isCustomError) {
                  return (
                    <div key={idx} className="my-2 p-2 bg-red-950/20 border border-red-800/30 rounded-lg text-xs text-red-400 flex items-start gap-2">
                      <span className="font-bold shrink-0">⚠️</span>
                      <p className="font-semibold">{msg.payload?.message}</p>
                    </div>
                  );
                }

                const senderName = msg.payload?.username || msg.sender || "Viewer";
                const level = msg.payload?.user_level || 1;
                const isSenderVIP = msg.payload?.is_vip || false;
                const chatColor = msg.payload?.chat_color || "#FFFFFF";
                const messageText = msg.payload?.content || msg.payload || msg.content || msg.message;

                return (
                  <div key={idx} className="flex gap-2.5 items-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="flex-1 min-w-0">
                      {isGift ? (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-3 rounded-2xl w-full shadow-md">
                          <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                            <Gift className="h-4.5 w-4.5 text-white fill-current" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              {renderLevelBadge(level)}
                              <span className="text-xs font-bold text-amber-400">{senderName}</span>
                            </div>
                            <p className="text-sm text-amber-100 font-bold mt-0.5">{messageText}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center flex-wrap gap-1.5 mb-1">
                            {renderLevelBadge(level)}
                            
                            {isSenderVIP && (
                              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8px] font-extrabold px-1 rounded uppercase tracking-wider">VIP</span>
                            )}

                            <span 
                              style={{ color: chatColor }} 
                              onClick={() => {
                                if (msg.payload?.user_id) {
                                  setSelectedUser({ id: msg.payload.user_id, username: senderName });
                                }
                              }}
                              className="text-xs font-extrabold cursor-pointer hover:underline"
                            >
                              {senderName}
                            </span>
                          </div>
                          
                          <p className="text-sm text-neutral-200 break-words bg-neutral-800/40 p-2.5 rounded-2xl rounded-tl-none border border-neutral-800/50">
                            {messageText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Moderation Overlay popup */}
            {selectedUser && (
              <div className="absolute inset-x-4 bottom-18 bg-neutral-950 border border-neutral-800 p-4 rounded-2xl z-30 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <p className="text-sm font-bold text-white flex items-center">
                    <Crown className="h-4 w-4 text-indigo-400 mr-2" />
                    Opsi User: <span className="text-indigo-300 ml-1.5 font-extrabold">{selectedUser.username}</span>
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="h-6 w-6 text-neutral-400 rounded-full">×</Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => sendModeratorCommand("mute", selectedUser.id, { duration_seconds: 300 })}
                    className="border-neutral-800 text-xs hover:bg-amber-600/10 hover:text-amber-500 h-10 gap-1 rounded-xl"
                  >
                    <VolumeX className="h-3.5 w-3.5" /> Mute 5m
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => sendModeratorCommand("kick", selectedUser.id)}
                    className="border-neutral-800 text-xs hover:bg-red-600/10 hover:text-red-500 h-10 gap-1 rounded-xl"
                  >
                    <Ban className="h-3.5 w-3.5" /> Kick
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const msg = prompt("Ketik isi pesan yang ingin disematkan:");
                      if (msg) {
                        sendModeratorCommand("pin", selectedUser.id, { content: msg });
                      }
                      setSelectedUser(null);
                    }}
                    className="border-neutral-800 text-xs hover:bg-indigo-600/10 hover:text-indigo-400 h-10 gap-1 rounded-xl"
                  >
                    <Pin className="h-3.5 w-3.5" /> Pin Msg
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Kirim pesan studio..." 
                  className="bg-neutral-900 border-neutral-800 text-sm h-11 focus-visible:ring-indigo-500 rounded-xl"
                />
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 h-11 w-11 shrink-0 rounded-xl shadow-lg shadow-indigo-900/30">
                  <Heart className="h-5 w-5 fill-current text-white animate-pulse" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

