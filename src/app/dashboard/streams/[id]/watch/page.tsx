"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MessageSquare, Heart, Gift, Share2, Flag, Radio } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import Hls from "hls.js";

export default function WatchStreamPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Stream Info
  useEffect(() => {
    async function fetchInfo() {
      try {
        const data = await api.get(`/streams/${streamId}`) as any;
        setStreamInfo(data);
      } catch (err) {
        console.error("Gagal memuat info stream", err);
      }
    }
    fetchInfo();
  }, [streamId]);

  // Setup HLS for Mux
  useEffect(() => {
    if (streamInfo?.mux_playback_url && remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      const hlsUrl = streamInfo.mux_playback_url;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      }
    }
  }, [streamInfo]);

  // WebRTC Hook for Viewer (Fallback)
  const { isConnected: isWebRTCConnected } = useWebRTC({
    streamId,
    role: 'viewer',
    onTrack: (stream) => {
      // Hanya gunakan WebRTC jika Mux tidak tersedia
      if (!streamInfo?.mux_playback_url) {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
    }
  });

  // Setup WebSocket untuk Live Chat Room
  useEffect(() => {
    if (!streamId) return;

    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    const socket = new WebSocket(`${WS_URL}/ws/rooms/${streamId}?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        console.error("Gagal membaca pesan", err);
      }
    };

    wsRef.current = socket;
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [streamId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !wsRef.current) return;

    const payload = {
      type: "chat_message",
      content: messageInput,
    };

    wsRef.current.send(JSON.stringify(payload));
    setMessages(prev => [...prev, { 
      sender: "Anda", 
      content: messageInput, 
      is_self: true 
    }]);
    setMessageInput("");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-black text-white min-h-screen">
      
      {/* KIRI: VIDEO PLAYER UTAMA */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden aspect-video shadow-2xl group">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
          />
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
              <span className="animate-pulse mr-2 h-2 w-2 bg-white rounded-full"></span>
              LIVE
            </div>
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center border border-white/10">
              <Users className="mr-2 h-3 w-3" /> {streamInfo?.viewers || 0}
            </div>
          </div>

          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-400 font-medium">Menghubungkan ke siaran...</p>
            </div>
          )}

          {/* Player Controls (Subtle) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Gift className="h-6 w-6 text-amber-400" />
                  </Button>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
               </div>
            </div>
          </div>
        </div>

        {/* Stream Info Detail */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{streamInfo?.title || "Loading Stream..."}</h1>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                  {(streamInfo?.host?.username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors">
                    {streamInfo?.host?.username || "Host Name"}
                  </p>
                  <p className="text-xs text-neutral-400">12.5K Followers</p>
                </div>
                <Button variant="outline" size="sm" className="ml-4 rounded-full border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white">
                  Ikuti
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-neutral-500">
              <Flag className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
            {streamInfo?.description || "Tidak ada deskripsi untuk stream ini."}
          </p>
        </div>
      </div>

      {/* KANAN: CHAT */}
      <div className="w-full lg:w-96 flex flex-col gap-4 h-[600px] lg:h-auto">
        <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-2xl">
          <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
              Live Chat
            </CardTitle>
            <div className="flex items-center gap-2">
               <span className="text-xs text-neutral-400 font-mono">ID: {streamId.slice(0, 8)}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col relative overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-1">
                  {!msg.system && (
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.is_self ? 'bg-indigo-600' : 'bg-neutral-800'}`}>
                      {(msg.sender || "A")[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!msg.system ? (
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold mb-0.5 ${msg.is_self ? 'text-indigo-400' : 'text-neutral-400'}`}>
                          {msg.sender || msg.username || "Viewer"}
                        </span>
                        <p className="text-sm text-neutral-200 break-words bg-neutral-800/50 p-2 rounded-lg rounded-tl-none">
                          {msg.content || msg.message}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center my-4 py-2 px-4 bg-indigo-950/30 border border-indigo-900/30 rounded-xl">
                        <p className="text-xs text-indigo-300 font-medium italic">{msg.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Katakan sesuatu yang baik..." 
                  className="bg-neutral-900 border-neutral-800 text-sm h-11 focus-visible:ring-indigo-500 rounded-xl"
                />
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 h-11 w-11 shrink-0 rounded-xl shadow-lg shadow-indigo-900/20">
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
