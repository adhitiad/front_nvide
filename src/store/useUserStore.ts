import { create } from "zustand";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  xp_next: number;
  banned: boolean;
  avatarUrl?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface UserState {
  user: UserProfile | null;
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<UserProfile | null>;
  fetchWallet: () => Promise<Wallet | null>;
  updateRole: (role: string) => void;
  updateBalance: (amount: number) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  wallet: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      // Endpoint backend: GET /auth/me atau GET /users/profile
      const data: any = await api.get("/auth/me");
      const profile = data?.data || data;
      set({ user: profile, loading: false });
      return profile;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal memuat profil pengguna";
      set({ error: errMsg, loading: false });
      return null;
    }
  },

  fetchWallet: async () => {
    set({ loading: true, error: null });
    try {
      // Endpoint backend: GET /wallet/balance
      const data: any = await api.get("/wallet/balance");
      const walletData = data?.data || data;
      set({ wallet: walletData, loading: false });
      return walletData;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memuat saldo dompet", loading: false });
      return null;
    }
  },

  updateRole: (role: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
  },

  updateBalance: (amount: number) => {
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance: amount } : null,
    }));
  },

  setUser: (user: UserProfile | null) => {
    set({ user });
  },

  logout: async () => {
    set({ user: null, wallet: null, error: null });
    try { await authClient.signOut(); } catch { /* ignore */ }
  },
}));
