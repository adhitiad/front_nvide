"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Send, 
  CheckCircle, 
  Plus, 
  FileText, 
  Loader2,
  Sparkles,
  TrendingUp,
  Percent,
  LogOut,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export default function AgencyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // States
  const [agency, setAgency] = useState<any>(null);
  const [hosts, setHosts] = useState<any[]>([]);
  const [hostRelation, setHostRelation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Agency Creation Form
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createLogo, setCreateLogo] = useState("");
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [submittingAgency, setSubmittingAgency] = useState(false);

  // Host Invitation Form
  const [inviteHostId, setInviteHostId] = useState("");
  const [revenueShare, setRevenueShare] = useState<number>(60);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Check if user owns an agency
        try {
          const myAgency = await api.get("/agencies/me") as any;
          if (myAgency) {
            setAgency(myAgency);
            // Fetch hosts of this agency
            const agencyHosts = await api.get(`/agencies/${myAgency.id}/hosts`) as any[];
            setHosts(agencyHosts || []);
          }
        } catch (err: any) {
          // If 404, user doesn't have an agency, which is expected
          setAgency(null);
        }

        // 2. If user is a host, check their agency relation/invitation
        if (session?.user?.role === "host" || session?.user?.role === "admin") {
          try {
            const rel = await api.get("/host/agency") as any;
            setHostRelation(rel);
          } catch (err) {
            setHostRelation(null);
          }
        }

      } catch (err) {
        console.error("Gagal memuat data agensi", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  // Handle Create Agency
  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error("Nama agensi wajib diisi!");
      return;
    }

    try {
      setSubmittingAgency(true);
      const newAgency = await api.post("/agencies", {
        name: createName,
        description: createDesc,
        logo_url: createLogo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=60",
        commission_rate: Number(commissionRate)
      }) as any;

      toast.success("Agensi berhasil didaftarkan!");
      setAgency(newAgency);
      
      // Refresh list
      const agencyHosts = await api.get(`/agencies/${newAgency.id}/hosts`) as any[];
      setHosts(agencyHosts || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat agensi");
    } finally {
      setSubmittingAgency(false);
    }
  };

  // Handle Invite Host
  const handleInviteHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteHostId.trim()) {
      toast.error("Host ID wajib diisi!");
      return;
    }

    try {
      setSubmittingInvite(true);
      await api.post(`/agencies/${agency.id}/invite`, {
        host_id: inviteHostId,
        revenue_share: Number(revenueShare)
      });

      toast.success("Undangan host berhasil dikirim!");
      setInviteHostId("");
      
      // Refresh hosts list
      const agencyHosts = await api.get(`/agencies/${agency.id}/hosts`) as any[];
      setHosts(agencyHosts || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengirim undangan. Pastikan Host ID benar dan host belum bergabung ke agensi lain.");
    } finally {
      setSubmittingInvite(false);
    }
  };

  // Host Action: Accept Invitation
  const handleAcceptInvite = async () => {
    if (!hostRelation?.agency_id) return;
    try {
      await api.post(`/agencies/${hostRelation.agency_id}/accept`, {});
      toast.success("Berhasil bergabung dengan agensi!");
      
      // Refresh relation
      const rel = await api.get("/host/agency") as any;
      setHostRelation(rel);
    } catch (err) {
      toast.error("Gagal menerima undangan agensi");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2 text-pink-400 text-sm font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          Dashboard Agensi & Host
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          Manajemen Kemitraan Agensi NVide
        </h1>
        <p className="text-neutral-400 text-sm max-w-xl">
          Bangun jaringan penyiaran premium Anda. Rekrut host top, bagi hasil donasi koin secara adil, dan kembangkan ekosistem streaming Anda.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* BAGIAN HOST (IF HOST INTEGRATED IN AGENCY) */}
          {(session?.user?.role === "host" || session?.user?.role === "admin") && hostRelation && (
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-tr from-neutral-900 via-neutral-900 to-indigo-950/20 border-indigo-500/30 text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                    <UserCheck className="h-5 w-5" />
                    Kemitraan Agensi Anda (Sebagai Host)
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">
                    Detail agensi naungan Anda dan persentase bagi hasil pendapatan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <p className="text-xl font-black">{hostRelation.agency?.name || "Agensi Mitra NVide"}</p>
                    <p className="text-xs text-neutral-400 max-w-xl">{hostRelation.agency?.description || "Mendukung perkembangan karir host di platform streaming NVide Live."}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="bg-neutral-950 border border-neutral-800/80 px-3 py-1.5 rounded-xl text-xs">
                        Bagi Hasil Host: <span className="text-indigo-400 font-bold">{hostRelation.revenue_share}%</span>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-800/80 px-3 py-1.5 rounded-xl text-xs">
                        Total Pendapatan Agensi: <span className="text-green-400 font-bold">{hostRelation.total_earnings || 0} Koin NV</span>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-800/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
                        Status Kemitraan: 
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hostRelation.status === "active" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {hostRelation.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hostRelation.status === "invited" && (
                    <Button 
                      onClick={handleAcceptInvite}
                      className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-50 hover:to-pink-500 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-lg"
                    >
                      Terima Undangan Kemitraan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* UTAMA: AGENCY OWNER INTERFACE */}
          {agency ? (
            <>
              {/* KIRI: STATS & LIST OF AGENCY HOSTS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Metrik agensi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-neutral-400 text-xs">Nama Agensi</CardDescription>
                      <CardTitle className="text-lg font-black text-white flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                        {agency.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-neutral-400 text-xs">Tarif Potongan Agensi</CardDescription>
                      <CardTitle className="text-lg font-black text-pink-400 flex items-center gap-1.5">
                        <Percent className="h-4 w-4" />
                        {agency.commission_rate}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-neutral-400 text-xs">Status Agensi</CardDescription>
                      <CardTitle className="text-lg font-black text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" />
                        {agency.status?.toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* List of agency hosts */}
                <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-400" />
                      Daftar Host Agensi ({hosts.length})
                    </CardTitle>
                    <CardDescription className="text-neutral-400 text-xs">
                      Manajemen host penyiaran premium yang tergabung di agensi Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {hosts.length === 0 ? (
                      <div className="text-center py-12 text-xs text-neutral-500 italic">
                        Belum ada host yang bergabung ke agensi ini. Undang host di panel kanan!
                      </div>
                    ) : (
                      hosts.map((ah) => (
                        <div key={ah.host_id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-white">Host ID: {ah.host_id}</p>
                            <div className="flex gap-3 text-neutral-400 text-[10px]">
                              <span>Bagi Hasil: <strong className="text-indigo-400">{ah.revenue_share}%</strong></span>
                              <span>Total Koin: <strong className="text-green-400">{ah.total_earnings || 0} NV</strong></span>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            ah.status === "active" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {ah.status.toUpperCase()}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* KANAN: UNDANG HOST BARU */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Send className="text-pink-400 h-5 w-5" />
                      Undang Host Baru
                    </CardTitle>
                    <CardDescription className="text-neutral-400 text-xs">
                      Kirim undangan kemitraan eksklusif ke host terdaftar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleInviteHost} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-xs">Host ID (UUID)</Label>
                        <Input
                          value={inviteHostId}
                          onChange={(e) => setInviteHostId(e.target.value)}
                          placeholder="e.g. 018f3a3c-..."
                          className="bg-neutral-950 border-neutral-800 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-xs">Bagi Hasil Host (%)</Label>
                        <select
                          value={revenueShare}
                          onChange={(e) => setRevenueShare(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="50">50% Host / 50% Agensi</option>
                          <option value="60">60% Host / 40% Agensi</option>
                          <option value="70">70% Host / 30% Agensi</option>
                          <option value="80">80% Host / 20% Agensi</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        disabled={submittingInvite}
                        className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg"
                      >
                        {submittingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim Undangan Host"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // PEMBUATAN AGENSI BARU
            <div className="lg:col-span-3 max-w-xl mx-auto w-full">
              <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2 text-indigo-400">
                    <Building2 className="h-6 w-6" />
                    Daftarkan Agensi Baru
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">
                    Mulai bisnis agensi Anda sendiri dan nikmati bagi hasil koin interaksi host.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAgency} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Nama Agensi</Label>
                      <Input
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Contoh: Star Media Agency"
                        className="bg-neutral-950 border-neutral-800 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Deskripsi Singkat</Label>
                      <textarea
                        value={createDesc}
                        onChange={(e) => setCreateDesc(e.target.value)}
                        placeholder="e.g. Agensi yang mewadahi creator bertalenta musik..."
                        rows={3}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Logo URL</Label>
                      <Input
                        value={createLogo}
                        onChange={(e) => setCreateLogo(e.target.value)}
                        placeholder="e.g. https://domain.com/logo.png"
                        className="bg-neutral-950 border-neutral-800 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Tarif Potongan Agensi (%)</Label>
                      <select
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="15">15% Potongan Agensi (Rekomendasi)</option>
                        <option value="20">20% Potongan Agensi</option>
                        <option value="25">25% Potongan Agensi</option>
                        <option value="30">30% Potongan Agensi</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingAgency}
                      className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-lg"
                    >
                      {submittingAgency ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bangun Agensi Sekarang"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
