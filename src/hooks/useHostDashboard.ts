import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface HostStats {
  todayRevenue: number;
  totalViews: number;
  totalLikes: number;
  giftsReceived: number;
  subscribers: number;
}

export interface RevenueData {
  name: string;
  amount: number;
}

export interface HostClip {
  id: string;
  title: string;
  duration: string;
  views: number;
  likes: number;
}

export interface StreamHistory {
  id: string;
  date: string;
  duration: string;
  views: number;
  likes: number;
  gifts: number;
  income: number;
}

export interface ShowRequest {
  id: string;
  requester: string;
  type: string;
  duration: string;
  budget: number;
  status: string;
}

export function useHostStats() {
  return useQuery({
    queryKey: ["host", "stats"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/host/stats");
        return response.data as HostStats;
      } catch (e) {
        return null;
      }
    },
  });
}

export function useHostRevenue(period: "daily" | "weekly" | "monthly") {
  return useQuery({
    queryKey: ["host", "revenue", period],
    queryFn: async () => {
      try {
        const response: any = await api.get(`/dashboard/host/revenue?period=${period}`);
        return response.data as RevenueData[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useHostClips() {
  return useQuery({
    queryKey: ["host", "clips"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/host/clips");
        return response.data as HostClip[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useHostHistory() {
  return useQuery({
    queryKey: ["host", "history"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/host/streams");
        return response.data as StreamHistory[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useHostRequests() {
  return useQuery({
    queryKey: ["host", "requests"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/host/requests");
        return response.data as ShowRequest[];
      } catch (e) {
        return [];
      }
    },
  });
}
