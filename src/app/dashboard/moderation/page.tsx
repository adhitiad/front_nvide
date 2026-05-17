"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  ShieldAlert, 
  Settings, 
  Image as ImageIcon, 
  FileText, 
  Slash, 
  UserX, 
  Play, 
  Plus, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  EyeOff, 
  Activity,
  Flame,
  BadgeAlert
} from "lucide-react";

export default function ModerationControlCenter() {
  const [activeTab, setActiveTab] = useState<"rules" | "nsfw" | "logs" | "wordlist" | "override">("rules");
  const [loading, setLoading] = useState(false);

  // States
  const [rules, setRules] = useState<any[]>([]);
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [wordlist, setWordlist] = useState<any[]>([]);
  const [activeBans, setActiveBans] = useState<any[]>([]);

  // Form states
  const [newRule, setNewRule] = useState({
    rule_code: "",
    name: "",
    category: "content",
    condition_type: "nsfw_score",
    threshold: 0.8,
    time_window_seconds: 60,
    action: "warn",
    action_duration_seconds: 300,
    max_strikes: 3,
    applies_to: "all",
    priority: 1
  });

  const [newWord, setNewWord] = useState({
    word: "",
    severity_level: 2,
    language: "id",
    is_regex: false
  });

  const [overrideForm, setOverrideForm] = useState({
    username: "",
    action_type: "mute",
    reason: "",
    duration_minutes: 30
  });

  // Fetch functions
  const fetchRules = async () => {
    try {
      const data = await api.get("/moderation/rules");
      setRules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Gagal memuat aturan moderasi: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchPendingImages = async () => {
    try {
      const data = await api.get("/moderation/images/pending");
      setPendingImages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Gagal memuat antrean gambar NSFW: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await api.get("/moderation/logs?limit=30");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Gagal memuat log audit keamanan: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchWordlist = async () => {
    try {
      const data = await api.get("/moderation/wordlist");
      setWordlist(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Gagal memuat daftar kata terlarang: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchActiveBans = async () => {
    try {
      const data = await api.get("/moderation/active-bans");
      setActiveBans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Gagal memuat daftar ban aktif: " + (err.response?.data?.message || err.message));
    }
  };

  // Run on tab changes
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      if (activeTab === "rules") await fetchRules();
      if (activeTab === "nsfw") await fetchPendingImages();
      if (activeTab === "logs") await fetchLogs();
      if (activeTab === "wordlist") await fetchWordlist();
      if (activeTab === "override") await fetchActiveBans();
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  // Actions
  const handleToggleRule = async (rule: any) => {
    try {
      const updated = { ...rule, is_active: !rule.is_active };
      await api.put(`/moderation/rules/${rule.id}`, updated);
      toast.success(`Aturan ${rule.name} berhasil ${updated.is_active ? "diaktifkan" : "dinonaktifkan"}`);
      fetchRules();
    } catch (err: any) {
      toast.error("Gagal mengubah status aturan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/moderation/rules", newRule);
      toast.success("Aturan baru berhasil ditambahkan!");
      setNewRule({
        rule_code: "",
        name: "",
        category: "content",
        condition_type: "nsfw_score",
        threshold: 0.8,
        time_window_seconds: 60,
        action: "warn",
        action_duration_seconds: 300,
        max_strikes: 3,
        applies_to: "all",
        priority: 1
      });
      fetchRules();
    } catch (err: any) {
      toast.error("Gagal membuat aturan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim()) return;
    try {
      await api.post("/moderation/wordlist", newWord);
      toast.success(`Kata "${newWord.word}" berhasil dimasukkan ke daftar pencekalan!`);
      setNewWord({ word: "", severity_level: 2, language: "id", is_regex: false });
      fetchWordlist();
    } catch (err: any) {
      toast.error("Gagal menambahkan kata: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteWord = async (word: string) => {
    try {
      await api.delete(`/moderation/wordlist?word=${encodeURIComponent(word)}`);
      toast.success(`Kata "${word}" dihapus dari daftar.`);
      fetchWordlist();
    } catch (err: any) {
      toast.error("Gagal menghapus kata: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveImage = async (jobId: string) => {
    try {
      await api.post(`/moderation/images/${jobId}/approve`);
      toast.success("Gambar berhasil disetujui (Aman)!");
      fetchPendingImages();
    } catch (err: any) {
      toast.error("Gagal memproses persetujuan gambar: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectImage = async (jobId: string) => {
    try {
      await api.post(`/moderation/images/${jobId}/reject`);
      toast.warning("Gambar ditolak dan disensor (BLURRED)!");
      fetchPendingImages();
    } catch (err: any) {
      toast.error("Gagal memproses penolakan gambar: " + (err.response?.data?.message || err.message));
    }
  };

  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideForm.username.trim() || !overrideForm.reason.trim()) {
      toast.error("Username dan alasan penindakan wajib diisi!");
      return;
    }

    try {
      // Periksa apakah username ada terlebih dahulu di server
      const exists = await api.get(`/auth/exists?username=${encodeURIComponent(overrideForm.username)}`) as any;
      if (!exists && !exists.exists) {
        toast.error("Username tidak ditemukan di sistem!");
        return;
      }
    } catch (err) {
      // Skip if checking route is not available, proceed anyway
    }

    try {
      // Fetch user profile by username or just proceed to manual override endpoint
      const durationSec = overrideForm.duration_minutes * 60;
      await api.post("/moderation/override", {
        username: overrideForm.username,
        action_type: overrideForm.action_type,
        reason: overrideForm.reason,
        duration_seconds: durationSec
      });

      toast.success(`Tindakan ${overrideForm.action_type.toUpperCase()} sukses diterapkan ke @${overrideForm.username}!`);
      setOverrideForm({ username: "", action_type: "mute", reason: "", duration_minutes: 30 });
      fetchActiveBans();
    } catch (err: any) {
      toast.error("Gagal melakukan penindakan manual: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 bg-black min-h-screen text-white font-sans selection:bg-red-600 selection:text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Safety & Auto-Moderation Engine
          </h1>
          <p className="text-sm text-neutral-400 mt-2 font-light">
            Panel kendali perlindungan real-time asinkron: Mencegah pornografi, spam, pelecehan, dan manipulasi gift secara instan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              if (activeTab === "rules") fetchRules();
              if (activeTab === "nsfw") fetchPendingImages();
              if (activeTab === "logs") fetchLogs();
              if (activeTab === "wordlist") fetchWordlist();
              if (activeTab === "override") fetchActiveBans();
              toast.success("Data berhasil disegarkan!");
            }} 
            variant="outline" 
            className="border-neutral-800 hover:bg-neutral-900 text-neutral-300 rounded-full p-2 h-10 w-10 flex items-center justify-center transition-transform hover:rotate-180 duration-500"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="text-xs bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-full font-semibold text-red-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            <Activity className="h-3.5 w-3.5 animate-pulse text-red-500" />
            SHIELD ACTIVE
          </div>
        </div>
      </div>

      {/* PREMIUM TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2.5 p-1.5 bg-neutral-950 border border-neutral-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === "rules"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          }`}
        >
          <Settings className="h-4 w-4" />
          Aturan Keselamatan
        </button>
        <button
          onClick={() => setActiveTab("nsfw")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
            activeTab === "nsfw"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Sensor NSFW ({pendingImages.length})
          {pendingImages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
              !
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === "logs"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          }`}
        >
          <FileText className="h-4 w-4" />
          Log Audit Keamanan
        </button>
        <button
          onClick={() => setActiveTab("wordlist")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === "wordlist"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          }`}
        >
          <Slash className="h-4 w-4" />
          Daftar Kata Terlarang
        </button>
        <button
          onClick={() => setActiveTab("override")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === "override"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          }`}
        >
          <UserX className="h-4 w-4" />
          Emergency Override
        </button>
      </div>

      {/* CONTENT INNER CONTAINER */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm text-neutral-400 animate-pulse font-light">Menyelaraskan data dari pusat komando...</p>
          </div>
        ) : (
          <>
            {/* 1. RULES TAB */}
            {activeTab === "rules" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column: List Rules */}
                  <div className="xl:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="text-indigo-400 h-5 w-5" />
                      Aturan Deteksi Aktif
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rules.map((rule) => (
                        <Card key={rule.id} className="bg-neutral-900/40 border-neutral-800/80 text-white shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${rule.is_active ? "bg-indigo-500" : "bg-neutral-700"}`}></div>
                          <CardHeader className="pb-2 pl-6">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/20 px-2 py-0.5 rounded font-mono text-indigo-400 font-bold uppercase tracking-wider">
                                {rule.rule_code}
                              </span>
                              <Button 
                                onClick={() => handleToggleRule(rule)} 
                                variant="outline" 
                                size="sm" 
                                className={`rounded-full border-0 text-xs px-3 font-semibold h-7 ${
                                  rule.is_active 
                                    ? "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/50" 
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-750"
                                }`}
                              >
                                {rule.is_active ? (
                                  <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Aktif</span>
                                ) : (
                                  <span className="flex items-center gap-1"><X className="h-3 w-3" /> Nonaktif</span>
                                )}
                              </Button>
                            </div>
                            <CardTitle className="text-base font-bold mt-2 text-white">{rule.name}</CardTitle>
                            <CardDescription className="text-xs text-neutral-400 font-light mt-1 uppercase tracking-wider">
                              Category: {rule.category} | Target: {rule.applies_to}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-xs text-neutral-300 pl-6 pb-4">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Threshold:</span>
                              <span className="font-mono text-amber-400 font-bold">{rule.threshold}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Masa Evaluasi:</span>
                              <span>{rule.time_window_seconds} detik</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Sanksi:</span>
                              <span className="text-red-400 font-bold uppercase tracking-wider">{rule.action}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Maks. Peringatan (Strikes):</span>
                              <span className="font-semibold text-white">{rule.max_strikes}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {rules.length === 0 && (
                        <div className="col-span-2 text-center py-10 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-xl">
                          <AlertCircle className="h-10 w-10 text-neutral-600 mx-auto mb-2" />
                          <p className="text-sm text-neutral-400 font-light">Belum ada aturan keamanan yang terdaftar.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Create Rule Form */}
                  <Card className="bg-neutral-900/20 border-neutral-800 text-white p-6 shadow-2xl backdrop-blur-md">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
                      <Plus className="text-indigo-400 h-5 w-5" />
                      Tambah Aturan Deteksi
                    </h3>
                    <form onSubmit={handleCreateRule} className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Rule Code (Unique)</label>
                        <Input 
                          placeholder="CONTOH: repeated_content_filter" 
                          value={newRule.rule_code}
                          onChange={(e) => setNewRule({ ...newRule, rule_code: e.target.value })}
                          className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-indigo-500 h-9"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Rule Name</label>
                        <Input 
                          placeholder="Nama Aturan Deskriptif" 
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-indigo-500 h-9"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Category</label>
                          <select 
                            value={newRule.category}
                            onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                          >
                            <option value="content">Content</option>
                            <option value="behavior">Behavior</option>
                            <option value="spam">Spam</option>
                            <option value="fraud">Fraud</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Applies To</label>
                          <select 
                            value={newRule.applies_to}
                            onChange={(e) => setNewRule({ ...newRule, applies_to: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                          >
                            <option value="all">All</option>
                            <option value="chat">Chat Messages</option>
                            <option value="stream">Live Streams</option>
                            <option value="gift">Gifts</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Tipe Kondisi</label>
                          <select 
                            value={newRule.condition_type}
                            onChange={(e) => setNewRule({ ...newRule, condition_type: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                          >
                            <option value="nsfw_score">NSFW Score</option>
                            <option value="repeated_message">Repeated Message</option>
                            <option value="gift_velocity">Gift Velocity</option>
                            <option value="toxicity_score">Toxicity Score</option>
                            <option value="caps_ratio">Caps Ratio</option>
                            <option value="link_count">Link Count</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Ambang Batas (Threshold)</label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            value={newRule.threshold}
                            onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                            className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-indigo-500 h-9"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Sanksi Otomatis</label>
                          <select 
                            value={newRule.action}
                            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-indigo-500"
                          >
                            <option value="warn">Warn (Kirim Peringatan)</option>
                            <option value="mute">Mute (Bisukan Sementara)</option>
                            <option value="kick">Kick (Keluarkan Dari Room)</option>
                            <option value="ban_temp">Ban Temp (Blokir Sementara)</option>
                            <option value="ban_perm">Ban Permanent</option>
                            <option value="blur_image">Blur Image (Sensor Foto)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Durasi Sanksi (Detik)</label>
                          <Input 
                            type="number" 
                            value={newRule.action_duration_seconds}
                            onChange={(e) => setNewRule({ ...newRule, action_duration_seconds: parseInt(e.target.value) })}
                            className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-indigo-500 h-9"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 mt-2 rounded-lg shadow-lg shadow-indigo-900/40">
                        Kirim & Pasang Aturan
                      </Button>
                    </form>
                  </Card>
                </div>
              </div>
            )}

            {/* 2. NSFW SCAN QUEUE TAB */}
            {activeTab === "nsfw" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="text-pink-500 h-5 w-5" />
                  Antrean Deteksi Gambar NSFW Asinkron
                </h3>
                <p className="text-xs text-neutral-400 font-light max-w-2xl">
                  Seluruh file thumbnail stream, story, atau avatar yang dideteksi oleh simulator pemindai didaftarkan di sini sebelum dinilai oleh AI. Administrator memiliki override penuh untuk meloloskan atau memblokir gambar.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                  {pendingImages.map((job) => (
                    <Card key={job.id} className="bg-neutral-900 border-neutral-800 text-white overflow-hidden shadow-2xl relative group">
                      <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={job.image_url} 
                          alt="Moderation Target" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md border border-neutral-800 px-2 py-0.5 rounded text-[10px] text-pink-400 font-mono font-bold uppercase">
                          {job.source_type}
                        </div>
                        {job.nsfw_score !== null && (
                          <div className={`absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            job.nsfw_score >= 0.8 ? "bg-red-900/80 border border-red-500/50 text-red-300" : "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                          }`}>
                            NSFW: {(job.nsfw_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Status:</span>
                            <span className="font-semibold text-amber-400 uppercase tracking-wider">{job.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Source ID:</span>
                            <span className="font-mono text-neutral-400">{job.source_id.slice(0, 8)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500 font-light">Waktu Masuk:</span>
                            <span className="text-neutral-400 font-light">{new Date(job.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button 
                            onClick={() => handleApproveImage(job.id)}
                            className="bg-emerald-950/80 border border-emerald-500/20 hover:bg-emerald-900 text-emerald-400 text-xs font-bold rounded-lg h-9"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                            Lolosan
                          </Button>
                          <Button 
                            onClick={() => handleRejectImage(job.id)}
                            className="bg-red-950/80 border border-red-500/20 hover:bg-red-900 text-red-400 text-xs font-bold rounded-lg h-9"
                          >
                            <EyeOff className="h-3.5 w-3.5 mr-1" />
                            Sensor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingImages.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-neutral-900/10 border border-dashed border-neutral-850 rounded-2xl">
                      <ImageIcon className="h-12 w-12 text-neutral-700 mx-auto mb-3 animate-pulse" />
                      <p className="text-base text-neutral-400 font-medium">Bagus! Antrean Gambar Kosong</p>
                      <p className="text-xs text-neutral-500 font-light mt-1">Tidak ada gambar yang mencurigakan atau membutuhkan verifikasi manual saat ini.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. MODERATION LOGS TAB */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="text-amber-500 h-5 w-5" />
                    Buku Log Audit Tindakan Keselamatan
                  </h3>
                </div>

                <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-2xl bg-neutral-950">
                  <Table>
                    <TableHeader className="bg-neutral-900/60">
                      <TableRow className="border-neutral-850">
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Waktu</TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">User Target</TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Tindakan</TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Pemicu</TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Bukti Pelanggaran</TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Status Banding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} className="border-neutral-900 hover:bg-neutral-900/30 transition-colors">
                          <TableCell className="font-mono text-xs text-neutral-400">
                            {new Date(log.action_executed_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            @{log.username || log.user_id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.action_taken === "ban_perm" || log.action_taken === "ban_temp"
                                ? "bg-red-950/80 border border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                                : log.action_taken === "mute"
                                ? "bg-amber-950/80 border border-amber-500/30 text-amber-400"
                                : log.action_taken === "kick"
                                ? "bg-orange-950/80 border border-orange-500/30 text-orange-400"
                                : "bg-neutral-800 text-neutral-300"
                            }`}>
                              {log.action_taken}
                            </span>
                            {log.action_duration_seconds && (
                              <span className="text-[10px] text-neutral-500 block mt-0.5">
                                ({Math.round(log.action_duration_seconds / 60)} m)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              log.trigger_type === "auto" ? "bg-indigo-950 text-indigo-300" : "bg-neutral-800 text-neutral-400"
                            }`}>
                              {log.trigger_type}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-neutral-300 font-light" title={log.evidence_content}>
                            {log.evidence_content || <span className="text-neutral-600 font-light italic">Tidak ada konten</span>}
                          </TableCell>
                          <TableCell>
                            {log.is_appealed ? (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                log.appeal_status === "pending"
                                  ? "bg-amber-950 text-amber-400 animate-pulse border border-amber-500/20"
                                  : log.appeal_status === "approved"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                  : "bg-red-950 text-red-400 border border-red-500/20"
                              }`}>
                                banding: {log.appeal_status}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500 italic">Tidak mengajukan</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {logs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-neutral-500 font-light">
                            <Activity className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                            Belum ada tindakan keamanan yang dicatat hari ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* 4. FORBIDDEN WORDLIST TAB */}
            {activeTab === "wordlist" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column: Management */}
                  <div className="xl:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Slash className="text-emerald-500 h-5 w-5" />
                      Database Kata & Frasa Terlarang
                    </h3>
                    <p className="text-xs text-neutral-400 font-light">
                      Kata-kata yang terdaftar di bawah akan otomatis dideteksi dan disensor menjadi bintang-bintang (****) atau memicu poin penalti (strike) saat dikirimkan di chat room.
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-4">
                      {wordlist.map((w) => (
                        <div 
                          key={w.id} 
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            w.severity_level === 3 
                              ? "bg-red-950/60 border-red-500/30 text-red-400"
                              : w.severity_level === 2
                              ? "bg-amber-950/60 border-amber-500/30 text-amber-400"
                              : "bg-neutral-900 border-neutral-800 text-neutral-300"
                          }`}
                        >
                          <span className="font-mono">{w.word}</span>
                          <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded-full text-neutral-400">
                            {w.is_regex ? "Regex" : "Text"}
                          </span>
                          <button 
                            onClick={() => handleDeleteWord(w.word)} 
                            className="text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {wordlist.length === 0 && (
                        <div className="w-full text-center py-14 bg-neutral-900/10 border border-dashed border-neutral-800 rounded-xl">
                          <AlertCircle className="h-10 w-10 text-neutral-700 mx-auto mb-2" />
                          <p className="text-sm text-neutral-400 font-light">Daftar pencekalan kosong. Silakan tambahkan kata pertama Anda!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Add Word Form */}
                  <Card className="bg-neutral-900/20 border-neutral-800 text-white p-6 shadow-2xl backdrop-blur-md">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
                      <Plus className="text-emerald-400 h-5 w-5" />
                      Daftarkan Kata/Regex Baru
                    </h3>
                    <form onSubmit={handleAddWord} className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Kata / Pola Regex</label>
                        <Input 
                          placeholder="Contoh: anjing, sc@m, [0-9]{10}" 
                          value={newWord.word}
                          onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                          className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-emerald-500 h-9"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Tingkat Bahaya</label>
                          <select 
                            value={newWord.severity_level}
                            onChange={(e) => setNewWord({ ...newWord, severity_level: parseInt(e.target.value) })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-emerald-500"
                          >
                            <option value="1">1 (Mild/Ringan)</option>
                            <option value="2">2 (Moderate/Sedang)</option>
                            <option value="3">3 (Severe/Sangat Toxic)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Bahasa</label>
                          <Input 
                            placeholder="id, en, all" 
                            value={newWord.language}
                            onChange={(e) => setNewWord({ ...newWord, language: e.target.value })}
                            className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-emerald-500 h-9"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1.5">
                        <input 
                          type="checkbox" 
                          id="is_regex"
                          checked={newWord.is_regex}
                          onChange={(e) => setNewWord({ ...newWord, is_regex: e.target.checked })}
                          className="rounded border-neutral-800 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="is_regex" className="text-xs text-neutral-400 font-light cursor-pointer select-none">Gunakan Pola Regular Expression (Regex)</label>
                      </div>

                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 mt-2 rounded-lg shadow-lg shadow-emerald-900/40">
                        Tambahkan ke Wordlist
                      </Button>
                    </form>
                  </Card>
                </div>
              </div>
            )}

            {/* 5. EMERGENCY MANUAL OVERRIDE */}
            {activeTab === "override" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left: Active Banned Users */}
                  <div className="xl:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <UserX className="text-red-500 h-5 w-5" />
                      Daftar Pengguna dalam Pembatasan Aktif
                    </h3>
                    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                      <Table>
                        <TableHeader className="bg-neutral-900/60">
                          <TableRow className="border-neutral-850">
                            <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">User ID</TableHead>
                            <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Jumlah Strike</TableHead>
                            <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Muted?</TableHead>
                            <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Banned?</TableHead>
                            <TableHead className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Alasan Pemblokiran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeBans.map((state) => (
                            <TableRow key={state.id} className="border-neutral-900 hover:bg-neutral-900/30 transition-colors">
                              <TableCell className="font-mono text-xs text-white">
                                {state.user_id}
                              </TableCell>
                              <TableCell>
                                <span className="bg-red-950 border border-red-500/30 px-2 py-0.5 rounded text-[10px] text-red-400 font-bold">
                                  {state.total_strikes} STRIKES
                                </span>
                              </TableCell>
                              <TableCell>
                                {state.is_muted ? (
                                  <span className="text-amber-400 font-semibold flex items-center gap-1 text-xs">
                                    <Lock className="h-3 w-3" /> Ya
                                  </span>
                                ) : (
                                  <span className="text-neutral-500 flex items-center gap-1 text-xs">
                                    <Unlock className="h-3 w-3" /> Tidak
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {state.is_banned ? (
                                  <span className="text-red-500 font-extrabold flex items-center gap-1 text-xs">
                                    <Lock className="h-3 w-3" /> YA (BLOCKED)
                                  </span>
                                ) : (
                                  <span className="text-neutral-500 flex items-center gap-1 text-xs">
                                    <Unlock className="h-3 w-3" /> Tidak
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-xs text-neutral-400 font-light">
                                {state.ban_reason || <span className="text-neutral-600 italic">-</span>}
                              </TableCell>
                            </TableRow>
                          ))}

                          {activeBans.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-neutral-500 font-light">
                                <ShieldCheck className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                                Bersih! Tidak ada akun yang terblokir atau dibisukan saat ini.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Right: Intervention Form */}
                  <Card className="bg-neutral-900/20 border-neutral-800 text-white p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl"></div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
                      <Flame className="text-red-500 h-5 w-5 animate-pulse" />
                      Intervensi Manual Darurat
                    </h3>
                    <form onSubmit={handleManualOverride} className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Username Pengguna Target</label>
                        <Input 
                          placeholder="Contoh: andi_toxic (tanpa @)" 
                          value={overrideForm.username}
                          onChange={(e) => setOverrideForm({ ...overrideForm, username: e.target.value })}
                          className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-red-500 h-9"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Tipe Penindakan</label>
                          <select 
                            value={overrideForm.action_type}
                            onChange={(e) => setOverrideForm({ ...overrideForm, action_type: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-red-500"
                          >
                            <option value="mute">MUTE (Bungkam)</option>
                            <option value="unmute">UNMUTE (Lepas Bungkam)</option>
                            <option value="kick">KICK (Tendang)</option>
                            <option value="ban_temp">BAN_TEMP (Blokir Sementara)</option>
                            <option value="ban_perm">BAN_PERM (Blokir Permanen)</option>
                            <option value="unban">UNBAN (Pemulihan Akun)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Durasi Penangguhan</label>
                          <select 
                            value={overrideForm.duration_minutes}
                            onChange={(e) => setOverrideForm({ ...overrideForm, duration_minutes: parseInt(e.target.value) })}
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-white text-xs h-9 focus:border-red-500"
                            disabled={["unmute", "unban", "ban_perm", "kick"].includes(overrideForm.action_type)}
                          >
                            <option value="15">15 Menit</option>
                            <option value="30">30 Menit</option>
                            <option value="120">2 Jam</option>
                            <option value="1440">24 Jam</option>
                            <option value="10080">7 Hari</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Alasan Resmi Keamanan</label>
                        <Input 
                          placeholder="Alasan pemblokiran (tercatat di log audit)" 
                          value={overrideForm.reason}
                          onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                          className="bg-neutral-950 border-neutral-800 text-white rounded-lg focus-visible:ring-red-500 h-9"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 mt-2 rounded-lg shadow-lg shadow-red-900/40">
                        Eksekusi Override Darurat
                      </Button>
                    </form>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
