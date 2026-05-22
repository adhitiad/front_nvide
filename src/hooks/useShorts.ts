import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ShortVideo {
  id: string;
  url: string;
  poster: string;
  host: {
    username: string;
    avatar: string;
    isFollowed: boolean;
  };
  description: string;
  likes: number;
  comments: number;
}

export function useShorts() {
  return useQuery({
    queryKey: ["shorts"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/shorts");
        return response.data as ShortVideo[];
      } catch (e) {
        // Fallback to empty array if endpoint is not fully ready
        return [];
      }
    },
  });
}
