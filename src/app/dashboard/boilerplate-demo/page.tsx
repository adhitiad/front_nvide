"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Terminal, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Database,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Users,
  Wallet,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

// 🛠️ TIPE DATA BOILERPLATE (Type-safety)
interface DataItem {
  id: string;
  name: string;
  category: string;
  value: number;
  status: "active" | "inactive";
  updatedAt: string;
}

export default function BoilerplateDemoPage() {
  // --- 🛠️ SANDBOX ENGINE CONTROLS ---
  // Membantu frontend developer mendesain UI & interaksi secara offline tanpa bergantung pada backend Go.
  const [sandboxMode, setSandboxMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DataItem[]>([]);
  
  // --- FORM STATES ---
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Streaming");
  const [valueInput, setValueInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- FILTER & SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // --- 1. MOCK DATA PENYEDIA (Sandbox offline) ---
  const MOCK_ITEMS: DataItem[] = [
    { id: "item-1", name: "Paket Koin Sultan", category: "Monetization", value: 150000, status: "active", updatedAt: new Date().toISOString() },
    { id: "item-2", name: "WebRTC Low-Latency Server", category: "Infrastructure", value: 45000, status: "active", updatedAt: new Date().toISOString() },
    { id: "item-3", name: "Moderasi NSFW Otomatis", category: "Safety", value: 20000, status: "active", updatedAt: new Date().toISOString() },
    { id: "item-4", name: "PK Battle Widget Premium", category: "Streaming", value: 75000, status: "inactive", updatedAt: new Date().toISOString() }
  ];

  // --- 2. AMBIL DATA AWAL (API vs Mock) ---
  useEffect(() => {
    fetchData();
  }, [sandboxMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (sandboxMode) {
        // Mode Offline: Mensimulasikan respon jaringan dengan delay halus
        await new Promise((resolve) => setTimeout(resolve, 800));
        setItems(MOCK_ITEMS);
        toast.info("Memuat data simulasi Sandbox offline!");
      } else {
        // Mode Produksi: Menghubungkan ke API Go Backend dengan Axios
        const response = await api.get("/discover/boilerplate-demo").catch(() => null);
        if (response) {
          setItems(response as any);
          toast.success("Berhasil tersambung dengan API Go!");
        } else {
          // Fallback otomatis jika backend belum menyala
          toast.error("Gagal tersambung ke backend Go. Beralih kembali ke mode Sandbox.");
          setSandboxMode(true);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
      toast.error("Kesalahan koneksi database!");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. DOCK SUBMIT DATA (Create) ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !valueInput) {
      toast.warning("Mohon isi semua field formulir!");
      return;
    }

    setSubmitting(true);
    const newItemPayload = {
      name: nameInput,
      category: categoryInput,
      value: Number(valueInput),
      status: "active" as const
    };

    try {
      if (sandboxMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const createdItem: DataItem = {
          id: "item-" + Math.random().toString(36).substring(4),
          ...newItemPayload,
          updatedAt: new Date().toISOString()
        };
        setItems((prev) => [createdItem, ...prev]);
        toast.success(`Sandbox: Berhasil membuat ${nameInput}!`);
      } else {
        // Integrasi API Produksi
        const response = await api.post("/discover/boilerplate-demo", newItemPayload) as any;
        if (response) {
          setItems((prev) => [response, ...prev]);
          toast.success(`Sukses memposting ke server: ${nameInput}!`);
        }
      }
      // Reset input form
      setNameInput("");
      setValueInput("");
    } catch (err: any) {
      toast.error("Gagal menyimpan data ke API: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- 4. HAPUS DATA (Delete) ---
  const handleDeleteItem = async (id: string) => {
    try {
      if (sandboxMode) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item berhasil dihapus dari Sandbox!");
      } else {
        await api.delete(`/discover/boilerplate-demo/${id}`);
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item berhasil dihapus dari database!");
      }
    } catch (err: any) {
      toast.error("Gagal menghapus item dari backend.");
    }
  };

  // --- 5. SEARCH & FILTER LOGIC ---
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white p-2 md:p-6 space-y-6 font-sans select-none relative overflow-x-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER UTAMA */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase tracking-wider">
              Dashboard Template
            </span>
            <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-400 animate-spin" /> Boilerplate Ready
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Pusat Kontrol Boilerplate
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            Halaman referensi arsitektur frontend dengan integrasi API, filter interaktif, dan simulator Sandbox.
          </p>
        </div>

        {/* CONTROLLER SANDBOX MODE */}
        <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-850 p-2.5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Terminal className="text-indigo-400 h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-mono text-indigo-300 font-bold">Simulator Panel</span>
          </div>
          <div className="h-4 w-px bg-neutral-800"></div>
          <Button 
            onClick={() => setSandboxMode(!sandboxMode)} 
            variant="outline" 
            size="sm"
            className={`text-xs rounded-xl h-8 px-4 cursor-pointer transition-all ${
              sandboxMode 
                ? "bg-indigo-950/50 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-950/30" 
                : "border-neutral-800 text-neutral-400"
            }`}
          >
            {sandboxMode ? "Mock Mode: Aktif" : "API Mode: Aktif"}
          </Button>
        </div>
      </div>

      {/* STATISTIK CARDS (Harmonious visual styles) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-neutral-850 rounded-2xl relative overflow-hidden shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-xs text-neutral-400 font-mono">TOTAL PENDAPATAN</CardDescription>
              <Wallet className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-white tracking-tight">Rp 2.450.000</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12.4% dalam 24 jam terakhir
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-neutral-850 rounded-2xl relative overflow-hidden shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-xs text-neutral-400 font-mono">AKTIVITAS SISTEM</CardDescription>
              <Database className="h-5 w-5 text-pink-400" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-white tracking-tight">{filteredItems.length} Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-indigo-400 font-mono">
              Terintegrasi dengan {sandboxMode ? "Sandbox engine" : "Go API Server"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-neutral-850 rounded-2xl relative overflow-hidden shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-xs text-neutral-400 font-mono">STATUS KONEKSI</CardDescription>
              <div className={`h-2.5 w-2.5 rounded-full ${sandboxMode ? "bg-amber-400" : "bg-emerald-500 animate-pulse"}`}></div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-white tracking-tight">
              {sandboxMode ? "SIMULATOR" : "PRODUCTION"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-neutral-500 font-mono">
              Host: {sandboxMode ? "Client Sandbox (Local)" : "localhost:8080 (Go API)"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* LEFT COLUMN: INTERACTIVE FORM CARD */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border border-neutral-900 shadow-2xl rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 border-b border-neutral-900/60">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <Plus className="text-indigo-400 h-5 w-5" />
                Registrasi Layanan Baru
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Gunakan form ini untuk mendaftarkan layanan/item baru ke state dinamis.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddItem}>
              <CardContent className="space-y-4 pt-4">
                
                {/* Input Nama */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-400 uppercase tracking-widest font-semibold font-mono">Nama Layanan</label>
                  <Input 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Contoh: Stream Booster X"
                    className="bg-neutral-900/50 border-neutral-850 text-white rounded-xl focus-visible:ring-indigo-500/50 h-10 text-xs font-light"
                    required
                  />
                </div>

                {/* Dropdown Kategori */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-400 uppercase tracking-widest font-semibold font-mono">Kategori Layanan</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="flex w-full rounded-xl border border-neutral-850 bg-neutral-900/50 px-3 py-2 text-xs text-white shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50 h-10 font-light cursor-pointer"
                  >
                    <option value="Streaming" className="bg-neutral-950 text-white">Streaming</option>
                    <option value="Monetization" className="bg-neutral-950 text-white">Monetization</option>
                    <option value="Infrastructure" className="bg-neutral-950 text-white">Infrastructure</option>
                    <option value="Safety" className="bg-neutral-950 text-white">Safety</option>
                  </select>
                </div>

                {/* Input Nilai */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-400 uppercase tracking-widest font-semibold font-mono">Nilai Estimasi (Rupiah)</label>
                  <Input 
                    type="number"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder="Contoh: 75000"
                    className="bg-neutral-900/50 border-neutral-850 text-white rounded-xl focus-visible:ring-indigo-500/50 h-10 text-xs font-light"
                    required
                  />
                </div>

              </CardContent>
              <CardFooter className="p-4 border-t border-neutral-900/60 bg-black/40">
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/30 cursor-pointer h-10 transition-all text-xs"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Tambah Layanan</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: CORE INTERACTIVE TABLE GLASSMORPHISM */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border border-neutral-900 text-white flex flex-col h-[480px] shadow-2xl rounded-2xl overflow-hidden">
            
            {/* Header Kontrol Tabel */}
            <CardHeader className="p-4 border-b border-neutral-900 bg-black/20 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-white">Daftar Layanan Terdaftar</CardTitle>
                  <CardDescription className="text-[11px] text-neutral-400">Total {filteredItems.length} layanan berhasil difilter.</CardDescription>
                </div>
                
                {/* Tombol Segarkan */}
                <Button 
                  onClick={fetchData} 
                  variant="ghost" 
                  size="icon" 
                  className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl cursor-pointer"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
                </Button>
              </div>

              {/* Bar Filter Interaktif */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari layanan berdasarkan nama..."
                    className="bg-neutral-900/50 border-neutral-850 pl-10 rounded-xl focus-visible:ring-indigo-500/50 h-9 text-xs"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-850 px-3 py-1.5 rounded-xl">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer border-none font-light"
                  >
                    <option value="all" className="bg-neutral-950 text-white">Semua Kategori</option>
                    <option value="Streaming" className="bg-neutral-950 text-white">Streaming</option>
                    <option value="Monetization" className="bg-neutral-950 text-white">Monetization</option>
                    <option value="Infrastructure" className="bg-neutral-950 text-white">Infrastructure</option>
                    <option value="Safety" className="bg-neutral-950 text-white">Safety</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            {/* Konten Table Output */}
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scroll">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <span className="text-xs font-light font-mono">Melakukan sinkronisasi data...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-500">
                  <AlertCircle className="h-8 w-8 text-neutral-600 animate-bounce" />
                  <span className="text-xs font-light">Tidak ada layanan yang cocok dengan kriteria pencarian Anda.</span>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/60">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 hover:bg-neutral-900/20 transition-all group duration-200"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">{item.name}</h4>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === "active" ? "bg-emerald-500" : "bg-neutral-700"}`}></span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                          <span className="bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-full text-indigo-400">{item.category}</span>
                          <span>ID: {item.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">Rp {item.value.toLocaleString("id-ID")}</div>
                          <div className="text-[9px] text-neutral-600">Updated: {new Date(item.updatedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</div>
                        </div>

                        {/* Action buttons (Delete) */}
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

          </Card>
        </div>

      </div>
    </div>
  );
}
