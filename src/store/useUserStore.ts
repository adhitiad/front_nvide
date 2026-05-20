import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { ApiEnvelope, UserProfile, Wallet } from "@/lib/types/api";

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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      wallet: null,
      loading: false,
      error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const envelope: ApiEnvelope<UserProfile> = await api.get("/auth/me");
      const profile = envelope.data;
      set({ user: profile, loading: false });
      return profile;
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || "Gagal memuat profil pengguna";
      set({ error: errMsg, loading: false });
      return null;
    }
  },

  fetchWallet: async () => {
    set({ loading: true, error: null });
    try {
      const envelope: ApiEnvelope<Wallet> = await api.get("/wallet/balance");
      const walletData = envelope.data;
      set({ wallet: walletData, loading: false });
      return walletData;
    } catch (err: any) {
      set({ error: err?.response?.data?.error?.message || "Gagal memuat saldo dompet", loading: false });
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
    }),
    {
      name: "nvide-user-storage",
      partialize: (state) => ({ user: state.user, wallet: state.wallet }),
    }
  )
);
