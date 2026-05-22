import { useRecommendations } from "./useRecommendations";

export function useRecommendation() {
  const { data: recommendedStreams = [], isLoading, error, refetch } = useRecommendations();

  return {
    recommendedStreams,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
}
