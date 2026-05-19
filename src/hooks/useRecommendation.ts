import { useEffect } from "react";
import { useRecommendationStore } from "@/store/useRecommendationStore";

export function useRecommendation() {
  const { recommendedStreams, loading, error, fetchRecommendations } = useRecommendationStore();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendedStreams,
    loading,
    error,
    refetch: fetchRecommendations
  };
}
