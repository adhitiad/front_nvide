"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Play, Radio, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDesc, setStreamDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const data = await api.get("/streams/live") as any;
      // Handle null or undefined data
      setStreams(Array.isArray(data) ? data : (data?.streams || []));
    } catch (err) {
      console.error("Gagal memuat stream", err);
      setStreams([]); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const res = await api.post("/streams", { 
        title: streamTitle, 
        description: streamDesc,
        is_private: false
      }) as any;

      // Setelah berhasil buat, kita panggil /start (jika memang host harus panggil start terpisah,
      // tergantung flow backend. Biasanya return stream_id)
      const streamId = res.id || res.stream?.id;
      if (streamId) {
        await api.post(`/streams/${streamId}/start`);
      }

      setIsCreateOpen(false);
      setStreamTitle("");
      setStreamDesc("");
      fetchStreams(); // Refresh daftar stream
    } catch (err: any) {
      setError(err.message || "Gagal membuat stream. Pastikan Anda punya role Host/Agency.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Live Streams</h1>
          <p className="text-neutral-400 mt-2">Tonton atau mulai siaran langsung Anda (WebRTC)</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/50">
              <Radio className="mr-2 h-4 w-4" />
              Mulai Streaming
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center">
                <Radio className="mr-2 h-5 w-5 text-indigo-400" /> Mulai Siaran Baru
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                Isi detail streaming Anda sebelum mulai bersiaran.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStream}>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-neutral-300">Judul Streaming</Label>
                  <Input 
                    id="title" 
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Main Game Malam Mingguan..." 
                    required
                    className="bg-neutral-950 border-neutral-800 text-neutral-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-neutral-300">Deskripsi Singkat</Label>
                  <Input 
                    id="desc" 
                    value={streamDesc}
                    onChange={(e) => setStreamDesc(e.target.value)}
                    placeholder="Bahas strategi baru dan bagi-bagi gift!" 
                    className="bg-neutral-950 border-neutral-800 text-neutral-100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  disabled={isCreating || !streamTitle} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isCreating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mempersiapkan Server...</>
                  ) : "Buka Room & Mulai Live"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-neutral-400 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang memuat stream...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.length > 0 ? (
            streams.map((stream) => (
              <Card key={stream.id} className="bg-neutral-900 border-neutral-800 text-neutral-100 overflow-hidden hover:border-neutral-700 transition-all">
                <div className="aspect-video bg-neutral-950 flex items-center justify-center relative">
                  <Video className="h-12 w-12 text-neutral-800" />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                    LIVE
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                    {stream.viewers || 0} Viewers
                  </div>
                </div>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg line-clamp-1">{stream.title}</CardTitle>
                  <CardDescription className="text-neutral-400">{stream.host?.username || stream.host_id || "Unknown Host"}</CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-4">
                  <Button variant="secondary" className="w-full bg-white text-black hover:bg-neutral-200">
                    <Play className="mr-2 h-4 w-4" />
                    Tonton
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-neutral-900 border border-neutral-800 border-dashed rounded-lg">
              <Radio className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Tidak ada stream aktif</h3>
              <p className="text-neutral-400">Jadilah yang pertama untuk memulai siaran langsung hari ini!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
