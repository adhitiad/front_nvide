"use client";

import { useState } from "react";
import { usePrediction } from "@/hooks/usePrediction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  HelpCircle,
  Timer,
  CheckCircle2,
  TrendingUp,
  Coins,
  Loader2,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface PredictionPanelProps {
  streamId: string;
}

export function PredictionPanel({ streamId }: PredictionPanelProps) {
  const {
    activePrediction,
    userBet,
    timeLeft,
    isClosed,
    formattedTimeLeft,
    placeBet,
    claimWinnings,
    refetch,
  } = usePrediction(streamId);

  const [betAmount, setBetAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  if (!activePrediction) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
        <HelpCircle className="h-10 w-10 text-neutral-800 animate-pulse" />
        <span className="text-xs font-bold text-neutral-500">Tidak Ada Prediksi Aktif</span>
        <span className="text-[10px] text-neutral-600">Host belum meluncurkan kuis taruhan prediksi saat ini.</span>
      </div>
    );
  }

  // Hitung persentase taruhan
  const totalBet = activePrediction.options.reduce((sum, opt) => sum + opt.totalBetIDR, 0);
  const yesOption = activePrediction.options.find((o) => o.id === "yes");
  const noOption = activePrediction.options.find((o) => o.id === "no");

  const yesPct = totalBet > 0 && yesOption ? Math.round((yesOption.totalBetIDR / totalBet) * 100) : 50;
  const noPct = totalBet > 0 && noOption ? Math.round((noOption.totalBetIDR / totalBet) * 100) : 50;

  const handlePlaceBet = async () => {
    const num = parseInt(betAmount);
    if (isNaN(num) || num <= 0) {
      toast.error("Masukkan nominal taruhan yang valid");
      return;
    }
    if (!selectedOption) {
      toast.error("Pilih opsi prediksi terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      await placeBet(activePrediction.id, selectedOption, num);
      toast.success(`Berhasil bertaruh Rp ${num.toLocaleString()} pada opsi ${selectedOption === "yes" ? "YA" : "TIDAK"}! 🎲`);
      setBetAmount("");
    } catch (err: any) {
      toast.error(err.message || "Gagal memasang taruhan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const { won, payout } = await claimWinnings(activePrediction.id);
      if (won) {
        toast.success(`Selamat! Anda memenangkan taruhan sebesar Rp ${payout.toLocaleString()}! 🎉`);
      } else {
        toast.error("Maaf, tebakan Anda meleset kali ini.");
      }
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal mencairkan kemenangan");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-6 select-none shadow-2xl relative overflow-hidden">
      
      {/* SHINY BACKGROUND BLUR EFFECT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 blur-md" />

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Trophy className="h-4 w-4 animate-bounce-short text-amber-400" />
          Pasar Prediksi Langsung
        </h4>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
          isClosed ? "bg-red-950 text-red-400 border-red-900/50" : "bg-purple-950 text-purple-400 border-purple-900/50"
        }`}>
          <Timer className="h-3.5 w-3.5" />
          {formattedTimeLeft}
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase text-neutral-500">Pertanyaan Prediksi</div>
        <p className="font-extrabold text-sm text-neutral-200 leading-snug">
          {activePrediction.question}
        </p>
      </div>

      {/* YES VS NO BET BAR GRAPH */}
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-bold text-neutral-400">
          <span>{yesOption?.text} ({yesPct}%)</span>
          <span>{noOption?.text} ({noPct}%)</span>
        </div>
        <div className="h-3 bg-neutral-900 border border-neutral-850 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-700"
            style={{ width: `${yesPct}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-indigo-600 transition-all duration-700"
            style={{ width: `${noPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-neutral-500">
          <span>Total Bet: Rp {yesOption?.totalBetIDR.toLocaleString()}</span>
          <span>Total Bet: Rp {noOption?.totalBetIDR.toLocaleString()}</span>
        </div>
      </div>

      <hr className="border-neutral-900" />

      {/* BET ACTION AREA */}
      {isClosed ? (
        <div className="bg-neutral-900/50 border border-neutral-850 p-5 rounded-2xl text-center space-y-4">
          <Lock className="h-8 w-8 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <span className="text-xs font-black block text-neutral-400">Taruhan Telah Ditutup!</span>
            <span className="text-[10px] text-neutral-500 block leading-relaxed">
              Menunggu Host menyelesaikan prediksi dan mengunggah hasil keputusan resmi.
            </span>
          </div>

          {userBet && userBet.status === "pending" && (
            <div className="mt-2 text-xs bg-purple-950/30 border border-purple-900/30 p-3 rounded-xl">
              Anda bertaruh <span className="font-bold text-purple-400">Rp {userBet.amountBetIDR.toLocaleString()}</span> pada opsi <span className="font-bold text-purple-400">{userBet.optionId === "yes" ? "YA" : "TIDAK"}</span>.
            </div>
          )}

          {userBet && userBet.status === "won" && (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold py-5 text-xs transition"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin text-white mr-2" /> : null}
              Cairkan Kemenangan Taruhan! 🏆
            </Button>
          )}
        </div>
      ) : userBet ? (
        // User already placed bet
        <div className="bg-purple-950/20 border border-purple-900/30 p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <CheckCircle2 className="h-4.5 w-4.5" />
            Taruhan Anda Terpasang!
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-neutral-900/40 border border-neutral-850 p-3 rounded-xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Opsi Terpilih</span>
              <span className="font-bold text-white block mt-0.5">{userBet.optionId === "yes" ? "YA" : "TIDAK"}</span>
            </div>
            <div className="bg-neutral-900/40 border border-neutral-850 p-3 rounded-xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Jumlah Taruhan</span>
              <span className="font-bold text-emerald-400 block mt-0.5">Rp {userBet.amountBetIDR.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 text-center leading-relaxed">
            Estimasi rasio dividen pembagian pot kemenangan: <span className="font-bold text-purple-400 font-mono">{(totalBet / (userBet.optionId === "yes" ? (yesOption?.totalBetIDR || 1) : (noOption?.totalBetIDR || 1))).toFixed(2)}x</span>
          </div>
        </div>
      ) : (
        // Form to place bet
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedOption("yes")}
              className={`py-5 text-xs rounded-xl font-bold transition ${
                selectedOption === "yes"
                  ? "bg-purple-600 border-purple-500 hover:bg-purple-600 text-white"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850"
              }`}
            >
              YA, BERHASIL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedOption("no")}
              className={`py-5 text-xs rounded-xl font-bold transition ${
                selectedOption === "no"
                  ? "bg-purple-600 border-purple-500 hover:bg-purple-600 text-white"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850"
              }`}
            >
              TIDAK, GAGAL
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet" className="text-[10px] font-bold text-neutral-500">Jumlah Taruhan (Koin / IDR)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">Rp</span>
              <Input
                id="bet"
                type="number"
                placeholder="10,000"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-neutral-900 border-neutral-800 focus:border-purple-500 pl-10 pr-4 py-5 text-xs rounded-xl font-bold"
              />
            </div>
          </div>

          <Button
            onClick={handlePlaceBet}
            disabled={submitting || !selectedOption || !betAmount}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5 shadow"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Coins className="h-4 w-4" />}
            Pasang Taruhan Prediksi
          </Button>
        </div>
      )}
    </div>
  );
}
