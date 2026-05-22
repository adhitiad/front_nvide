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
      set({ vodList: data, loading: false });
    } catch {
      set({ vodList: [], loading: false, error: "Failed to fetch VOD list" });
    }
  },

  fetchVODById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/vod/${id}`);
      const data = res?.data || res;
      set({ currentVOD: data, loading: false });
    } catch {
      set({ currentVOD: null, loading: false, error: "Failed to fetch VOD" });
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
