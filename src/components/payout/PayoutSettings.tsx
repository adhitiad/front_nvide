"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";

type PayoutMethod = {
  id: string;
  type: "bank_transfer" | "ewallet" | "crypto";
  is_primary: boolean;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  ewallet_provider?: string;
  ewallet_phone_number?: string;
};

type CryptoAddress = {
  id: string;
  network: "solana" | "bitcoin" | "bsc";
  address: string;
  label?: string;
};

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "CIMB", "Permata"];
const EWALLET = ["gopay", "ovo", "dana", "shopeepay", "linkaja"];
const NETWORKS = ["solana", "bitcoin", "bsc"];

export default function PayoutSettings({ scope }: { scope: "host" | "agency" }) {
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"bank_transfer" | "ewallet" | "crypto">("bank_transfer");
  const [form, setForm] = useState<any>({});

  const countByType = useMemo(
    () => ({
      bank_transfer: methods.filter((m) => m.type === "bank_transfer").length,
      ewallet: methods.filter((m) => m.type === "ewallet").length,
      crypto: cryptoAddresses.length,
    }),
    [methods, cryptoAddresses]
  );

  const load = async () => {
    try {
      const [m, c] = await Promise.all([api.get("/payout-methods"), api.get("/crypto-payout-addresses")]);
      setMethods(Array.isArray(m) ? m : m?.data || []);
      setCryptoAddresses(Array.isArray(c) ? c : c?.data || []);
    } catch {
      toast.error("Gagal memuat metode penarikan");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      if (type === "crypto") {
        await api.post("/crypto-payout-addresses", form);
      } else {
        await api.post("/payout-methods", { type, ...form });
      }
      toast.success("Metode penarikan ditambahkan");
      setOpen(false);
      setForm({});
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal menambah metode penarikan");
    }
  };

  const removeMethod = async (id: string, crypto = false) => {
    if (!confirm("Yakin hapus metode penarikan ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      if (crypto) await api.delete(`/crypto-payout-addresses/${id}`);
      else await api.delete(`/payout-methods/${id}`);
      toast.success("Berhasil dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const setPrimary = async (id: string) => {
    try {
      await api.put(`/payout-methods/${id}/primary`);
      toast.success("Metode utama diperbarui");
      load();
    } catch {
      toast.error("Gagal mengubah metode utama");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs">
        Data rekening Anda dienkripsi dan aman.
      </div>
      <div className="text-[11px] text-muted-foreground">
        Batas: Maks 3 Bank, 3 E-Wallet, 5 Crypto.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <div key={m.id} className="p-4 border rounded-2xl bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">{m.type.replace("_", " ")}</span>
              {m.is_primary ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Utama</span> : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {m.type === "bank_transfer" ? `${m.bank_name} • ${m.account_number}` : `${m.ewallet_provider} • ${m.ewallet_phone_number}`}
            </div>
            <div className="flex gap-2">
              {!m.is_primary && (
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setPrimary(m.id)}>
                  Jadikan Utama
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => removeMethod(m.id)}>
                Hapus
              </Button>
            </div>
          </div>
        ))}
        {cryptoAddresses.map((c) => (
          <div key={c.id} className="p-4 border rounded-2xl bg-card space-y-2">
            <div className="text-xs font-bold uppercase">crypto • {c.network}</div>
            <div className="text-xs text-muted-foreground break-all">{c.address}</div>
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => removeMethod(c.id, true)}>
              Hapus
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={() => setOpen(true)} className="text-xs font-bold">
        Tambah Metode Penarikan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-screen h-screen max-w-none rounded-none md:w-full md:h-auto md:max-w-xl md:rounded-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Metode Penarikan ({scope})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["bank_transfer", "ewallet", "crypto"] as const).map((t) => (
                <Button key={t} variant={type === t ? "default" : "outline"} className="text-[10px]" onClick={() => setType(t)}>
                  {t === "bank_transfer" ? "Transfer Bank" : t === "ewallet" ? "E-Wallet" : "Crypto"}
                </Button>
              ))}
            </div>

            {type === "bank_transfer" && (
              <div className="space-y-2">
                <select className="w-full h-10 rounded-xl border px-3 text-sm" onChange={(e) => setForm({ ...form, bank_name: e.target.value })}>
                  <option value="">Pilih Bank</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <Input placeholder="Nomor rekening" onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                <Input placeholder="Nama pemilik rekening" onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })} />
              </div>
            )}

            {type === "ewallet" && (
              <div className="space-y-2">
                <select className="w-full h-10 rounded-xl border px-3 text-sm" onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                  <option value="">Pilih Provider</option>
                  {EWALLET.map((e) => <option key={e} value={e}>{e.toUpperCase()}</option>)}
                </select>
                <Input placeholder="Nomor HP" onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>
            )}

            {type === "crypto" && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700">
                  Transaksi crypto bersifat final. Pastikan alamat benar.
                </div>
                <select className="w-full h-10 rounded-xl border px-3 text-sm" onChange={(e) => setForm({ ...form, network: e.target.value })}>
                  <option value="">Pilih Network</option>
                  {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <Input placeholder="Alamat crypto" onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <Input placeholder="Label (opsional)" onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
            )}

            {type !== "crypto" && (
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} />
                Jadikan sebagai metode utama
              </label>
            )}

            <Button className="w-full" onClick={submit}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

