"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Settings, Users, MessageSquare, ExternalLink } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function WebRTCStreamRoom() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  
  const [isLive, setIsLive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Hook for Broadcaster
  const { isConnected: isWebRTCConnected } = useWebRTC({
    streamId,
    role: 'host',
    localStream: isLive ? localStream : null // Hanya connect jika sudah LIVE
  });

  // Setup Kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        setLocalStream(stream);
      } catch (err) {
        console.error("Gagal mengakses kamera/mikrofon", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update video element srcObject when localStream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup WebSocket untuk Live Chat Room
  useEffect(() => {
    if (!streamId) return;

    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    // Inisialisasi koneksi WebSocket
    // Menggunakan query string untuk mengirim token (cara umum di Go)
    const socket = new WebSocket(`${WS_URL}/ws/rooms/${streamId}?token=${token}`);
    
    socket.onopen = () => {
      console.log("WebSocket Live Chat Connected");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        
        // Auto scroll ke bawah
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        console.error("Gagal membaca pesan", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Live Chat Disconnected");
    };

    wsRef.current = socket;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [streamId]);

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const handleStartBroadcast = async () => {
    try {
      const data = await api.post(`/streams/${streamId}/start`) as any;
      setIsLive(true);
      setStreamInfo(data); // Update stream info with Mux keys
      setMessages(prev => [...prev, { system: true, message: "Siaran langsung telah dimulai!" }]);
    } catch (err) {
      console.error("Gagal memulai broadcast", err);
      alert("Gagal terhubung ke server. Pastikan stream valid.");
    }
  };

  const handleEndBroadcast = async () => {
    try {
      await api.post(`/streams/${streamId}/end`);
      setIsLive(false);
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      router.push("/dashboard/streams");
    } catch (err) {
      console.error("Gagal mengakhiri broadcast", err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !wsRef.current) return;

    // Format payload tergantung ekspektasi backend Go (biasanya JSON)
    const payload = {
      type: "chat_message",
      content: messageInput,
    };

    wsRef.current.send(JSON.stringify(payload));
    
    // Tambahkan pesan ke UI secara optimistik jika backend me-loopback pesan, 
    // jika backend me-loopback pesan kita sendiri, blok ini bisa di-skip
    // Tapi untuk memastikan responsivitas:
    setMessages(prev => [...prev, { 
      sender: "Anda", 
      content: messageInput, 
      is_self: true 
    }]);

    setMessageInput("");
    
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* KIRI: VIDEO PLAYER UTAMA & KONTROL */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col gap-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center">
                Room: <span className="text-indigo-400 ml-2">{streamId}</span>
                {isLive && (
                  <span className="ml-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                    LIVE BROADCASTING
                  </span>
                )}
              </h1>
              <p className="text-sm text-neutral-400">Gunakan browser atau software seperti OBS untuk mengudara</p>
            </div>
            <div className="flex gap-2">
              {isLive && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/dashboard/streams/${streamId}/watch`, '_blank')}
                  className="border-neutral-700 text-neutral-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lihat Sebagai Penonton
                </Button>
              )}
              {!isLive ? (
                <Button onClick={handleStartBroadcast} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/50">
                  Mulai Mengudara
                </Button>
              ) : (
                <Button onClick={handleEndBroadcast} variant="destructive">
                  Akhiri Siaran
                </Button>
              )}
            </div>
          </div>

          {isLive && streamInfo?.stream_key && (
            <div className="mt-4 p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-lg space-y-3">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Mux Stream Credentials (Untuk OBS)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase">RTMP Server URL</p>
                  <code className="text-xs text-white bg-black/50 p-2 rounded block mt-1">rtmp://global-live.mux.com:5222/app</code>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase">Stream Key</p>
                  <code className="text-xs text-amber-400 bg-black/50 p-2 rounded block mt-1">{streamInfo.stream_key}</code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 bg-black rounded-xl border border-neutral-800 overflow-hidden aspect-video shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-300 ${!cameraEnabled ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
              <VideoOff className="h-20 w-20 text-neutral-700" />
            </div>
          )}

          {/* Baris Kontrol Mengambang */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-neutral-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-700">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleMic}
              className={`rounded-full h-12 w-12 border-0 transition-colors ${micEnabled ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-red-900/50 hover:bg-red-900/80 text-red-400'}`}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleCamera}
              className={`rounded-full h-12 w-12 border-0 transition-colors ${cameraEnabled ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-red-900/50 hover:bg-red-900/80 text-red-400'}`}
            >
              {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-0 bg-neutral-800 hover:bg-neutral-700 text-white"
              onClick={toggleCamera}
              title={cameraEnabled ? "Pause Kamera" : "Resume Kamera"}
            >
              <MonitorUp className={`h-5 w-5 ${!cameraEnabled ? 'text-red-500' : ''}`} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-0 bg-neutral-800 hover:bg-neutral-700 text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <div className="w-px h-8 bg-neutral-700 mx-2"></div>

            <Button 
              variant="destructive" 
              size="icon" 
              onClick={handleEndBroadcast}
              className="rounded-full h-12 w-12 shadow-lg shadow-red-900/50"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* KANAN: CHAT & VIEWER LIST */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-xl">
          <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
              Live Chat
            </CardTitle>
            <div className="text-xs text-neutral-400 flex items-center">
              <Users className="mr-1 h-3 w-3" /> <span className="animate-pulse mr-1 h-2 w-2 bg-emerald-500 rounded-full inline-block"></span> Terhubung
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col relative h-[500px] lg:h-auto">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-neutral-800">
              <div className="text-xs text-center text-neutral-500 my-2 bg-neutral-950 py-1 rounded-full border border-neutral-800">
                Koneksi WebSocket WebSocket terjalin
              </div>
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.system ? 'text-center my-2 text-amber-400 font-medium' : 'animate-in fade-in slide-in-from-bottom-2'}`}>
                  {!msg.system && (
                    <span className={`font-bold ${msg.is_self ? 'text-indigo-400' : 'text-emerald-400'}`}>
                      {msg.sender || msg.username || "Anonymous"}:{" "}
                    </span>
                  )}
                  <span className={msg.system ? '' : 'text-neutral-300'}>{msg.content || msg.message}</span>
                </div>
              ))}
              
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-3 border-t border-neutral-800 bg-neutral-950">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ketik pesan..." 
                  className="bg-neutral-900 border-neutral-800 text-sm h-10 focus-visible:ring-indigo-500"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4">
                  Kirim
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
