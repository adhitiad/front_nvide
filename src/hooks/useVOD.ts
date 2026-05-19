import { useEffect } from "react";
import { useVODStore } from "@/store/useVODStore";

export function useVOD(id?: string) {
  const {
    vodList,
    currentVOD,
    drmToken,
    verifyingDRM,
    unlockedVODs,
    loading,
    error,
    fetchVODList,
    fetchVODById,
    requestDRMToken,
    unlockVOD,
  } = useVODStore();

  useEffect(() => {
    if (id) {
      fetchVODById(id);
    } else {
      fetchVODList();
    }
  }, [id, fetchVODById, fetchVODList]);

  return {
    vodList,
    currentVOD,
    drmToken,
    verifyingDRM,
    unlockedVODs,
    loading,
    error,
    fetchVODList,
    requestDRMToken,
    unlockVOD,
    isUnlocked: (vodId: string) => {
      const vod = vodList.find((v) => v.id === vodId) || currentVOD;
      if (!vod) return false;
      if (!vod.isPremium) return true;
      return unlockedVODs.includes(vodId);
    }
  };
}
