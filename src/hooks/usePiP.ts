"use client";

import { useCallback, useState } from "react";

export function usePiP() {
  const [isActive, setIsActive] = useState(false);

  const enterPiP = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return false;
    const anyDoc = document as any;
    if (!document.pictureInPictureEnabled || video.disablePictureInPicture) return false;
    try {
      await (video as any).requestPictureInPicture();
      setIsActive(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitPiP = useCallback(async () => {
    const anyDoc = document as any;
    if (!anyDoc.pictureInPictureElement) return;
    await anyDoc.exitPictureInPicture();
    setIsActive(false);
  }, []);

  return { isActive, enterPiP, exitPiP };
}

