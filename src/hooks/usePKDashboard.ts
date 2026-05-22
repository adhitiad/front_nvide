import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface HostProfile {
  id: string;
  username: string;
  level: number;
  avatarUrl: string;
  streamTitle: string;
}

export function useOnlineHosts() {
  return useQuery({
    queryKey: ["pk", "online"],
    queryFn: async () => {
      try {
        const response: any = await api.get("/pk/online");
        return response.data as HostProfile[];
      } catch (e) {
        return [];
      }
    },
  });
}
