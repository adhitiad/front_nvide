"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Video as VideoIcon, Upload, Heart, MessageCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SocialPage() {
  const [vods, setVods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSocial = async () => {
    try {
      setLoading(true);
      const data = await api.get("/vods") as any;
      setVods(Array.isArray(data) ? data : (data?.vods || []));
    } catch (err) {
      console.error("Gagal memuat konten sosial", err);
      setVods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  const handleUploadVOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Silakan pilih file video terlebih dahulu");
      return;
    }
    
    setIsUploading(true);
    setError("");

    try {
      // Menggunakan FormData untuk upload file
      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("description", uploadDesc);
      formData.append("file", file); // key 'file' harus sesuai dengan form field di backend Go Anda

      await api.post("/vods", formData);

      setIsUploadOpen(false);
      setUploadTitle("");
      setUploadDesc("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchSocial(); // Refresh daftar VOD
    } catch (err: any) {
      setError(err.message || "Gagal upload VOD. Pastikan file valid.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Social & VOD</h1>
          <p className="text-neutral-400 mt-2">Jelajahi video on demand dan stories dari pengguna lain</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload Story
          </Button>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-700 hover:bg-pink-800 text-white shadow-md shadow-pink-900/50">
                <Upload className="mr-2 h-4 w-4" />
                Upload VOD
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-pink-400" /> Upload Video (VOD)
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Unggah file video MP4 untuk disimpan sebagai Video On Demand.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadVOD}>
                <div className="grid gap-4 py-4">
                  {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="videoFile" className="text-neutral-300">Pilih File Video</Label>
                    <Input 
                      id="videoFile" 
                      type="file"
                      accept="video/mp4,video/x-m4v,video/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      ref={fileInputRef}
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 cursor-pointer file:text-white file:bg-neutral-800 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-neutral-300">Judul Video</Label>
                    <Input 
                      id="title" 
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Keseruan Acara Tadi Malam..." 
                      required
                      className="bg-neutral-950 border-neutral-800 text-neutral-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-neutral-300">Deskripsi Singkat</Label>
                    <Input 
                      id="desc" 
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      placeholder="Jangan lupa like & comment ya!" 
                      className="bg-neutral-950 border-neutral-800 text-neutral-100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isUploading || !uploadTitle || !file} 
                    className="w-full bg-pink-700 hover:bg-pink-800 text-white"
                  >
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...</>
                    ) : "Unggah Video"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {loading ? (
        <div className="text-neutral-400 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat daftar konten...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vods.length > 0 ? (
            vods.map((item) => (
              <Card key={item.id} className="bg-neutral-900 border-neutral-800 text-neutral-100 overflow-hidden hover:border-neutral-700 transition-all">
                <div className="aspect-square sm:aspect-video bg-neutral-950 flex items-center justify-center relative">
                  {item.type === "Story" ? (
                    <ImageIcon className="h-12 w-12 text-neutral-800" />
                  ) : (
                    <VideoIcon className="h-12 w-12 text-neutral-800" />
                  )}
                  <div className="absolute top-3 right-3 bg-neutral-800/80 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                    {item.type || "VOD"}
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between text-neutral-400 text-sm mt-2">
                  <div className="flex gap-4">
                    <span className="flex items-center hover:text-pink-500 cursor-pointer transition-colors">
                      <Heart className="h-4 w-4 mr-1" /> {item.likes || 0}
                    </span>
                    <span className="flex items-center hover:text-sky-500 cursor-pointer transition-colors">
                      <MessageCircle className="h-4 w-4 mr-1" /> {item.comments || 0}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-neutral-900 border border-neutral-800 border-dashed rounded-lg">
              <VideoIcon className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Belum ada konten</h3>
              <p className="text-neutral-400">Mulai unggah VOD atau Story pertama Anda!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
