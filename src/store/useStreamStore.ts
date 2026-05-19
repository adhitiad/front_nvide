import { create } from "zustand";
import api from "@/lib/api";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  level?: number;
  xp?: number;
}

export interface Stream {
  id: string;
  host_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: string;
  category: string;
  tags: string;
  viewer_count: number;
  like_count: number;
  room_mode: string;
  mux_playback_url?: string;
  playback_id?: string;
  host?: User;
}

export interface Gift {
  id: string;
  name: string;
  icon_url: string;
  price: number;
  currency: string;
  animation_url?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  userLevel: number;
  chatColor: string;
  isVip: boolean;
  vipRank: number;
  timestamp: string;
  type: "chat" | "gift" | "like" | "system" | "warning";
  giftData?: {
    name: string;
    iconUrl: string;
    quantity: number;
    comboCount: number;
  };
}

interface StreamState {
  streams: Stream[];
  currentStream: Stream | null;
  gifts: Gift[];
  chatMessages: ChatMessage[];
  viewerCount: number;
  likes: number;
  loading: boolean;
  error: string | null;
  userLevel: number;
  userXp: number;
  userXpNext: number;

  fetchStreams: (category?: string) => Promise<void>;
  fetchStreamByID: (id: string) => Promise<void>;
  fetchGiftCatalog: () => Promise<void>;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  sendGift: (giftId: string, quantity: number, streamId: string) => Promise<any>;
  likeStream: (streamId: string) => Promise<void>;
  updateUserXP: (xp: number, level: number, xpNext: number) => void;
  setViewerCount: (count: number) => void;
  setLikes: (count: number) => void;
}

export const useStreamStore = create<StreamState>((set, get) => ({
  streams: [],
  currentStream: null,
  gifts: [],
  chatMessages: [],
  viewerCount: 0,
  likes: 0,
  loading: false,
  error: null,
  userLevel: 1,
  userXp: 0,
  userXpNext: 100,

  fetchStreams: async (category?: string) => {
    set({ loading: true, error: null });
    try {
      // Endpoint backend: GET /api/v1/streams/live atau GET /api/v1/streams
      const endpoint = category ? `/streams?category=${category}` : "/streams/live";
      const data: any = await api.get(endpoint);
      // Backend returns either array directly or wrapped
      const streamList = Array.isArray(data) ? data : data?.data || [];
      set({ streams: streamList, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memuat daftar siaran aktif", loading: false });
    }
  },

  fetchStreamByID: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Endpoint backend: GET /api/v1/streams/{stream_id}
      const data: any = await api.get(`/streams/${id}`);
      const stream = data?.data || data;
      set({ 
        currentStream: stream, 
        viewerCount: stream?.viewer_count || 0,
        likes: stream?.like_count || 0,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memuat detail siaran", loading: false });
    }
  },

  fetchGiftCatalog: async () => {
    try {
      // Endpoint backend: GET /api/v1/gifts
      const data: any = await api.get("/gifts");
      const giftList = Array.isArray(data) ? data : data?.data || [];
      set({ gifts: giftList });
    } catch (err) {
      console.error("Gagal memuat katalog hadiah:", err);
    }
  },

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-199), message], // Batasi maksimal 200 pesan di state
    }));
  },

  clearChat: () => set({ chatMessages: [] }),

  sendGift: async (giftId: string, quantity: number, streamId: string) => {
    try {
      // Endpoint backend: POST /api/v1/gifts/send
      const payload = {
        gift_id: giftId,
        quantity,
        stream_id: streamId,
      };
      const response = await api.post("/gifts/send", payload);
      
      // Update local balance/XP jika response menyertakan data keuangan/XP baru
      return response;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Gagal mengirim hadiah");
    }
  },

  likeStream: async (streamId: string) => {
    try {
      // Endpoint backend: POST /api/v1/likes
      await api.post("/likes", {
        content_id: streamId,
        content_type: "stream",
      });
      set((state) => ({ likes: state.likes + 1 }));
    } catch (err) {
      console.error("Gagal menyukai stream:", err);
    }
  },

  updateUserXP: (xp: number, level: number, xpNext: number) => {
    set({ userXp: xp, userLevel: level, userXpNext: xpNext });
  },

  setViewerCount: (count: number) => set({ viewerCount: count }),
  setLikes: (count: number) => set({ likes: count }),
}));
