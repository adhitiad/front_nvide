import { create } from "zustand";
import api from "@/lib/api";

export interface PredictionOption {
  id: string;
  text: string;
  totalBetIDR: number;
}

export interface Prediction {
  id: string;
  streamId: string;
  question: string;
  options: PredictionOption[];
  endsAt: string; // ISO String
  status: "active" | "resolved" | "cancelled";
  winnerOptionId?: string;
}

export interface UserBet {
  predictionId: string;
  optionId: string;
  amountBetIDR: number;
  status: "pending" | "won" | "lost" | "claimed";
  payoutIDR?: number;
}

interface PredictionState {
  activePrediction: Prediction | null;
  userBet: UserBet | null;
  loading: boolean;
  error: string | null;

  fetchActivePrediction: (streamId: string) => Promise<void>;
  placeBet: (predictionId: string, optionId: string, amountIDR: number) => Promise<void>;
  claimWinnings: (predictionId: string) => Promise<{ won: boolean; payout: number }>;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  activePrediction: null,
  userBet: null,
  loading: false,
  error: null,

  fetchActivePrediction: async (streamId: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/predictions/streams/${streamId}`);
      const data = res?.data || res;

      if (!data || Object.keys(data).length === 0) {
        // Fallback dummy active prediction untuk demonstrasi interaktif
        const dummy: Prediction = {
          id: "pred-1",
          streamId,
          question: "Apakah Host akan berhasil mengumpulkan 5,000 Likes dalam 15 menit berikutnya?",
          options: [
            { id: "yes", text: "Ya, Berhasil!", totalBetIDR: 450000 },
            { id: "no", text: "Tidak, Gagal!", totalBetIDR: 280000 },
          ],
          endsAt: new Date(Date.now() + 10 * 60000).toISOString(), // 10 menit dari sekarang
          status: "active",
        };
        set({ activePrediction: dummy, loading: false });
        return;
      }

      set({ activePrediction: data, loading: false });
    } catch {
      // Fallback jika API backend belum terhubung/di-seed
      const dummy: Prediction = {
        id: "pred-1",
        streamId,
        question: "Apakah Host akan mengenakan kostum pelayan (Maid Outfit) untuk show berikutnya?",
        options: [
          { id: "yes", text: "Ya, Tentu!", totalBetIDR: 620000 },
          { id: "no", text: "Tidak!", totalBetIDR: 350000 },
        ],
        endsAt: new Date(Date.now() + 5 * 60000).toISOString(),
        status: "active",
      };
      set({ activePrediction: dummy, loading: false });
    }
  },

  placeBet: async (predictionId: string, optionId: string, amountIDR: number) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/predictions/${predictionId}/bet`, { option_id: optionId, amount_idr: amountIDR });
      
      const newBet: UserBet = {
        predictionId,
        optionId,
        amountBetIDR: amountIDR,
        status: "pending",
      };

      // Perbarui total bets di state lokal secara optimis
      const active = get().activePrediction;
      if (active) {
        const updatedOptions = active.options.map((opt) => 
          opt.id === optionId ? { ...opt, totalBetIDR: opt.totalBetIDR + amountIDR } : opt
        );
        set({ activePrediction: { ...active, options: updatedOptions } });
      }

      set({ userBet: newBet, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memasang taruhan", loading: false });
      throw err;
    }
  },

  claimWinnings: async (predictionId: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.post(`/predictions/${predictionId}/claim`);
      const payout = res?.payout_idr || res?.data?.payout_idr || 0;
      const won = payout > 0;

      set((state) => ({
        userBet: state.userBet ? { ...state.userBet, status: "claimed", payoutIDR: payout } : null,
        loading: false,
      }));

      return { won, payout };
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal mencairkan kemenangan", loading: false });
      throw err;
    }
  }
}));
