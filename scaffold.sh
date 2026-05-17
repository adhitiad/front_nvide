#!/bin/bash
# 🛠️ NVide Next.js Dashboard Page Scaffolder
# File: front_nvide/scaffold.sh
# Cara penggunaan: chmod +x scaffold.sh && ./scaffold.sh posts

if [ -z "$1" ]; then
    echo -e "\e[31m⚠️ Error: Nama dashboard page tidak boleh kosong!\e[0m"
    echo -e "Penggunaan: ./scaffold.sh [nama_page]"
    exit 1
fi

LowerName="$(tr '[:upper:]' '[:lower:]' <<< "$1")"
TitleName="$(tr '[:lower:]' '[:upper:]' <<< ${LowerName:0:1})${LowerName:1}"

echo -e "\e[36m🚀 Menghasilkan Halaman Dashboard Boilerplate Next.js untuk: $TitleName...\e[0m"

# Path Tujuan
TargetDir="src/app/dashboard/$LowerName"
PagePath="$TargetDir/page.tsx"

# Membuat direktori jika belum ada
mkdir -p "$TargetDir"

# 1. GENERATE DYNAMIC PAGE TEMPLATE
cat <<EOF > "$PagePath"
"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Terminal, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Database,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

// 🏆 Tipe data boilerplate untuk $TitleName
interface ${TitleName}Item {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ${TitleName}DashboardPage() {
  const [sandboxMode, setSandboxMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<${TitleName}Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form input states
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- MOCK DATA SIMULATOR ---
  const MOCK_ITEMS: ${TitleName}Item[] = [
    { id: "mock-1", title: "Contoh Data $TitleName Pertama", description: "Deskripsi singkat mengenai $LowerName yang diunggah secara otomatis dalam mode simulator.", status: "active", createdAt: new Date().toISOString() },
    { id: "mock-2", title: "Contoh Data $TitleName Kedua", description: "Layanan ini berjalan di sandbox developer NVide untuk memudahkan penataan UI.", status: "inactive", createdAt: new Date().toISOString() }
  ];

  // Ambil Data
  useEffect(() => {
    fetchData();
  }, [sandboxMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (sandboxMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setItems(MOCK_ITEMS);
      } else {
        // Panggil endpoint backend riil
        const response = await api.get("/$LowerName").catch(() => null);
        if (response) {
          setItems(response as any);
        } else {
          toast.error("Gagal terhubung dengan backend Go. Mengaktifkan Sandbox mode.");
          setSandboxMode(true);
        }
      }
    } catch (e) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Item Baru
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    setSubmitting(true);
    const payload = { title: titleInput, description: descInput };

    try {
      if (sandboxMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newItem: ${TitleName}Item = {
          id: "item-" + Math.random().toString(36).substring(4),
          title: titleInput,
          description: descInput,
          status: "active",
          createdAt: new Date().toISOString()
        };
        setItems((prev) => [newItem, ...prev]);
        toast.success("[Sandbox] Berhasil menambahkan $TitleName!");
      } else {
        const response = await api.post("/$LowerName", payload) as any;
        if (response) {
          setItems((prev) => [response, ...prev]);
          toast.success("Berhasil memposting data $TitleName baru!");
        }
      }
      setTitleInput("");
      setDescInput("");
    } catch (err: any) {
      toast.error("Gagal memproses data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus Item
  const handleDeleteItem = async (id: string) => {
    try {
      if (sandboxMode) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        toast.success("[Sandbox] Item berhasil dihapus!");
      } else {
        await api.delete(\`/$LowerName/\${id}\`);
        setItems((prev) => prev.filter((it) => it.id !== id));
        toast.success("Item berhasil terhapus!");
      }
    } catch (e) {
      toast.error("Gagal menghapus.");
    }
  };

  const filteredItems = items.filter((it) => 
    it.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    it.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative overflow-hidden select-none min-h-[80vh]">
      
      {/* HEADER WIDGET */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase tracking-wider">
              Modul $TitleName
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Kelola $TitleName
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Gunakan portal ini untuk melacak dan mengontrol parameter $LowerName.
          </p>
        </div>

        {/* SANDBOX SWAP */}
        <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-850 p-2 rounded-2xl">
          <Terminal className="text-indigo-400 h-4 w-4 animate-pulse" />
          <Button 
            onClick={() => setSandboxMode(!sandboxMode)} 
            variant="outline" 
            size="sm"
            className={\`text-xs rounded-xl h-8 px-4 cursor-pointer transition-all \\\${
              sandboxMode ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-300" : "border-neutral-800 text-neutral-400"
            }\`}
          >
            {sandboxMode ? "Mode Simulator" : "Mode Server"}
          </Button>
        </div>
      </div>

      {/* BODY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT CARD */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden shadow-xl">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Plus className="text-indigo-400 h-4.5 w-4.5" /> Buat $TitleName
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateItem}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Judul</label>
                  <Input 
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Judul $TitleName..."
                    className="bg-neutral-900/50 border-neutral-850 text-white rounded-xl h-10 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Deskripsi</label>
                  <Input 
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Deskripsi singkat..."
                    className="bg-neutral-900/50 border-neutral-850 text-white rounded-xl h-10 text-xs"
                  />
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t border-neutral-900 bg-black/30">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer text-xs h-10"
                >
                  Post $TitleName
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* DISPLAY TABLE */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-xl h-[450px] flex flex-col">
            <CardHeader className="p-4 border-b border-neutral-900 bg-black/20 space-y-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-white">Item Terdaftar</CardTitle>
                <Button onClick={fetchData} variant="ghost" size="icon" className="text-neutral-400 rounded-xl cursor-pointer">
                  <RefreshCw className={\`h-4 w-4 \\\${loading ? "animate-spin text-indigo-400" : ""}\`} />
                </Button>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="bg-neutral-900/50 border-neutral-850 pl-9 rounded-xl h-9 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center h-full text-neutral-400 font-mono text-xs">
                  Sinkronisasi...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
                  Tidak ada item yang ditemukan.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 hover:bg-neutral-900/10">
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">{item.description}</p>
                      </div>
                      <Button onClick={() => handleDeleteItem(item.id)} variant="ghost" size="icon" className="text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
EOF

echo -e "\e[32m✅ Selesai! Halaman dashboard boilerplate telah berhasil dibuat di:\e[0m"
echo -e " 📂 Halaman Page: \e[36msrc/app/dashboard/$LowerName/page.tsx\e[0m"
echo -e "\n\e[33m💡 Anda sekarang dapat membuka http://localhost:3000/dashboard/$LowerName di browser Anda!\e[0m"
EOF
chmod +x "$PagePath" 2>/dev/null || true
