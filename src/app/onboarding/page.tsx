"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore, LANGUAGES, Language } from "@/store/useLanguageStore";
import { useThemeStore, Theme } from "@/store/useThemeStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { 
  Sparkles, 
  Globe, 
  Sun, 
  Moon, 
  Laptop, 
  Heart,
  Gamepad2,
  Tv2,
  Volume2,
  Music,
  Users2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UserOnboardingPage() {
  const router = useRouter();
  
  // Stores
  const t = useLanguageStore((state) => state.t);
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();
  const { userStep, userData, setUserStep, updateUserData } = useOnboardingStore();

  const handleLangSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleThemeSelect = (mode: Theme) => {
    setTheme(mode);
  };

  const handleInterestToggle = (interest: string) => {
    const active = userData.interests.includes(interest);
    const updated = active 
      ? userData.interests.filter(i => i !== interest)
      : [...userData.interests, interest];
    updateUserData({ interests: updated });
  };

  const handleNext = () => {
    if (userStep < 3) {
      setUserStep(userStep + 1);
    } else {
      if (userData.interests.length === 0) {
        toast.warning("Please choose at least one category interest!");
        return;
      }
      toast.success("Onboarding completed! Welcome to NVide Live! 🌸");
      router.push("/");
    }
  };

  const handleBack = () => {
    if (userStep > 1) {
      setUserStep(userStep - 1);
    }
  };

  const handleSkip = () => {
    toast.info("Onboarding skipped. You can always change preferences in Settings! 🌸");
    router.push("/");
  };

  const categories = [
    { key: "gaming", label: t("onboarding.categories.gaming", "Anime Gaming"), icon: Gamepad2, color: "hover:border-pink-400 text-pink-500 bg-pink-500/5" },
    { key: "cosplay", label: t("onboarding.categories.cosplay", "Cosplay Showcase"), icon: Tv2, color: "hover:border-violet-400 text-violet-500 bg-violet-500/5" },
    { key: "talk", label: t("onboarding.categories.talk", "ASMR Chitchat"), icon: Volume2, color: "hover:border-sky-400 text-sky-500 bg-sky-500/5" },
    { key: "music", label: t("onboarding.categories.music", "Music & Sing Cover"), icon: Music, color: "hover:border-amber-400 text-amber-500 bg-amber-500/5" },
    { key: "private", label: t("onboarding.categories.private", "VIP 1-on-1 calls"), icon: Users2, color: "hover:border-emerald-400 text-emerald-500 bg-emerald-500/5" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow anime style */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg bg-card rounded-3xl border border-primary/20 p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Progress Bar & Skip Button */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
            <span>Step {userStep} of 3</span>
            <button 
              onClick={handleSkip} 
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Skip Onboarding ➔
            </button>
          </div>
          <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(userStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-black text-primary flex items-center justify-center gap-1.5 leading-none">
            {t("onboarding.user_title", "Welcome to NVide Live!")}
            <Sparkles className="h-5 w-5 text-accent anime-sparkle" />
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            {t("onboarding.user_subtitle", "Customize your streaming preference.")}
          </p>
        </div>

        {/* WIZARD PANELS */}
        <div className="min-h-[220px] flex items-center justify-center py-2">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CHOOSE LANGUAGE */}
            {userStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-4"
              >
                <h3 className="font-heading font-bold text-center text-sm text-foreground flex items-center justify-center gap-1">
                  <Globe className="h-4.5 w-4.5 text-primary" />
                  {t("onboarding.step_lang", "Select System Language")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        language === lang.code 
                          ? "border-primary bg-primary/10 text-primary shadow-sm" 
                          : "border-primary/10 bg-background text-muted-foreground hover:bg-primary/5"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHOOSE THEME */}
            {userStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-4"
              >
                <h3 className="font-heading font-bold text-center text-sm text-foreground flex items-center justify-center gap-1">
                  <Sun className="h-4.5 w-4.5 text-primary" />
                  {t("onboarding.step_theme", "Choose Your Style")}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "light" as const, icon: Sun, label: t("theme.light", "Sweet Light") },
                    { code: "dark" as const, icon: Moon, label: t("theme.dark", "Neon Dark") },
                    { code: "system" as const, icon: Laptop, label: t("theme.system", "OS System") }
                  ].map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.code}
                        onClick={() => handleThemeSelect(mode.code)}
                        className={`p-4 rounded-3xl border flex flex-col items-center gap-2 text-center text-xs font-bold transition-all ${
                          theme === mode.code 
                            ? "border-primary bg-primary/10 text-primary shadow-md" 
                            : "border-primary/10 bg-background text-muted-foreground hover:bg-primary/5"
                        }`}
                      >
                        <Icon className="h-6 w-6 text-primary" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: CATEGORY INTERESTS */}
            {userStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-4"
              >
                <h3 className="font-heading font-bold text-center text-sm text-foreground flex items-center justify-center gap-1">
                  <Heart className="h-4.5 w-4.5 text-primary animate-pulse" />
                  {t("onboarding.step_interests", "Pick Content Interests")}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const active = userData.interests.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => handleInterestToggle(cat.key)}
                        className={`px-4 py-2.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all ${cat.color} ${
                          active 
                            ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/30" 
                            : "border-primary/15"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
          <Button
            disabled={userStep === 1}
            onClick={handleBack}
            variant="outline"
            className="border-primary/20 rounded-full px-6 text-xs h-9.5"
          >
            {t("onboarding.back", "Back")}
          </Button>

          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-full px-6 text-xs h-9.5 shadow-md"
          >
            {userStep === 3 ? t("onboarding.finish", "Finish & Enjoy") : t("onboarding.next", "Next")}
          </Button>
        </div>

      </div>
    </div>
  );
}
