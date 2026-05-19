import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserOnboardingData {
  language: string;
  theme: "light" | "dark" | "system";
  interests: string[];
}

export interface HostOnboardingData {
  nickname: string;
  bio: string;
  avatarUrl: string;
  kycDocType: string;
  kycDocNumber: string;
  kycFrontPhoto: string;
  kycSelfiePhoto: string;
  country: string;
  paymentMethod: "wallet" | "crypto";
  cryptoWalletAddress: string;
  bankName: string;
  bankAccount: string;
  streamResolution: "portrait" | "landscape";
  streamKey: string;
  streamUrl: string;
  personalGuidelines: string;
  contentGuidelinesAccepted: boolean;
}

export interface AgencyOnboardingData {
  type: "individual" | "business";
  businessName: string;
  businessRegNumber: string;
  documentPhoto: string;
  defaultCommission: number;
  initialHostsUsernames: string[];
}

interface OnboardingState {
  // User Onboarding State
  userStep: number;
  userData: UserOnboardingData;
  setUserStep: (step: number) => void;
  updateUserData: (data: Partial<UserOnboardingData>) => void;
  resetUserOnboarding: () => void;

  // Host Onboarding State
  hostStep: number;
  hostData: HostOnboardingData;
  setHostStep: (step: number) => void;
  updateHostData: (data: Partial<HostOnboardingData>) => void;
  resetHostOnboarding: () => void;

  // Agency Onboarding State
  agencyStep: number;
  agencyData: AgencyOnboardingData;
  setAgencyStep: (step: number) => void;
  updateAgencyData: (data: Partial<AgencyOnboardingData>) => void;
  resetAgencyOnboarding: () => void;
}

const defaultUserData: UserOnboardingData = {
  language: "en",
  theme: "system",
  interests: [],
};

const defaultHostData: HostOnboardingData = {
  nickname: "",
  bio: "",
  avatarUrl: "",
  kycDocType: "KTP",
  kycDocNumber: "",
  kycFrontPhoto: "",
  kycSelfiePhoto: "",
  country: "ID",
  paymentMethod: "wallet",
  cryptoWalletAddress: "",
  bankName: "",
  bankAccount: "",
  streamResolution: "landscape",
  streamKey: "nvide_live_key_" + Math.random().toString(36).substring(7),
  streamUrl: "rtmp://live.nvide.com/live",
  personalGuidelines: "",
  contentGuidelinesAccepted: false,
};

const defaultAgencyData: AgencyOnboardingData = {
  type: "individual",
  businessName: "",
  businessRegNumber: "",
  documentPhoto: "",
  defaultCommission: 10,
  initialHostsUsernames: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // User Onboarding
      userStep: 1,
      userData: defaultUserData,
      setUserStep: (userStep) => set({ userStep }),
      updateUserData: (data) =>
        set((state) => ({ userData: { ...state.userData, ...data } })),
      resetUserOnboarding: () => set({ userStep: 1, userData: defaultUserData }),

      // Host Onboarding
      hostStep: 1,
      hostData: defaultHostData,
      setHostStep: (hostStep) => set({ hostStep }),
      updateHostData: (data) =>
        set((state) => ({ hostData: { ...state.hostData, ...data } })),
      resetHostOnboarding: () => set({ hostStep: 1, hostData: defaultHostData }),

      // Agency Onboarding
      agencyStep: 1,
      agencyData: defaultAgencyData,
      setAgencyStep: (agencyStep) => set({ agencyStep }),
      updateAgencyData: (data) =>
        set((state) => ({ agencyData: { ...state.agencyData, ...data } })),
      resetAgencyOnboarding: () =>
        set({ agencyStep: 1, agencyData: defaultAgencyData }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
