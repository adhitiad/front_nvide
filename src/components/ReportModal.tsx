"use client";

import { useState } from "react";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  targetId: string;
  targetType: "stream" | "chat" | "user";
  trigger: React.ReactNode;
}

const categories = [
  "Spam / Penipuan",
  "Pelecehan / Harassment",
  "Konten Di Bawah Umur (18+ Mismatch)",
  "Ujaran Kebencian",
  "Pelanggaran Hak Cipta / DRM",
  "Lainnya"
];

export function ReportModal({ targetId, targetType, trigger }: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { submitReport } = useReport();

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Deskripsi wajib diisi untuk melengkapi berkas aduan");
      return;
    }

    setSubmitting(true);
    try {
      await submitReport(category, description, targetId, targetType);
      toast.success("Laporan berhasil dikirim ke Admin NVide. Terima kasih atas kepedulian Anda! 🛡️");
      setDescription("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirimkan laporan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-sm text-white select-none">
        <DialogHeader>
          <DialogTitle className="text-sm font-black flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
            Kirim Laporan Pengaduan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleReport} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-400">Kategori Pelanggaran</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-xl text-xs font-semibold focus:border-purple-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-black text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-xs font-bold text-neutral-400">Jelaskan Detail Pelanggaran</Label>
            <textarea
              id="desc"
              rows={4}
              placeholder="Sebutkan tindakan spesifik yang dilakukan pelanggar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 p-3 text-xs rounded-xl font-medium text-neutral-200 resize-none"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={submitting}
            className="w-full bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-2 shadow"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Mengirimkan...
              </>
            ) : (
              "Kirim Laporan Sekarang"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
