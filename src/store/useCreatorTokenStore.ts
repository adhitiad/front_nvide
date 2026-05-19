import { create } from "zustand";
import api from "@/lib/api";

export interface CreatorTokenInfo {
  hostId: string;
  name: string;
  symbol: string;
  totalSupply: number;
  currentPriceIDR: number;
  bondingCurveType: string;
  marketCapIDR: number;
}

export interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "video" | "image" | "chat";
  minTokenRequired: number;
  createdAt: string;
}

export interface PricePoint {
  time: string;
  price: number;
}

interface CreatorTokenState {
  tokenInfo: CreatorTokenInfo | null;
  userBalance: number;
  priceHistory: PricePoint[];
  exclusiveContent: ExclusiveContent[];
  loading: boolean;
  error: string | null;

  fetchTokenInfo: (hostId: string) => Promise<void>;
  fetchExclusiveContent: (hostId: string) => Promise<void>;
  buyToken: (hostId: string, amountIDR: number) => Promise<{ estimatedTokens: number }>;
  executeBuyToken: (hostId: string, amountIDR: number) => Promise<void>;
}

export const useCreatorTokenStore = create<CreatorTokenState>((set) => ({
  tokenInfo: null,
  userBalance: 0,
  priceHistory: [],
  exclusiveContent: [],
  loading: false,
  error: null,

  fetchTokenInfo: async (hostId: string) => {
    set({ loading: true, error: null });
    try {
      // Panggil API backend untuk mendapatkan info token kreator
      const res: any = await api.get(`/creator-tokens/hosts/${hostId}`);
      const data = res?.data || res;
      
      // Dummy data jika API backend belum fully seeded demi kelancaran demo
      const tokenInfo: CreatorTokenInfo = {
        hostId: data?.host_id || hostId,
        name: data?.name || "Host Exclusive Token",
        symbol: data?.symbol || "HOSTX",
        totalSupply: data?.total_supply || 1000000,
        currentPriceIDR: data?.current_price || 1500,
        bondingCurveType: data?.bonding_curve_type || "exponential",
        marketCapIDR: data?.market_cap || 15000000,
      };

      // Dummy price history untuk grafik Recharts
      const priceHistory: PricePoint[] = [
        { time: "09:00", price: 1200 },
        { time: "10:00", price: 1250 },
        { time: "11:00", price: 1300 },
        { time: "12:00", price: 1280 },
        { time: "13:00", price: 1350 },
        { time: "14:00", price: 1420 },
        { time: "15:00", price: tokenInfo.currentPriceIDR },
      ];

      // Saldo user saat ini
      const balanceRes: any = await api.get(`/creator-tokens/hosts/${hostId}/balance`).catch(() => ({ balance: 120 }));
      const userBalance = balanceRes?.balance || balanceRes?.data?.balance || 120;

      set({ tokenInfo, priceHistory, userBalance, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memuat token kreator", loading: false });
    }
  },

  fetchExclusiveContent: async (hostId: string) => {
    try {
      const res: any = await api.get(`/creator-tokens/hosts/${hostId}/exclusive-content`);
      const exclusiveContent = Array.isArray(res) ? res : res?.data || [
        {
          id: "ex-1",
          title: "Private Behind-the-Scenes Video",
          description: "Video eksklusif saat pemotretan studio kemarin.",
          mediaUrl: "https://example.com/stream.m3u8",
          mediaType: "video",
          minTokenRequired: 50,
          createdAt: "2026-05-18",
        },
        {
          id: "ex-2",
          title: "Exclusive Selfie Pack",
          description: "Kumpulan foto premium beresolusi tinggi.",
          mediaUrl: "https://example.com/photos.zip",
          mediaType: "image",
          minTokenRequired: 100,
          createdAt: "2026-05-19",
        }
      ];
      set({ exclusiveContent });
    } catch (err) {
      console.error("Gagal mengambil konten eksklusif:", err);
    }
  },

  buyToken: async (hostId: string, amountIDR: number) => {
    // Estimasi pembelian token (simulasi bonding curve lokal)
    try {
      const res: any = await api.post(`/creator-tokens/hosts/${hostId}/estimate-buy`, { amount_idr: amountIDR });
      return { estimatedTokens: res?.estimated_tokens || res?.data?.estimated_tokens || Math.floor(amountIDR / 1500) };
    } catch {
      return { estimatedTokens: Math.floor(amountIDR / 1500) };
    }
  },

  executeBuyToken: async (hostId: string, amountIDR: number) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/creator-tokens/hosts/${hostId}/buy`, { amount_idr: amountIDR });
      // Refresh token info & saldo
      const resInfo: any = await api.get(`/creator-tokens/hosts/${hostId}`);
      const data = resInfo?.data || resInfo;
      
      const balanceRes: any = await api.get(`/creator-tokens/hosts/${hostId}/balance`).catch(() => ({ balance: 120 }));
      const userBalance = balanceRes?.balance || balanceRes?.data?.balance || 120;

      set((state) => ({
        userBalance,
        tokenInfo: state.tokenInfo ? { ...state.tokenInfo, currentPriceIDR: data?.current_price || state.tokenInfo.currentPriceIDR } : null,
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal mengeksekusi pembelian token", loading: false });
      throw err;
    }
  }
}));
