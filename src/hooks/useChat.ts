import { useEffect, useRef, useState, useCallback } from "react";
import { useStreamStore, ChatMessage } from "@/store/useStreamStore";
import { toast } from "sonner";

interface UseChatOptions {
  streamId: string;
  userId?: string;
  username?: string;
}

export function useChat({ streamId, userId, username }: UseChatOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const addChatMessage = useStreamStore((state) => state.addChatMessage);
  const setViewerCount = useStreamStore((state) => state.setViewerCount);
  const setLikes = useStreamStore((state) => state.setLikes);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!streamId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    const wsUrl = `${WS_URL}/ws/chat/${streamId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WebSocket Chat] Koneksi berhasil dibuka!");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      addChatMessage({
        id: `sys-conn-${Date.now()}`,
        userId: "system",
        username: "Sistem",
        content: "Anda telah bergabung ke dalam obrolan siaran langsung.",
        userLevel: 0,
        chatColor: "#10B981",
        isVip: false,
        vipRank: 0,
        timestamp: new Date().toISOString(),
        type: "system",
      });
    };

    ws.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const { type, payload, timestamp } = rawData;

        switch (type) {
          case "chat": {
            const msg: ChatMessage = {
              id: payload.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: payload.user_id,
              username: payload.username || "Anonim",
              content: payload.content,
              userLevel: payload.user_level || 1,
              chatColor: payload.chat_color || "#ffffff",
              isVip: !!payload.is_vip,
              vipRank: payload.vip_rank || 0,
              timestamp: timestamp || new Date().toISOString(),
              type: "chat",
            };
            addChatMessage(msg);
            break;
          }

          case "gift": {
            const giftMsg: ChatMessage = {
              id: `gift-${Date.now()}-${Math.random()}`,
              userId: payload.sender_id,
              username: payload.sender_username || "Seseorang",
              content: `mengirim ${payload.quantity}x ${payload.gift_name}! 🎁 (Combo x${payload.combo_count || 1})`,
              userLevel: payload.sender_level || 1,
              chatColor: "#F59E0B",
              isVip: false,
              vipRank: 0,
              timestamp: timestamp || new Date().toISOString(),
              type: "gift",
              giftData: {
                name: payload.gift_name,
                iconUrl: payload.icon_url,
                quantity: payload.quantity,
                comboCount: payload.combo_count || 1,
              },
            };
            addChatMessage(giftMsg);

            if (typeof window !== "undefined") {
              const ev = new CustomEvent("trigger-gift-effect", { detail: payload });
              window.dispatchEvent(ev);
            }
            break;
          }

          case "like": {
            const likeMsg: ChatMessage = {
              id: `like-${Date.now()}-${Math.random()}`,
              userId: payload.user_id,
              username: payload.username || "Seseorang",
              content: `menyukai siaran ini! ❤️`,
              userLevel: payload.user_level || 1,
              chatColor: "#EF4444",
              isVip: false,
              vipRank: 0,
              timestamp: timestamp || new Date().toISOString(),
              type: "like",
            };
            addChatMessage(likeMsg);
            if (payload.like_count !== undefined) {
              setLikes(payload.like_count);
            }
            break;
          }

          case "system_announcement": {
            addChatMessage({
              id: `sys-${Date.now()}`,
              userId: "system",
              username: "NVide Bot",
              content: payload.message || JSON.stringify(payload),
              userLevel: 99,
              chatColor: "#3B82F6",
              isVip: false,
              vipRank: 0,
              timestamp: timestamp || new Date().toISOString(),
              type: "system",
            });
            break;
          }

          case "moderation_warning": {
            toast.warning(payload.message || "Peringatan moderasi dari admin.");
            addChatMessage({
              id: `sys-warn-${Date.now()}`,
              userId: "system",
              username: "Peringatan Keamanan",
              content: payload.message || JSON.stringify(payload),
              userLevel: 99,
              chatColor: "#EF4444",
              isVip: false,
              vipRank: 0,
              timestamp: timestamp || new Date().toISOString(),
              type: "warning",
            });
            break;
          }

          case "force_disconnect": {
            toast.error(`Anda telah dikeluarkan. Alasan: ${payload.reason || "Pelanggaran aturan"}`);
            ws.close();
            break;
          }

          case "error": {
            toast.error(payload.message || "Terjadi kesalahan obrolan");
            break;
          }

          case "viewer_update": {
            if (payload.viewer_count !== undefined) {
              setViewerCount(payload.viewer_count);
            }
            break;
          }

          case "xp_update": {
            if (payload.user_id === userId) {
              toast.success(`Level Up! Selamat Anda naik ke Level ${payload.level}!`);
            }
            break;
          }
        }
      } catch (err) {
        console.error("[WebSocket Chat] Gagal parsing pesan:", err);
      }
    };

    ws.onclose = (event) => {
      console.warn("[WebSocket Chat] Koneksi ditutup:", event);
      setIsConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000;
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, timeout);
      } else {
        toast.error("Gagal menyambung kembali ke server obrolan.");
      }
    };

    ws.onerror = (err) => {
      console.error("[WebSocket Chat] Error terjadi:", err);
    };
  }, [streamId, addChatMessage, setViewerCount, setLikes, userId]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Gagal mengirim pesan: Obrolan belum terhubung");
      return false;
    }

    socketRef.current.send(JSON.stringify({ type: "chat", payload: content }));
    return true;
  }, []);

  const sendLike = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    socketRef.current.send(JSON.stringify({ type: "like", payload: {} }));
    return true;
  }, []);

  return { isConnected, sendMessage, sendLike };
}
