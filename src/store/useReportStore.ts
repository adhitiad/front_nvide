import { create } from "zustand";
import api from "@/lib/api";

export interface UserReport {
  id: string;
  category: string;
  description: string;
  targetType: "stream" | "chat" | "user";
  targetId: string;
  reporterUsername: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

interface ReportState {
  reports: UserReport[];
  loading: boolean;
  error: string | null;

  submitReport: (category: string, description: string, targetId: string, targetType: "stream" | "chat" | "user") => Promise<void>;
  fetchReports: (status?: "pending" | "resolved" | "dismissed") => Promise<void>;
  resolveReport: (id: string, action: "delete_content" | "ban_user" | "send_warning" | "dismiss") => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  loading: false,
  error: null,

  submitReport: async (category, description, targetId, targetType) => {
    set({ loading: true, error: null });
    try {
      await api.post("/reports", {
        category,
        description,
        target_id: targetId,
        target_type: targetType,
      });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal mengirimkan laporan", loading: false });
      throw err;
    }
  },

  fetchReports: async (status = "pending") => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.get(`/reports?status=${status}`);
      const data = Array.isArray(res) ? res : res?.data || [];
      set({ reports: data, loading: false });
    } catch {
      // Fallback dummy reports
      const dummy: UserReport[] = [
        {
          id: "rep-1",
          category: "Harassment",
          description: "User Clara_Spam mengirim spam obrolan kasar berulang kali.",
          targetType: "chat",
          targetId: "msg-129",
          reporterUsername: "Budi_Viewer",
          status: "pending",
          createdAt: "2026-05-19",
        },
        {
          id: "rep-2",
          category: "Underage Content",
          description: "Siaran ini melanggar pedoman umur dewasa.",
          targetType: "stream",
          targetId: "stream-9",
          reporterUsername: "Andi_Sakti",
          status: "pending",
          createdAt: "2026-05-19",
        }
      ];
      set({ reports: dummy.filter((r) => r.status === status), loading: false });
    }
  },

  resolveReport: async (id, action) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/reports/${id}/resolve`, { action });
      // Update status lokal
      set((state) => ({
        reports: state.reports.map((r) => 
          r.id === id ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved" } : r
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Gagal memproses moderasi laporan", loading: false });
      throw err;
    }
  }
}));
