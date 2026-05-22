"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useOnboardingStore, HostOnboardingData } from "@/store/useOnboardingStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { 
  Sparkles, 
  Video, 
  DollarSign, 
  Eye, 
  Heart, 
  Gift, 
  Users, 
  Scissors, 
  Calendar, 
  Settings, 
  ChevronRight, 
  Key, 
  Globe, 
  Upload, 
  CheckCircle,
  HelpCircle,
  Play,
  Copy,
  Clock,
  ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  useHostStats, 
  useHostRevenue, 
  useHostClips, 
  useHostHistory, 
  useHostRequests 
} from "@/hooks/useHostDashboard";



export default function HostDashboardPage() {
  const t = useLanguageStore((state) => state.t);
  
  // Stores
  const { hostStep, hostData, setHostStep, updateHostData, resetHostOnboarding } = useOnboardingStore();
  const { activeSubscription, deductQuota } = useSubscriptionStore();

  // Local state
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "requests" | "settings">("overview");
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  
  // Real API hooks
  const { data: hostStats } = useHostStats();
  const { data: revenueData } = useHostRevenue(chartPeriod);
  const { data: hostClips } = useHostClips();
  const { data: streamHistory } = useHostHistory();
  const { data: incomingRequests } = useHostRequests();

  const [showRequests, setShowRequests] = useState<any[]>([]);

  useEffect(() => {
    if (incomingRequests) setShowRequests(incomingRequests);
  }, [incomingRequests]);

  // Settings form local state
  const [ratePerMin, setRatePerMin] = useState(15000); // IDR per min
  const [allowIncognito, setAllowIncognito] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  // Sync isRegistered state from onboarding completion
  useEffect(() => {
    if (hostData.contentGuidelinesAccepted && hostData.kycDocNumber && hostData.nickname) {
      setIsRegistered(true);
    }
  }, [hostData]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleAcceptRequest = (id: string, requester: string) => {
    setShowRequests(showRequests.filter((r) => r.id !== id));
    toast.success(`You accepted the request from @${requester}! Prepare the room.`);
  };

  const handleDeclineRequest = (id: string) => {
    setShowRequests(showRequests.filter((r) => r.id !== id));
    toast.info("Request declined.");
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  // Host Onboarding wizard handers
  const handleOnboardingNext = () => {
    if (hostStep === 1 && !hostData.nickname) {
      toast.error("Please fill in your Nickname!");
      return;
    }
    if (hostStep === 2) {
      if (!hostData.kycDocNumber || !hostData.kycFrontPhoto) {
        toast.error("Please upload KYC ID photo and fill in document number!");
        return;
      }
      if (hostData.country === "OTHER") {
        toast.error("KYC ditolak karena di luar wilayah layanan. Negara yang diterima: Indonesia, Malaysia, Filipina, Vietnam, Thailand, Singapura, Spanyol, Brasil.");
        return;
      }
    }
    if (hostStep === 3 && hostData.paymentMethod === "wallet" && !hostData.bankAccount) {
      toast.error("Please fill in Bank Account information!");
      return;
    }
    if (hostStep === 4 && !hostData.streamKey) {
      toast.error("Stream Key cannot be empty!");
      return;
    }
    if (hostStep === 5 && !hostData.personalGuidelines) {
      toast.error("Please set your Room Chat / Personal Content Guidelines!");
      return;
    }
    if (hostStep === 5 && !hostData.contentGuidelinesAccepted) {
      toast.error("You must accept the Content Guidelines to stream!");
      return;
    }

    if (hostStep < 5) {
      setHostStep(hostStep + 1);
    } else {
      setIsRegistered(true);
      toast.success("Congratulations! You are officially registered as a Host! 🌸");
    }
  };

  const handleOnboardingBack = () => {
    if (hostStep > 1) {
      setHostStep(hostStep - 1);
    }
  };

  // Render ONBOARDING WIZARD if host not registered
  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-3xl border border-primary/20 shadow-xl space-y-6 relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-2xl" />

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-black text-xl animate-bounce">
            🌸
          </div>
          <h1 className="text-2xl font-heading font-black text-primary tracking-tight">
            {t("onboarding.host_title", "Become a Host Partner")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Complete the 5-step registration to start broadcasting and earning!
          </p>
        </div>

        {/* Steps progress indicator */}
        <div className="flex items-center justify-between px-6 pt-2">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1 last:flex-initial">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                hostStep >= stepNum 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground border-primary/20"
              }`}>
                {stepNum}
              </div>
              {stepNum < 5 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  hostStep > stepNum ? "bg-primary" : "bg-primary/20"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP CONTENT WIZARD */}
        <div className="p-4 bg-background/50 border border-primary/5 rounded-2xl space-y-4">
          
          {/* STEP 1: PROFILE SETUP */}
          {hostStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1">
                Step 1: Creator Profile Details
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Studio Nickname *</label>
                  <Input 
                    placeholder="e.g. SakuraChan" 
                    value={hostData.nickname}
                    onChange={(e) => updateHostData({ nickname: e.target.value })}
                    className="border-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Short Bio</label>
                  <textarea 
                    placeholder="Tell your fans who you are..." 
                    value={hostData.bio}
                    onChange={(e) => updateHostData({ bio: e.target.value })}
                    className="w-full min-h-[80px] text-sm p-3 rounded-xl border border-primary/20 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Profile Avatar URL (Optional)</label>
                  <Input 
                    placeholder="https://images.unsplash.com/..." 
                    value={hostData.avatarUrl}
                    onChange={(e) => updateHostData({ avatarUrl: e.target.value })}
                    className="border-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KYC MANDATORY UPLOAD */}
          {hostStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1">
                Step 2: Secure KYC Identification
              </h3>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                <p className="font-bold flex items-center gap-1">
                  ⚠️ PEMBERITAHUAN WILAYAH KYC / KYC REGION WARNING:
                </p>
                <p>Verifikasi KYC saat ini hanya didukung untuk wilayah berikut: Indonesia, Malaysia, Filipina, Vietnam, Thailand, Singapura, Spanyol, dan Brasil. Pendaftaran dari luar wilayah ini akan ditolak otomatis.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Doc Type</label>
                    <select 
                      value={hostData.kycDocType}
                      onChange={(e) => updateHostData({ kycDocType: e.target.value })}
                      className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                    >
                      <option value="KTP">KTP / ID Card</option>
                      <option value="Passport">Passport</option>
                      <option value="SIM">Driver License</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Country</label>
                    <select 
                      value={hostData.country}
                      onChange={(e) => updateHostData({ country: e.target.value })}
                      className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                    >
                      <option value="ID">Indonesia</option>
                      <option value="MY">Malaysia</option>
                      <option value="PH">Philippines</option>
                      <option value="VN">Vietnam</option>
                      <option value="TH">Thailand</option>
                      <option value="SG">Singapore</option>
                      <option value="ES">Spain</option>
                      <option value="BR">Brazil</option>
                      <option value="OTHER">Lainnya (Luar Wilayah) / Other</option>
                    </select>
                  </div>
                </div>

                {hostData.country === "OTHER" && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl space-y-2 text-xs text-red-400 animate-pulse">
                    <p className="font-bold flex items-center gap-1.5">
                      ❌ WILAYAH TIDAK DIDUKUNG / UNSUPPORTED REGION:
                    </p>
                    <p className="leading-relaxed">
                      Maaf, verifikasi KYC Host Anda ditolak karena negara Anda saat ini tidak didukung untuk melakukan siaran langsung. Kami hanya dapat menerima pendaftaran dari negara-negara berikut:
                    </p>
                    <ul className="list-disc pl-5 font-bold space-y-1 mt-1 text-white">
                      <li>Indonesia (ID)</li>
                      <li>Malaysia (MY)</li>
                      <li>Filipina (PH)</li>
                      <li>Vietnam (VN)</li>
                      <li>Thailand (TH)</li>
                      <li>Singapura (SG)</li>
                      <li>Spanyol (ES)</li>
                      <li>Brasil (BR)</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Identity Document Number *</label>
                  <Input 
                    placeholder="e.g. 3171010000000000" 
                    value={hostData.kycDocNumber}
                    onChange={(e) => updateHostData({ kycDocNumber: e.target.value })}
                    className="border-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">ID Card / Passport Photo *</label>
                    <div 
                      onClick={() => updateHostData({ kycFrontPhoto: "https://api.dicebear.com/7.x/shapes/svg?seed=front" })}
                      className="h-28 border border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-background hover:bg-primary/5 transition-colors"
                    >
                      {hostData.kycFrontPhoto ? (
                        <span className="text-xs text-emerald-500 font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Attached</span>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Selfie holding document *</label>
                    <div 
                      onClick={() => updateHostData({ kycSelfiePhoto: "https://api.dicebear.com/7.x/shapes/svg?seed=selfie" })}
                      className="h-28 border border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-background hover:bg-primary/5 transition-colors"
                    >
                      {hostData.kycSelfiePhoto ? (
                        <span className="text-xs text-emerald-500 font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Attached</span>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD DETAILS */}
          {hostStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1">
                Step 3: Revenue Withdrawal Method
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateHostData({ paymentMethod: "wallet" })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      hostData.paymentMethod === "wallet" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-primary/20 bg-background text-muted-foreground"
                    }`}
                  >
                    <span>🏦 Bank Transfer</span>
                  </button>
                  <button 
                    onClick={() => updateHostData({ paymentMethod: "crypto" })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      hostData.paymentMethod === "crypto" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-primary/20 bg-background text-muted-foreground"
                    }`}
                  >
                    <span>🪙 USDT Crypto (USDT-TRC20)</span>
                  </button>
                </div>

                {hostData.paymentMethod === "wallet" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Bank Name</label>
                      <Input 
                        placeholder="e.g. BCA / Mandiri / Maybank" 
                        value={hostData.bankName}
                        onChange={(e) => updateHostData({ bankName: e.target.value })}
                        className="border-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Account Number *</label>
                      <Input 
                        placeholder="e.g. 123456789" 
                        value={hostData.bankAccount}
                        onChange={(e) => updateHostData({ bankAccount: e.target.value })}
                        className="border-primary/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">USDT Wallet Address (TRC-20) *</label>
                    <Input 
                      placeholder="e.g. TYHh9p172Jsb2B1..." 
                      value={hostData.cryptoWalletAddress}
                      onChange={(e) => updateHostData({ cryptoWalletAddress: e.target.value })}
                      className="border-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: STREAM CONFIGURATION & RESOLUTION */}
          {hostStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1">
                Step 4: Stream Key & Live configuration
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Broadcasting Endpoint URL</label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly
                      value={hostData.streamUrl}
                      className="bg-muted border-primary/20 text-xs font-mono"
                    />
                    <Button 
                      onClick={() => handleCopy(hostData.streamUrl, "RTMP URL")}
                      variant="outline" 
                      className="h-9.5 px-3 border-primary/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground font-heading">Streaming Secret Key</label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly
                      type="password"
                      value={hostData.streamKey}
                      className="bg-muted border-primary/20 text-xs font-mono"
                    />
                    <Button 
                      onClick={() => handleCopy(hostData.streamKey, "Stream Key")}
                      variant="outline" 
                      className="h-9.5 px-3 border-primary/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Live Streaming Layout Target</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateHostData({ streamResolution: "portrait" })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                        hostData.streamResolution === "portrait" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/20 bg-background text-muted-foreground"
                      }`}
                    >
                      <span>📱 Portrait (Mobile Optimized)</span>
                    </button>
                    <button 
                      onClick={() => updateHostData({ streamResolution: "landscape" })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                        hostData.streamResolution === "landscape" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/20 bg-background text-muted-foreground"
                      }`}
                    >
                      <span>💻 Landscape (Web / PC)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REGISTRATION AGREEMENT */}
          {hostStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1">
                Step 5: Content Integrity Guidelines
              </h3>
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2 text-[11px] leading-relaxed text-muted-foreground">
                <p className="font-bold text-destructive flex items-center gap-1">
                  ⚠️ STRICT COMMUNITY RULES / ATURAN KHUSUS:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>TEMA NON-LGBT Wajib:</strong> Siaran tidak boleh mengandung propaganda LGBT, perilaku homoseksual, atau dekorasi yang bernuansa bendera pelangi.</li>
                  <li><strong>MODERASI OTOMATIS:</strong> Konten atau profil yang mengandung unsur LGBT langsung tidak ditampilkan dan dihapus sistem.</li>
                  <li><strong>KEKERASAN DILARANG:</strong> Tidak boleh menampilkan senjata tajam, ancaman verbal, atau tindakan membahayakan diri sendiri.</li>
                  <li><strong>VERIFIKASI KYC:</strong> Pelanggaran akan memicu pembekuan KYC permanen dan penahanan dana di dompet platform.</li>
                </ul>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-muted-foreground">Atur Pedoman Konten Obrolan Pribadi (Banned Words / Room Rules) *</label>
                <textarea 
                  placeholder="e.g. Jangan kasar, dilarang SARA, kata terlarang: spam, benci..." 
                  value={hostData.personalGuidelines}
                  onChange={(e) => updateHostData({ personalGuidelines: e.target.value })}
                  className="w-full min-h-[80px] text-sm p-3 rounded-xl border border-primary/20 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Pedoman ini akan ditampilkan secara otomatis kepada pemirsa saat memasuki siaran langsung Anda.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="acceptGuide"
                  checked={hostData.contentGuidelinesAccepted}
                  onChange={(e) => updateHostData({ contentGuidelinesAccepted: e.target.checked })}
                  className="h-4.5 w-4.5 accent-primary cursor-pointer"
                />
                <label htmlFor="acceptGuide" className="text-xs font-bold text-foreground cursor-pointer">
                  I read and accept all Content Guidelines & Non-LGBT rules.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* WIZARD ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            disabled={hostStep === 1}
            onClick={handleOnboardingBack}
            variant="outline"
            className="border-primary/20 rounded-2xl px-5 text-xs h-9.5"
          >
            Back
          </Button>
          <Button 
            onClick={handleOnboardingNext}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl px-5 text-xs h-9.5 shadow-md"
          >
            {hostStep === 5 ? "Submit & Register 🚀" : "Next Step"}
          </Button>
        </div>
      </div>
    );
  }

  // Render COMPLETE CREATOR STUDIO DASHBOARD if registered
  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-background border border-primary/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[10px] font-black bg-primary/20 text-primary rounded-bl-2xl">
          HOST ACTIVE PARTNER
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full border border-primary bg-primary/10 overflow-hidden shadow-md">
            {hostData.avatarUrl ? (
              <img src={hostData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-primary font-black text-lg">
                🌸
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-primary flex items-center gap-1.5 leading-none">
              @{hostData.nickname} Studio
              <Sparkles className="h-4.5 w-4.5 text-accent anime-sparkle" />
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Set your price, customize streaming, and monitor earnings.
            </p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["overview", "history", "requests", "settings"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={`h-9.5 text-xs font-bold rounded-full ${
                activeTab === tab 
                  ? "bg-primary text-primary-foreground" 
                  : "border-primary/25 hover:bg-primary/5"
              }`}
            >
              {tab.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* TABS OVERVIEW SECTION */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: "Today's Revenue", value: `Rp${hostStats?.todayRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
              { label: "Total Views", value: `${(hostStats?.totalViews ?? 0) / 1000}K`, icon: Eye, color: "text-sky-500 bg-sky-500/10" },
              { label: "Total Likes", value: `${(hostStats?.totalLikes ?? 0) / 1000}K`, icon: Heart, color: "text-rose-500 bg-rose-500/10" },
              { label: "Gifts Received", value: hostStats?.giftsReceived?.toString() ?? "0", icon: Gift, color: "text-amber-500 bg-amber-500/10" },
              { label: "Subscribers", value: hostStats?.subscribers?.toString() ?? "0", icon: Users, color: "text-violet-500 bg-violet-500/10" },
              { 
                label: t("ai_clip.quota_info", "AI Clip Quota"), 
                value: activeSubscription ? `${activeSubscription.quotaRemaining}/${activeSubscription.quotaTotal}` : "0", 
                icon: Scissors, 
                color: "text-pink-500 bg-pink-500/10" 
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-4 bg-card rounded-2xl border border-primary/10 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-1.5 rounded-xl ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-black mt-2 text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {activeSubscription && (
            <div className="p-4 bg-card rounded-2xl border border-primary/10 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-primary font-bold">Langganan Aktif: {activeSubscription.planName}</span>
              <span className="text-muted-foreground">
                Sisa Kuota: {activeSubscription.quotaRemaining}/{activeSubscription.quotaTotal} clip
              </span>
              <span className="text-muted-foreground">
                Berlaku hingga: {new Date(activeSubscription.expiryDate).toLocaleDateString("id-ID")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base flex items-center gap-1.5">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Studio Earnings Chart
                </h3>
                <div className="flex rounded-full border border-primary/10 overflow-hidden">
                  {(["daily", "weekly", "monthly"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                        chartPeriod === period ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 text-muted-foreground"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHostRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--primary)" }} />
                    <Area type="monotone" dataKey="amount" stroke="var(--primary)" fillOpacity={1} fill="url(#colorHostRevenue)" strokeWidth={2} name="Earnings (IDR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Generated Clips */}
            <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base flex items-center gap-1.5 text-foreground">
                <Scissors className="h-5 w-5 text-primary anime-sparkle" />
                Latest Generated AI Clips
              </h3>
              <div className="space-y-3">
                {(hostClips || []).map((clip) => (
                  <div key={clip.id} className="p-3 bg-background/50 border border-primary/5 rounded-2xl flex items-center justify-between hover:border-primary/20 transition-all">
                    <div>
                      <p className="text-xs font-bold text-foreground">{clip.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>⏱️ {clip.duration}</span>
                        <span>👁️ {(clip.views / 1000).toFixed(1)}k views</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS STREAM HISTORY */}
      {activeTab === "history" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Live Broadcasting Log History
          </h2>
          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Broadcast Date</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Viewers Peak</th>
                  <th className="pb-3">Likes</th>
                  <th className="pb-3">Gifts Received</th>
                  <th className="pb-3 text-right">Income Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {(streamHistory || []).map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3.5 font-bold">{log.date}</td>
                    <td className="py-3.5 font-semibold text-muted-foreground">{log.duration}</td>
                    <td className="py-3.5 font-extrabold text-sky-500">{log.views.toLocaleString()} 👤</td>
                    <td className="py-3.5 font-semibold text-rose-500">{log.likes.toLocaleString()} ❤️</td>
                    <td className="py-3.5 font-bold text-amber-500">{log.gifts} 🎁</td>
                    <td className="py-3.5 text-right font-black text-emerald-500">Rp{log.income.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABS SHOW REQUESTS */}
      {activeTab === "requests" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary anime-sparkle" />
            Incoming Private Show Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showRequests.map((req) => (
              <div key={req.id} className="p-4 bg-background/50 border border-primary/10 rounded-2xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent/20 text-accent-foreground px-2 py-0.5 text-[9px] font-black uppercase rounded-bl-xl">
                  PENDING
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">@{req.requester}</h4>
                  <p className="text-xs font-semibold text-primary mt-1">Requesting: {req.type}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Duration target: {req.duration}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Offered Budget</span>
                    <span className="text-sm font-black text-emerald-500">Rp{req.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDeclineRequest(req.id)}
                      variant="ghost" 
                      className="h-8 hover:bg-destructive/10 text-destructive text-xs font-bold rounded-xl"
                    >
                      Decline
                    </Button>
                    <Button 
                      onClick={() => handleAcceptRequest(req.id, req.requester)}
                      className="h-8 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl shadow-sm"
                    >
                      Accept Private Room
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {showRequests.length === 0 && (
              <div className="col-span-2 py-8 text-center text-muted-foreground font-semibold">
                No active custom requests from fans at the moment. 🌸
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABS STUDIO SETTINGS */}
      {activeTab === "settings" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Studio & Private Call Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  Private 1-on-1 Call Rate (per minute) *
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-primary">Rp</span>
                  <Input 
                    type="number" 
                    value={ratePerMin}
                    onChange={(e) => setRatePerMin(Number(e.target.value))}
                    className="border-primary/20"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Platforms takes a flat 10% commission on private room minutes.</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-background/50 border border-primary/5 rounded-2xl">
                <div>
                  <span className="text-xs font-bold block">Allow Incognito Spectators</span>
                  <span className="text-[10px] text-muted-foreground">Fans can view anonymous but cannot type in live chat.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={allowIncognito}
                  onChange={(e) => setAllowIncognito(e.target.checked)}
                  className="h-4.5 w-4.5 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background/50 border border-primary/5 rounded-2xl">
                <div>
                  <span className="text-xs font-bold block">Strict Private Profile mode</span>
                  <span className="text-[10px] text-muted-foreground">Only show past vods/streams to paid subscribers.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={privateProfile}
                  onChange={(e) => setPrivateProfile(e.target.checked)}
                  className="h-4.5 w-4.5 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> OBS / Stream configuration
              </h4>
              <div className="space-y-2 text-xs">
                <p>Use any streaming software like OBS Studio or Streamlabs to broadcast to NVide Live.</p>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">RTMP Server Target</span>
                  <Input readOnly value={hostData.streamUrl} className="bg-background border-primary/10 h-8 text-[11px] font-mono" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Secret Stream Key</span>
                  <Input readOnly type="password" value={hostData.streamKey} className="bg-background border-primary/10 h-8 text-[11px] font-mono" />
                </div>
                <p className="text-[9px] text-amber-600 font-semibold">⚠️ Do not share your secret stream key. Anyone with this key can stream to your room.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-primary/10">
            <Button 
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl px-6 text-xs h-10 shadow-md"
            >
              Save Studio Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


