"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Terminal,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Zap,
  Swords,
  Timer,
  User,
  Heart,
  Gift,
  Flame,
  Volume2,
  VolumeX,
  Play,
  X,
  UserCheck,
  Trophy,
} from "lucide-react";
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
import api from "@/lib/api";

// 🏆 Tipe data PK Battle untuk type-safety
interface PKBattle {
  id: string;
  battleCode: string;
  hostAId: string;
  hostBId: string;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  status:
    | "invited"
    | "accepted"
    | "active"
    | "punishment"
    | "ended"
    | "rejected";
  durationSeconds: number;
  timeLeftSeconds: number;
}

interface HostProfile {
  id: string;
  username: string;
  level: number;
  avatarUrl: string;
  streamTitle: string;
}

export default function PKBattleDashboardPage() {
  const [sandboxMode, setSandboxMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activePK, setActivePK] = useState<PKBattle | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [duration, setDuration] = useState(300);
  const [theme, setTheme] = useState("gift_war");
  const [isMuted, setIsMuted] = useState(false);
  const [pkHistory, setPKHistory] = useState<PKBattle[]>([]);

  // Simulation states
  const [incomingInvite, setIncomingInvite] = useState<PKBattle | null>(null);

  // Mock list of online hosts to invite
  const MOCK_ONLINE_HOSTS: HostProfile[] = [
    {
      id: "host-b1",
      username: "diana_live",
      level: 42,
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      streamTitle: "Lagu Santai Malam Hari ✨",
    },
    {
      id: "host-b2",
      username: "alex_gaming",
      level: 35,
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      streamTitle: "Push Rank Conqueror Solo! 🎮",
    },
    {
      id: "host-b3",
      username: "putri_talkshow",
      level: 50,
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      streamTitle: "Obrolan Seru & QnA Berhadiah 💖",
    },
  ];

  // Load initial data
  useEffect(() => {
    resetToDefaultPK();
    loadHistory();
  }, [sandboxMode]);

  // Timer Countdown Simulator
  useEffect(() => {
    if (
      !activePK ||
      activePK.status === "ended" ||
      activePK.status === "rejected" ||
      activePK.status === "invited"
    )
      return;

    const interval = setInterval(() => {
      setActivePK((prev) => {
        if (!prev) return null;
        if (prev.timeLeftSeconds <= 1) {
          clearInterval(interval);

          // Transisi otomatis (Self-healing simulator)
          if (prev.status === "active") {
            const winner =
              prev.scoreA > prev.scoreB
                ? "Anda"
                : prev.scoreB > prev.scoreA
                  ? prev.hostBId
                  : "Draw";
            toast.success(
              `Durasi PK habis! Memasuki masa Hukuman. Pemenang: ${winner}`,
            );
            return {
              ...prev,
              status: "punishment",
              timeLeftSeconds: 120, // Hukuman 2 menit
              winnerId:
                prev.scoreA > prev.scoreB
                  ? prev.hostAId
                  : prev.scoreB > prev.scoreA
                    ? prev.hostBId
                    : null,
            };
          } else if (prev.status === "punishment") {
            toast.info("PK Battle telah sepenuhnya berakhir!");
            const finalPK = {
              ...prev,
              status: "ended",
              timeLeftSeconds: 0,
            } as PKBattle;
            setPKHistory((history) => [finalPK, ...history]);
            return finalPK;
          }
          return prev;
        }

        return {
          ...prev,
          timeLeftSeconds: prev.timeLeftSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePK?.id, activePK?.status]);

  const resetToDefaultPK = () => {
    // PK bawaan saat halaman dimuat
    setActivePK({
      id: "pk-active-id",
      battleCode: "PK-20260517-SIM",
      hostAId: "me-id",
      hostBId: "host-b1",
      scoreA: 12500,
      scoreB: 9800,
      winnerId: null,
      status: "active",
      durationSeconds: 300,
      timeLeftSeconds: 185,
    });
  };

  const loadHistory = () => {
    setPKHistory([
      {
        id: "pk-hist-1",
        battleCode: "PK-20260516-ABC",
        hostAId: "me-id",
        hostBId: "host-b2",
        scoreA: 45000,
        scoreB: 32000,
        winnerId: "me-id",
        status: "ended",
        durationSeconds: 300,
        timeLeftSeconds: 0,
      },
      {
        id: "pk-hist-2",
        battleCode: "PK-20260515-XYZ",
        hostAId: "me-id",
        hostBId: "host-b3",
        scoreA: 8200,
        scoreB: 18400,
        winnerId: "host-b3",
        status: "ended",
        durationSeconds: 300,
        timeLeftSeconds: 0,
      },
    ]);
  };

  // --- API / SIMULATOR CALLS ---

  // 1. Invite PK Battle
  const handleInvitePK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpponent) {
      toast.warning("Silakan pilih host lawan terlebih dahulu.");
      return;
    }

    setLoading(true);
    const opponent = MOCK_ONLINE_HOSTS.find((h) => h.id === selectedOpponent);

    try {
      if (sandboxMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Simulasikan undangan terkirim
        const newPK: PKBattle = {
          id: "pk-" + Math.random().toString(36).substring(4),
          battleCode:
            "PK-" +
            new Date().toISOString().slice(0, 10).replace(/-/g, "") +
            "-" +
            Math.random().toString(36).substring(7).toUpperCase(),
          hostAId: "me-id",
          hostBId: opponent?.username || "opponent",
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          status: "invited",
          durationSeconds: duration,
          timeLeftSeconds: duration,
        };

        setActivePK(newPK);
        toast.success(
          `[Sandbox] Undangan PK berhasil dikirim ke ${opponent?.username}!`,
        );

        // Simulasikan balasan otomatis dari bot setelah 4 detik
        setTimeout(() => {
          setActivePK((prev) => {
            if (prev && prev.id === newPK.id && prev.status === "invited") {
              toast.success(
                `${opponent?.username} menerima tantangan PK Anda! Bersiaplah! 🔥`,
              );
              return {
                ...prev,
                status: "active",
                timeLeftSeconds: prev.durationSeconds,
              };
            }
            return prev;
          });
        }, 4000);
      } else {
        // Panggil endpoint backend Go riil
        const response = await api
          .post("/pk/battle/invite", {
            opponent_host_id: selectedOpponent,
            duration: duration,
            theme: theme,
          })
          .catch(() => null);

        if (response) {
          const resData = response as any;
          setActivePK({
            id: resData.id,
            battleCode: resData.battleCode || "PK-API",
            hostAId: resData.hostAID,
            hostBId: resData.hostBID,
            scoreA: resData.scoreA || 0,
            scoreB: resData.scoreB || 0,
            winnerId: resData.winnerId || null,
            status: resData.status as any,
            durationSeconds: resData.durationSeconds || 300,
            timeLeftSeconds: resData.durationSeconds || 300,
          });
          toast.success("Undangan PK berhasil dikirim via Server API!");
        } else {
          toast.error(
            "Gagal terhubung dengan backend Go. Kembali ke mode Simulator.",
          );
          setSandboxMode(true);
        }
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Accept PK Battle Invitation
  const handleAcceptInvite = async (pkId: string) => {
    try {
      if (sandboxMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setActivePK({
          id: pkId,
          battleCode: "PK-ACCEPTED-SIM",
          hostAId: "me-id",
          hostBId: "putri_talkshow",
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          status: "active",
          durationSeconds: 300,
          timeLeftSeconds: 300,
        });
        setIncomingInvite(null);
        toast.success(
          "[Sandbox] Anda menerima tantangan PK! Pertandingan dimulai!",
        );
      } else {
        const response = await api
          .post(`/pk/battle/${pkId}/accept`)
          .catch(() => null);
        if (response) {
          toast.success("PK Battle berhasil diterima!");
          setIncomingInvite(null);
          fetchPKStatus(pkId);
        } else {
          toast.error("Gagal terhubung ke backend.");
        }
      }
    } catch (e) {
      toast.error("Kesalahan jaringan.");
    }
  };

  // 3. Reject PK Battle Invitation
  const handleRejectInvite = async (pkId: string) => {
    try {
      if (sandboxMode) {
        setIncomingInvite(null);
        toast.info("[Sandbox] Undangan PK ditolak.");
      } else {
        await api.post(`/pk/battle/${pkId}/reject`);
        setIncomingInvite(null);
        toast.info("Undangan PK ditolak via API.");
      }
    } catch (e) {
      toast.error("Gagal menolak undangan.");
    }
  };

  // 4. Fetch status real-time
  const fetchPKStatus = async (pkId: string) => {
    if (sandboxMode) return;
    try {
      const response = await api
        .get(`/pk/battle/${pkId}/status`)
        .catch(() => null);
      if (response) {
        const resData = response as any;
        setActivePK({
          id: resData.pk_id || pkId,
          battleCode: "PK-LIVE-API",
          hostAId: resData.host_a_id,
          hostBId: resData.host_b_id,
          scoreA: resData.score_a || 0,
          scoreB: resData.score_b || 0,
          winnerId: resData.winner_id || null,
          status: resData.status as any,
          durationSeconds: 300,
          timeLeftSeconds: resData.time_left_seconds || 0,
        });
      }
    } catch (e) {
      toast.error("Gagal memperbarui status dari server.");
    }
  };

  // --- SIMULATION WIDGETS ---
  const simulateGift = (side: "a" | "b", amount: number) => {
    if (!activePK || activePK.status !== "active") {
      toast.warning("Simulasi gift hanya bisa dilakukan saat PK aktif!");
      return;
    }

    setActivePK((prev) => {
      if (!prev) return null;
      const nextA = side === "a" ? prev.scoreA + amount : prev.scoreA;
      const nextB = side === "b" ? prev.scoreB + amount : prev.scoreB;

      toast.success(
        `[Simulasi] Kirim koin ke Host ${side.toUpperCase()} senilai +${amount.toLocaleString()} Pts!`,
      );

      return {
        ...prev,
        scoreA: nextA,
        scoreB: nextB,
      };
    });
  };

  const triggerIncomingInvite = () => {
    setIncomingInvite({
      id: "pk-invite-" + Math.random().toString(36).substring(4),
      battleCode: "PK-INV-INCOMING",
      hostAId: "putri_talkshow",
      hostBId: "me-id",
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      status: "invited",
      durationSeconds: 300,
      timeLeftSeconds: 300,
    });
    toast.info(
      "Anda menerima undangan PK masuk dari putri_talkshow! Cek daftar di bawah.",
    );
  };

  // Kalkulasi persentase score bar
  const totalScore = (activePK?.scoreA || 0) + (activePK?.scoreB || 0);
  const percentA =
    totalScore === 0
      ? 50
      : Math.round(((activePK?.scoreA || 0) / totalScore) * 100);
  const percentB = 100 - percentA;

  // Format menit:detik
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 relative overflow-hidden select-none min-h-[85vh]">
      {/* HEADER WIDGET */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/20 text-rose-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
              <Swords className="h-3 w-3" /> PK Arena
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            NVide Live PK Battle
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Tantang host lain secara real-time, kumpulkan hadiah combo, dan
            menangkan pertandingan live streaming.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-850 p-1.5 rounded-2xl">
          <Terminal className="text-indigo-400 h-4 w-4 ml-2.5 animate-pulse" />
          <Button
            onClick={() => setSandboxMode(!sandboxMode)}
            variant="outline"
            size="sm"
            className={`text-xs rounded-xl h-8 px-4 cursor-pointer transition-all ${
              sandboxMode
                ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                : "border-neutral-800 text-neutral-400"
            }`}
          >
            {sandboxMode ? "Mode Simulator (Offline)" : "Mode Server (API)"}
          </Button>
        </div>
      </div>

      {/* MATCH STATUS WIDGET (INVITATION INCOMING MOCK CARD) */}
      {incomingInvite && (
        <div className="bg-gradient-to-r from-neutral-950 via-rose-950/20 to-neutral-950 border border-rose-900/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                PT
              </div>
              <Flame className="absolute -top-1.5 -right-1.5 text-yellow-500 h-4 w-4 fill-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Undangan PK Masuk!</p>
              <p className="text-[10px] text-neutral-400">
                Host{" "}
                <span className="text-rose-400 font-bold">putri_talkshow</span>{" "}
                mengajak Anda PK Battle (Durasi: 5 Menit)!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAcceptInvite(incomingInvite.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs px-4 h-8 cursor-pointer font-bold flex items-center gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Terima Tantangan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRejectInvite(incomingInvite.id)}
              className="border-neutral-800 hover:bg-neutral-900 text-neutral-300 rounded-xl text-xs px-4 h-8 cursor-pointer"
            >
              Tolak
            </Button>
          </div>
        </div>
      )}

      {/* ⚔️ LIVE BATTLE GROUND GRAPHIC ⚔️ */}
      {activePK && (
        <Card className="bg-neutral-950/70 backdrop-blur-xl border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* TOP SCORE PROGRESS BAR */}
          <div className="p-4 border-b border-neutral-900/60 bg-black/40">
            <div className="flex justify-between items-center mb-2.5 px-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] text-rose-400 font-mono font-bold tracking-wider">
                  TEAM RED (ANDA)
                </span>
              </div>

              {/* TIMER BOX */}
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-850 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.4)]">
                <Timer className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-mono font-black tracking-wider text-yellow-400 uppercase">
                  {activePK.status === "invited"
                    ? "Menunggu"
                    : activePK.status === "punishment"
                      ? "HUKUMAN"
                      : "BATTLE"}
                </span>
                <span className="text-xs font-mono font-black text-white ml-1.5">
                  {formatTime(activePK.timeLeftSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider">
                  TEAM BLUE (LAWAN)
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
              </div>
            </div>

            {/* NEON SCORE PROGRESS BAR */}
            <div className="h-7 w-full bg-neutral-900 rounded-2xl overflow-hidden flex relative border border-neutral-850">
              <div
                style={{ width: `${percentA}%` }}
                className="bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500 flex items-center justify-start pl-4 relative shadow-[inset_0_0_10px_rgba(244,63,94,0.4)]"
              >
                <span className="text-[10px] font-black text-white tracking-wide font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {activePK.scoreA.toLocaleString()} pts ({percentA}%)
                </span>
              </div>
              <div
                style={{ width: `${percentB}%` }}
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500 flex items-center justify-end pr-4 relative shadow-[inset_0_0_10px_rgba(34,211,238,0.4)]"
              >
                <span className="text-[10px] font-black text-white tracking-wide font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  ({percentB}%) {activePK.scoreB.toLocaleString()} pts
                </span>
              </div>

              {/* VS badge center splitter */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full border border-black animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                VS
              </div>
            </div>
          </div>

          {/* SPLIT STREAM SCREEN CONTAINERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative bg-neutral-950">
            {/* HOST A (ME) STREAM WINDOW */}
            <div className="aspect-video bg-neutral-900/40 relative flex flex-col items-center justify-center p-4 border-r border-neutral-900/70 select-none overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent pointer-events-none" />

              {/* Camera view simulation overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-white tracking-wider">
                  LIVE
                </span>
              </div>

              {/* Stream Frame placeholder */}
              <div className="h-28 w-28 rounded-2xl bg-neutral-950 border border-neutral-850 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <User className="h-10 w-10 text-rose-500 animate-pulse" />
                <span className="text-[9px] font-bold text-rose-400 mt-2 font-mono">
                  HOST_A (ANDA)
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/50 backdrop-blur-md p-2 rounded-xl border border-neutral-900">
                <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />{" "}
                  Host Level 48
                </span>
                <span className="text-[9px] font-mono text-rose-400">
                  Score: {activePK.scoreA.toLocaleString()}
                </span>
              </div>
            </div>

            {/* HOST B (OPPONENT) STREAM WINDOW */}
            <div className="aspect-video bg-neutral-900/40 relative flex flex-col items-center justify-center p-4 select-none overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-white tracking-wider">
                  OPPONENT
                </span>
              </div>

              {/* Mute Opponent */}
              <div className="absolute top-4 right-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsMuted(!isMuted);
                    toast.info(
                      isMuted
                        ? "Suara lawan diaktifkan!"
                        : "Suara lawan dibisukan!",
                    );
                  }}
                  className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl text-neutral-400 hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Stream Frame placeholder */}
              <div className="h-28 w-28 rounded-2xl bg-neutral-950 border border-neutral-850 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <User className="h-10 w-10 text-cyan-500 animate-pulse" />
                <span className="text-[9px] font-bold text-cyan-400 mt-2 font-mono">
                  {activePK.hostBId.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/50 backdrop-blur-md p-2 rounded-xl border border-neutral-900">
                <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-cyan-500 fill-cyan-500" />{" "}
                  Host Level 35
                </span>
                <span className="text-[9px] font-mono text-cyan-400">
                  Score: {activePK.scoreB.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* PK VICTORY / END STATUS LAYER */}
          {(activePK.status === "punishment" ||
            activePK.status === "ended") && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
              <Trophy className="h-16 w-16 text-yellow-400 animate-bounce mb-3" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                {activePK.status === "punishment"
                  ? "PK Selesai! Masa Hukuman"
                  : "Pertandingan Berakhir"}
              </h2>
              <p className="text-sm text-neutral-300 mt-2 max-w-md font-light">
                {activePK.winnerId === "me-id" ||
                activePK.winnerId === activePK.hostAId ? (
                  <span className="text-emerald-400 font-bold font-mono">
                    🏆 SELAMAT! ANDA MEMENANGKAN PK BATTLE DENGAN MARGIN{" "}
                    {(activePK.scoreA - activePK.scoreB).toLocaleString()} PTS!
                    🏆
                  </span>
                ) : activePK.winnerId ? (
                  <span className="text-rose-400 font-bold font-mono">
                    Lawan memenangkan PK Battle. Bersiaplah menerima hukuman di
                    stream! 👊
                  </span>
                ) : (
                  <span className="text-yellow-400 font-bold font-mono">
                    Hasil Seri! Skor seimbang. Tidak ada hukuman. 🤝
                  </span>
                )}
              </p>
              {activePK.status === "ended" && (
                <Button
                  onClick={resetToDefaultPK}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs h-9 px-6 mt-5 cursor-pointer"
                >
                  Mulai PK Baru
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* CONTROL & UTILITY PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. INVITE PANEL */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden shadow-xl">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Swords className="text-rose-500 h-4.5 w-4.5" /> Kirim Tantangan
                PK
              </CardTitle>
              <CardDescription className="text-[10px] text-neutral-400 font-light mt-0.5">
                Kirim undangan tanding real-time ke host yang sedang live.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleInvitePK}>
              <CardContent className="space-y-4 pt-4">
                {/* OPPONENT INPUT */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">
                    Pilih Host Lawan
                  </label>
                  <select
                    value={selectedOpponent}
                    onChange={(e) => setSelectedOpponent(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-850 text-white rounded-xl h-10 px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">-- Pilih Host Aktif --</option>
                    {MOCK_ONLINE_HOSTS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.username} (Lvl {h.level}) -{" "}
                        {h.streamTitle.slice(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* DURATION */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">
                    Durasi Tanding (Detik)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-neutral-900/50 border border-neutral-850 text-white rounded-xl h-10 px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value={180}>180 Detik (3 Menit)</option>
                    <option value={300}>300 Detik (5 Menit)</option>
                    <option value={600}>600 Detik (10 Menit)</option>
                  </select>
                </div>

                {/* THEME */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">
                    Tema Battle
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-850 text-white rounded-xl h-10 px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="gift_war">Perang Hadiah (Gift War)</option>
                    <option value="popularity">Kepopuleran (Popularity)</option>
                    <option value="task_challenge">
                      Tantangan Tugas (Task)
                    </option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t border-neutral-900 bg-black/30">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold rounded-xl cursor-pointer text-xs h-10 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Kirim Tantangan PK
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* 2. SIMULATOR Gifting PANEL (OFFLINE SANDBOX MODE) */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden shadow-xl">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Gift className="text-indigo-400 h-4.5 w-4.5" /> Simulator
                Hadiah (Sandbox)
              </CardTitle>
              <CardDescription className="text-[10px] text-neutral-400 font-light mt-0.5">
                Gunakan widget simulator ini untuk menguji grafik poin/skor
                secara real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* GIFT SIMULATOR TO HOST A */}
              <div className="space-y-2 border border-neutral-900 p-3 rounded-xl bg-neutral-950">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-rose-400 font-mono font-bold">
                    HADIAH UNTUK ANDA
                  </span>
                  <span className="text-[9px] bg-rose-950/40 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-mono">
                    Team Red
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => simulateGift("a", 500)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-rose-950/20 hover:text-rose-300"
                  >
                    +500 koin
                  </Button>
                  <Button
                    onClick={() => simulateGift("a", 2500)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-rose-950/20 hover:text-rose-300"
                  >
                    +2.5K koin
                  </Button>
                  <Button
                    onClick={() => simulateGift("a", 10000)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-rose-950/20 hover:text-rose-300"
                  >
                    +10K koin
                  </Button>
                </div>
              </div>

              {/* GIFT SIMULATOR TO HOST B */}
              <div className="space-y-2 border border-neutral-900 p-3 rounded-xl bg-neutral-950">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    HADIAH UNTUK LAWAN
                  </span>
                  <span className="text-[9px] bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                    Team Blue
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => simulateGift("b", 500)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-cyan-950/20 hover:text-cyan-300"
                  >
                    +500 koin
                  </Button>
                  <Button
                    onClick={() => simulateGift("b", 2500)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-cyan-950/20 hover:text-cyan-300"
                  >
                    +2.5K koin
                  </Button>
                  <Button
                    onClick={() => simulateGift("b", 10000)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 rounded-lg cursor-pointer border-neutral-850 hover:bg-cyan-950/20 hover:text-cyan-300"
                  >
                    +10K koin
                  </Button>
                </div>
              </div>

              {/* EXTRA SIMULATOR TRIGGERS */}
              <div className="pt-2">
                <Button
                  onClick={triggerIncomingInvite}
                  variant="outline"
                  size="sm"
                  className="w-full border-neutral-850 text-indigo-400 hover:bg-indigo-950/20 hover:text-indigo-300 rounded-xl text-xs h-9 cursor-pointer"
                >
                  ⚡ Kirim Undangan Masuk Tiruan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. HISTORY TABLE */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border border-neutral-900 rounded-2xl shadow-xl flex flex-col h-[350px]">
            <CardHeader className="p-4 border-b border-neutral-900 bg-black/20 flex justify-between items-center flex-row space-y-0">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-yellow-500" /> Riwayat PK
                Terakhir
              </CardTitle>
              <Button
                onClick={loadHistory}
                variant="ghost"
                size="icon"
                className="text-neutral-400 rounded-xl cursor-pointer h-7 w-7"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin divide-y divide-neutral-900">
              {pkHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500 text-xs font-light">
                  Belum ada riwayat pertandingan.
                </div>
              ) : (
                pkHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex justify-between items-center hover:bg-neutral-900/10 transition-colors"
                  >
                    <div>
                      <h4 className="text-[11px] font-bold text-white flex items-center gap-1">
                        <span>⚔️ {item.hostBId}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono font-light">
                          {item.battleCode.split("-").pop()}
                        </span>
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono font-light">
                        Poin:{" "}
                        <span className="text-rose-400 font-bold">
                          {item.scoreA.toLocaleString()}
                        </span>{" "}
                        vs{" "}
                        <span className="text-cyan-400 font-bold">
                          {item.scoreB.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <div>
                      {item.winnerId === "me-id" ||
                      item.winnerId === item.hostAId ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
                          MENANG
                        </span>
                      ) : item.winnerId ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/20 text-rose-400 font-mono font-bold">
                          KALAH
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 font-mono font-bold">
                          SERI
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
