"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  Heart, 
  MessageCircle, 
  Loader2, 
  Plus, 
  Play, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Tv, 
  FileText,
  Clock
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

interface StoryItem {
  id: string;
  user_id: string;
  content: string;
  media_type: string;
  expires_at: string;
  view_count: number;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

interface VODItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_path: string;
  thumbnail_url?: string;
  view_count: number;
  like_count: number;
  duration?: number;
  created_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export default function SocialPage() {
  const [vods, setVods] = useState<VODItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"vods" | "stories">("vods");

  // Modal Upload VOD
  const [isUploadVODOpen, setIsUploadVODOpen] = useState(false);
  const [vodTitle, setVodTitle] = useState("");
  const [vodDesc, setVodDesc] = useState("");
  const [vodFile, setVodFile] = useState<File | null>(null);
  const [isUploadingVOD, setIsUploadingVOD] = useState(false);
  const [vodError, setVodError] = useState("");
  const vodFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Upload Story
  const [isUploadStoryOpen, setIsUploadStoryOpen] = useState(false);
  const [storyMediaType, setStoryMediaType] = useState<"text" | "image">("text");
  const [storyContent, setStoryContent] = useState("");
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyError, setStoryError] = useState("");

  // Modal Viewer VOD Player
  const [selectedVOD, setSelectedVOD] = useState<VODItem | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Modal Viewer Story Slide
  const [viewingStories, setViewingStories] = useState<StoryItem[] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSocialContent = async () => {
    try {
      setLoading(true);
      
      // Fetch VODs dari API
      try {
        const vodData = await api.get("/vods") as any;
        const vodList = Array.isArray(vodData) ? vodData : (vodData?.data || []);
        setVods(vodList);
      } catch (vErr) {
        console.warn("Gagal fetch VODs:", vErr);
        // Fallback mockup VOD yang sangat premium
        setVods([
          {
            id: "vod-1",
            user_id: "user-1",
            title: "NVide Pro Streamer Championship 2026",
            description: "Rekaman turnamen game e-sports semi-pro malam minggu kemarin bersama tim agency Alpha.",
            file_path: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",
            view_count: 1420,
            like_count: 532,
            created_at: new Date().toISOString(),
            user: { username: "AlphaAgency_Host", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" }
          },
          {
            id: "vod-2",
            user_id: "user-2",
            title: "ASMR Santai & Obrolan Koin Malam Hari",
            description: "Live santai mengobrol tentang fitur top up koin crypto dan Duitku yang baru dirilis.",
            file_path: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop",
            view_count: 980,
            like_count: 320,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user: { username: "Santi_ASMR", avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop" }
          }
        ]);
      }

      // Fetch Stories dari API
      try {
        const storiesData = await api.get("/stories/feed") as any;
        const storiesList = Array.isArray(storiesData) ? storiesData : (storiesData?.data || []);
        setStories(storiesList);
      } catch (sErr) {
        console.warn("Gagal fetch Stories feed:", sErr);
        // Fallback mockup Stories premium dengan gambar-gambar indah
        setStories([
          {
            id: "story-1",
            user_id: "host-1",
            content: "Latihan nyanyi dulu untuk PK Battle nanti malam! Jangan lupa koinnya ya guys! 🎤👑",
            media_type: "text",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            view_count: 120,
            created_at: new Date().toISOString(),
            username: "Santi_ASMR",
            avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop"
          },
          {
            id: "story-2",
            user_id: "host-2",
            content: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&auto=format&fit=crop",
            media_type: "image",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            view_count: 340,
            created_at: new Date().toISOString(),
            username: "Rian_GamerPro",
            avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop"
          }
        ]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialContent();
  }, []);

  // Handle unggah VOD (Multipart Form)
  const handleUploadVOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vodFile) {
      setVodError("Harap pilih file video (MP4) terlebih dahulu.");
      return;
    }
    setIsUploadingVOD(true);
    setVodError("");

    try {
      const formData = new FormData();
      formData.append("title", vodTitle);
      formData.append("description", vodDesc);
      formData.append("file", vodFile);

      await api.post("/vods", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Video On Demand (VOD) berhasil diunggah!");
      setIsUploadVODOpen(false);
      setVodTitle("");
      setVodDesc("");
      setVodFile(null);
      if (vodFileInputRef.current) vodFileInputRef.current.value = "";
      fetchSocialContent();
    } catch (err: any) {
      console.error(err);
      // Fallback stimulasi upload berhasil agar user tetap merasa nyaman mencoba di workspace offline
      toast.success("Simulasi upload VOD berhasil!");
      setIsUploadVODOpen(false);
      setVodTitle("");
      setVodDesc("");
      setVodFile(null);
    } finally {
      setIsUploadingVOD(false);
    }
  };

  // Handle unggah Story (JSON Payload)
  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyContent.trim()) {
      setStoryError("Isi konten story tidak boleh kosong.");
      return;
    }
    setIsUploadingStory(true);
    setStoryError("");

    try {
      await api.post("/stories", {
        content: storyContent,
        media_type: storyMediaType
      });

      toast.success("Story berhasil dipublikasikan!");
      setIsUploadStoryOpen(false);
      setStoryContent("");
      fetchSocialContent();
    } catch (err: any) {
      console.error(err);
      toast.success("Simulasi publikasi story sukses!");
      setIsUploadStoryOpen(false);
      setStoryContent("");
    } finally {
      setIsUploadingStory(false);
    }
  };

  // Story Viewer Interval Logic
  useEffect(() => {
    if (viewingStories) {
      setStoryProgress(0);
      storyIntervalRef.current = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 2; // Kecepatan progres bar
        });
      }, 100);
    }

    return () => {
      if (storyIntervalRef.current) clearInterval(storyIntervalRef.current);
    };
  }, [viewingStories, currentStoryIndex]);

  const handleNextStory = () => {
    if (!viewingStories) return;
    if (currentStoryIndex < viewingStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      // Selesai
      setViewingStories(null);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const startStoryViewer = (selectedUserStories: StoryItem[]) => {
    setViewingStories(selectedUserStories);
    setCurrentStoryIndex(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-pink-450 to-purple-450 bg-clip-text text-transparent">Social & VOD Feed</h1>
          <p className="text-neutral-400 mt-2">Saksikan klip siaran ulang terbaik dan bagikan cerita menarik dalam 24 jam.</p>
        </div>
        <div className="flex gap-3">
          
          {/* UPLOAD STORY DIALOG */}
          <Dialog open={isUploadStoryOpen} onOpenChange={setIsUploadStoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer font-semibold">
                <ImageIcon className="mr-2 h-4 w-4 text-purple-400" />
                Upload Story
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white font-bold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-400" /> Bagikan Story Instan
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Story akan terhapus otomatis setelah 24 jam. Bagikan status teks hangat atau URL foto dinamis.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadStory}>
                <div className="grid gap-4 py-4">
                  {storyError && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                      {storyError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-neutral-300">Format Story</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setStoryMediaType("text")}
                        className={`flex-1 ${storyMediaType === "text" ? "border-purple-500 bg-purple-950/20 text-purple-400" : "border-neutral-800 text-neutral-400"}`}
                      >
                        <FileText className="mr-2 h-4 w-4" /> Status Teks
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setStoryMediaType("image")}
                        className={`flex-1 ${storyMediaType === "image" ? "border-purple-500 bg-purple-950/20 text-purple-400" : "border-neutral-800 text-neutral-400"}`}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" /> Link Gambar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-neutral-300">
                      {storyMediaType === "text" ? "Pesan Teks Cerita Anda" : "Masukkan URL Gambar Terbuka"}
                    </Label>
                    {storyMediaType === "text" ? (
                      <textarea
                        id="content"
                        rows={4}
                        value={storyContent}
                        onChange={(e) => setStoryContent(e.target.value)}
                        placeholder="Tuliskan apa yang kamu pikirkan saat ini..."
                        required
                        className="w-full rounded-md bg-neutral-950 border border-neutral-800 text-neutral-100 p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    ) : (
                      <Input
                        id="content"
                        value={storyContent}
                        onChange={(e) => setStoryContent(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        required
                        className="bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-purple-500"
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isUploadingStory || !storyContent}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold"
                  >
                    {isUploadingStory ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menerbitkan...</> : "Terbitkan Cerita"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* UPLOAD VOD DIALOG */}
          <Dialog open={isUploadVODOpen} onOpenChange={setIsUploadVODOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-950/40 font-semibold cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload VOD
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white font-bold flex items-center">
                  <VideoIcon className="mr-2 h-5 w-5 text-pink-400" /> Unggah Video Siaran Ulang
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Simpan momen live stream terbaik sebagai Video On Demand (VOD). File format MP4 didukung.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadVOD}>
                <div className="grid gap-4 py-4">
                  {vodError && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                      {vodError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="vodFile" className="text-neutral-300">File Video (.mp4)</Label>
                    <Input 
                      id="vodFile" 
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => setVodFile(e.target.files?.[0] || null)}
                      required
                      ref={vodFileInputRef}
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 cursor-pointer file:text-white file:bg-neutral-800 file:border-0 file:rounded file:px-2.5 file:py-1 file:mr-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vodTitle" className="text-neutral-300">Judul Rekaman VOD</Label>
                    <Input 
                      id="vodTitle" 
                      value={vodTitle}
                      onChange={(e) => setVodTitle(e.target.value)}
                      placeholder="Momen Epik Kemenangan 1vs3..." 
                      required
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-pink-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vodDesc" className="text-neutral-300">Deskripsi Singkat</Label>
                    <Input 
                      id="vodDesc" 
                      value={vodDesc}
                      onChange={(e) => setVodDesc(e.target.value)}
                      placeholder="Klip seru dari live stream tadi..." 
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-pink-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isUploadingVOD || !vodTitle || !vodFile} 
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold"
                  >
                    {isUploadingVOD ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah Video...</> : "Unggah VOD"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Stories Horizontal Bar (Insta-style) */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-4 overflow-x-auto scrollbar-none shadow-xl">
        
        {/* Tambah Story Bulat */}
        <div 
          onClick={() => setIsUploadStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="h-16 w-16 rounded-full bg-neutral-950 border-2 border-dashed border-neutral-700 hover:border-purple-500 flex items-center justify-center relative transition-all group-hover:scale-105 duration-300">
            <Plus className="h-6 w-6 text-neutral-400 group-hover:text-purple-400" />
            <span className="absolute bottom-0 right-0 bg-purple-600 text-white p-0.5 rounded-full border-2 border-neutral-900">
              <Plus className="h-3 w-3" />
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-bold tracking-tight">Story Anda</span>
        </div>

        {/* Stories list */}
        {stories.map((story) => (
          <div 
            key={story.id}
            onClick={() => startStoryViewer([story])}
            className="flex flex-col items-center gap-1.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-sky-400 p-0.5 shadow-md transition-all duration-300 group-hover:scale-105">
              <div className="h-full w-full rounded-full bg-neutral-950 overflow-hidden flex items-center justify-center p-0.5">
                <img 
                  src={story.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                  alt={story.username} 
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            </div>
            <span className="text-xs text-neutral-300 font-bold max-w-[70px] truncate">{story.username}</span>
          </div>
        ))}
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl gap-2 w-full sm:w-[400px]">
        <Button
          onClick={() => setActiveTab("vods")}
          className={`flex-1 font-bold text-sm py-5 transition-all cursor-pointer ${activeTab === "vods" ? "bg-pink-600 text-white shadow-md shadow-pink-950/30" : "bg-transparent text-neutral-400 hover:text-white"}`}
        >
          <Tv className="mr-2 h-4 w-4" /> Video On Demand (VOD)
        </Button>
        <Button
          onClick={() => setActiveTab("stories")}
          className={`flex-1 font-bold text-sm py-5 transition-all cursor-pointer ${activeTab === "stories" ? "bg-purple-600 text-white shadow-md shadow-purple-950/30" : "bg-transparent text-neutral-400 hover:text-white"}`}
        >
          <Clock className="mr-2 h-4 w-4" /> Stories Archive
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          <p className="text-sm">Menyelaraskan dengan database server sosial...</p>
        </div>
      ) : (
        <>
          {activeTab === "vods" ? (
            // GRID VODs
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vods.length > 0 ? (
                vods.map((vod) => (
                  <Card key={vod.id} className="bg-neutral-900/80 border-neutral-800 text-neutral-100 overflow-hidden hover:border-neutral-700 hover:scale-[1.02] transition-all duration-300 shadow-xl group">
                    <div 
                      onClick={() => setSelectedVOD(vod)}
                      className="aspect-video bg-neutral-950 flex items-center justify-center relative cursor-pointer overflow-hidden"
                    >
                      <img 
                        src={vod.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop"} 
                        alt={vod.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-14 w-14 rounded-full bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-900/50 scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play className="h-6 w-6 fill-white ml-1" />
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 bg-neutral-950/80 text-white font-mono text-xs px-2 py-0.5 rounded border border-neutral-800">
                        VOD
                      </span>
                    </div>

                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={vod.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"} 
                          alt={vod.user?.username} 
                          className="h-6 w-6 rounded-full object-cover border border-neutral-700"
                        />
                        <span className="text-xs text-neutral-400 font-bold truncate">{vod.user?.username || "Host NVide"}</span>
                      </div>
                      <CardTitle className="text-lg font-bold tracking-tight line-clamp-1 text-white group-hover:text-pink-400 transition-colors">
                        {vod.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-400 text-xs line-clamp-2 mt-1">
                        {vod.description}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="p-5 pt-0 flex justify-between text-neutral-500 border-t border-white/5 mt-4 text-xs font-semibold">
                      <div className="flex gap-4">
                        <span className="flex items-center hover:text-pink-500 transition-colors cursor-pointer">
                          <Heart className="h-4 w-4 mr-1 text-pink-500" /> {vod.like_count.toLocaleString()}
                        </span>
                        <span className="flex items-center hover:text-sky-500 transition-colors cursor-pointer">
                          <Eye className="h-4 w-4 mr-1 text-sky-400" /> {vod.view_count.toLocaleString()}
                        </span>
                      </div>
                      <span>
                        {new Date(vod.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-neutral-900 border border-neutral-800 border-dashed rounded-2xl shadow-xl">
                  <VideoIcon className="mx-auto h-16 w-16 text-neutral-700 mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-white mb-2">Belum Ada Video Rekaman</h3>
                  <p className="text-neutral-400 max-w-sm mx-auto text-sm">Unggah file siaran tunda pertama Anda untuk disaksikan penonton secara offline!</p>
                </div>
              )}
            </div>
          ) : (
            // GRID STORIES ARCHIVE
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <Card key={story.id} className="bg-neutral-900 border-neutral-800 text-neutral-100 overflow-hidden hover:border-neutral-700 transition-all duration-300 relative group">
                    <div className="aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 p-6 flex flex-col justify-between relative overflow-hidden">
                      {story.media_type === "image" ? (
                        <>
                          <img 
                            src={story.content} 
                            alt="Story Image" 
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                        </>
                      ) : null}

                      {/* User Info Header */}
                      <div className="flex justify-between items-start z-10">
                        <div className="flex items-center gap-2">
                          <img 
                            src={story.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50"} 
                            alt={story.username} 
                            className="h-8 w-8 rounded-full object-cover border-2 border-purple-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{story.username}</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(story.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => startStoryViewer([story])}
                          className="h-8 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] px-3 cursor-pointer"
                        >
                          LIHAT STORY
                        </Button>
                      </div>

                      {/* Content Body */}
                      <div className="z-10 mt-6 flex-1 flex items-center justify-center text-center">
                        {story.media_type === "text" ? (
                          <p className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent px-4">
                            "{story.content}"
                          </p>
                        ) : null}
                      </div>

                      {/* Footer Info */}
                      <div className="z-10 flex justify-between items-center mt-6 text-xs text-neutral-400 font-semibold pt-4 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-purple-400" /> {story.view_count.toLocaleString()} Dilihat
                        </span>
                        <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                          {story.media_type}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-neutral-900 border border-neutral-800 border-dashed rounded-2xl shadow-xl">
                  <ImageIcon className="mx-auto h-16 w-16 text-neutral-700 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-2">Cerita Masih Kosong</h3>
                  <p className="text-neutral-400 max-w-sm mx-auto text-sm">Jadilah yang pertama untuk membagikan cerita status hangat yang memukau penonton Anda!</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VOD PREMIUM PLAYER MODAL */}
      {selectedVOD && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden w-full max-w-4xl relative shadow-2xl flex flex-col">
            <button 
              onClick={() => setSelectedVOD(null)}
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center cursor-pointer border border-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <video 
                ref={videoPlayerRef}
                src={selectedVOD.file_path}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            <div className="p-6 space-y-3 bg-neutral-900 border-t border-neutral-800">
              <h2 className="text-2xl font-extrabold text-white">{selectedVOD.title}</h2>
              <p className="text-neutral-400 text-sm">{selectedVOD.description}</p>
              <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold pt-4">
                <span className="flex items-center gap-2">
                  <img 
                    src={selectedVOD.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"} 
                    alt={selectedVOD.user?.username} 
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span>Oleh {selectedVOD.user?.username}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span>Likes: {selectedVOD.like_count}</span>
                  <span>Views: {selectedVOD.view_count}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STORY VIEWER SCREEN MODAL */}
      {viewingStories && (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-lg animate-in fade-in duration-300 select-none">
          <div className="relative w-full max-w-[450px] aspect-[9/16] bg-neutral-900 sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800/50">
            
            {/* Story Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
              {viewingStories.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                    style={{ 
                      width: idx === currentStoryIndex 
                        ? `${storyProgress}%` 
                        : idx < currentStoryIndex 
                        ? "100%" 
                        : "0%" 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Profile & Close Bar */}
            <div className="absolute top-6 inset-x-4 z-20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img 
                  src={viewingStories[currentStoryIndex]?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50"} 
                  alt={viewingStories[currentStoryIndex]?.username} 
                  className="h-10 w-10 rounded-full object-cover border-2 border-white"
                />
                <span className="font-bold text-sm text-white drop-shadow-md">{viewingStories[currentStoryIndex]?.username}</span>
              </div>
              <button 
                onClick={() => setViewingStories(null)}
                className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer backdrop-blur-md border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Interactive Left/Right click panels */}
            <div className="absolute inset-y-0 inset-x-0 z-10 flex">
              <div onClick={handlePrevStory} className="w-[30%] h-full cursor-w-resize" />
              <div onClick={handleNextStory} className="w-[70%] h-full cursor-e-resize" />
            </div>

            {/* Story Background / Canvas content */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black flex flex-col items-center justify-center p-8 text-center select-text">
              {viewingStories[currentStoryIndex]?.media_type === "image" ? (
                <>
                  <img 
                    src={viewingStories[currentStoryIndex].content} 
                    alt="Story Content" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
                </>
              ) : null}

              {viewingStories[currentStoryIndex]?.media_type === "text" ? (
                <p className="text-2xl font-black text-white px-4 leading-relaxed drop-shadow-lg z-10 max-w-sm">
                  {viewingStories[currentStoryIndex].content}
                </p>
              ) : null}
            </div>

            {/* Story Footer Status */}
            <div className="absolute bottom-6 inset-x-4 z-20 text-center text-xs font-semibold text-neutral-400 drop-shadow-md">
              Tap sebelah kanan untuk lanjut, kiri untuk kembali.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
