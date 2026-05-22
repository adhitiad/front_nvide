import { create } from "zustand";

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
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // local UI state
  viewerCount: number;
  likes: number;
  setViewerCount: (count: number) => void;
  setLikes: (count: number) => void;
}

export const useStreamStore = create<StreamState>((set, get) => ({
  chatMessages: [],
  viewerCount: 0,
  likes: 0,

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-199), message], // Batasi maksimal 200 pesan di state
    }));
  },

  clearChat: () => set({ chatMessages: [] }),

  setViewerCount: (count: number) => set({ viewerCount: count }),
  setLikes: (count: number) => set({ likes: count }),
}));
