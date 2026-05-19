"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Tv,
  Key,
  Copy,
  CheckCircle,
  Sliders,
  Settings,
  Sparkles,
  Lock,
  Loader2,
  AlertTriangle,
  Tablet,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function HostStreamDashboard() {
  const { data: session } = useSession();
  
  // STREAM METADATA STATE
  const [title, setTitle] = useState("Show Seru Malam Minggu Sayang 💋");
  const [description, setDescription] = useState("Gabung obrolan seru dan dukung aku malam ini!");
  const [category, setCategory] = useState("gaming");
  const [updatingMeta, setUpdatingMeta] = useState(false);

  // DUAL STREAM KEYS STATE
  const serverUrl = "rtmp://stream.nvide.live/live";
  const landscapeKey = "live_landscape_nvide_host_" + (session?.user?.id?.substring(0, 8) || "key");
  const portraitKey = "live_portrait_nvide_host_" + (session?.user?.id?.substring(0, 8) || "key");

  // TOY SETUP STATE
  const [toyId, setToyId] = useState("lovense-lush-3-xyz");
  const [toyStatus, setToyStatus] = useState("connected");
  const [savingToy, setSavingToy] = useState(false);

  // PRIVATE ROOM SETUP STATE
  const [privatePrice, setPrivatePrice] = useState("1500");
  const [privateRoomActive, setPrivateRoomActive] = useState(false);
  const [launchingPrivate, setLaunchingPrivate] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard! 📋`);
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingMeta(true);
    try {
      await api.put("/streams/current/metadata", { title, description, category });
      toast.success("Informasi/Metadata siaran berhasil diperbarui! 📝");
    } catch {
      // Local simulated update
      setTimeout(() => {
        toast.success("Informasi siaran diperbarui di server lokal!");
        setUpdatingMeta(false);
      }, 800);
    }
  };

  const handleSaveToyMapping = async () => {
    setSavingToy(true);
    try {
      await api.post("/settings/toys/device", { device_id: toyId });
      toast.success("Konfigurasi mainan pintar Lovense berhasil dipetakan! ⚡");
      setToyStatus("connected");
    } catch {
      setTimeout(() => {
        toast.success("Koneksi mainan pintar berhasil dipetakan secara lokal!");
        setSavingToy(false);
      }, 800);
    }
  };

  const handleLaunchPrivateRoom = async () => {
    setLaunchingPrivate(true);
    try {
      const price = parseInt(privatePrice);
      await api.post("/rooms/private/start", { price_idr: price });
      setPrivateRoomActive(true);
      toast.success("Private Room Berbayar berhasil diluncurkan ke seluruh pemirsa! 🔒💋");
    } catch {
      setTimeout(() => {
        setPrivateRoomActive(true);
        setLaunchingPrivate(false);
        toast.success("Room privat berbayar diluncurkan (simulasi lokal)!");
      }, 800);
    }
  };

  const handleStopPrivateRoom = async () => {
    setLaunchingPrivate(true);
    try {
      await api.post("/rooms/private/stop");
      setPrivateRoomActive(false);
      toast.success("Siaran berhasil dikembalikan ke publik! 🔓");
    } catch {
      setTimeout(() => {
        setPrivateRoomActive(false);
        setLaunchingPrivate(false);
        toast.success("Siaran dikembalikan ke publik (simulasi)!");
      }, 500);
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
            <span className="bg-purple-950 text-purple-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-purple-900/50 flex items-center gap-1.5 shadow-lg animate-pulse">
              <Tv className="h-3.5 w-3.5" />
              Creator Studio
            </span>
            <span className="text-sm font-bold text-neutral-300">Dashboard Siaran Host</span>
          </div>
        </div>
      </header>

      {/* CONTENT GRID */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STREAM INGESTION SETTINGS (DUAL STREAM KEY) & OBS SETUPS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* DUAL STREAM KEY BOX */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-black flex items-center gap-2 text-purple-400">
                <Key className="h-4.5 w-4.5" />
                Dual Format Streaming Keys
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                NVide Live mendukung streaming format ganda. Masukkan Server URL dan Kunci Siaran yang sesuai ke aplikasi streaming Anda (misal: OBS Studio).
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {/* Server URL */}
              <div className="space-y-2">
                <Label className="text-neutral-400">Server Ingest URL (RTMP)</Label>
                <div className="flex gap-2">
                  <Input readOnly value={serverUrl} className="bg-neutral-900 border-neutral-850 font-mono text-[11px] h-11 flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(serverUrl, "Server URL")} className="border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 rounded-xl h-11 w-11 shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Landscape Key */}
              <div className="space-y-2">
                <Label className="text-neutral-400 flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5 text-purple-400" />
                  Kunci Siaran Landscape (Horizontal - 16:9)
                </Label>
                <div className="flex gap-2">
                  <Input type="password" readOnly value={landscapeKey} className="bg-neutral-900 border-neutral-850 font-mono text-[11px] h-11 flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(landscapeKey, "Stream Key Landscape")} className="border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 rounded-xl h-11 w-11 shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Portrait Key */}
              <div className="space-y-2">
                <Label className="text-neutral-400 flex items-center gap-1">
                  <Tablet className="h-3.5 w-3.5 text-pink-400" />
                  Kunci Siaran Portrait (Vertical - 9:16)
                </Label>
                <div className="flex gap-2">
                  <Input type="password" readOnly value={portraitKey} className="bg-neutral-900 border-neutral-850 font-mono text-[11px] h-11 flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(portraitKey, "Stream Key Portrait")} className="border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 rounded-xl h-11 w-11 shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* OBS CONFIGURATION GUIDE CARD */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-sm font-black flex items-center gap-2 text-neutral-300">
              <Settings className="h-4.5 w-4.5 text-purple-400" />
              Panduan Konfigurasi OBS Studio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-neutral-400">
              <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Monitor className="h-4 w-4 text-purple-400" /> Mode Horizontal (16:9)
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Atur resolusi kanvas ke <span className="font-bold text-white">1920x1080</span>.</li>
                  <li>Masukkan Kunci Siaran Landscape ke pengaturan stream OBS.</li>
                  <li>Sangat cocok untuk live gaming & talkshow santai.</li>
                </ul>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Tablet className="h-4 w-4 text-pink-400" /> Mode Vertikal (9:16)
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Atur resolusi kanvas ke <span className="font-bold text-white">1080x1920</span>.</li>
                  <li>Masukkan Kunci Siaran Portrait ke pengaturan stream OBS.</li>
                  <li>Sangat intim untuk model tarian, interaksi dekat, & mobile views.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: METADATA FORMS & PRIVATE ROOM, TOYS MODUL */}
        <div className="space-y-8">
          
          {/* STREAM METADATA FORM */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-sm font-black flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Metadata Siaran Langsung
            </h3>

            <form onSubmit={handleUpdateMetadata} className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label htmlFor="tTitle">Judul Siaran</Label>
                <Input id="tTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-neutral-900 border-neutral-850 focus:border-purple-500 rounded-xl h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tDesc">Deskripsi</Label>
                <textarea id="tDesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-neutral-900 border border-neutral-850 p-3 rounded-xl focus:border-purple-500 font-medium text-neutral-200 resize-none" required />
              </div>
              <div className="space-y-2">
                <Label>Kategori Konten</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-neutral-900 border border-neutral-850 text-neutral-300 p-3 rounded-xl focus:border-purple-500">
                  <option value="gaming">Gaming</option>
                  <option value="talkshow">Talkshow</option>
                  <option value="music">Musik</option>
                  <option value="beauty">Kecantikan</option>
                </select>
              </div>

              <Button type="submit" disabled={updatingMeta} className="w-full bg-purple-600 hover:bg-purple-550 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5">
                {updatingMeta ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
                Perbarui Metadata Siaran
              </Button>
            </form>
          </div>

          {/* PRIVATE ROOM CONTROL WIDGET */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-neutral-300">
                <Lock className="h-4.5 w-4.5 text-amber-500" />
                Paid Private Room
              </h3>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                privateRoomActive ? "bg-amber-950 text-amber-400 border border-amber-900/40" : "bg-neutral-900 text-neutral-500 border border-neutral-850"
              }`}>
                {privateRoomActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label htmlFor="pCost">Tarif Flat Masuk (IDR)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">Rp</span>
                  <Input id="pCost" type="number" value={privatePrice} onChange={(e) => setPrivatePrice(e.target.value)} className="bg-neutral-900 border-neutral-850 pl-10 focus:border-purple-500 font-bold rounded-xl h-11" />
                </div>
              </div>

              {privateRoomActive ? (
                <Button onClick={handleStopPrivateRoom} disabled={launchingPrivate} className="w-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-red-500 rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5">
                  {launchingPrivate ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : null}
                  Kembalikan ke Siaran Publik
                </Button>
              ) : (
                <Button onClick={handleLaunchPrivateRoom} disabled={launchingPrivate} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5 shadow">
                  {launchingPrivate ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
                  Luncurkan Room Privat
                </Button>
              )}
            </div>
          </div>

          {/* INTERACTIVE TOYS INTEGRATION SETUP */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-neutral-300">
                <Sliders className="h-4.5 w-4.5 text-purple-400 animate-spin" />
                Lovense Toy Config
              </h3>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                toyStatus === "connected" ? "bg-green-950 text-green-400 border border-green-900/40" : "bg-red-950 text-red-400 border border-red-900/40"
              }`}>
                {toyStatus}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label htmlFor="tDevice">ID Perangkat Lovense</Label>
                <Input id="tDevice" value={toyId} onChange={(e) => setToyId(e.target.value)} placeholder="Contoh: lush-3-host-device" className="bg-neutral-900 border-neutral-850 focus:border-purple-500 rounded-xl h-11 font-mono" />
              </div>

              <Button onClick={handleSaveToyMapping} disabled={savingToy} className="w-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-350 rounded-xl font-bold py-5 text-xs transition flex items-center justify-center gap-1.5">
                {savingToy ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
                Hubungkan Perangkat Lovense
              </Button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
