"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldAlert,
  ChevronLeft,
  Trash2,
  Ban,
  AlertOctagon,
  CheckCircle,
  Clock,
  User,
  Radio,
  MessageSquare,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "resolved" | "dismissed">("pending");
  const { reports, loading, fetchReports, resolveReport } = useReport();

  useEffect(() => {
    fetchReports(statusFilter);
  }, [statusFilter, fetchReports]);

  const handleAction = async (reportId: string, action: "delete_content" | "ban_user" | "send_warning" | "dismiss") => {
    try {
      await resolveReport(reportId, action);
      const messages = {
        delete_content: "Konten pelanggaran berhasil dihapus! 🗑️",
        ban_user: "User pembuat konten berhasil dibanned dari platform! 🚫",
        send_warning: "Peringatan resmi admin telah dikirimkan ke user! ⚠️",
        dismiss: "Laporan berhasil ditolak/diabaikan! 🤝",
      };
      toast.success(messages[action]);
      fetchReports(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses tindakan moderasi");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-red-950 text-red-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-red-900/50 flex items-center gap-1.5 shadow-lg">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin Moderation
            </span>
            <span className="text-sm font-bold text-neutral-300">Pusat Keamanan & Pengaduan</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        
        {/* TABS SELECTOR */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
          <div className="flex gap-2">
            {(["pending", "resolved", "dismissed"] as const).map((st) => (
              <Button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-5 py-2.5 text-xs font-black uppercase border transition ${
                  statusFilter === st
                    ? "bg-red-650 border-red-600 hover:bg-red-650 text-white"
                    : "bg-neutral-950 border-neutral-900 hover:bg-neutral-900 text-neutral-400"
                }`}
              >
                {st === "pending" ? "Menunggu Verifikasi" : st === "resolved" ? "Selesai Diproses" : "Ditolak / Diabaikan"}
              </Button>
            ))}
          </div>

          <span className="text-xs text-neutral-500 font-mono">
            {reports.length} Pengaduan
          </span>
        </div>

        {/* REPORTS TABLE */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-neutral-950 border border-neutral-900 rounded-3xl">
            <CheckCircle className="h-12 w-12 text-neutral-850" />
            <span className="text-sm font-bold text-neutral-400">Semua Bersih!</span>
            <span className="text-xs text-neutral-600">Tidak ada laporan masuk yang cocok dengan filter status saat ini.</span>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-neutral-900/50 border-neutral-900">
                <TableRow className="border-neutral-900 text-neutral-400 hover:bg-transparent">
                  <TableHead className="font-extrabold text-[10px] uppercase">Pelapor</TableHead>
                  <TableHead className="font-extrabold text-[10px] uppercase">Tipe Target</TableHead>
                  <TableHead className="font-extrabold text-[10px] uppercase">Kategori</TableHead>
                  <TableHead className="font-extrabold text-[10px] uppercase">Deskripsi Pengaduan</TableHead>
                  <TableHead className="font-extrabold text-[10px] uppercase">Tanggal</TableHead>
                  {statusFilter === "pending" && <TableHead className="font-extrabold text-[10px] uppercase text-right">Tindakan</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rep) => (
                  <TableRow key={rep.id} className="border-neutral-900 hover:bg-neutral-900/30 text-xs">
                    <TableCell className="font-bold text-neutral-300">{rep.reporterUsername}</TableCell>
                    
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-neutral-400 font-bold uppercase text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">
                        {rep.targetType === "stream" ? (
                          <>
                            <Radio className="h-3 w-3 text-purple-400" /> stream
                          </>
                        ) : rep.targetType === "chat" ? (
                          <>
                            <MessageSquare className="h-3 w-3 text-blue-400" /> chat
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-emerald-400" /> user
                          </>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="font-bold text-red-400">{rep.category}</TableCell>
                    <TableCell className="max-w-xs truncate text-neutral-400 font-medium">{rep.description}</TableCell>
                    <TableCell className="font-mono text-neutral-500">{rep.createdAt}</TableCell>

                    {statusFilter === "pending" && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleAction(rep.id, "send_warning")}
                            title="Kirim Peringatan"
                            className="text-amber-500 hover:text-white hover:bg-amber-600/10 rounded-full h-8 w-8"
                          >
                            <AlertOctagon className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleAction(rep.id, "delete_content")}
                            title="Hapus Konten"
                            className="text-red-400 hover:text-white hover:bg-red-650/10 rounded-full h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleAction(rep.id, "ban_user")}
                            title="Banned User"
                            className="text-red-650 hover:text-white hover:bg-red-700/10 rounded-full h-8 w-8"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAction(rep.id, "dismiss")}
                            className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs rounded-xl font-bold px-3 py-1"
                          >
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      </main>
    </div>
  );
}
