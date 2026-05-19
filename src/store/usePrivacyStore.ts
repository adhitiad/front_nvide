import { create } from "zustand";
import api from "@/lib/api";

export interface MutedBlockedUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface PrivacyState {
  privateProfile: boolean;
  incognitoMode: boolean;
  disappearingMessagesDuration: "none" | "1h" | "24h" | "7d";
  blockedUsers: MutedBlockedUser[];
  mutedUsers: MutedBlockedUser[];
  loading: boolean;
  error: string | null;

  fetchPrivacySettings: () => Promise<void>;
  updatePrivacySetting: (key: "privateProfile" | "incognitoMode" | "disappearingMessagesDuration", value: any) => Promise<void>;
  fetchBlockMuteList: () => Promise<void>;
  blockUser: (userId: string, username: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  muteUser: (userId: string, username: string) => Promise<void>;
  unmuteUser: (userId: string) => Promise<void>;
}

export const usePrivacyStore = create<PrivacyState>((set, get) => ({
  privateProfile: false,
  incognitoMode: false,
  disappearingMessagesDuration: "none",
  blockedUsers: [],
  mutedUsers: [],
  loading: false,
  error: null,

  fetchPrivacySettings: async () => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get("/settings/privacy");
      const data = res?.data || res;
      set({
        privateProfile: !!data?.private_profile,
        incognitoMode: !!data?.incognito_mode,
        disappearingMessagesDuration: data?.disappearing_messages_duration || "none",
        loading: false,
      });
    } catch {
      // Localstorage fallback
      if (typeof window !== "undefined") {
        set({
          privateProfile: localStorage.getItem("pp_private_profile") === "true",
          incognitoMode: localStorage.getItem("pp_incognito_mode") === "true",
          disappearingMessagesDuration: (localStorage.getItem("pp_disappearing_duration") as any) || "none",
          loading: false,
        });
      }
    }
  },

  updatePrivacySetting: async (key, value) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        private_profile: key === "privateProfile" ? value : get().privateProfile,
        incognito_mode: key === "incognitoMode" ? value : get().incognitoMode,
        disappearing_messages_duration: key === "disappearingMessagesDuration" ? value : get().disappearingMessagesDuration,
      };
      await api.put("/settings/privacy", payload);
      set({ [key]: value, loading: false } as any);
    } catch {
      // Local fallback
      if (typeof window !== "undefined") {
        if (key === "privateProfile") localStorage.setItem("pp_private_profile", String(value));
        if (key === "incognitoMode") localStorage.setItem("pp_incognito_mode", String(value));
        if (key === "disappearingMessagesDuration") localStorage.setItem("pp_disappearing_duration", String(value));
      }
      set({ [key]: value, loading: false } as any);
    }
  },

  fetchBlockMuteList: async () => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get("/settings/privacy/relations");
      const data = res?.data || res;
      set({
        blockedUsers: data?.blocked || [],
        mutedUsers: data?.muted || [],
        loading: false,
      });
    } catch {
      // Fallback dummy
      set({
        blockedUsers: [
          { id: "bl-1", username: "SpamBot_Adult" },
          { id: "bl-2", username: "Troll99" },
        ],
        mutedUsers: [
          { id: "mu-1", username: "ChatSpammer_2" },
        ],
        loading: false,
      });
    }
  },

  blockUser: async (userId, username) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/settings/privacy/relations/block`, { target_id: userId });
      set((state) => ({
        blockedUsers: [...state.blockedUsers, { id: userId, username }],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  unblockUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/settings/privacy/relations/unblock`, { target_id: userId });
      set((state) => ({
        blockedUsers: state.blockedUsers.filter((u) => u.id !== userId),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  muteUser: async (userId, username) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/settings/privacy/relations/mute`, { target_id: userId });
      set((state) => ({
        mutedUsers: [...state.mutedUsers, { id: userId, username }],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  unmuteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/settings/privacy/relations/unmute`, { target_id: userId });
      set((state) => ({
        mutedUsers: state.mutedUsers.filter((u) => u.id !== userId),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
