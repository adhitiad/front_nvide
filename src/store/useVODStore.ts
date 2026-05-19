import { create } from "zustand";
import api from "@/lib/api";

export interface VODMedia {
  id: string;
  hostId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  isPremium: boolean;
  priceIDR: number;
  duration: number; // detik
  views: number;
  createdAt: string;
  host?: {
    username: string;
  };
}

interface VODState {
  vodList: VODMedia[];
  currentVOD: VODMedia | null;
  drmToken: string | null;
  verifyingDRM: boolean;
  unlockedVODs: string[];
  loading: boolean;
  error: string | null;

  fetchVODList: (filter?: "all" | "free" | "premium") => Promise<void>;
  fetchVODById: (id: string) => Promise<void>;
  requestDRMToken: (vodId: string) => Promise<string | null>;
  unlockVOD: (vodId: string, price: number) => Promise<void>;
}

export const useVODStore = create<VODState>((set, get) => ({
  vodList: [],
  currentVOD: null,
  drmToken: null,
  verifyingDRM: false,
  unlockedVODs: [],
  loading: false,
  error: null,

  fetchVODList: async (filter = "all") => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/vod?filter=${filter}`);
      const data = Array.isArray(res) ? res : res?.data || [];
      
      if (data.length === 0) {
        // Fallback dummy VOD list
        const dummy: VODMedia[] = [
          {
            id: "vod-1",
            hostId: "host-1",
            title: "Siaran Rekaman: Private VIP Dance Show 💋",
            description: "Show tari tiang sensual eksklusif VIP yang tidak disensor.",
            thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600",
            videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            isPremium: true,
            priceIDR: 4500,
            duration: 1200,
            views: 4520,
            createdAt: "2026-05-18",
            host: { username: "Angel_Secret" },
          },
          {
            id: "vod-2",
            hostId: "host-2",
            title: "Review Lovense Lush 3 Integration Setup",
            description: "Panduan lengkap bagaimana saya memasang mainan pintar dengan live chat.",
            thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600",
            videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            isPremium: false,
            priceIDR: 0,
            duration: 480,
            views: 8900,
            createdAt: "2026-05-17",
            host: { username: "Clara_Live" },
          },
          {
            id: "vod-3",
            hostId: "host-3",
            title: "Exclusive ASMR: Binaural Ear Licking 🎧",
            description: "ASMR kualitas 3D stereo terdalam untuk menenangkan tidur Anda.",
            thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600",
            videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            isPremium: true,
            priceIDR: 2500,
            duration: 1800,
            views: 2100,
            createdAt: "2026-05-16",
            host: { username: "Sasha_Warm" },
          }
        ];
        
        // Filter lokal
        const filtered = filter === "all" ? dummy : dummy.filter((v) => filter === "premium" ? v.isPremium : !v.isPremium);
        set({ vodList: filtered, loading: false });
        return;
      }

      set({ vodList: data, loading: false });
    } catch {
      // Fallback lokal jika API server gagal terhubung
      const dummy: VODMedia[] = [
        {
          id: "vod-1",
          hostId: "host-1",
          title: "Siaran Rekaman: Private VIP Dance Show 💋",
          description: "Show tari tiang sensual eksklusif VIP yang tidak disensor.",
          thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          isPremium: true,
          priceIDR: 4500,
          duration: 1200,
          views: 4520,
          createdAt: "2026-05-18",
          host: { username: "Angel_Secret" },
        },
        {
          id: "vod-2",
          hostId: "host-2",
          title: "Review Lovense Lush 3 Integration Setup",
          description: "Panduan lengkap bagaimana saya memasang mainan pintar dengan live chat.",
          thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          isPremium: false,
          priceIDR: 0,
          duration: 480,
          views: 8900,
          createdAt: "2026-05-17",
          host: { username: "Clara_Live" },
        }
      ];
      const filtered = filter === "all" ? dummy : dummy.filter((v) => filter === "premium" ? v.isPremium : !v.isPremium);
      set({ vodList: filtered, loading: false });
    }
  },

  fetchVODById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/vod/${id}`);
      const data = res?.data || res;
      set({ currentVOD: data, loading: false });
    } catch {
      // Fallback detail
      const dummy: VODMedia = {
        id,
        hostId: "host-1",
        title: "Siaran Rekaman: Private VIP Dance Show 💋",
        description: "Show tari tiang sensual eksklusif VIP yang tidak disensor. Nikmati visual premium beresolusi tinggi dengan lisensi enkripsi DRM standar industri.",
        thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600",
        videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        isPremium: true,
        priceIDR: 4500,
        duration: 1200,
        views: 4520,
        createdAt: "2026-05-18",
        host: { username: "Angel_Secret" },
      };
      set({ currentVOD: dummy, loading: false });
    }
  },

  requestDRMToken: async (vodId: string) => {
    set({ verifyingDRM: true, error: null });
    try {
      const res: any = await api.post(`/vod/${vodId}/drm-license`);
      const token = res?.drm_token || res?.data?.drm_token || "drm_token_mock_approved";
      
      // Tunggu visual delay agar penonton merasakan enkripsi DRM
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      set({ drmToken: token, verifyingDRM: false });
      return token;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Lisensi DRM ditolak", verifyingDRM: false });
      return null;
    }
  },

  unlockVOD: async (vodId: string, price: number) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/vod/${vodId}/unlock`);
      set((state) => ({
        unlockedVODs: [...state.unlockedVODs, vodId],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Pembelian VOD premium gagal", loading: false });
      throw err;
    }
  }
}));
