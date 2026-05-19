"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useCreatorToken } from "@/hooks/useCreatorToken";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Coins,
  TrendingUp,
  Wallet,
  ChevronLeft,
  Lock,
  Unlock,
  Play,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ host_id: string }>;
}

export default function CreatorTokenPage({ params }: PageProps) {
  const { host_id: hostId } = use(params);
  const { data: session } = useSession();
  
  const {
    tokenInfo,
    userBalance,
    priceHistory,
    exclusiveContent,
    loading,
    error,
    buyToken,
    executeBuyToken,
    refetch
  } = useCreatorToken(hostId);

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0);
  const [purchasing, setPurchasing] = useState(false);

  const handleBuyAmountChange = async (val: string) => {
    setBuyAmount(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setEstimatedTokens(0);
      return;
    }
    const { estimatedTokens } = await buyToken(hostId, num);
    setEstimatedTokens(estimatedTokens);
  };

  const handleBuyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(buyAmount);
    if (isNaN(num) || num <= 0) {
      toast.error("Masukkan nominal pembelian yang valid");
      return;
    }

    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    setPurchasing(true);
    try {
      await executeBuyToken(hostId, num);
      toast.success("Pembelian token kreator berhasil! 🎉");
      setBuyOpen(false);
      setBuyAmount("");
      setEstimatedTokens(0);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal membeli token kreator");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading && !tokenInfo) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <span className="text-md font-bold text-neutral-400">Memuat data token kreator...</span>
      </div>
    );
  }

  if (error || !tokenInfo) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
        <h2 className="text-2xl font-black text-red-400">Token Kreator Gagal Dimuat</h2>
        <p className="text-neutral-400 max-w-sm">
          {error || "Kreator ini belum menerbitkan token bonding curve mereka."}
        </p>
        <Link href="/streams">
          <Button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full font-bold">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Siaran
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/streams">
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-purple-900/50 flex items-center gap-1.5 shadow-lg">
              <Coins className="h-3.5 w-3.5" />
              Creator Token
            </span>
            <span className="text-sm font-bold text-neutral-300">Bonding Curve Market</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        
        {/* TOP ROW: STATS & INTERACTIVE ACTION CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TOKEN CORE DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center font-black text-lg shadow-lg">
                    {tokenInfo.symbol}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{tokenInfo.name}</h1>
                    <span className="text-xs text-neutral-400 font-bold uppercase">{tokenInfo.symbol} / IDR</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm">
                  Token eksklusif kreator ini dioperasikan menggunakan model otomatis *Bonding Curve*. Setiap pembelian baru menaikkan harga token secara proporsional.
                </p>
              </div>

              <div className="flex flex-col gap-1 items-end bg-neutral-900/40 border border-neutral-800/80 p-4 rounded-2xl">
                <span className="text-xs text-neutral-500 font-bold">Harga Saat Ini</span>
                <span className="text-3xl font-black text-emerald-400">Rp {tokenInfo.currentPriceIDR.toLocaleString()}</span>
                <span className="text-[10px] text-purple-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Exponential
                </span>
              </div>
            </div>

            {/* CHART CARD */}
            <Card className="bg-neutral-950 border-neutral-900 rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  Grafik Riwayat Harga (Bonding Curve)
                </CardTitle>
                <span className="text-xs font-mono text-neutral-500">Real-time update</span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} 
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QUICK INTERACTION SIDE PANEL */}
          <div className="space-y-6">
            {/* SALDO USER CARD */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  Dompet Token Saya
                </span>
                <Coins className="h-5 w-5 text-purple-400" />
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black font-mono tracking-tight text-white">
                  {userBalance.toLocaleString()}
                </span>
                <span className="text-xs text-purple-400 font-bold block">
                  {tokenInfo.symbol} Tokens
                </span>
              </div>
              <div className="text-[10px] text-neutral-500">
                Nilai Estimasi: Rp {(userBalance * tokenInfo.currentPriceIDR).toLocaleString()}
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-md font-black">Mulai Berinvestasi</h3>
                <p className="text-xs text-neutral-400">
                  Dukung host favorit Anda dengan membeli token mereka. Buka konten eksklusif dan chat prioritas secara langsung.
                </p>
              </div>

              <Button 
                onClick={() => setBuyOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold py-6 text-sm shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                Beli Token {tokenInfo.symbol} <Sparkles className="h-4 w-4 ml-1.5 animate-pulse" />
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM EXCLUSIVE CONTENT LOCKER SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-black">Konten Eksklusif Terkunci Token</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exclusiveContent.map((content) => {
              const isUnlocked = userBalance >= content.minTokenRequired;

              return (
                <div 
                  key={content.id}
                  className={`bg-neutral-950 border rounded-3xl p-6 flex flex-col justify-between gap-6 transition relative overflow-hidden ${
                    isUnlocked ? "border-purple-600/30 shadow-lg shadow-purple-500/5 hover:border-purple-500" : "border-neutral-900 filter saturate-50 opacity-90"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Unlock className="h-3 w-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        )}
                        <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md font-bold uppercase">{content.mediaType}</span>
                      </div>
                      <h3 className="font-extrabold text-md leading-snug">{content.title}</h3>
                      <p className="text-neutral-400 text-xs leading-relaxed">{content.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-neutral-500 uppercase font-black">Syarat Akses</span>
                      <span className="text-xs font-extrabold text-purple-400">{content.minTokenRequired} {tokenInfo.symbol}</span>
                    </div>

                    {isUnlocked ? (
                      <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold px-4 py-2 text-xs flex items-center gap-1 transition shadow">
                        <Play className="h-3.5 w-3.5 fill-white" /> Putar Konten
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setBuyOpen(true)}
                        className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white rounded-xl font-bold px-4 py-2 text-xs flex items-center gap-1 transition"
                      >
                        Beli Token
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* DIALOG DIALOG PEMBELIAN */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-sm text-white select-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-400" />
              Beli Token Kreator
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBuyToken} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold text-neutral-400">Nominal Pembelian (IDR)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">Rp</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="50,000"
                  value={buyAmount}
                  onChange={(e) => handleBuyAmountChange(e.target.value)}
                  className="bg-neutral-900 border-neutral-800 focus:border-purple-500 pl-10 pr-4 py-6 text-sm rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800/80 p-4 rounded-2xl flex justify-between items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-neutral-500 font-black uppercase">Estimasi Diperoleh</span>
                <span className="text-md font-bold text-emerald-400">+{estimatedTokens} {tokenInfo.symbol}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-neutral-500 font-bold block">Bonding Curve Premium</span>
                <span className="text-xs font-mono font-bold text-purple-400">Exp V2</span>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={purchasing || !buyAmount}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold py-6 text-xs transition flex items-center justify-center gap-2 shadow"
            >
              {purchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Memproses Transaksi...
                </>
              ) : (
                "Konfirmasi Pembelian"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
