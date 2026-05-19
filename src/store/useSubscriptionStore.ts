import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VIPPlan {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  quota: number;
  description: string;
  features: string[];
}

export interface SubscriptionHistoryItem {
  id: string;
  planId: string;
  planName: string;
  pricePaid: number;
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "expired";
}

interface SubscriptionState {
  plans: VIPPlan[];
  activeSubscription: {
    planId: string;
    planName: string;
    quotaRemaining: number;
    quotaTotal: number;
    expiryDate: string;
  } | null;
  history: SubscriptionHistoryItem[];
  loading: boolean;
  error: string | null;

  subscribeToPlan: (planId: string, isFirstHostPromo?: boolean) => Promise<boolean>;
  deductQuota: (amount: number) => boolean;
  addQuota: (amount: number) => void;
  fetchSubscriptionInfo: () => Promise<void>;
}

const defaultPlans: VIPPlan[] = [
  {
    id: "vip1",
    name: "VIP1",
    price: 49999,
    promoPrice: 15678, // Promo host pertama
    quota: 10,
    description: "Paket awal untuk host baru.",
    features: ["10 clip/bulan", "Durasi aktif 1 bulan", "Kualitas MP4 720p", "Bisa share langsung"],
  },
  {
    id: "vip2",
    name: "VIP2",
    price: 89999,
    quota: 45,
    description: "Paket menengah untuk host aktif.",
    features: ["45 clip/bulan", "Durasi aktif 1 bulan", "Antrian prioritas", "Kualitas HD 1080p"],
  },
  {
    id: "vip3",
    name: "VIP3",
    price: 178999,
    quota: 100,
    description: "Paket tinggi untuk host profesional.",
    features: ["100 clip/bulan", "Durasi aktif 1 bulan", "Generate lebih cepat", "Kualitas Ultra HD 4K"],
  },
];

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plans: defaultPlans,
      activeSubscription: null,
      history: [],
      loading: false,
      error: null,

      subscribeToPlan: async (planId, isFirstHostPromo = false) => {
        set({ loading: true, error: null });
        try {
          const plan = get().plans.find((p) => p.id === planId);
          if (!plan) throw new Error("Plan not found");

          const price = isFirstHostPromo && plan.promoPrice ? plan.promoPrice : plan.price;
          
          // Mock call - wait 1.5s
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const now = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(now.getMonth() + 1);

          const newSubscription = {
            planId: plan.id,
            planName: plan.name,
            quotaRemaining: plan.quota,
            quotaTotal: plan.quota,
            expiryDate: nextMonth.toISOString(),
          };

          const newHistoryItem: SubscriptionHistoryItem = {
            id: "sub_" + Math.random().toString(36).substring(7),
            planId: plan.id,
            planName: plan.name,
            pricePaid: price,
            purchaseDate: now.toISOString(),
            expiryDate: nextMonth.toISOString(),
            status: "active",
          };

          // Expire previous active subscription history items
          const updatedHistory = get().history.map((item) => ({
            ...item,
            status: "expired" as const,
          }));

          set({
            activeSubscription: newSubscription,
            history: [newHistoryItem, ...updatedHistory],
            loading: false,
          });

          return true;
        } catch (e: any) {
          set({ loading: false, error: e.message || "Failed to subscribe" });
          return false;
        }
      },

      deductQuota: (amount) => {
        const sub = get().activeSubscription;
        if (!sub || sub.quotaRemaining < amount) {
          return false;
        }
        
        set({
          activeSubscription: {
            ...sub,
            quotaRemaining: sub.quotaRemaining - amount,
          },
        });
        return true;
      },

      addQuota: (amount) => {
        const sub = get().activeSubscription;
        if (sub) {
          set({
            activeSubscription: {
              ...sub,
              quotaRemaining: sub.quotaRemaining + amount,
              quotaTotal: sub.quotaTotal + amount,
            },
          });
        }
      },

      fetchSubscriptionInfo: async () => {
        // Mock fetch
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ loading: false });
      },
    }),
    {
      name: "subscription-storage",
    }
  )
);
