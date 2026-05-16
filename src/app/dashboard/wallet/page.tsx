"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, ArrowUpRight, ArrowDownLeft, Receipt, CreditCard, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const PACKAGES = [
  { id: "pkg-1", coins: 1000, price: 100000 },
  { id: "pkg-2", coins: 5000, price: 475000 },
  { id: "pkg-3", coins: 10000, price: 900000 },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State Top Up
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State Withdrawal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank_bca");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // In production:
      // const walletData = await api.get("/wallet/balance") as any;
      // setWallet(walletData);

      setWallet({
        balance: 15450,
        idr_equivalent: 1545000,
        status: "active"
      });

      // In production:
      // const txData = await api.get("/wallet/transactions") as any;
      // setTransactions(txData);

      setTransactions([
        { id: "tx-1", type: "deposit", amount: 5000, desc: "Top Up via Duitku", date: "2026-05-16", status: "success" },
        { id: "tx-2", type: "gift_sent", amount: -200, desc: "Gift 'Super Star' to johndoe", date: "2026-05-15", status: "success" },
        { id: "tx-3", type: "gift_received", amount: 1500, desc: "Received 'Dragon' from viewers", date: "2026-05-14", status: "success" },
        { id: "tx-4", type: "withdrawal", amount: -2000, desc: "Withdraw to Bank BCA", date: "2026-05-10", status: "success" },
      ]);
    } catch (err) {
      console.error("Gagal memuat wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleProcessTopUp = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); // Simulasi delay API
      
      setWallet((prev: any) => ({
        ...prev,
        balance: prev.balance + selectedPackage.coins,
        idr_equivalent: prev.idr_equivalent + selectedPackage.price
      }));
      
      setTransactions((prev) => [
        { 
          id: `tx-new-${Date.now()}`, 
          type: "deposit", 
          amount: selectedPackage.coins, 
          desc: `Top Up ${selectedPackage.coins} Koin`, 
          date: new Date().toISOString().split('T')[0], 
          status: "success" 
        },
        ...prev
      ]);

      setIsTopUpOpen(false);
      setSelectedPackage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount);
    
    if (!amountNum || amountNum <= 0) {
      setWithdrawError("Jumlah koin tidak valid");
      return;
    }

    if (amountNum > wallet.balance) {
      setWithdrawError("Saldo koin Anda tidak mencukupi");
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError("");

    try {
      // Produksi:
      // await api.post("/withdrawals", { amount: amountNum, method: withdrawMethod, account: withdrawAccount });
      
      await new Promise(r => setTimeout(r, 1500)); // Simulasi API
      
      // Update UI Mock
      setWallet((prev: any) => ({
        ...prev,
        balance: prev.balance - amountNum,
        idr_equivalent: prev.idr_equivalent - (amountNum * 100) // Asumsi 1 koin = 100 Rupiah (kasar)
      }));

      setTransactions((prev) => [
        { 
          id: `tx-wd-${Date.now()}`, 
          type: "withdrawal", 
          amount: -amountNum, 
          desc: `Penarikan ke ${withdrawMethod.toUpperCase()}`, 
          date: new Date().toISOString().split('T')[0], 
          status: "pending" 
        },
        ...prev
      ]);

      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
    } catch (err: any) {
      setWithdrawError(err.message || "Gagal memproses penarikan dana");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dompet (Wallet)</h1>
          <p className="text-neutral-400 mt-2">Kelola koin, top-up, dan penarikan dana Anda</p>
        </div>
      </div>

      {loading ? (
        <div className="text-neutral-400">Loading wallet...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-emerald-900 to-neutral-900 border-neutral-800 text-white shadow-xl shadow-emerald-900/10">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  Saldo Koin Tersedia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold font-mono tracking-tight">
                  {wallet?.balance.toLocaleString()} <span className="text-xl text-neutral-400 font-sans">Koin</span>
                </div>
                <p className="text-emerald-300/70 mt-2">
                  ≈ Rp {wallet?.idr_equivalent.toLocaleString("id-ID")}
                </p>
              </CardContent>
              <CardFooter className="flex gap-4 border-t border-white/10 pt-4 mt-4">
                
                {/* TOP UP DIALOG */}
                <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 shadow-md shadow-emerald-900/50">
                      <ArrowDownLeft className="mr-2 h-4 w-4" />
                      Top Up Koin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Top Up Koin</DialogTitle>
                      <DialogDescription className="text-neutral-400">
                        Pilih paket koin yang ingin Anda beli. Pembayaran didukung oleh Duitku & Crypto.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {PACKAGES.map((pkg) => (
                        <div 
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPackage?.id === pkg.id 
                              ? "border-emerald-500 bg-emerald-950/30" 
                              : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-900/50 flex items-center justify-center">
                              <Coins className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="font-bold text-lg">{pkg.coins.toLocaleString()} Koin</div>
                          </div>
                          <div className="text-emerald-400 font-medium">
                            Rp {pkg.price.toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button 
                        disabled={!selectedPackage || isProcessing} 
                        onClick={handleProcessTopUp}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isProcessing ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                        ) : "Lanjutkan ke Pembayaran"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* WITHDRAW DIALOG */}
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 flex-1 bg-transparent">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Tarik Dana
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Tarik Dana (Withdrawal)</DialogTitle>
                      <DialogDescription className="text-neutral-400">
                        Cairkan koin Anda ke rekening bank atau dompet crypto.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWithdraw}>
                      <div className="grid gap-4 py-4">
                        {withdrawError && (
                          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                            {withdrawError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label className="text-neutral-300">Metode Penarikan</Label>
                          <div className="flex gap-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              onClick={() => setWithdrawMethod("bank_bca")}
                              className={`flex-1 ${withdrawMethod === "bank_bca" ? "border-emerald-500 bg-emerald-950/20 text-emerald-400" : "border-neutral-800 text-neutral-400"}`}
                            >
                              Bank BCA
                            </Button>
                            <Button 
                              type="button"
                              variant="outline" 
                              onClick={() => setWithdrawMethod("crypto_usdt")}
                              className={`flex-1 ${withdrawMethod === "crypto_usdt" ? "border-emerald-500 bg-emerald-950/20 text-emerald-400" : "border-neutral-800 text-neutral-400"}`}
                            >
                              Crypto USDT
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account" className="text-neutral-300">Nomor Rekening / Wallet Address</Label>
                          <Input 
                            id="account" 
                            value={withdrawAccount}
                            onChange={(e) => setWithdrawAccount(e.target.value)}
                            placeholder={withdrawMethod === "bank_bca" ? "BCA - 1234567890" : "0x..."}
                            required
                            className="bg-neutral-950 border-neutral-800 text-neutral-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-neutral-300">Jumlah Koin yang ditarik</Label>
                          <Input 
                            id="amount" 
                            type="number"
                            min="1000"
                            max={wallet?.balance}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Minimal 1000 Koin"
                            required
                            className="bg-neutral-950 border-neutral-800 text-neutral-100"
                          />
                          <p className="text-xs text-neutral-500 text-right">
                            Saldo Anda: {wallet?.balance.toLocaleString()} Koin
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit"
                          disabled={isWithdrawing || !withdrawAmount || !withdrawAccount} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isWithdrawing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                          ) : "Ajukan Penarikan"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

              </CardFooter>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-4 w-4 text-sky-400" />
                  Metode Aktif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between items-center group hover:border-neutral-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">BCA (Duitku)</span>
                    <span className="text-xs text-neutral-500">**** **** 1234</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-sky-400 hover:text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity">Ubah</Button>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between items-center group hover:border-neutral-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Crypto (USDT)</span>
                    <span className="text-xs text-neutral-500">0xAbC...987Z</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-sky-400 hover:text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity">Ubah</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Receipt className="mr-2 h-5 w-5 text-neutral-400" />
                Riwayat Transaksi
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Aktivitas keluar masuk koin pada dompet Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-neutral-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-neutral-950">
                    <TableRow className="border-neutral-800 hover:bg-neutral-950/50">
                      <TableHead className="text-neutral-400 font-medium">Tanggal</TableHead>
                      <TableHead className="text-neutral-400 font-medium">Deskripsi</TableHead>
                      <TableHead className="text-neutral-400 font-medium">Tipe</TableHead>
                      <TableHead className="text-right text-neutral-400 font-medium">Jumlah (Koin)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                        <TableCell className="font-medium text-neutral-300">{tx.date}</TableCell>
                        <TableCell>{tx.desc}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                            tx.type === 'deposit' || tx.type === 'gift_received' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : tx.type === 'withdrawal' && tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {tx.type.replace('_', ' ')} {tx.status === 'pending' ? '(Pending)' : ''}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-bold text-base ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
