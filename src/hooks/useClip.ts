import { useEffect } from "react";
import { useClipStore } from "@/store/useClipStore";

export function useClip(streamId: string) {
  const { clips, generating, loading, error, fetchClips, regenerateClips } = useClipStore();

  useEffect(() => {
    if (streamId) {
      fetchClips(streamId);
    }
  }, [streamId, fetchClips]);

  return {
    clips,
    generating,
    loading,
    error,
    regenerate: () => regenerateClips(streamId),
    refetch: () => fetchClips(streamId),
  };
}
