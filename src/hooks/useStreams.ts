import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiEnvelope, Stream } from "@/lib/types/api";

export function useStreams(category?: string) {
  return useQuery({
    queryKey: ["streams", category],
    queryFn: async () => {
      const endpoint = category ? `/streams?category=${category}` : "/streams/live";
      const envelope: ApiEnvelope<Stream[]> = await api.get(endpoint);
      return envelope.data || [];
    },
  });
}

export function useStreamById(id: string) {
  return useQuery({
    queryKey: ["streams", id],
    queryFn: async () => {
      const envelope: ApiEnvelope<Stream> = await api.get(`/streams/${id}`);
      return envelope.data;
    },
    enabled: !!id,
  });
}

export function useSendGift() {
  return useMutation({
    mutationFn: async ({ giftId, quantity, streamId }: { giftId: string; quantity: number; streamId: string }) => {
      const payload = { gift_id: giftId, quantity, stream_id: streamId };
      const response = await api.post("/gifts/send", payload);
      return response; // Handle balance updates outside or via invalidation
    },
  });
}

export function useLikeStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (streamId: string) => {
      await api.post("/likes", { content_id: streamId, content_type: "stream" });
    },
    onSuccess: (_, streamId) => {
      // Invalidate stream data or optimistically update likes count
      queryClient.invalidateQueries({ queryKey: ["streams", streamId] });
    },
  });
}
