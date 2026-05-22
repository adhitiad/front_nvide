"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Gift {
  id: string;
  name: string;
  price: number; // in IDR
  icon_url?: string;
  description?: string;
  category?: string;
}

export interface GiftTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  gift_id: string;
  quantity: number;
  room_id?: string;
  conversation_id?: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface GiftLeaderboard {
  rank: number;
  user_id: string;
  username: string;
  total_gift_value: number;
  gift_count: number;
}

export function useGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available gifts
  const fetchGiftCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = (await api.get("/gifts")) as Gift[];
      setGifts(data || []);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memuat katalog gift";
      setError(message);
      console.error("Fetch gift catalog error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send gift to recipient
  const sendGift = useCallback(
    async (
      receiverId: string,
      giftId: string,
      quantity: number = 1,
      options?: {
        roomId?: string;
        conversationId?: string;
      }
    ) => {
      try {
        setSending(giftId);
        setError(null);

        const payload = {
          receiver_id: receiverId,
          gift_id: giftId,
          quantity,
          room_id: options?.roomId,
          conversation_id: options?.conversationId,
        };

        const response = (await api.post("/gifts/send", payload)) as GiftTransaction;
        
        const gift = gifts.find((g) => g.id === giftId);
        const giftName = gift?.name || "Gift";
        toast.success(`${giftName} berhasil dikirim!`);

        return response;
      } catch (err: any) {
        const message = err.response?.data?.message || "Gagal mengirim gift";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setSending(null);
      }
    },
    [gifts]
  );

  // Send gift in private chat
  const sendPrivateGift = useCallback(
    async (receiverId: string, conversationId: string, giftId: string, quantity: number = 1) => {
      return sendGift(receiverId, giftId, quantity, { conversationId });
    },
    [sendGift]
  );

  // Send gift in stream chat
  const sendStreamGift = useCallback(
    async (receiverId: string, roomId: string, giftId: string, quantity: number = 1) => {
      return sendGift(receiverId, giftId, quantity, { roomId });
    },
    [sendGift]
  );

  // Get leaderboard for gifts in a stream
  const getGiftLeaderboard = useCallback(async (streamId: string) => {
    try {
      setLoading(true);
      const response = (await api.get(`/streams/${streamId}/gifts/leaderboard`)) as GiftLeaderboard[];
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memuat leaderboard gift";
      console.error("Fetch gift leaderboard error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    gifts,
    loading,
    sending,
    error,

    // Methods
    fetchGiftCatalog,
    sendGift,
    sendPrivateGift,
    sendStreamGift,
    getGiftLeaderboard,
  };
}
