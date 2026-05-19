"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Loader2, 
  Coins, 
  Clock, 
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export default function PrivateCallPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const callId = params?.id as string;

  // Media Stream States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  // Connection & Control States
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "active" | "ended">("connecting");
  const [role, setRole] = useState<"caller" | "host" | "">("");
  const [callDuration, setCallDuration] = useState(0);
  const [coinsSpent, setCoinsSpent] = useState(0);

  // WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load Session & Fetch Call rates
  useEffect(() => {
    if (!callId || !session?.user) return;

    async function initCall() {
      try {
        // Fetch call details from backend to confirm caller or host role
        const callDetails = await api.get(`/calls/${callId}`) as any;
        if (callDetails.caller_id === session?.user?.id) {
          setRole("caller");
        } else if (callDetails.host_id === session?.user?.id) {
          setRole("host");
        } else {
          setRole("caller"); // fallback
        }

        // Get local video stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup Signaling WebSocket connection
        const token = localStorage.getItem("access_token");
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
        const ws = new WebSocket(`${WS_URL}/ws/call/${callId}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[Signaling] Connected to WebSocket Call Server!");
          setIsJoined(true);
          setupPeerConnection(stream, ws);
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle WebRTC Peer Exchange
            if (data.type === "webrtc:offer") {
              const pc = pcRef.current;
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                ws.send(JSON.stringify({ type: "webrtc:answer", payload: answer }));
                
                // If host, accept the call to trigger backend billing ticker
                if (session?.user?.role === "host") {
                  ws.send(JSON.stringify({ type: "call:accept" }));
                }
              }
            } else if (data.type === "webrtc:answer") {
              const pc = pcRef.current;
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              }
            } else if (data.type === "webrtc:ice") {
              const pc = pcRef.current;
              if (pc && data.payload) {
                await pc.addIceCandidate(new RTCIceCandidate(data.payload));
              }
            }
            
            // Handle Call Status Events
            else if (data.type === "call:tick") {
              setCoinsSpent((prev) => prev + 100); // 100 koin per menit
              toast.success("Saldo terpotong: -100 Koin NV (Panggilan Berjalan)");
            } else if (data.type === "call:ended") {
              setCallStatus("ended");
              toast.error(data.reason === "balance_insufficient" 
                ? "Panggilan terputus: Saldo Koin NV tidak mencukupi!" 
                : "Panggilan diakhiri oleh lawan bicara."
              );
              cleanupCall();
            }
          } catch (err) {
            console.error("Gagal memproses pesan signaling", err);
          }
        };

        ws.onerror = (err) => {
          console.error("Signaling error:", err);
          toast.error("Gagal terhubung ke server signaling!");
        };

        ws.onclose = () => {
          console.log("Signaling WebSocket disconnected.");
          setCallStatus("ended");
        };

      } catch (err) {
        console.error("Gagal inisialisasi media/signaling", err);
        toast.error("Gagal mengakses Kamera/Mikrofon!");
      }
    }

    initCall();

    return () => {
      cleanupCall();
    };
  }, [callId, session]);

  // Setup Peer Connection
  const setupPeerConnection = async (stream: MediaStream, ws: WebSocket) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });
    pcRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote stream track!");
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallStatus("active");
      }
    };

    // Gather ICE Candidates and send to peer
    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "webrtc:ice",
          payload: event.candidate
        }));
      }
    };

    // If Caller, initiate connection by sending Offer
    // We add a tiny delay to allow WS room setup
    setTimeout(async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({
          type: "webrtc:offer",
          payload: offer
        }));
        console.log("[WebRTC] Local offer sent to host!");
      } catch (err) {
        console.error("Gagal membuat WebRTC Offer", err);
      }
    }, 1000);
  };

  // Timer tracker for call duration
  useEffect(() => {
    if (callStatus !== "active") return;
    
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  // Clean up all resources
  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "call:end" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // User Action: End Call
  const handleEndCall = () => {
    toast.error("Panggilan diakhiri.");
    cleanupCall();
    router.replace("/dashboard/bookings");
  };

  // Toggle audio
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[85vh] bg-black text-white relative overflow-hidden rounded-3xl p-6 border border-neutral-900 shadow-2xl flex flex-col justify-between">
      
      {/* 1. CALL TOP STATUS PANEL */}
      <div className="flex items-center justify-between bg-neutral-950/60 border border-neutral-800/80 px-4 py-3 rounded-2xl backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-neutral-200">
            {callStatus === "connecting" ? "Menghubungkan..." : "Panggilan Video Premium"}
          </span>
        </div>

        {callStatus === "active" && (
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-indigo-400">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(callDuration)}
            </span>
            {role === "caller" && (
              <span className="flex items-center gap-1 text-pink-400">
                <Coins className="h-3.5 w-3.5" />
                {coinsSpent} Koin NV
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. VIDEO STREAMS VIEWPORTS GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 my-6 relative min-h-[450px]">
        
        {/* LOCAL VIDEO FEED (Kamera Depan Anda) */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          {(!localStream || isVideoOff) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 text-xs">
              <Loader2 className="h-8 w-8 text-neutral-700 animate-spin mb-2" />
              Kamera Lokal Dimatikan
            </div>
          )}
          <span className="absolute bottom-3 left-3 bg-neutral-950/80 border border-neutral-800 px-3 py-1 rounded-xl text-[10px] font-bold">
            Anda (Lokal)
          </span>
        </div>

        {/* REMOTE VIDEO FEED (Kamera Mitra Lawan Panggilan) */}
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-neutral-950 flex items-center justify-center shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {callStatus !== "active" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 text-xs space-y-2 text-center p-6">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-1" />
              <p className="font-bold text-neutral-300">Menunggu lawan bicara terhubung...</p>
              <p className="text-[10px] text-neutral-600 max-w-xs">Pastikan lawan bicara Anda menyetujui panggilan WebRTC ini.</p>
            </div>
          )}
          <span className="absolute bottom-3 left-3 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-xl text-[10px] font-bold text-indigo-300">
            Partner (Remote)
          </span>
        </div>

      </div>

      {/* 3. CALL CONTROLS PANEL */}
      <div className="flex justify-center items-center gap-4 bg-neutral-950/60 border border-neutral-800/80 py-4 px-6 rounded-2xl backdrop-blur-md z-10 max-w-sm mx-auto w-full">
        {/* Toggle Audio */}
        <Button
          onClick={toggleMute}
          className={`h-11 w-11 rounded-full p-0 flex items-center justify-center transition border ${
            isMuted 
              ? "bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30" 
              : "bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800"
          }`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* End Call / Hang Up */}
        <Button
          onClick={handleEndCall}
          className="h-12 w-12 rounded-full p-0 bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/35 border-transparent flex items-center justify-center transition"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>

        {/* Toggle Video */}
        <Button
          onClick={toggleVideo}
          className={`h-11 w-11 rounded-full p-0 flex items-center justify-center transition border ${
            isVideoOff 
              ? "bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30" 
              : "bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800"
          }`}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
        </Button>
      </div>

    </div>
  );
}
