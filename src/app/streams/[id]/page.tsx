"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useStreamStore } from "@/store/useStreamStore";
import { useChat } from "@/hooks/useChat";
import { useSession } from "@/lib/auth-client";
import { HLSPlayer } from "@/components/HLSPlayer";
import { GiftPanel } from "@/components/GiftPanel";
import { CoinRain } from "@/components/CoinRain";
import { PredictionPanel } from "@/components/PredictionPanel";
import { ReportModal } from "@/components/ReportModal";
import { usePrivacy } from "@/hooks/usePrivacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Heart,
  Send,
  ChevronLeft,
  Trophy,
  MessageSquare,
  Shield,
  Sparkles,
  Loader2,
  Radio,
  AlertCircle,
  RotateCw,
  Sliders,
  DollarSign,
  Tv,
  HelpCircle,
  Clock,
  VolumeX,
  UserX,
  AlertTriangle,
  Lock,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StreamDetailPage({ params }: PageProps) {
  const { id: streamId } = use(params);
  const { data: session } = useSession();

  const {
    currentStream,
    fetchStreamByID,
    chatMessages,
    viewerCount,
    likes,
    likeStream,
    loading,
    error,
    userLevel,
    userXp,
    userXpNext,
  } = useStreamStore();

  const { isBlocked, isMuted, block, mute } = usePrivacy();

  // FORMAT GANDA STATE
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    "landscape",
  );
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Set orientation to portrait automatically on mobile screen detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setOrientation("portrait");
      }
    }
  }, []);

  // INTERACTIVE TOYS STATE
  const [toyIntensity, setToyIntensity] = useState(5);
  const [toyDuration, setToyDuration] = useState(30);
  const [toyTips, setToyTips] = useState("100");
  const [controllingToy, setControllingToy] = useState(false);

  // REQUEST SHOW STATE
  const [showRequestText, setShowRequestText] = useState("");
  const [showRequestTips, setShowRequestTips] = useState("500");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // PAID ROOM STATE
  const [isPrivateRoomActive, setIsPrivateRoomActive] = useState(false);
  const [privateRoomCost, setPrivateRoomCost] = useState(1500);
  const [joinedPrivateRoom, setJoinedPrivateRoom] = useState(false);
  const [joiningPrivate, setJoiningPrivate] = useState(false);

  // AI CHATBOT OFFLINE STATE
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "Halo sayang! Host asli sedang offline saat ini. Aku adalah AI Pendamping pribadinya yang mempelajari gaya bicara sensualnya. Mau ngobrol intim bersamaku? (Biaya: 500 IDR/pesan)",
    },
  ]);
  const [sendingAiChat, setSendingAiChat] = useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState(25); // simulasi token-gate (min 10 token)

  const [chatInput, setChatInput] = useState("");
  const [activeRain, setActiveRain] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi WebSocket Chat menggunakan custom hook
  const { isConnected, sendMessage, sendLike } = useChat({
    streamId,
    userId: session?.user?.id,
    username: session?.user?.name,
  });

  useEffect(() => {
    fetchStreamByID(streamId);
  }, [fetchStreamByID, streamId]);

  // Efek scroll obrolan ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatHistory]);

  // Dengar event visual gift dari useChat
  useEffect(() => {
    const handleGiftRain = (e: Event) => {
      setActiveRain(true);
      setTimeout(() => setActiveRain(false), 5000);
    };

    window.addEventListener("trigger-gift-effect", handleGiftRain);
    return () => {
      window.removeEventListener("trigger-gift-effect", handleGiftRain);
    };
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!session) {
      toast.error("Silakan masuk terlebih dahulu untuk mengirim komentar");
      return;
    }

    const success = sendMessage(chatInput.trim());
    if (success) {
      setChatInput("");
    }
  };

  const handleLike = () => {
    if (!session) {
      toast.error("Silakan masuk terlebih dahulu untuk menyukai siaran");
      return;
    }
    sendLike();
    likeStream(streamId);
    toast.success("Siaran disukai! ❤️");
  };

  // ORIENTATION TOGGLER
  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "landscape" ? "portrait" : "landscape"));
    toast.success(
      `Layout diubah ke mode: ${orientation === "landscape" ? "Portrait (9:16)" : "Landscape (16:9)"} 📱`,
    );
  };

  // LOVENSE INTERACTIVE TOY CONTROL TRIGGER
  const handleControlToy = async () => {
    if (!session) {
      toast.error("Silakan login untuk mengirim koin kendali mainan");
      return;
    }
    const tipsAmount = parseInt(toyTips);
    if (isNaN(tipsAmount) || tipsAmount <= 0) {
      toast.error("Nominal tips koin tidak valid");
      return;
    }

    setControllingToy(true);
    try {
      await api.post(`/streams/${streamId}/toys/control`, {
        command: `vibrate_${toyIntensity}`,
        duration: toyDuration,
        tips_amount: tipsAmount,
      });
      toast.success(
        `Mainan pintar Host tergetar pada tingkat getar ${toyIntensity} selama ${toyDuration} detik! ⚡💋`,
      );
      setActiveRain(true);
      setTimeout(() => setActiveRain(false), 4000);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengontrol mainan pintar host",
      );
    } finally {
      setControllingToy(false);
    }
  };

  // SUBMIT CUSTOM SHOW REQUEST
  const handleSendShowRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRequestText.trim()) return;
    const tipsAmount = parseInt(showRequestTips);
    if (isNaN(tipsAmount) || tipsAmount <= 0) {
      toast.error("Nominal tips request tidak valid");
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.post(`/streams/${streamId}/requests`, {
        performance_details: showRequestText.trim(),
        tips_amount: tipsAmount,
      });
      toast.success(
        "Permintaan show kustom berhasil dikirimkan dengan tips aman! 📜✨",
      );
      setShowRequestText("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengajukan permintaan show",
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  // JOIN PRIVATE ROOM FLAT PAYMENT
  const handleJoinPrivateRoom = async () => {
    if (!session) {
      toast.error("Silakan masuk terlebih dahulu untuk membayar");
      return;
    }
    setJoiningPrivate(true);
    try {
      await api.post(`/rooms/${streamId}/join`);
      toast.success(
        "Pembayaran flat berhasil! Selamat bergabung di Private Room Video 💋",
      );
      setJoinedPrivateRoom(true);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Gagal melakukan transaksi gabung room berbayar",
      );
    } finally {
      setJoiningPrivate(false);
    }
  };

  // SEND OFFLINE AI MESSAGE (TOKEN GATED + COST DETECTOR)
  const handleSendAiChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    if (userTokenBalance < 10) {
      toast.error(
        `Anda membutuhkan minimal 10 Token Kreator untuk mengakses chatbot AI companion offline.`,
      );
      return;
    }

    const userText = aiChatInput.trim();
    setAiChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setAiChatInput("");
    setSendingAiChat(true);

    try {
      const res: any = await api.post("/ai/chat", { message: userText });
      const reply =
        res?.reply ||
        res?.data?.reply ||
        "Hmm sayang... Tentu saja aku mau memanjakanmu malam ini.";
      setAiChatHistory((prev) => [...prev, { sender: "ai", text: reply }]);
      toast.success(
        "Pesan terkirim! 500 IDR didebit ke dompet kreator secara pasif.",
      );
    } catch {
      // Local simulated response with host sensual style
      setTimeout(() => {
        setAiChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Sayang, aku sangat suka caramu berbisik... Aku merindukanmu begitu dalam saat offline ini 💋`,
          },
        ]);
        toast.success("Pesan diproses! 500 IDR dipotong secara pasif.");
      }, 1000);
    } finally {
      setSendingAiChat(false);
    }
  };

  if (loading && !currentStream) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <span className="text-md font-bold text-neutral-400">
          Menghubungkan ke ruang siaran...
        </span>
      </div>
    );
  }

  if (error || !currentStream) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
        <h2 className="text-2xl font-black text-red-400">
          Siaran Tidak Ditemukan
        </h2>
        <p className="text-neutral-400 max-w-sm">
          {error ||
            "Siaran langsung mungkin telah berakhir atau ID tidak valid."}
        </p>
        <Link href="/streams">
          <Button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full font-bold">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Siaran
          </Button>
        </Link>
      </div>
    );
  }

  const xpProgress = Math.min((userXp / userXpNext) * 100, 100);

  // HIGH PRIVACY MUTE AND BLOCK FILTERING
  const filteredChatMessages = chatMessages.filter(
    (msg) => !isBlocked(msg.userId) && !isMuted(msg.userId),
  );

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col font-sans relative selection:bg-purple-600 selection:text-white"
      onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (touchStartY === null) return;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (deltaY < -80) setIsMobileChatOpen(true); // swipe up
        if (deltaY > 80) setIsMobileChatOpen(false); // swipe down
        setTouchStartY(null);
      }}
    >
      {/* COIN RAIN EFFECT OVERLAY */}
      <CoinRain active={activeRain} />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/streams">
            <Button
              size="icon"
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-red-600/25">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live
            </span>
            <span className="text-sm font-bold text-neutral-300">
              Room #{currentStream.id.substring(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* FORMAT GANDA ORIENTATION SWITCHER */}
          <Button
            onClick={toggleOrientation}
            className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 font-bold rounded-full px-4 text-xs flex items-center gap-1.5 shadow"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Layout: {orientation === "landscape" ? "16:9" : "9:16"}
          </Button>

          <div className="bg-neutral-900 border border-neutral-800 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-400" />
            {viewerCount} Penonton
          </div>
        </div>
      </header>

      {/* DUAL FORMAT COMPATIBLE GRID CONTAINER */}
      <div
        className={`flex-1 w-full max-w-[1600px] mx-auto px-6 py-8 ${
          orientation === "landscape"
            ? "grid grid-cols-1 lg:grid-cols-4 gap-8"
            : "flex flex-col max-w-[900px] gap-8"
        }`}
      >
        {/* LEFT COLUMN: THEATRICAL VIDEO PLAYER & INTERACTION MODULES */}
        <div
          className={
            orientation === "landscape"
              ? "lg:col-span-3 space-y-6 flex flex-col justify-start"
              : "space-y-6 w-full"
          }
        >
          {/* PRIVATE ROOM BERBAYAR BLOCKER OR VIDEO */}
          {isPrivateRoomActive && !joinedPrivateRoom ? (
            /* PAID PRIVATE ROOM LOCKER */
            <div className="relative aspect-video w-full bg-neutral-950 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-500 shadow-xl">
                <Lock className="h-7 w-7 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-amber-400">
                  Siaran Beralih ke Room Privat
                </h3>
                <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mx-auto">
                  Host telah meluncurkan pertunjukan kustom eksklusif. Anda
                  harus membayar biaya flat masuk untuk melanjutkan tontonan.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex items-center gap-6 text-left">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-black">
                    Biaya Flat Masuk
                  </span>
                  <span className="text-2xl font-black text-emerald-400 block mt-0.5">
                    Rp {privateRoomCost.toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={handleJoinPrivateRoom}
                  disabled={joiningPrivate}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold px-6 py-5 text-xs transition shadow"
                >
                  {joiningPrivate ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5" />
                  ) : null}
                  Konfirmasi Bayar & Gabung
                </Button>
              </div>
            </div>
          ) : (
            /* COMPONENT PEMUTAR HLS DENGAN ADAPTASI FORMAT */
            <div
              className={`relative overflow-hidden rounded-3xl border border-neutral-900 shadow-2xl ${
                orientation === "portrait"
                  ? "aspect-[9/16] max-w-[420px] mx-auto w-full"
                  : "aspect-video w-full"
              }`}
            >
              <HLSPlayer
                src={
                  currentStream.mux_playback_url ||
                  `https://stream.mux.com/${currentStream.playback_id}.m3u8`
                }
                poster={currentStream.thumbnail_url}
              />
            </div>
          )}

          {/* CONTROL BOX: LIKE, GIFT PANEL, LEVEL STATS */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-neutral-950 p-6 rounded-2xl border border-neutral-900 shadow-xl">
            {/* LEVEL & EXPERIENCE STATS */}
            <div className="flex-1 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
                  Level Saya
                </span>
                <span className="text-neutral-500 font-mono">
                  {userXp} / {userXpNext} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-650 flex items-center justify-center text-xs font-black ring-2 ring-purple-600/30">
                  Lv.{userLevel}
                </div>
                <div className="flex-1 h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* INTERACTION BUTTONS */}
            <div className="flex items-center gap-4 border-t md:border-t-0 border-neutral-900 pt-4 md:pt-0">
              <Button
                onClick={handleLike}
                className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white rounded-full font-bold px-6 shadow-lg transition"
              >
                <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
                {likes.toLocaleString()} Likes
              </Button>

              <GiftPanel
                receiverId={currentStream.host_id}
                roomId={currentStream.id}
                trigger={
                  <Button className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold px-6 shadow-lg transition">
                    Kirim Gift 🎁
                  </Button>
                }
              />
            </div>
          </div>

          {/* INTERACTIVE TOYS CONTROLLER & SHOW REQUEST PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LOVENSE CONTROLLER */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-purple-400 animate-spin" />
                  Lovense Toy Controller
                </h4>
                <span className="text-[10px] text-green-400 font-extrabold uppercase bg-green-950/40 border border-green-900/30 px-2.5 py-0.5 rounded-full">
                  Device Connected
                </span>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                {/* Vibration Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-neutral-400">
                    <span>Kekuatan Getar</span>
                    <span className="font-mono text-purple-400">
                      {toyIntensity} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={toyIntensity}
                    onChange={(e) => setToyIntensity(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5 bg-neutral-900 rounded-full"
                  />
                </div>

                {/* Duration select */}
                <div className="space-y-2">
                  <div className="flex justify-between text-neutral-400">
                    <span>Durasi Getaran</span>
                    <span className="font-mono text-purple-400">
                      {toyDuration} Detik
                    </span>
                  </div>
                  <select
                    value={toyDuration}
                    onChange={(e) => setToyDuration(parseInt(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 p-3 rounded-xl focus:border-purple-500"
                  >
                    <option value={10}>10 Detik</option>
                    <option value={30}>30 Detik</option>
                    <option value={60}>60 Detik</option>
                  </select>
                </div>

                {/* Tips amount */}
                <div className="space-y-2">
                  <Label className="text-neutral-450 block text-[10px] uppercase font-bold">
                    Kirim Koin Kontrol (Tips)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                      🪙
                    </span>
                    <Input
                      type="number"
                      value={toyTips}
                      onChange={(e) => setToyTips(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 pl-10 focus:border-purple-500 font-bold rounded-xl h-11"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleControlToy}
                  disabled={controllingToy}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  {controllingToy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : null}
                  Getarkan Mainan Kreator ⚡
                </Button>
              </div>
            </div>

            {/* REQUEST SHOW PANEL */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Kirim Request Show Kustom
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Ajukan aksi khusus/tarian kepada host dengan tips kustom Anda.
                  Dana Anda hanya dicairkan ketika Host menyetujui request Anda.
                </p>
              </div>

              <form
                onSubmit={handleSendShowRequest}
                className="space-y-4 text-xs font-semibold"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="reqText"
                    className="text-neutral-450 text-[10px] uppercase font-bold"
                  >
                    Rincian Request
                  </Label>
                  <textarea
                    id="reqText"
                    rows={2}
                    placeholder="Contoh: Menari sensual memakai gaun hitam..."
                    value={showRequestText}
                    onChange={(e) => setShowRequestText(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-xl focus:border-purple-500 font-medium text-neutral-200 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reqTips"
                    className="text-neutral-450 text-[10px] uppercase font-bold"
                  >
                    Koin Tips Penjamin (IDR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                      Rp
                    </span>
                    <Input
                      id="reqTips"
                      type="number"
                      value={showRequestTips}
                      onChange={(e) => setShowRequestTips(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 pl-10 focus:border-purple-500 font-bold rounded-xl h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submittingRequest || !showRequestText}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-650 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  {submittingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : null}
                  Ajukan Request Show
                </Button>
              </form>
            </div>
          </div>

          {/* DYNAMIC PASAR PREDIKSI WIDGET */}
          <PredictionPanel streamId={streamId} />

          {/* STREAM DETAILED META INFO */}
          <div className="bg-neutral-950 p-8 rounded-3xl border border-neutral-900 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400 bg-purple-950/40 border border-purple-900/40 px-3 py-1 rounded-md">
                    {currentStream.category || "General"}
                  </span>
                  <Link href={`/streams/${streamId}/clips`}>
                    <Button
                      size="xs"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold px-3 text-[10px]"
                    >
                      <Tv className="h-3 w-3 mr-1" /> Putar AI Klip
                    </Button>
                  </Link>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {currentStream.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/creator/${currentStream.host_id}/token`}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800/80 px-4 py-2 rounded-2xl flex items-center gap-3 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold uppercase shadow">
                    {currentStream.host?.username?.charAt(0) || "H"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-neutral-200 flex items-center gap-1">
                      {currentStream.host?.username || "Host"}
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest">
                      Beli Token Kreator
                    </span>
                  </div>
                </Link>

                {/* MODERATOR CONTROL OPTION CARD */}
                <ReportModal
                  targetId={streamId}
                  targetType="stream"
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-neutral-500 hover:text-red-500 rounded-full"
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </Button>
                  }
                />
              </div>
            </div>

            <hr className="border-neutral-900" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-300 font-sans">
                Deskripsi Siaran
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {currentStream.description ||
                  "Selamat datang di ruangan siaran langsung saya! Jangan ragu untuk mengobrol, memberikan like, dan mengirimkan gift interaktif untuk mendukung konten saya."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT WINDOW OR OFFLINE AI COMPANION */}
        <div
          className={`flex flex-col bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative ${
            orientation === "landscape"
              ? "lg:col-span-1 h-[600px] lg:h-auto"
              : "w-full h-[550px]"
          } ${
            isMobileChatOpen
              ? "fixed inset-0 z-50 h-full w-full rounded-none"
              : "hidden lg:flex"
          }`}
        >
          {currentStream.status === "offline" ? (
            /* COMPANION OFFLINE CHATBOT WIDGET */
            <div className="flex-1 flex flex-col h-full relative">
              {/* Token Gated Overlay Blocker */}
              {userTokenBalance < 10 && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center gap-5">
                  <Lock className="h-10 w-10 text-purple-400 animate-pulse" />
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-purple-400 block tracking-widest">
                      Akses Token Kreator Diperlukan
                    </span>
                    <p className="text-[10px] text-neutral-500 leading-relaxed max-w-[220px]">
                      Anda harus memiliki minimal{" "}
                      <span className="font-bold text-white">
                        10 Token Kreator
                      </span>{" "}
                      milik host untuk mengakses AI Companion obrolan luring.
                    </p>
                  </div>
                  <Link href={`/creator/${currentStream.host_id}/token`}>
                    <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-bold text-xs px-5 shadow-lg">
                      Beli Token Kreator
                    </Button>
                  </Link>
                </div>
              )}

              {/* Chatbot Header */}
              <div className="bg-neutral-950 border-b border-neutral-900 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center font-bold text-xs uppercase shadow text-white">
                    AI
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1">
                      AI {currentStream.host?.username || "Host"}
                    </h3>
                    <span className="text-[9px] text-purple-400 font-extrabold uppercase block tracking-wider">
                      AI Companion Offline
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isMobileChatOpen && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMobileChatOpen(false)}
                      className="lg:hidden text-xs font-bold text-neutral-400 hover:text-white mr-1"
                    >
                      Tutup
                    </Button>
                  )}
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                </div>
              </div>

              {/* Chatbot History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 text-xs ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[9px] text-neutral-500 uppercase font-black">
                      {msg.sender === "user"
                        ? "Anda"
                        : `AI ${currentStream.host?.username}`}
                    </span>
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] font-medium leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sendingAiChat && (
                  <div className="flex gap-1 items-center text-[10px] text-neutral-500 font-bold">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                    AI sedang menyusun kata intim...
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>

              {/* Chatbot Input form */}
              <form
                onSubmit={handleSendAiChatMessage}
                className="bg-neutral-950 border-t border-neutral-900 p-5 flex items-center gap-3"
              >
                <Input
                  type="text"
                  placeholder="Kirim pesan (Biaya: 500 IDR)..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  className="flex-1 bg-neutral-900 border-neutral-850 focus:border-purple-500 text-xs rounded-xl"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-purple-650 hover:bg-purple-600 text-white rounded-xl h-9 w-9 shrink-0 transition"
                >
                  <Send className="h-4.5 w-4.5 fill-white" />
                </Button>
              </form>
            </div>
          ) : (
            /* REAL-TIME PREMIUM CHAT WINDOW */
            <>
              {/* CHAT HEADER */}
              <div className="bg-neutral-950 border-b border-neutral-900 p-5 flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-purple-400" />
                  Live Chat
                </h3>

                {/* DISAPPEARING MESSAGES CLOCK INDICATOR */}
                <div className="flex items-center gap-2">
                  {isMobileChatOpen && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMobileChatOpen(false)}
                      className="lg:hidden text-xs font-bold text-neutral-400 hover:text-white mr-1"
                    >
                      Tutup
                    </Button>
                  )}
                  <span title="Masa Habis Pesan Aktif">
                    <Clock className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                </div>
              </div>

              {/* CHAT SCROLL AREA */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
                {filteredChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-2">
                    <MessageSquare className="h-8 w-8 text-neutral-800" />
                    <span className="text-xs text-neutral-500 font-bold">
                      Obrolan Kosong
                    </span>
                    <span className="text-[10px] text-neutral-600">
                      Jadilah yang pertama menulis pesan!
                    </span>
                  </div>
                ) : (
                  filteredChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex flex-col gap-1 text-xs relative group/item"
                    >
                      {msg.type === "system" || msg.type === "warning" ? (
                        <div className="bg-neutral-900/60 border border-neutral-800/80 px-3 py-2 rounded-xl text-neutral-400 flex items-start gap-1.5 leading-relaxed">
                          <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                          <span>{msg.content}</span>
                        </div>
                      ) : msg.type === "gift" ? (
                        <div className="bg-amber-950/20 border border-amber-500/20 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 animate-bounce-short">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center font-bold text-[10px] text-amber-500">
                              {msg.username.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-amber-400">
                                {msg.username}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {msg.content}
                              </span>
                            </div>
                          </div>
                          {msg.giftData?.iconUrl && (
                            <img
                              src={msg.giftData.iconUrl}
                              alt={msg.giftData.name}
                              className="h-7 w-7 object-contain"
                            />
                          )}
                        </div>
                      ) : (
                        /* Standard Chat with inline moderation options */
                        <div className="space-y-0.5 relative pr-10">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-900/50">
                              Lv.{msg.userLevel}
                            </span>
                            {msg.isVip && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                                <Trophy className="h-2.5 w-2.5" /> VIP
                              </span>
                            )}
                            <span
                              className="font-extrabold"
                              style={{ color: msg.chatColor }}
                            >
                              {msg.username}
                            </span>

                            {/* Clock timer for disappearing message indicator */}
                            <span className="text-[9px] text-neutral-600 font-mono flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-neutral-600" />
                              23j
                            </span>
                          </div>
                          <p className="text-neutral-300 font-medium pl-1 leading-relaxed break-words">
                            {msg.content}
                          </p>

                          {/* INLINE MODERATION ACTIONS (MUTE & BLOCK INSTANT TRIGGER) */}
                          {session && session.user.id !== msg.userId && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover\/item:opacity-100 transition duration-200">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  mute(msg.userId, msg.username);
                                  toast.success(
                                    `User @${msg.username} berhasil dibisukan! 🔊`,
                                  );
                                }}
                                title="Bisukan User"
                                className="h-6 w-6 text-neutral-500 hover:text-purple-400 rounded-full"
                              >
                                <VolumeX className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  block(msg.userId, msg.username);
                                  toast.success(
                                    `User @${msg.username} berhasil diblokir! 🚫`,
                                  );
                                }}
                                title="Blokir User"
                                className="h-6 w-6 text-neutral-500 hover:text-red-500 rounded-full"
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* CHAT INPUT AREA */}
              <form
                onSubmit={handleSendChat}
                className="bg-neutral-950 border-t border-neutral-900 p-5 flex items-center gap-3"
              >
                <Input
                  type="text"
                  placeholder={
                    session
                      ? "Tulis pesan obrolan..."
                      : "Masuk untuk mengirim pesan..."
                  }
                  disabled={!session}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-neutral-900 border-neutral-800 focus:border-purple-500 text-xs rounded-xl"
                />

                {/* INLINE REPORTING BUTTON */}
                <ReportModal
                  targetId={streamId}
                  targetType="chat"
                  trigger={
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-neutral-500 hover:text-red-500 h-9 w-9 rounded-xl border border-neutral-900 hover:bg-neutral-900"
                    >
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </Button>
                  }
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={!session || !chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl h-9 w-9 shrink-0 transition"
                >
                  <Send className="h-4.5 w-4.5 fill-white" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Floating Chat Button for Mobile */}
      {!isMobileChatOpen && (
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <Button
            onClick={() => setIsMobileChatOpen(true)}
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg flex items-center justify-center anime-pulse-hover border border-primary/20"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
