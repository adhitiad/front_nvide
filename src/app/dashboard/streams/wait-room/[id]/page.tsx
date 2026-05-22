"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  Clock,
  Send,
  Gift,
  Flame,
  ChevronLeft,
  Loader2,
  Sparkles,
  Zap,
  Heart,
  Crown,
  Award,
  Terminal,
  Play,
  Volume2,
  Lock,
} from "lucide-react";

/**
 * 🛠️ CONFIGURASI BOILERPLATE: KATALOG GIFT INTERAKTIF
 * Developer bisa menambahkan/mengedit jenis gift, harga coin, warna ikon, dan class animasi di sini.
 */
interface GiftItem {
  code: string;
  name: string;
  icon: React.ComponentType<any>;
  cost: number;
  color: string;
  effectClass?: string; // class CSS untuk efek partikel
}

const PLEDGE_GIFTS: GiftItem[] = [
  {
    code: "love_candy",
    name: "Love Candy",
    icon: Heart,
    cost: 10,
    color: "text-pink-400 animate-pulse",
    effectClass: "animate-bounce",
  },
  {
    code: "stream_star",
    name: "Stream Star",
    icon: Sparkles,
    cost: 50,
    color: "text-amber-400",
    effectClass: "animate-spin",
  },
  {
    code: "super_rocket",
    name: "Super Rocket",
    icon: Zap,
    cost: 200,
    color: "text-indigo-400",
    effectClass: "animate-pulse",
  },
  {
    code: "golden_crown",
    name: "Golden Crown",
    icon: Crown,
    cost: 500,
    color: "text-yellow-400",
    effectClass: "animate-bounce",
  },
];

export default function WaitRoomPage() {
  const params = useParams();
  const router = useRouter();
  const occurrenceId = params.id as string;

  // --- CORE STATES ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [occurrence, setOccurrence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // --- LIVE SYNC STATES ---
  const [viewerCount, setViewerCount] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(600); // 10 menit default
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState("");

  // --- ACTION STATES ---
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [pledging, setPledging] = useState(false);
  const [selectedGift, setSelectedGift] = useState("love_candy");
  const [giftQty, setGiftQty] = useState(1);

  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Inisialisasi Profil & Data Awal
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // Jalur Produksi: Tarik profil riil & data jadwal dari backend
        const user = (await api.get("/auth/me").catch(() => null)) as any;
        if (user) {
          setCurrentUser(user);
        } else {
          // Fallback tamu jika sesi kosong
          setCurrentUser({
            id: "guest-" + Math.random().toString(36).substring(5),
            username: "Gamu-Guest",
            user_level: 1,
          });
        }

        const list = (await api
          .get("/discover/upcoming")
          .catch(() => [])) as any[];
        const matched = list.find((item) => item.id === occurrenceId);

        if (matched) {
          setOccurrence(matched);
        } else {
          // Fallback data standard jika ID tidak tercantum di discover feed
          setOccurrence({
            id: occurrenceId,
            schedule_title: "Pre-Show Waiting Room",
            schedule_description:
              "Bersiaga untuk live stream interaktif dari host favorit Anda.",
            host_username: "Broadcaster",
            occurrence_start_at: new Date(Date.now() + 300000).toISOString(),
          });
        }
      } catch (err) {
        console.error("Gagal inisialisasi waitroom", err);
        toast.error("Gagal tersambung ke database.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [occurrenceId]);

  // 2. Koneksi WebSocket Real-time (Hanya jika mode mock tidak aktif)
  useEffect(() => {
    if (!currentUser || !occurrenceId) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let apiHost = "localhost:8080";
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        apiHost = new URL(process.env.NEXT_PUBLIC_API_URL).host;
      } else if (typeof window !== "undefined") {
        apiHost = window.location.host;
      }
    } catch (e) {}

    const wsUrl = `${wsProtocol}//${apiHost}/ws/wait-room/${occurrenceId}?user_id=${currentUser.id}`;

    console.log("Koneksi WS WaitRoom:", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      toast.success("Tersambung ke Media Server Real-Time!");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWSMessage(msg);
      } catch (err) {
        console.error("Gagal parsing WS message", err);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      // Auto-reconnect boilerplate
      setTimeout(() => {
        console.log("Mencoba menyambungkan kembali WebSocket...");
      }, 5000);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    return () => {
      if (ws) ws.close();
    };
  }, [currentUser, occurrenceId]);

  // Scroll Chat Otomatis saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Slow Mode rate limiter ticker
  useEffect(() => {
    if (rateLimitTimer <= 0) return;
    const interval = setInterval(() => {
      setRateLimitTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  /**
   * ⚡ STALKER EVENT REGISTRY: PENANGANAN PESAN WEBSOCKET (BOILERPLATE)
   * Developer cukup menambahkan case baru di sini untuk mendukung fitur wait room interaktif lainnya.
   */
  const handleWSMessage = (msg: any) => {
    switch (msg.type) {
      case "system":
        // Kejadian sistem (bergabung, keluar, mute massal)
        if (msg.payload?.message) {
          pushSystemMessage(msg.payload.message);
        }
        if (msg.payload?.count !== undefined) {
          setViewerCount(msg.payload.count);
        }
        break;

      case "chat":
        // Pesan obrolan antar penonton
        pushChatMessage(
          msg.id || Math.random().toString(),
          msg.username || "Anonymous",
          msg.user_level || 1,
          msg.payload?.message || msg.payload,
        );
        break;

      case "countdown":
        // Hitung mundur sinkron server
        if (msg.payload?.seconds_remaining !== undefined) {
          setSecondsRemaining(msg.payload.seconds_remaining);
        }
        break;

      case "live_started":
        // Host memulai siaran -> auto teleport
        toast.success(
          "🔴 HOST TELAH ONLINE! Mengarahkan Anda ke Live Stream...",
          { duration: 5000 },
        );
        setTimeout(() => {
          if (msg.payload?.redirect_url) {
            router.push(msg.payload.redirect_url);
          } else if (msg.payload?.stream_id) {
            router.push(`/dashboard/streams/${msg.payload.stream_id}/watch`);
          }
        }, 1500);
        break;

      case "host_missed":
        // Host telat memulai siaran lebih dari 10 menit
        toast.error("Host tidak dapat memulai siaran sesuai jadwal.");
        pushSystemMessage(
          "⚠️ Host melewatkan jadwal siaran. Ruang tunggu akan ditutup sebentar lagi.",
        );
        break;

      default:
        console.log("Event WS tidak dikenal:", msg.type, msg);
    }
  };

  // Helper pengisi pesan
  const pushChatMessage = (
    id: string,
    username: string,
    level: number,
    text: string,
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id,
        type: "chat",
        username,
        userLevel: level,
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const pushSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: "system",
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Kirim Obrolan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || rateLimitTimer > 0) return;

    if (!wsConnected) {
      toast.error("Koneksi server terputus. Silakan coba lagi.");
      return;
    }

    const payload = {
      type: "chat",
      payload: { message: typedMessage },
    };

    socketRef.current?.send(JSON.stringify(payload));
    setTypedMessage("");
    setRateLimitTimer(5); // Aktifkan Slow Mode 5 Detik
  };

  // Kirim Pledge Gift
  const handleSendPledge = async () => {
    if (pledging) return;
    setPledging(true);

    try {
      // Jalur Produksi API
      await api.post(`/wait-rooms/${occurrenceId}/pledge`, {
        gift_code: selectedGift,
        quantity: giftQty,
      });

      toast.success(
        `Berhasil berkomitmen mengirim ${giftQty}x ${selectedGift.replace("_", " ")} saat live dimulai!`,
      );
      pushSystemMessage(
        `🎁 Anda berkomitmen mengirim ${giftQty}x ${selectedGift.replace("_", " ")}!`,
      );
    } catch (err: any) {
      toast.error(
        "Gagal melakukan pledge: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setPledging(false);
    }
  };

  // Format Jam Hitung Mundur
  const formatCountdown = (totalSecs: number | null) => {
    if (totalSecs === null) return "--:--:--";
    if (totalSecs <= 0) return "Memulai siaran...";

    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  };

  // Pewarnaan Lencana Level Pengguna (Boilerplate)
  const getUserLevelBadge = (level: number) => {
    if (level >= 40)
      return {
        label: "ROYAL",
        bg: "bg-gradient-to-r from-red-600 to-amber-600 border-yellow-500 text-yellow-200",
      };
    if (level >= 25)
      return {
        label: "PLATINUM",
        bg: "bg-indigo-600/30 border-indigo-500 text-indigo-400",
      };
    if (level >= 10)
      return {
        label: "GOLD",
        bg: "bg-amber-600/30 border-amber-500 text-amber-400",
      };
    return {
      label: "BRONZE",
      bg: "bg-neutral-800 border-neutral-700 text-neutral-400",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-light text-neutral-400 animate-pulse">
          Menghubungkan ke Ruang Tunggu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-6 font-sans select-none relative overflow-x-hidden">
      {/* CORE WAITROOM CONTENT */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Button
          onClick={() => router.push("/dashboard/streams")}
          variant="ghost"
          className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke Discovery
        </Button>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
          ></span>
          <span className="text-xs text-neutral-400 font-mono">
            {wsConnected ? "REALTIME SYNCED" : "RECONNECTING"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: TITLE CARD & TICKER */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-neutral-800/85 text-white relative overflow-hidden shadow-2xl rounded-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-indigo-950/60 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-indigo-400 font-mono font-bold uppercase tracking-wider">
                  Live Wait Room
                </span>
                <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  {viewerCount} penonton
                </span>
              </div>
              <CardTitle className="text-xl font-extrabold mt-3 text-white tracking-tight">
                {occurrence?.schedule_title}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400 mt-1">
                Host: @{occurrence?.host_username}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                {occurrence?.schedule_description ||
                  "Ini adalah ruang tunggu. Chat dengan penonton lain dan berikan komitmen gift Anda sebelum streaming dimulai!"}
              </p>

              {/* TIMING COUNTDOWN WIDGET */}
              <div className="bg-black/40 border border-neutral-800/80 rounded-2xl p-5 text-center space-y-2.5 shadow-inner">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500 animate-spin" /> LIVE
                  DIMULAI DALAM
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  {formatCountdown(secondsRemaining)}
                </div>
                <div className="text-[10px] text-neutral-500 font-light">
                  Mulai:{" "}
                  {new Date(
                    occurrence?.occurrence_start_at,
                  ).toLocaleTimeString()}{" "}
                  WIB
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PRE-STREAM PLEDGE GIFT PANEL */}
          <Card className="bg-neutral-950 border border-neutral-900 text-white shadow-2xl relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Gift className="text-pink-400 h-5 w-5 animate-pulse" />
                Pre-Stream Gift Pledge
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Lakukan komitmen pledge gift. Gift secara otomatis dikirim saat
                host go-live dari dompet NVide Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gift Grid Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                {PLEDGE_GIFTS.map((g) => {
                  const Icon = g.icon;
                  const isSelected = selectedGift === g.code;
                  return (
                    <button
                      key={g.code}
                      onClick={() => setSelectedGift(g.code)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? "bg-pink-950/20 border-pink-500/50 shadow-md shadow-pink-950/40"
                          : "bg-neutral-900/30 border-neutral-850 hover:bg-neutral-900/60"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${g.color} ${isSelected ? g.effectClass : ""} transition-transform`}
                      />
                      <div className="mt-3">
                        <div className="text-xs font-bold text-white">
                          {g.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {g.cost} Coins
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity selectors */}
              <div className="flex justify-between items-center gap-4 border-t border-neutral-900 pt-3">
                <span className="text-xs text-neutral-400">Jumlah Gift:</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setGiftQty((prev) => Math.max(1, prev - 1))}
                    className="h-8 w-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center border border-neutral-800"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold w-6 text-center">
                    {giftQty}
                  </span>
                  <button
                    onClick={() => setGiftQty((prev) => prev + 1)}
                    className="h-8 w-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center border border-neutral-800"
                  >
                    +
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                onClick={handleSendPledge}
                disabled={pledging}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-pink-950/40"
              >
                {pledging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim
                    Komitmen...
                  </>
                ) : (
                  <>
                    <Flame className="mr-2 h-4 w-4 text-rose-300 animate-pulse" />{" "}
                    Kirim Komitmen Gift
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: REALTIME CHAT GLASSMORPHISM */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border border-neutral-900 text-white flex flex-col h-[550px] shadow-2xl relative rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <CardHeader className="p-4 border-b border-neutral-900 flex flex-row justify-between items-center bg-black/20">
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Pre-Show Chat Room
                </CardTitle>
                <CardDescription className="text-[11px] text-neutral-400">
                  Jeda lambat (Slow mode) aktif: 5 detik antar pesan.
                </CardDescription>
              </div>
              <div className="text-[10px] bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 font-bold tracking-wider">
                SLOW MODE ACTIVE
              </div>
            </CardHeader>

            {/* Chat output */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 Scrollbar-thinScroll">
              {messages.map((m) => {
                if (m.type === "system") {
                  return (
                    <div
                      key={m.id}
                      className="text-center py-1.5 px-3 bg-neutral-900/30 border border-neutral-900/60 rounded-xl text-[10px] text-neutral-500 font-light max-w-sm mx-auto"
                    >
                      {m.text}
                    </div>
                  );
                }

                const badge = getUserLevelBadge(m.userLevel || 1);

                return (
                  <div key={m.id} className="flex items-start gap-2.5 max-w-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[8px] border px-1.5 py-0.2 rounded font-mono font-bold ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-indigo-300 font-sans">
                          @{m.username}
                        </span>
                        <span className="text-[9px] text-neutral-600 font-light">
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="bg-neutral-900/60 border border-neutral-850/80 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs text-neutral-200 font-light leading-relaxed break-all">
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </CardContent>

            {/* Chat inputs */}
            <CardFooter className="p-4 border-t border-neutral-900 bg-black/40">
              <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                <Input
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder={
                    rateLimitTimer > 0
                      ? `Tunggu ${rateLimitTimer}s (Slow Mode)`
                      : "Kirim pesan ke Ruang Tunggu..."
                  }
                  disabled={rateLimitTimer > 0}
                  className="bg-neutral-900/80 border-neutral-800 text-white rounded-xl focus-visible:ring-indigo-500 h-11"
                  required
                />
                <Button
                  type="submit"
                  disabled={!typedMessage.trim() || rateLimitTimer > 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 w-11 rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-950"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
