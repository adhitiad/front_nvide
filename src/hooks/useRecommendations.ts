import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Stream } from "@/lib/types/api";

export function useRecommendations() {
  return useQuery<Stream[], Error>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      try {
        const res: any = await api.get("/recommendations");
        return Array.isArray(res) ? res : res?.data || [];
      } catch (err) {
        // Fallback: ambil stream reguler jika data rekomendasi AI kosong
        const res: any = await api.get("/streams/live");
        const data = Array.isArray(res) ? res : res?.data || [];
        return data.slice(0, 3);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
