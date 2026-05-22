import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AgencyStats {
  totalHosts: number;
  totalHostRevenue: number;
  totalAgencyCommission: number;
}

export interface AgencyRevenueData {
  name: string;
  HostEarnings: number;
  AgencyFee: number;
}

export interface ManagedHost {
  id: string;
  username: string;
  realName: string;
  joinedDate: string;
  monthlyRevenue: number;
  commissionRate: number;
}

export function useAgencyStats() {
  return useQuery({
    queryKey: ["agency", "stats"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/agency/stats");
        return response.data as AgencyStats;
      } catch (e) {
        return { totalHosts: 0, totalHostRevenue: 0, totalAgencyCommission: 0 };
      }
    },
  });
}

export function useAgencyRevenue(period: "daily" | "weekly" | "monthly") {
  return useQuery({
    queryKey: ["agency", "revenue", period],
    queryFn: async () => {
      try {
        const response: any = await api.get(`/dashboard/agency/revenue?period=${period}`);
        return response.data as AgencyRevenueData[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useAgencyHosts() {
  return useQuery({
    queryKey: ["agency", "hosts"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/dashboard/agency/hosts");
        return response.data as ManagedHost[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useInviteHost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hostUsername, revenueShare }: { hostUsername: string; revenueShare: number }) => {
      const res = await api.post("/dashboard/agency/hosts/invite", {
        host_username: hostUsername,
        revenue_share: revenueShare,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "hosts"] });
    },
  });
}

export function useRemoveHost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hostId: string) => {
      const res = await api.delete(`/dashboard/agency/hosts/${hostId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "hosts"] });
    },
  });
}
