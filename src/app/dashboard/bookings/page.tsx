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
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Video, 
  Phone, 
  MapPin, 
  Sparkles, 
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Data States
  const [hosts, setHosts] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [hostBookings, setHostBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow as default
  );
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [duration, setDuration] = useState<number>(30); // minutes
  const [notes, setNotes] = useState<string>("");
  const [callType, setCallType] = useState<"video" | "voice">("video");
  const [locationName, setLocationName] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  // Fetch all initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch available hosts (using active streams as host catalog)
        const streamList = await api.get("/streams") as any[];
        const hostMap = new Map();
        streamList.forEach((s: any) => {
          if (s.host) {
            hostMap.set(s.host.id, s.host);
          }
        });
        setHosts(Array.from(hostMap.values()));

        // 2. Fetch User requested bookings
        const userB = await api.get("/bookings") as any[];
        setMyBookings(userB || []);

        // 3. If host, fetch host bookings
        if (session?.user?.role === "host" || session?.user?.role === "admin") {
          const hostB = await api.get("/host/bookings") as any[];
          setHostBookings(hostB || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data booking", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  // Fetch available slots when host or date changes
  useEffect(() => {
    if (!selectedHost || !selectedDate) return;
    
    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        const slots = await api.get(`/api/v1/hosts/${selectedHost.id}/available-slots?date=${selectedDate}`) as any[];
        setAvailableSlots(slots || []);
        if (slots && slots.length > 0) {
          setSelectedSlot(slots[0].start_time || "");
        } else {
          setSelectedSlot("");
        }
      } catch (err) {
        console.error("Gagal memuat jadwal tersedia", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    
    fetchSlots();
  }, [selectedHost, selectedDate]);

  // Handle Request Booking
  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHost) {
      toast.error("Silakan pilih Host terlebih dahulu!");
      return;
    }
    if (!selectedSlot) {
      toast.error("Silakan pilih jam slot yang tersedia!");
      return;
    }

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedSlot}`);
      
      const payload = {
        host_id: selectedHost.id,
        booking_type_id: "00000000-0000-0000-0000-000000000000", // Default mock UUID
        scheduled_at: scheduledAt.toISOString(),
        duration: duration,
        notes: notes,
        location_name: locationName || (callType === "video" ? "Virtual Video Call" : "Virtual Voice Call"),
        latitude: null,
        longitude: null
      };

      await api.post("/bookings", payload);
      toast.success("Permintaan booking berhasil diajukan!");
      
      // Reset form
      setNotes("");
      setLocationName("");
      setSelectedHost(null);

      // Refresh list
      const userB = await api.get("/bookings") as any[];
      setMyBookings(userB || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Saldo Koin NV tidak cukup untuk melakukan booking!");
    }
  };

  // Host Action: Accept Booking
  const handleAcceptBooking = async (id: string) => {
    try {
      await api.post(`/host/bookings/${id}/accept`, {});
      toast.success("Booking berhasil disetujui!");
      
      // Refresh list
      const hostB = await api.get("/host/bookings") as any[];
      setHostBookings(hostB || []);
    } catch (err) {
      toast.error("Gagal menyetujui booking");
    }
  };

  // Host Action: Reject Booking
  const handleRejectBooking = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }
    try {
      await api.post(`/host/bookings/${id}/reject`, { reason: rejectReason });
      toast.success("Booking berhasil ditolak!");
      setActiveRejectId(null);
      setRejectReason("");

      // Refresh list
      const hostB = await api.get("/host/bookings") as any[];
      setHostBookings(hostB || []);
    } catch (err) {
      toast.error("Gagal menolak booking");
    }
  };

  // Start WebRTC private call
  const handleStartCall = (bookingId: string) => {
    toast.success("Menghubungkan ke Panggilan WebRTC...");
    router.push(`/dashboard/call/${bookingId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "accepted":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "rejected":
      case "host_rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "completed":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          Monetisasi Jadwal Premium
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          Halaman Booking & Jadwal Host
        </h1>
        <p className="text-neutral-400 text-sm max-w-xl">
          Jadwalkan interaksi video call 1-on-1 privat, atur tarif interaksi premium, dan kelola pemesanan jadwal langsung di satu tempat.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KIRI: SELECTION & FORM BOOKING */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="text-indigo-400 h-5 w-5" />
                  Buat Janji Baru
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">
                  Pilih host, tanggal, dan slot jam untuk panggilan privat.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Host selector */}
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold text-xs">Pilih Host</Label>
                  {hosts.length === 0 ? (
                    <p className="text-neutral-500 text-xs italic">Tidak ada host aktif saat ini.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                      {hosts.map((host) => (
                        <button
                          key={host.id}
                          onClick={() => setSelectedHost(host)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                            selectedHost?.id === host.id
                              ? "bg-indigo-600/20 border-indigo-500"
                              : "bg-neutral-950/50 border-neutral-900 hover:border-neutral-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-[10px]">
                              {host.username?.[0]?.toUpperCase() || "H"}
                            </div>
                            <span className="text-xs font-bold text-neutral-200">{host.username || host.email}</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-bold">Pilih</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedHost && (
                  <form onSubmit={handleRequestBooking} className="space-y-4 pt-2 border-t border-neutral-800/80">
                    <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 text-xs space-y-1">
                      <p className="text-neutral-400">Host Terpilih: <span className="text-white font-bold">{selectedHost.username}</span></p>
                      <p className="text-neutral-400">Tarif Panggilan: <span className="text-indigo-400 font-bold">100 Koin NV / Menit</span></p>
                    </div>

                    {/* Date picker */}
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Tanggal</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-neutral-950 border-neutral-800 text-xs text-white"
                      />
                    </div>

                    {/* Available slots selection */}
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs flex justify-between">
                        <span>Jam Tersedia</span>
                        {loadingSlots && <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />}
                      </Label>
                      {availableSlots.length === 0 ? (
                        <p className="text-neutral-500 text-xs italic bg-neutral-950/40 p-3 rounded-xl text-center">
                          {loadingSlots ? "Memeriksa jadwal..." : "Tidak ada jadwal kosong untuk tanggal ini."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto">
                          {availableSlots.map((slot) => (
                            <button
                              type="button"
                              key={slot.start_time}
                              onClick={() => setSelectedSlot(slot.start_time)}
                              className={`p-2 rounded-lg border text-center text-xs font-semibold transition ${
                                selectedSlot === slot.start_time
                                  ? "bg-indigo-600 text-white border-transparent"
                                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {slot.start_time?.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Durasi Panggilan (Menit)</Label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="15">15 Menit (1.500 Koin)</option>
                        <option value="30">30 Menit (3.000 Koin)</option>
                        <option value="60">60 Menit (6.000 Koin)</option>
                      </select>
                    </div>

                    {/* Call Type selector */}
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Tipe Panggilan</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCallType("video")}
                          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                            callType === "video"
                              ? "bg-indigo-600/20 border-indigo-500 text-white"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          <Video className="h-3.5 w-3.5" /> Video Call
                        </button>
                        <button
                          type="button"
                          onClick={() => setCallType("voice")}
                          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                            callType === "voice"
                              ? "bg-indigo-600/20 border-indigo-500 text-white"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          <Phone className="h-3.5 w-3.5" /> Voice Call
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-xs">Catatan / Kebutuhan</Label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Diskusi kerja sama agensi..."
                        className="bg-neutral-950 border-neutral-800 text-xs text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!selectedSlot}
                      className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-900/25"
                    >
                      Ajukan Booking Sekarang
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KANAN: DAFTAR BOOKING USER & HOST MANAGEMENT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. HOST PANEL (IF ROLE HOST) */}
            {(session?.user?.role === "host" || session?.user?.role === "admin") && (
              <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-pink-400">
                    <Users className="h-5 w-5" />
                    Permintaan Booking Masuk (Sebagai Host)
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">
                    Konfirmasi atau tolak jadwal konsultasi interaktif yang diajukan penonton.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                  {hostBookings.length === 0 ? (
                    <div className="text-center py-10 text-xs text-neutral-500 italic">
                      Belum ada permintaan booking masuk dari penonton.
                    </div>
                  ) : (
                    hostBookings.map((b) => (
                      <div key={b.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-neutral-500 font-bold bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                              {b.booking_code}
                            </span>
                            <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full ${getStatusColor(b.status)}`}>
                              {b.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white font-bold">Penonton ID: {b.user_id.slice(0, 8)}</p>
                          <p className="text-neutral-400 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(b.scheduled_at).toLocaleString("id-ID")} ({b.duration_minutes} Menit)
                          </p>
                          {b.user_notes && <p className="text-neutral-500 italic">" {b.user_notes} "</p>}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                          {b.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptBooking(b.id)}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold flex-1 md:flex-none text-xs rounded-xl"
                              >
                                Terima
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActiveRejectId(b.id)}
                                className="font-bold flex-1 md:flex-none text-xs rounded-xl"
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {b.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartCall(b.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex-1 md:flex-none text-xs rounded-xl"
                            >
                              Mulai Video Call
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Reject dialog mockup inline */}
                  {activeRejectId && (
                    <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl space-y-3">
                      <Label className="text-xs font-bold text-red-400">Berikan Alasan Penolakan:</Label>
                      <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Jadwal bertabrakan dengan Live Stream utama..."
                        className="bg-neutral-900 border-neutral-800 text-xs text-white"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRejectBooking(activeRejectId)} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">Tolak Permanen</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setActiveRejectId(null); setRejectReason(""); }} className="text-xs text-neutral-400 hover:text-white rounded-xl">Batal</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 2. USER PANEL (MY REQUESTED BOOKINGS) */}
            <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-400">
                  <CheckCircle className="h-5 w-5" />
                  Reservasi Jadwal Saya (Sebagai Penonton)
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">
                  Pantau janji temu panggilan video 1-on-1 dengan host favorit Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[450px] overflow-y-auto">
                {myBookings.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-500 italic">
                    Belum ada reservasi jadwal diajukan. Mulai booking di sebelah kiri!
                  </div>
                ) : (
                  myBookings.map((b) => (
                    <div key={b.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-neutral-500 font-bold bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                            {b.booking_code}
                          </span>
                          <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full ${getStatusColor(b.status)}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-bold">Host ID: {b.host_id.slice(0, 8)}</p>
                        <p className="text-neutral-400 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-400" />
                          {new Date(b.scheduled_at).toLocaleString("id-ID")} ({b.duration_minutes} Menit)
                        </p>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        {b.status === "accepted" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartCall(b.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex-1 md:flex-none text-xs rounded-xl shadow-lg shadow-indigo-900/35"
                          >
                            <Video className="h-3.5 w-3.5 mr-1" /> Mulai Panggilan Video
                          </Button>
                        )}
                        {b.status === "pending" && (
                          <span className="text-[10px] text-neutral-500 font-medium italic border border-neutral-800 px-3 py-1.5 rounded-xl bg-neutral-950/40">
                            Menunggu persetujuan host...
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
      )}
    </div>
  );
}
