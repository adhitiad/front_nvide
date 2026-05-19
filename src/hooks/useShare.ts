"use client";

export function useShare() {
  const share = async (payload: { title: string; text?: string; url?: string }) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(payload);
      return true;
    }
    if (payload.url && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(payload.url);
      return false;
    }
    return false;
  };

  return { share, canNativeShare: typeof navigator !== "undefined" && !!navigator.share };
}

