import { useEffect } from "react";
import { useCreatorTokenStore } from "@/store/useCreatorTokenStore";

export function useCreatorToken(hostId: string) {
  const {
    tokenInfo,
    userBalance,
    priceHistory,
    exclusiveContent,
    loading,
    error,
    fetchTokenInfo,
    fetchExclusiveContent,
    buyToken,
    executeBuyToken,
  } = useCreatorTokenStore();

  useEffect(() => {
    if (hostId) {
      fetchTokenInfo(hostId);
      fetchExclusiveContent(hostId);
    }
  }, [hostId, fetchTokenInfo, fetchExclusiveContent]);

  return {
    tokenInfo,
    userBalance,
    priceHistory,
    exclusiveContent,
    loading,
    error,
    buyToken,
    executeBuyToken,
    refetch: () => {
      fetchTokenInfo(hostId);
      fetchExclusiveContent(hostId);
    }
  };
}
