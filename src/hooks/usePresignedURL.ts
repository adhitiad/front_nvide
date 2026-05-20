// src/hooks/usePresignedURL.ts
// Fetch presigned URL for a storage object and auto-refresh before expiry.
// Falls back to /storage/{id}/urls if the single-url endpoint fails.

import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api";
import { useStorageStore } from "@/store/useStorageStore";
import type { PresignedUrlResponse, PresignedUrlsFallback } from "@/lib/types/storage";

const REFRESH_BUFFER_MS = 4 * 60 * 1000 + 30 * 1000; // 4 min 30 sec

interface UsePresignedURLResult {
  url: string | null;
  provider: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePresignedURL(storageId: string): UsePresignedURLResult {
  const getPresignedURL = useStorageStore((s) => s.getPresignedURL);
  const getFallbackURLs = useStorageStore((s) => s.getFallbackURLs);

  const [url, setUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fetchURL = useCallback(async () => {
    if (!storageId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try single-url endpoint first
      const res: PresignedUrlResponse = await api.get(`/storage/${storageId}/url`);
      setUrl(res.url);
      setProvider(res.provider);
    } catch {
      // Fallback: try multi-provider URL endpoint
      try {
        const fallback: PresignedUrlsFallback = await api.get(`/storage/${storageId}/urls`);
        // Use the provider designated as primary
        const primary = fallback.urls.find((u) => u.provider === fallback.primary_provider);
        if (primary) {
          setUrl(primary.url);
          setProvider(primary.provider);
        } else if (fallback.urls.length > 0) {
          setUrl(fallback.urls[0].url);
          setProvider(fallback.urls[0].provider);
        } else {
          throw new Error("Tidak ada URL yang tersedia");
        }
      } catch (fallbackErr: any) {
        setError(fallbackErr?.error?.message || "Gagal mengambil presigned URL");
        setUrl(null);
        setProvider(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [storageId]);

  // Initial fetch + interval-based refresh
  useEffect(() => {
    fetchURL();
    clearTimer();

    timerRef.current = setInterval(() => {
      fetchURL();
    }, REFRESH_BUFFER_MS);

    return clearTimer;
  }, [fetchURL, clearTimer]);

  return { url, provider, isLoading, error, refetch: fetchURL };
}
