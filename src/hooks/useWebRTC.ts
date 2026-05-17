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

  const onTrackRef = useRef(onTrack);
  onTrackRef.current = onTrack;

  useEffect(() => {
    if (!streamId) return;
    if (role === 'host' && !localStream) {
      return;
    }

    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    // Inisialisasi WebSocket Signaling
    const ws = new WebSocket(`${WS_URL}/api/v1/streams/${streamId}/signal?token=${token}&role=${role}`);
    wsRef.current = ws;

    const setupPeerConnection = async () => {
      if (pcRef.current) {
        console.log("[WebRTC] Closing existing PeerConnection for renegotiation...");
        pcRef.current.close();
      }

      console.log(`[WebRTC] Setting up new PeerConnection for ${role}...`);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      // Debugging connection states
      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state changed to: ${pc.connectionState}`);
        if (pc.connectionState === 'connected') {
          console.log('[WebRTC] PeerConnection is fully connected!');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn('[WebRTC] PeerConnection failed/disconnected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE Connection state changed to: ${pc.iceConnectionState}`);
      };

      pc.onicegatheringstatechange = () => {
        console.log(`[WebRTC] ICE Gathering state changed to: ${pc.iceGatheringState}`);
      };

      pc.onsignalingstatechange = () => {
        console.log(`[WebRTC] Signaling state changed to: ${pc.signalingState}`);
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          console.log(`[WebRTC] Sending ICE candidate to server:`, event.candidate.candidate);
          ws.send(JSON.stringify({
            type: 'ice_candidate',
            data: event.candidate
          }));
        }
      };

      // Handle Tracks
      pc.ontrack = (event) => {
        console.log("[WebRTC] Received remote track event:", event);
        if (event.streams && event.streams[0]) {
          console.log("[WebRTC] Remote stream detected:", event.streams[0]);
          if (onTrackRef.current) {
            onTrackRef.current(event.streams[0]);
          }
        } else {
          console.warn("[WebRTC] Remote track received but no associated media stream");
        }
      };

      // Jika role adalah host, tambahkan track lokal ke PeerConnection
      if (role === 'host' && localStream) {
        console.log("[WebRTC] Adding local tracks to PC:", localStream.getTracks());
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Jika role adalah viewer, tambahkan transceivers recvonly agar SDP berisi media sections
      if (role === 'viewer') {
        console.log("[WebRTC] Adding receive-only transceivers for viewer");
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });
      }

      // Create Offer
      // Baik host maupun viewer mengirim offer ke server (Pion) dalam desain ini
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("[WebRTC] Local offer created & set. Sending to server...");
        
        ws.send(JSON.stringify({
          type: 'offer',
          data: offer
        }));
      } catch (err) {
        console.error("[WebRTC] Failed to create or set local offer:", err);
      }
    };

    ws.onopen = () => {
      console.log(`[WebRTC] Signaling Connected as ${role}`);
      setIsConnected(true);
      setupPeerConnection();
    };

    ws.onerror = (err) => {
      console.error(`[WebRTC] Signaling WebSocket error for ${role}:`, err);
    };

    ws.onclose = (event) => {
      console.warn(`[WebRTC] Signaling WebSocket closed for ${role}:`, event);
      setIsConnected(false);
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const pc = pcRef.current;
        
        if (msg.type === 'renegotiate') {
          console.log("[WebRTC] Received renegotiate request from server. Re-establishing connection...");
          setupPeerConnection();
          return;
        }

        if (!pc) return;

        switch (msg.type) {
          case 'answer':
            console.log("[WebRTC] Received answer from server. Setting remote description...");
            await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
            break;
          case 'ice_candidate':
            console.log("[WebRTC] Received ICE candidate from server. Adding to peer connection...");
            if (msg.data) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.data));
            }
            break;
        }
      } catch (err) {
        console.error("[WebRTC] Failed to process signaling message:", err);
      }
    };

    return () => {
      if (pcRef.current) {
        console.log("[WebRTC] Cleaning up hook. Closing PeerConnection...");
        pcRef.current.close();
      }
      ws.close();
    };
  }, [streamId, role, localStream]);

  return { isConnected };
}
