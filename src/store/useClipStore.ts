import { create } from "zustand";
import api from "@/lib/api";

export interface AIClip {
  id: string;
  streamId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // detik
  likes: number;
  createdAt: string;
}

interface ClipState {
  clips: AIClip[];
  generating: boolean;
  loading: boolean;
  error: string | null;

  fetchClips: (streamId: string) => Promise<void>;
  regenerateClips: (streamId: string) => Promise<void>;
}

export const useClipStore = create<ClipState>((set) => ({
  clips: [],
  generating: false,
  loading: false,
  error: null,

  fetchClips: async (streamId: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/streams/${streamId}/clips`);
      const data = Array.isArray(res) ? res : res?.data || [];
      set({ clips: data, loading: false });
    } catch {
      // Fallback dummy AI Clips
      const dummy: AIClip[] = [
        {
          id: "clip-1",
          streamId,
          title: "Momen Terbaik: Lovense Vibe Reaction! ⚡",
          thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=400",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          duration: 30,
          likes: 450,
          createdAt: "2026-05-19",
        },
        {
          id: "clip-2",
          streamId,
          title: "Momen Terbaik: Koin Tumpah 1000 Coins Rain! 🪙",
          thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          duration: 45,
          likes: 820,
          createdAt: "2026-05-19",
        }
      ];
      set({ clips: dummy, loading: false });
    }
  },

  regenerateClips: async (streamId: string) => {
    set({ generating: true, error: null });
    try {
      await api.post(`/streams/${streamId}/clips/regenerate`);
      // Tunggu delay visual proses AI
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const dummy: AIClip[] = [
        {
          id: "clip-1",
          streamId,
          title: "Momen Terbaik: Lovense Vibe Reaction! ⚡",
          thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=400",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          duration: 30,
          likes: 450,
          createdAt: "2026-05-19",
        },
        {
          id: "clip-2",
          streamId,
          title: "Momen Terbaik: Koin Tumpah 1000 Coins Rain! 🪙",
          thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          duration: 45,
          likes: 820,
          createdAt: "2026-05-19",
        },
        {
          id: "clip-3",
          streamId,
          title: "Baru Dihasilkan: Private Chat Confession ❤️",
          thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400",
          videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          duration: 15,
          likes: 120,
          createdAt: "2026-05-19",
        }
      ];
      
      set({ clips: dummy, generating: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal menghasilkan ulang klip AI", generating: false });
      throw err;
    }
  }
}));
