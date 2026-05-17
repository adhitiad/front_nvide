"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MessageSquare, Heart, Gift, Share2, Flag, Pin, Crown, ShieldAlert, VolumeX, Ban, Settings } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import Hls from "hls.js";
import { GiftPanel } from "@/components/GiftPanel";
import { CoinRain } from "@/components/CoinRain";

export default function WatchStreamPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const currentUserRef = useRef<any>(null);
  currentUserRef.current = currentUser;
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [useHLSFallback, setUseHLSFallback] = useState(false);

  // Chat & Moderation State
  const [messages, setMessages] = useState<any[]>([]);
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

  // Helper to get host display name (fallback to email if username is empty)
  const getHostDisplayName = () => {
    if (!streamInfo?.host) return "Loading Host...";
    if (streamInfo.host.username && streamInfo.host.username.trim() !== "") {
      return streamInfo.host.username;
    }
    if (streamInfo.host.email) {
      return streamInfo.host.email.split("@")[0];
    }
    return `Host ${streamInfo.host.id.slice(0, 8)}`;
  };

  // Fetch Stream Info & Current User Profile
  useEffect(() => {
    async function initPage() {
      try {
        const data = await api.get(`/streams/${streamId}`) as any;
        setStreamInfo(data);

        const user = await api.get("/auth/me") as any;
        setCurrentUser(user);
      } catch (err) {
        console.error("Gagal menginisialisasi halaman siaran", err);
      }
    }
    initPage();
  }, [streamId]);

  // WebRTC Hook for Viewer (Fallback)
  const { isConnected: isWebRTCConnected } = useWebRTC({
    streamId,
    role: 'viewer',
    onTrack: (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        // HANYA pasang srcObject jika belum terpasang untuk mencegah tabrakan pemuatan ganda (audio & video)!
        if (remoteVideoRef.current.srcObject !== stream) {
          console.log("[WebRTC] Successfully received remote stream track, binding to video ref...");
          remoteVideoRef.current.srcObject = stream;
          // Memicu play secara eksplisit jika tertahan kebijakan autoplay browser
          remoteVideoRef.current.play().catch(err => {
            console.warn("[WebRTC] Playback play() was blocked or interrupted:", err);
          });
        }
      }
    }
  });

  // HLS Fallback Timer: Tunggu 4 detik untuk melihat apakah WebRTC tersambung.
  // Jika dalam 4 detik WebRTC tidak terhubung dan tidak ada track, aktifkan HLS fallback.
  useEffect(() => {
    if (!streamInfo?.mux_playback_url) return;
    if (isWebRTCConnected || remoteStream) {
      // Jika WebRTC terhubung, matikan fallback HLS
      setUseHLSFallback(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!isWebRTCConnected && !remoteStream) {
        console.log("[Playback] WebRTC connection failed/slow after 4s. Switching to HLS fallback...");
        setUseHLSFallback(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [streamInfo, isWebRTCConnected, remoteStream]);

  // Setup HLS for Mux Player (Hanya jika fallback HLS aktif)
  useEffect(() => {
    if (!useHLSFallback) {
      // Jika fallback HLS mati, bersihkan instansi HLS jika sempat terbuat
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    if (streamInfo?.mux_playback_url && remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      const hlsUrl = streamInfo.mux_playback_url;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 0,
          maxBufferLength: 10,
          maxMaxBufferLength: 20,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 4,
          manifestLoadingMaxRetry: 5,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        return () => {
          video.src = "";
        };
      }
    }
  }, [streamInfo, useHLSFallback]);

  // Setup WebSocket untuk Live Chat Room & System Moderasi
  useEffect(() => {
    if (!streamId) return;

    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    const socket = new WebSocket(`${WS_URL}/ws/rooms/${streamId}?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const lines = event.data.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);
          
          // Handle Event-Event Khusus dari Server (Moderasi, Level Up, dll.)
          if (msg.type === "message_pinned") {
            setPinnedMessage(msg.payload?.content);
          } else if (msg.type === "chat_settings_updated") {
            setChatSettings({
              chat_mode: msg.payload?.chat_mode,
              slow_mode_seconds: msg.payload?.slow_mode_seconds,
              min_level_to_chat: msg.payload?.min_level_to_chat
            });
          } else if (
            (msg.type === "user_kicked" && currentUserRef.current?.id === msg.payload?.target_user_id) ||
            (msg.type === "force_disconnect" && currentUserRef.current?.id === msg.payload?.target_user_id)
          ) {
            alert(`Anda telah dikeluarkan dari siaran langsung ini. Alasan: ${msg.payload?.reason || "Pelanggaran aturan keselamatan atau tindakan moderator."}`);
            router.push("/dashboard/streams");
            return;
          } else if (msg.type === "error" && msg.payload?.code === "KICKED") {
            alert("Akses Ditolak: Anda telah di-kick dari ruangan ini.");
            router.push("/dashboard/streams");
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
    return () => {
      socket.close();
    };
  }, [streamId, router]);

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

  // Moderator & Host Actions (Mute, Kick, Pin, settings)
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

  const isHostOrModerator = currentUser?.id === streamInfo?.host?.id;

  const renderLevelBadge = (level: number) => {
    if (level < 10) {
      return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 uppercase">Lvl {level}</span>;
    } else if (level < 25) {
      return <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-1.5 shadow-[0_0_5px_rgba(6,182,212,0.4)]">Lvl {level}</span>;
    } else if (level < 50) {
      return <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-1.5 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.5)]">Lvl {level}</span>;
    } else {
      return <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded mr-1.5 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)] animate-bounce">👑 Lvl {level}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-black text-white min-h-screen">
      <CoinRain active={triggerCoinRain} />
      
      {/* KIRI: VIDEO PLAYER UTAMA & DETAIL HOST */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="relative bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden aspect-video shadow-2xl group">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            controls
            className="w-full h-full object-contain"
          />
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
              <span className="animate-pulse mr-2 h-2 w-2 bg-white rounded-full"></span>
              LIVE
            </div>
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center border border-white/10 shadow-md">
              <Users className="mr-2 h-3 w-3 text-cyan-400" /> {streamInfo?.viewers || 0}
            </div>
          </div>

          {!remoteStream && !streamInfo?.mux_playback_url && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-0">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-400 font-medium animate-pulse">Menghubungkan ke siaran langsung...</p>
            </div>
          )}

          {/* Player Controls Hover overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-pink-500 hover:bg-white/10 rounded-full scale-110">
                <Heart className="h-6 w-6 fill-current animate-bounce" />
              </Button>
              <GiftPanel 
                receiverId={streamInfo?.host?.id} 
                roomId={streamId} 
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full">
                <Share2 className="mr-2 h-4 w-4 text-indigo-400" /> Bagikan
              </Button>
            </div>
          </div>
        </div>

        {/* Info Detail Host */}
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-indigo-500/20 border-2 border-indigo-400">
                {(getHostDisplayName() || "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white leading-none">{getHostDisplayName()}</h2>
                  <span className="bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">HOST</span>
                </div>
                <p className="text-xs text-neutral-400">ID: {streamInfo?.host?.id?.slice(0, 8)} • Terverifikasi</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-6 font-bold shadow-md shadow-indigo-900/10">
              Ikuti Host
            </Button>
          </div>
          
          <div className="mt-5 border-t border-neutral-800/80 pt-4">
            <h1 className="text-lg font-bold text-white mb-2">{streamInfo?.title || "Mencari Siaran..."}</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {streamInfo?.description || "Selamat menikmati hiburan interaktif NVide Live!"}
            </p>
          </div>
        </div>
      </div>

      {/* KANAN: CHAT AREA & MODERASI */}
      <div className="w-full lg:w-96 flex flex-col gap-4 h-[600px] lg:h-auto z-10">
        <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-2xl relative">
          <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0 bg-neutral-900/80 backdrop-blur-md z-10">
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
              Live Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              {isHostOrModerator && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowModPanel(!showModPanel)} 
                  className={`h-8 w-8 rounded-full ${showModPanel ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
                  title="Moderator Dashboard"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <span className="text-[10px] text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono">
                {chatSettings.chat_mode.toUpperCase()}
              </span>
            </div>
          </CardHeader>

          {/* Moderator Control Overlay Panel */}
          {showModPanel && isHostOrModerator && (
            <div className="absolute top-[60px] inset-x-0 bg-neutral-950 border-b border-neutral-800 p-4 z-20 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Panel Kontrol Ruangan</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400">Mode Obrolan</label>
                  <select 
                    value={chatSettings.chat_mode}
                    onChange={(e) => updateChatSettings({ ...chatSettings, chat_mode: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 p-1.5 rounded text-white mt-1"
                  >
                    <option value="public">Publik (Bebas)</option>
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
                    <option value="0">Tanpa Batas</option>
                    <option value="5">5 Detik</option>
                    <option value="10">10 Detik</option>
                    <option value="30">30 Detik</option>
                  </select>
                </div>
              </div>

              {chatSettings.chat_mode === "level_gate" && (
                <div className="pt-1">
                  <label className="text-[10px] text-neutral-400 block mb-1">Level Minimal untuk Chat</label>
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
            {/* Pinned Message sticky banner */}
            {pinnedMessage && (
              <div className="bg-indigo-950/80 border-b border-indigo-800/40 p-3 flex items-start gap-2 backdrop-blur-md animate-in slide-in-from-top-1 z-10">
                <Pin className="h-4 w-4 text-indigo-400 rotate-45 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-indigo-300 block uppercase tracking-wider mb-0.5">Sematkan</span>
                  <p className="text-xs text-indigo-100 font-medium truncate">{pinnedMessage}</p>
                </div>
                {isHostOrModerator && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setPinnedMessage(null)} 
                    className="h-5 w-5 text-indigo-400 hover:text-white rounded-full shrink-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            )}

            {/* Chat Messages scroll area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 bg-neutral-900/10">
              {messages.length === 0 && (
                <div className="text-center text-xs text-neutral-500 py-10">
                  Belum ada pesan. Say hello!
                </div>
              )}

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
                      <p className="text-xs font-black text-amber-400 tracking-wider">
                        ✨ LEVEL UP ALERT ✨
                      </p>
                      <p className="text-[11px] text-yellow-100 font-medium mt-1">
                        Selamat! <span className="font-extrabold text-white">{msg.payload?.username}</span> naik ke <span className="text-amber-400 font-bold">Level {msg.payload?.new_level}</span>!
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
                          <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">
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
                              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8px] font-extrabold px-1 rounded uppercase tracking-wider shadow-[0_0_5px_rgba(244,63,94,0.3)]">VIP</span>
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

            {/* User Moderation Popover Modal */}
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
            
            {/* Input Bar */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <form className="flex gap-2 animate-in slide-in-from-bottom-2 duration-300" onSubmit={handleSendMessage}>
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    chatSettings.chat_mode === "level_gate" 
                      ? `Chat dikunci (Min Level ${chatSettings.min_level_to_chat})...` 
                      : "Kirim pesan hangat ke host..."
                  }
                  className="bg-neutral-900 border-neutral-800 text-sm h-11 focus-visible:ring-indigo-500 rounded-xl placeholder-neutral-500"
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
