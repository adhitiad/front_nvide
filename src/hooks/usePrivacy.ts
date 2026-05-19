import { useEffect } from "react";
import { usePrivacyStore } from "@/store/usePrivacyStore";

export function usePrivacy() {
  const {
    privateProfile,
    incognitoMode,
    disappearingMessagesDuration,
    blockedUsers,
    mutedUsers,
    loading,
    error,
    fetchPrivacySettings,
    updatePrivacySetting,
    fetchBlockMuteList,
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser
  } = usePrivacyStore();

  useEffect(() => {
    fetchPrivacySettings();
    fetchBlockMuteList();
  }, [fetchPrivacySettings, fetchBlockMuteList]);

  return {
    privateProfile,
    incognitoMode,
    disappearingMessagesDuration,
    blockedUsers,
    mutedUsers,
    loading,
    error,
    updateSetting: updatePrivacySetting,
    block: blockUser,
    unblock: unblockUser,
    mute: muteUser,
    unmute: unmuteUser,
    isBlocked: (userId: string) => blockedUsers.some((u) => u.id === userId),
    isMuted: (userId: string) => mutedUsers.some((u) => u.id === userId)
  };
}
