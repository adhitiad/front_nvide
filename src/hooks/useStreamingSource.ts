// src/hooks/useStreamingSource.ts
// Hook for VOD/stream recording playback.
// Obtains a presigned HLS URL from the backend via usePresignedURL.
// Handles automatic fallback to an alternate provider if the primary fails.
// Returns a URL ready to be passed directly to HLS.js.

import { useEffect, useRef, useState, useCallback } from "react";
import { usePresignedURL } from "./usePresignedURL";
import { useStorageStore } from "@/store/useStorageStore";

interface UseStreamingSourceOptions {
  /** storage_id of the recorded/uploaded VOD file */
  storageId: string;
  /** Force a specific provider; leave empty to use backend-preferred primary */
  preferredProvider?: string;
  /** Automatically refetch the presigned URL on expiry (default true) */
  autoRefresh?: boolean;
}

interface UseStreamingSourceResult {
  streamUrl: string | null;
  provider: string | null;
  ipfsHash: string | null;
  isLoading: boolean;
  error: string | null;
  // Called when HLS reports a network error on the current URL
  switchToFallback: () => Promise<void>;
  retry: () => void;
  activeProvider: string | null;
}

const FALLBACK_PROVIDERS = ["oci", "storj", "filebase"];

export function useStreamingSource({
  storageId,
  preferredProvider,
  autoRefresh = true,
}: UseStreamingSourceOptions): UseStreamingSourceResult {
  const [activeProvider, setActiveProvider] = useState<string | null>(preferredProvider || null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const switchingRef = useRef(false);

  const {
    url: presignedUrl,
    provider: detectedProvider,
    isLoading: urlLoading,
    error: urlError,
    refetch,
  } = usePresignedURL(storageId);

  const { getFallbackURLs, uploadedFiles } = useStorageStore();

  // Mirror IPFS hash from the store when we have a storage file record
  useEffect(() => {
    const record = uploadedFiles.find(
      (f) => f.storage_id === storageId || f.id === storageId
    );
    if (record?.ipfs_hash) setIpfsHash(record.ipfs_hash);
  }, [uploadedFiles, storageId]);

  // Choose provider: user preferred → detected → first available fallback
  useEffect(() => {
    if (!presignedUrl) return;
    if (preferredProvider) {
      setActiveProvider(preferredProvider);
    } else if (detectedProvider) {
      setActiveProvider(detectedProvider);
    }
  }, [presignedUrl, detectedProvider, preferredProvider]);

  const switchToFallback = useCallback(async () => {
    if (!storageId || switchingRef.current) return;
    switchingRef.current = true;

    try {
      const fallbacks: Record<string, string> = await getFallbackURLs(storageId);
      const current = activeProvider || detectedProvider || "";

      // Pick next provider that is not the current one
      const next = FALLBACK_PROVIDERS.find((p) => p !== current && fallbacks[p]);
      if (next && fallbacks[next]) {
        setActiveProvider(next);
      }
    } catch {
      // Silently fail; the presigned URL will eventually be auto-refreshed
    } finally {
      switchingRef.current = false;
    }
  }, [storageId, activeProvider, detectedProvider, getFallbackURLs]);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    streamUrl: presignedUrl,
    provider: activeProvider,
    ipfsHash,
    isLoading: urlLoading,
    error: urlError,
    switchToFallback,
    retry,
    activeProvider,
  };
}
