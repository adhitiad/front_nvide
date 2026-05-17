"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GiftPanelProps {
  receiverId: string;
  roomId?: string;
  conversationId?: string;
  trigger?: React.ReactNode;
}

export function GiftPanel({ receiverId, roomId, conversationId, trigger }: GiftPanelProps) {
  const [gifts, setGifts] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchGifts();
      fetchBalance();
    }
  }, [open]);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const data = await api.get("/gifts") as any;
      setGifts(data || []);
    } catch (err) {
      console.error("Gagal memuat gift", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await api.get("/wallet/balance") as any;
      setBalance(data.balance || 0);
    } catch (err) {}
  };

  const handleSendGift = async (gift: any) => {
    if (balance < gift.price) {
      toast.error("Saldo tidak mencukupi!");
      return;
    }

    try {
      setSending(gift.id);
      const payload = {
        receiver_id: receiverId,
        gift_id: gift.id,
        quantity: 1,
        room_id: roomId,
        conversation_id: conversationId
      };

      await api.post("/gifts/send", payload);
      toast.success(`${gift.name} berhasil dikirim!`);
      fetchBalance(); // Update saldo setelah kirim
      
      // Jika di chat private, kita bisa menutup dialog
      if (conversationId) setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengirim gift");
    } finally {
      setSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-400/10">
            <Gift className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-6">
            <span className="flex items-center gap-2">
              <Gift className="text-amber-400 h-5 w-5" /> Kirim Gift
            </span>
            <span className="text-xs bg-neutral-800 px-3 py-1 rounded-full flex items-center gap-1.5 font-normal">
              <Wallet className="h-3 w-3 text-emerald-400" /> Rp {balance.toLocaleString()}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {gifts.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-neutral-500 text-sm">
                Belum ada gift tersedia.
              </div>
            ) : (
              gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  disabled={!!sending}
                  className="flex flex-col items-center p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all group relative overflow-hidden"
                >
                  <div className="h-14 w-14 mb-2 flex items-center justify-center bg-neutral-900 rounded-lg group-hover:scale-110 transition-transform">
                    {gift.icon_url ? (
                      <img src={gift.icon_url} alt={gift.name} className="h-10 w-10 object-contain" />
                    ) : (
                      <Gift className="h-8 w-8 text-neutral-700" />
                    )}
                  </div>
                  <span className="text-xs font-bold truncate w-full text-center">{gift.name}</span>
                  <span className="text-[10px] text-amber-500 font-mono mt-0.5">Rp {gift.price}</span>
                  
                  {sending === gift.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-center">
           <Button variant="link" className="text-xs text-indigo-400" onClick={() => window.open('/dashboard/wallet', '_blank')}>
             Isi Saldo Wallet
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
