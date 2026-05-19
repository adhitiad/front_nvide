import { create } from "zustand";
import api from "@/lib/api";
import { Stream } from "./useStreamStore";

interface RecommendationState {
  recommendedStreams: Stream[];
  loading: boolean;
  error: string | null;

  fetchRecommendations: () => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendedStreams: [],
  loading: false,
  error: null,

  fetchRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get("/recommendations");
      const data = Array.isArray(res) ? res : res?.data || [];
      set({ recommendedStreams: data, loading: false });
    } catch {
      // Fallback: ambil stream reguler jika data rekomendasi AI kosong
      try {
        const res: any = await api.get("/streams/live");
        const data = Array.isArray(res) ? res : res?.data || [];
        set({ recommendedStreams: data.slice(0, 3), loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    }
  }
}));
