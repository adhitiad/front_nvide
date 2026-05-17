"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Video, 
  Play, 
  Radio, 
  Loader2, 
  Calendar, 
  Bell, 
  BellOff, 
  Users, 
  Clock, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  Trash2,
  CalendarDays,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function StreamsPage() {
  const router = useRouter();
  
  // Tab State: "live" | "schedules"
  const [activeTab, setActiveTab] = useState<"live" | "schedules">("live");
  
  // Live Streams States
  const [streams, setStreams] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  
  // Schedules States
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [trendingSchedules, setTrendingSchedules] = useState<any[]>([]);
  const [myReminders, setMyReminders] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Modal State for Live
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDesc, setStreamDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [liveError, setLiveError] = useState("");

  // Modal State for Schedule Creation
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    category: "gaming",
    schedule_type: "one_time", // "one_time" | "recurring"
    scheduled_at: "", // datetime-local
    expected_duration_minutes: 60,
    max_wait_room_users: 500,
    recurrence_rule: "", // "daily" | "weekly"
    recurrence_time: "19:00",
    timezone: "Asia/Jakarta"
  });

  // Fetch functions
  const fetchLiveStreams = async () => {
    try {
      setLoadingLive(true);
      const data = await api.get("/streams/live") as any;
      setStreams(Array.isArray(data) ? data : (data?.streams || []));
    } catch (err) {
      console.error("Gagal memuat stream", err);
      setStreams([]);
    } finally {
      setLoadingLive(false);
    }
  };

  const fetchScheduleCenter = async () => {
    try {
      setLoadingSchedules(true);
      // Fetch upcoming feed
      const upcomingData = await api.get("/discover/upcoming") as any[];
      setUpcomingSchedules(Array.isArray(upcomingData) ? upcomingData : []);

      // Fetch trending schedules
      const trendingData = await api.get("/discover/trending-schedules") as any[];
      setTrendingSchedules(Array.isArray(trendingData) ? trendingData : []);

      // Fetch user's reminders
      const reminderData = await api.get("/users/me/reminders") as any[];
      setMyReminders(Array.isArray(reminderData) ? reminderData : []);
    } catch (err) {
      console.error("Gagal memuat data jadwal", err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    if (activeTab === "live") {
      fetchLiveStreams();
    } else {
      fetchScheduleCenter();
    }
  }, [activeTab]);

  // Handle Quick Live
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setLiveError("");

    try {
      const res = await api.post("/streams", { 
        title: streamTitle, 
        description: streamDesc,
        is_private: false
      }) as any;

      const streamId = res.id || res.stream?.id;
      if (streamId) {
        await api.post(`/streams/${streamId}/start`);
        toast.success("Siaran langsung Anda berhasil dimulai!");
        router.push(`/dashboard/streams/${streamId}`);
      }
      setIsCreateOpen(false);
      setStreamTitle("");
      setStreamDesc("");
    } catch (err: any) {
      setLiveError(err.response?.data?.message || err.message || "Gagal membuat stream.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Schedule Creation
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);

    try {
      const payload: any = {
        title: scheduleForm.title,
        description: scheduleForm.description,
        category: scheduleForm.category,
        schedule_type: scheduleForm.schedule_type,
        expected_duration_minutes: Number(scheduleForm.expected_duration_minutes),
        max_wait_room_users: Number(scheduleForm.max_wait_room_users),
        timezone: scheduleForm.timezone,
      };

      if (scheduleForm.schedule_type === "one_time") {
        if (!scheduleForm.scheduled_at) {
          toast.error("Waktu mulai terjadwal wajib diisi!");
          setIsScheduling(false);
          return;
        }
        payload.scheduled_at = new Date(scheduleForm.scheduled_at).toISOString();
      } else {
        payload.recurrence_rule = scheduleForm.recurrence_rule || "daily";
        payload.recurrence_time = scheduleForm.recurrence_time;
        payload.recurrence_start_date = new Date().toISOString();
        // End date 30 days from now by default
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        payload.recurrence_end_date = endDate.toISOString();
      }

      await api.post("/streams/schedules", payload);
      toast.success("Jadwal siaran langsung berhasil dibuat!");
      setIsScheduleOpen(false);
      // Reset form
      setScheduleForm({
        title: "",
        description: "",
        category: "gaming",
        schedule_type: "one_time",
        scheduled_at: "",
        expected_duration_minutes: 60,
        max_wait_room_users: 500,
        recurrence_rule: "",
        recurrence_time: "19:00",
        timezone: "Asia/Jakarta"
      });
      fetchScheduleCenter();
    } catch (err: any) {
      toast.error("Gagal menjadwalkan siaran: " + (err.response?.data?.message || err.message));
    } finally {
      setIsScheduling(false);
    }
  };

  // Smart Reminder Actions
  const handleSubscribeReminder = async (scheduleId: string) => {
    try {
      await api.post(`/streams/schedules/${scheduleId}/reminders`, {
        remind_24h: true,
        remind_1h: true,
        remind_15m: true,
        remind_live_start: true,
        push_enabled: true
      });
      toast.success("Lonceng pengingat diaktifkan! Kami akan kabari Anda sebelum live dimulai.");
      fetchScheduleCenter();
    } catch (err: any) {
      toast.error("Gagal mengaktifkan pengingat: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnsubscribeReminder = async (scheduleId: string) => {
    try {
      await api.delete(`/streams/schedules/${scheduleId}/reminders`);
      toast.warning("Pengingat dinonaktifkan.");
      fetchScheduleCenter();
    } catch (err: any) {
      toast.error("Gagal menonaktifkan pengingat: " + (err.response?.data?.message || err.message));
    }
  };

  // Helper Countdown & Wait Room validation
  const getCountdownText = (startAtStr: string) => {
    const start = new Date(startAtStr);
    const diffMs = start.getTime() - Date.now();
    if (diffMs <= 0) return "Siaran dimulai";

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} hari lagi`;
    }
    if (hours > 0) {
      return `${hours}j ${mins}m lagi`;
    }
    return `${mins}m lagi`;
  };

  const isWaitRoomAvailable = (startAtStr: string) => {
    const start = new Date(startAtStr);
    const diffMs = start.getTime() - Date.now();
    // Wait room opens 5 minutes (300000 ms) before the schedule
    // And is still open even if start time is past but host hasn't ended/started stream yet
    return diffMs <= 300000;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 bg-black min-h-screen text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <Radio className="h-8 w-8 text-indigo-400" />
            NVide Live Studio & Discovery
          </h1>
          <p className="text-sm text-neutral-400 mt-2 font-light">
            Tonton siaran langsung interaktif atau rancang jadwal siaran Anda untuk mengumpulkan penonton di Ruang Tunggu.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Quick Stream Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 border border-indigo-500/20">
                <Radio className="mr-2 h-4 w-4" />
                Live Instan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-indigo-400" /> Siaran Langsung Instan
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Mulai pemancaran feed kamera/layar Anda ke server global secara asinkron.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStream}>
                <div className="grid gap-4 py-4">
                  {liveError && (
                    <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg">
                      {liveError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-neutral-300">Judul Siaran</Label>
                    <Input 
                      id="title" 
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Membahas update server v2..." 
                      required
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-neutral-300">Deskripsi Live</Label>
                    <Input 
                      id="desc" 
                      value={streamDesc}
                      onChange={(e) => setStreamDesc(e.target.value)}
                      placeholder="Mabar santai plus bagi-bagi reward menarik!" 
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isCreating || !streamTitle} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-lg"
                  >
                    {isCreating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuka Ingest RTMP...</>
                    ) : "Buka Room & Live"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Schedule Creator Dialog */}
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-neutral-800 hover:bg-neutral-900 text-neutral-300 rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Jadwalkan Live
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" /> Buat Jadwal Siaran Baru
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Jadwalkan sesi live mendatang. Pengikut Anda akan menerima notifikasi otomatis dan bisa masuk ruang tunggu pra-siar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSchedule}>
                <div className="grid gap-4 py-3 text-sm">
                  <div className="space-y-1">
                    <Label htmlFor="sched_title" className="text-neutral-300 text-xs font-semibold">Judul Jadwal Siaran</Label>
                    <Input 
                      id="sched_title" 
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      placeholder="Jadwal Live Mingguan: Deep Dive WebRTC" 
                      required
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sched_desc" className="text-neutral-300 text-xs font-semibold">Deskripsi / Rincian Acara</Label>
                    <Input 
                      id="sched_desc" 
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                      placeholder="Q&A interaktif, live coding, dan reveal fitur baru" 
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-neutral-300 text-xs font-semibold">Kategori Acara</Label>
                      <select 
                        value={scheduleForm.category}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                      >
                        <option value="gaming">Gaming</option>
                        <option value="education">Edukasi / Coding</option>
                        <option value="chatting">Just Chatting</option>
                        <option value="music">Musik & Hiburan</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-neutral-300 text-xs font-semibold">Tipe Jadwal</Label>
                      <select 
                        value={scheduleForm.schedule_type}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, schedule_type: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                      >
                        <option value="one_time">Siaran Sekali (One Time)</option>
                        <option value="recurring">Siaran Berulang (Recurring)</option>
                      </select>
                    </div>
                  </div>

                  {scheduleForm.schedule_type === "one_time" ? (
                    <div className="space-y-1">
                      <Label htmlFor="sched_at" className="text-neutral-300 text-xs font-semibold">Waktu Mulai Terjadwal</Label>
                      <Input 
                        id="sched_at" 
                        type="datetime-local"
                        value={scheduleForm.scheduled_at}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                        required={scheduleForm.schedule_type === "one_time"}
                        className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-neutral-300 text-xs font-semibold">Pola Perulangan</Label>
                        <select 
                          value={scheduleForm.recurrence_rule}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, recurrence_rule: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                        >
                          <option value="daily">Setiap Hari (Daily)</option>
                          <option value="weekly">Setiap Minggu (Weekly)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="recur_time" className="text-neutral-300 text-xs font-semibold">Jam Siar (Format HH:MM)</Label>
                        <Input 
                          id="recur_time" 
                          placeholder="Contoh: 19:00"
                          value={scheduleForm.recurrence_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, recurrence_time: e.target.value })}
                          required={scheduleForm.schedule_type === "recurring"}
                          className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="duration" className="text-neutral-300 text-xs font-semibold">Estimasi Durasi (Menit)</Label>
                      <Input 
                        id="duration" 
                        type="number"
                        value={scheduleForm.expected_duration_minutes}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, expected_duration_minutes: parseInt(e.target.value) })}
                        required
                        className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="max_users" className="text-neutral-300 text-xs font-semibold">Batas Kuota Wait Room</Label>
                      <Input 
                        id="max_users" 
                        type="number"
                        value={scheduleForm.max_wait_room_users}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, max_wait_room_users: parseInt(e.target.value) })}
                        required
                        className="bg-neutral-950 border-neutral-800 text-neutral-100 focus-visible:ring-indigo-500 h-9"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button 
                    type="submit"
                    disabled={isScheduling || !scheduleForm.title} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-10 rounded-lg shadow-lg shadow-indigo-900/40"
                  >
                    {isScheduling ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan Jadwal...</>
                    ) : "Simpan & Jadwalkan Siaran"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* DOUBLE NAVIGATION TABS */}
      <div className="flex border-b border-neutral-800 pb-px">
        <button
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold transition-all ${
            activeTab === "live"
              ? "border-indigo-500 text-indigo-400 font-extrabold"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4" />
          Live Streaming Sekarang ({streams.length})
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold transition-all relative ${
            activeTab === "schedules"
              ? "border-indigo-500 text-indigo-400 font-extrabold"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Jadwal Live & Wait Room
          {upcomingSchedules.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-900 text-indigo-300 font-bold border border-indigo-500/20">
              {upcomingSchedules.length}
            </span>
          )}
        </button>
      </div>

      {/* RENDER CONTENT PANELS */}
      {activeTab === "live" ? (
        <>
          {loadingLive ? (
            <div className="flex items-center justify-center py-20 text-neutral-400">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-500" />
              Menghubungkan ke server media...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.length > 0 ? (
                streams.map((stream) => (
                  <Card key={stream.id} className="bg-neutral-900/40 border-neutral-800 text-neutral-100 overflow-hidden hover:border-neutral-700 hover:shadow-2xl transition-all relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                    <div className="aspect-video bg-neutral-950 flex items-center justify-center relative">
                      <Video className="h-12 w-12 text-neutral-800" />
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse shadow-md shadow-red-950">
                        LIVE
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded">
                        {stream.viewers || 0} Viewers
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg font-bold line-clamp-1 text-white">{stream.title}</CardTitle>
                      <CardDescription className="text-neutral-400 text-xs mt-1">Host: @{stream.host?.username || stream.host_id || "Broadcaster"}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 py-2">
                      <p className="text-neutral-400 text-xs line-clamp-2 font-light">
                        {stream.description || "Selamat datang di live streaming interaktif NVide."}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-2">
                      <Button 
                        onClick={() => router.push(`/dashboard/streams/${stream.id}/watch`)}
                        variant="secondary" 
                        className="w-full bg-white text-black hover:bg-neutral-200 rounded-xl font-bold transition-all"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Tonton Siaran
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-neutral-900/10 border border-neutral-850 border-dashed rounded-2xl">
                  <Radio className="mx-auto h-12 w-12 text-neutral-600 mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium text-white mb-2">Tidak ada stream aktif</h3>
                  <p className="text-sm text-neutral-400 font-light max-w-md mx-auto">
                    Belum ada host yang bersiaran langsung saat ini. Klik tombol "Live Instan" di atas untuk menyiarkan feed Anda!
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* SCHEDULES TAB PANEL (Fitur 7) */
        <div className="space-y-8">
          {loadingSchedules ? (
            <div className="flex items-center justify-center py-20 text-neutral-400">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-500" />
              Menyinkronkan jadwal siaran...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left & Middle: Upcoming Schedules Feed & Trending */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Trending Schedules Section */}
                {trendingSchedules.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Flame className="text-amber-500 h-5 w-5 animate-pulse" />
                      Jadwal Populer Paling Ditunggu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trendingSchedules.map((occ) => {
                        const hasReminder = myReminders.some(r => r.schedule_id === occ.schedule_id);
                        const wrAvailable = isWaitRoomAvailable(occ.occurrence_start_at);
                        
                        return (
                          <Card key={occ.id} className="bg-gradient-to-br from-neutral-900 to-indigo-950/20 border-neutral-800 hover:border-indigo-500/30 text-white relative overflow-hidden transition-all shadow-xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-300 font-mono font-bold uppercase">
                                  Trending Schedule
                                </span>
                                <span className="text-xs text-amber-400 font-bold flex items-center gap-1 font-mono">
                                  <Clock className="h-3 w-3" />
                                  {getCountdownText(occ.occurrence_start_at)}
                                </span>
                              </div>
                              <CardTitle className="text-base font-bold mt-2 text-white line-clamp-1">{occ.schedule_title}</CardTitle>
                              <CardDescription className="text-xs text-neutral-400 mt-1">Host: @{occ.host_username}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-xs text-neutral-300 space-y-3 pb-3">
                              <p className="line-clamp-2 font-light text-neutral-400">{occ.schedule_description || "Sesi siaran interaktif global."}</p>
                              <div className="flex justify-between items-center text-[11px] text-neutral-500 font-mono border-t border-neutral-850 pt-2.5">
                                <span>Mulai: {new Date(occ.occurrence_start_at).toLocaleString()}</span>
                                <span>Max Room: {occ.max_wait_room_users || 500}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-1 gap-2">
                              {wrAvailable ? (
                                <Button 
                                  onClick={() => router.push(`/dashboard/streams/wait-room/${occ.id}`)}
                                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-950/40"
                                >
                                  Masuk Wait Room <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              ) : (
                                <Button 
                                  onClick={() => hasReminder ? handleUnsubscribeReminder(occ.schedule_id) : handleSubscribeReminder(occ.schedule_id)}
                                  className={`w-full font-bold rounded-xl h-9 transition-all text-xs ${
                                    hasReminder 
                                      ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300" 
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-950"
                                  }`}
                                >
                                  {hasReminder ? (
                                    <><BellOff className="h-3.5 w-3.5 mr-1" /> Matikan Pengingat</>
                                  ) : (
                                    <><Bell className="h-3.5 w-3.5 mr-1" /> Ingatkan Saya</>
                                  )}
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Main Upcoming Feed Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDays className="text-indigo-400 h-5 w-5" />
                    Semua Jadwal Siaran Mendatang
                  </h3>
                  <div className="space-y-4">
                    {upcomingSchedules.length > 0 ? (
                      upcomingSchedules.map((occ) => {
                        const hasReminder = myReminders.some(r => r.schedule_id === occ.schedule_id);
                        const wrAvailable = isWaitRoomAvailable(occ.occurrence_start_at);

                        return (
                          <div key={occ.id} className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            
                            <div className="space-y-2 max-w-xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] bg-neutral-800 border border-neutral-750 px-2 py-0.5 rounded text-neutral-400 font-semibold uppercase">
                                  {occ.category || "General"}
                                </span>
                                <span className="text-xs text-indigo-400 font-semibold font-mono flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Mulai: {new Date(occ.occurrence_start_at).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-white line-clamp-1">{occ.schedule_title}</h4>
                              <p className="text-xs text-neutral-400 font-light line-clamp-2">{occ.schedule_description || "Tidak ada detail tambahan."}</p>
                              <div className="text-[11px] text-neutral-500 font-mono">
                                Host: <span className="text-neutral-300">@{occ.host_username}</span> | Countdown: <span className="text-amber-400 font-bold">{getCountdownText(occ.occurrence_start_at)}</span>
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto min-w-[150px]">
                              {wrAvailable ? (
                                <Button 
                                  onClick={() => router.push(`/dashboard/streams/wait-room/${occ.id}`)}
                                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl transition-all shadow-lg"
                                >
                                  Masuk Wait Room <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              ) : (
                                <Button 
                                  onClick={() => hasReminder ? handleUnsubscribeReminder(occ.schedule_id) : handleSubscribeReminder(occ.schedule_id)}
                                  variant="outline"
                                  className={`w-full border-neutral-800 text-xs font-bold rounded-xl h-10 ${
                                    hasReminder 
                                      ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-400" 
                                      : "hover:bg-neutral-900 text-neutral-300"
                                  }`}
                                >
                                  {hasReminder ? (
                                    <><BellOff className="h-3.5 w-3.5 mr-1" /> Jangan Ingatkan</>
                                  ) : (
                                    <><Bell className="h-3.5 w-3.5 mr-1" /> Ingatkan Saya</>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-16 bg-neutral-900/10 border border-dashed border-neutral-850 rounded-2xl">
                        <Calendar className="mx-auto h-10 w-10 text-neutral-700 mb-3" />
                        <p className="text-sm text-neutral-400 font-light">Belum ada jadwal live mendatang yang tercantum.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: User's Reminders Checklist */}
              <div className="space-y-6">
                <Card className="bg-neutral-900/20 border-neutral-850 text-white shadow-2xl backdrop-blur-md p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"></div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-neutral-850 pb-3">
                    <Bell className="text-pink-400 h-5 w-5" />
                    Lonceng Pengingat Saya
                  </h3>
                  
                  <div className="space-y-4">
                    {myReminders.length > 0 ? (
                      myReminders.map((occ) => (
                        <div key={occ.id} className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-xl space-y-2 hover:border-neutral-800 transition-colors">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-pink-950/80 border border-pink-500/20 px-2 py-0.5 rounded font-mono text-pink-400 font-bold uppercase">
                              Active Reminder
                            </span>
                            <button 
                              onClick={() => handleUnsubscribeReminder(occ.schedule_id)} 
                              className="text-neutral-500 hover:text-red-400 transition-colors"
                              title="Matikan pengingat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{occ.schedule_title}</h4>
                          <div className="text-[10px] text-neutral-500 space-y-0.5">
                            <div>Host: @{occ.host_username}</div>
                            <div className="text-amber-400 font-semibold font-mono">Live: {new Date(occ.occurrence_start_at).toLocaleTimeString()}</div>
                          </div>
                          
                          {isWaitRoomAvailable(occ.occurrence_start_at) && (
                            <Button 
                              onClick={() => router.push(`/dashboard/streams/wait-room/${occ.id}`)}
                              className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold rounded-lg h-7 mt-1"
                            >
                              Buka Wait Room
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-neutral-500 text-xs font-light">
                        <BellOff className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                        Belum mengaktifkan pengingat apapun.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
