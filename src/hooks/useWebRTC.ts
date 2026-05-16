import { useEffect, useRef, useState } from 'react';

interface UseWebRTCOptions {
  streamId: string;
  role: 'host' | 'viewer';
  onTrack?: (stream: MediaStream) => void;
  localStream?: MediaStream | null;
}

export function useWebRTC({ streamId, role, onTrack, localStream }: UseWebRTCOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!streamId) return;

    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    // Inisialisasi WebSocket Signaling
    const ws = new WebSocket(`${WS_URL}/api/v1/streams/${streamId}/signal?token=${token}&role=${role}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebRTC Signaling Connected as ${role}`);
      setIsConnected(true);
      setupPeerConnection();
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      const pc = pcRef.current;
      if (!pc) return;

      switch (msg.type) {
        case 'answer':
          console.log("Received answer from server");
          await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
          break;
        case 'ice_candidate':
          console.log("Received ICE candidate from server");
          if (msg.data) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.data));
          }
          break;
      }
    };

    const setupPeerConnection = async () => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'ice_candidate',
            data: event.candidate
          }));
        }
      };

      // Handle Tracks
      pc.ontrack = (event) => {
        console.log("Received remote track");
        if (onTrack && event.streams[0]) {
          onTrack(event.streams[0]);
        }
      };

      // Jika role adalah host, tambahkan track lokal ke PeerConnection
      if (role === 'host' && localStream) {
        console.log("Adding local tracks to PC");
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Create Offer
      // Baik host maupun viewer mengirim offer ke server (Pion) dalam desain ini
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        ws.send(JSON.stringify({
          type: 'offer',
          data: offer
        }));
      } catch (err) {
        console.error("Failed to create offer", err);
      }
    };

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [streamId, role, localStream, onTrack]);

  return { isConnected };
}
