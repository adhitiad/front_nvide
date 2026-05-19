"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useOnboardingStore, AgencyOnboardingData } from "@/store/useOnboardingStore";
import { useSession } from "@/lib/auth-client";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Send, 
  CheckCircle, 
  Plus, 
  FileText, 
  Loader2,
  Sparkles,
  TrendingUp,
  Percent,
  UserCheck,
  UserX,
  Upload,
  ChevronRight,
  Settings,
  ShieldCheck,
  ArrowRight
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

// Mock data for Agency
const MOCK_COMMISSION_DATA = [
  { name: "Week 1", HostEarnings: 45000000, AgencyFee: 9000000 },
  { name: "Week 2", HostEarnings: 58000000, AgencyFee: 11600000 },
  { name: "Week 3", HostEarnings: 52000000, AgencyFee: 10400000 },
  { name: "Week 4", HostEarnings: 74000000, AgencyFee: 14800000 },
];

const INITIAL_MANAGED_HOSTS = [
  { id: "h1", username: "SakuraChan", realName: "Sakura Kinomoto", joinedDate: "2026-04-15", monthlyRevenue: 18400000, commissionRate: 20 },
  { id: "h2", username: "GamerTatsuya", realName: "Tatsuya Shiba", joinedDate: "2026-05-01", monthlyRevenue: 12500000, commissionRate: 15 },
  { id: "h3", username: "ChibiMiku", realName: "Miku Hatsune", joinedDate: "2026-05-10", monthlyRevenue: 8900000, commissionRate: 20 }
];

export default function AgencyPage() {
  const { data: session } = useSession();
  const t = useLanguageStore((state) => state.t);
  
  // Onboarding Store
  const { agencyStep, agencyData, setAgencyStep, updateAgencyData, resetAgencyOnboarding } = useOnboardingStore();

  // Local States
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "hosts" | "settings">("overview");
  const [managedHosts, setManagedHosts] = useState(INITIAL_MANAGED_HOSTS);
  
  // Invite Form
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteCommission, setInviteCommission] = useState(20);
  
  // Settings Form
  const [businessName, setBusinessName] = useState("");
  const [defaultCommission, setDefaultCommission] = useState(20);

  // Sync state if already completed
  useEffect(() => {
    if (agencyData.businessName && agencyData.documentPhoto) {
      setIsRegistered(true);
      setBusinessName(agencyData.businessName);
      setDefaultCommission(agencyData.defaultCommission);
    }
  }, [agencyData]);

  const handleOnboardingNext = () => {
    if (agencyStep === 1 && !agencyData.businessName) {
      toast.error("Please fill in your Business Name!");
      return;
    }
    if (agencyStep === 2 && !agencyData.documentPhoto) {
      toast.error("Please upload registration document photo!");
      return;
    }
    if (agencyStep === 4) {
      setIsRegistered(true);
      toast.success("Agency registered successfully! 🏢🌸");
      return;
    }
    setAgencyStep(agencyStep + 1);
  };

  const handleOnboardingBack = () => {
    if (agencyStep > 1) {
      setAgencyStep(agencyStep - 1);
    }
  };

  const handleInviteHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) {
      toast.error("Host Username cannot be empty!");
      return;
    }

    const newHost = {
      id: "h_" + Math.random().toString(36).substring(7),
      username: inviteUsername,
      realName: inviteUsername.charAt(0).toUpperCase() + inviteUsername.slice(1) + " Senpai",
      joinedDate: new Date().toISOString().split("T")[0],
      monthlyRevenue: 0,
      commissionRate: inviteCommission
    };

    setManagedHosts([...managedHosts, newHost]);
    toast.success(`Partnership invitation sent to @${inviteUsername}!`);
    setInviteUsername("");
  };

  const handleRemoveHost = (hostId: string, username: string) => {
    setManagedHosts(managedHosts.filter((h) => h.id !== hostId));
    toast.success(`Removed @${username} from your agency network.`);
  };

  const handleSaveSettings = () => {
    updateAgencyData({
      businessName,
      defaultCommission
    });
    toast.success("Agency settings updated successfully!");
  };

  // Calculate metrics
  const totalHostRevenue = managedHosts.reduce((acc, curr) => acc + curr.monthlyRevenue, 0);
  const totalAgencyCommission = managedHosts.reduce((acc, curr) => acc + (curr.monthlyRevenue * (curr.commissionRate / 100)), 0);

  // WIZARD FOR NEW AGENCY REGISTRATION
  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-3xl border border-primary/20 shadow-xl space-y-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-2xl" />

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-black text-xl animate-bounce">
            🏢
          </div>
          <h1 className="text-2xl font-heading font-black text-primary tracking-tight">
            {t("onboarding.agency_title", "Register New Agency HQ")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Complete the steps to build your host broadcasting network.
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between px-6 pt-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1 last:flex-initial">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                agencyStep >= stepNum 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground border-primary/20"
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  agencyStep > stepNum ? "bg-primary" : "bg-primary/20"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP PANELS */}
        <div className="p-4 bg-background/50 border border-primary/5 rounded-2xl space-y-4">
          
          {/* STEP 1: ACCOUNT TYPE & INFO */}
          {agencyStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary">Step 1: Agency Type & Business Name</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Account Entity Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateAgencyData({ type: "individual" })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                        agencyData.type === "individual" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/20 bg-background text-muted-foreground"
                      }`}
                    >
                      <span>👤 Individual Agent</span>
                    </button>
                    <button 
                      onClick={() => updateAgencyData({ type: "business" })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                        agencyData.type === "business" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/20 bg-background text-muted-foreground"
                      }`}
                    >
                      <span>🏢 Registered Business</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Agency Business Name *</label>
                  <Input 
                    placeholder="e.g. Kawaii Media Group" 
                    value={agencyData.businessName}
                    onChange={(e) => updateAgencyData({ businessName: e.target.value })}
                    className="border-primary/20"
                  />
                </div>

                {agencyData.type === "business" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Business Registration Number</label>
                    <Input 
                      placeholder="e.g. REG-1840-83492" 
                      value={agencyData.businessRegNumber}
                      onChange={(e) => updateAgencyData({ businessRegNumber: e.target.value })}
                      className="border-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS UPLOAD */}
          {agencyStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary">Step 2: Business Registration Documents</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {agencyData.type === "business" 
                  ? "Unggah Surat Izin Usaha / NPWP Perusahaan untuk memverifikasi entitas bisnis resmi agensi Anda." 
                  : "Unggah KTP / Identitas Pengenal Pribadi untuk memverifikasi status agen individu Anda."}
              </p>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">
                  {agencyData.type === "business" ? "Dokumen Izin Usaha Perusahaan *" : "Foto KTP / Identitas Pribadi *"}
                </label>
                <div 
                  onClick={() => updateAgencyData({ documentPhoto: "https://api.dicebear.com/7.x/shapes/svg?seed=agency_doc" })}
                  className="h-32 border border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-background hover:bg-primary/5 transition-colors"
                >
                  {agencyData.documentPhoto ? (
                    <span className="text-xs text-emerald-500 font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Attached document.webp</span>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground">Click to upload doc</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INITIAL HOSTS INVITE (CAN SKIP) */}
          {agencyStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary">Step 3: Tambahkan Host Pertama (Bisa Dilewati)</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Username Host (Pisahkan dengan koma)</label>
                <textarea 
                  placeholder="e.g. SakuraChan, ChibiMiku, SenpaiKun" 
                  value={agencyData.initialHostsUsernames.join(", ")}
                  onChange={(e) => updateAgencyData({ initialHostsUsernames: e.target.value.split(",").map(x => x.trim()) })}
                  className="w-full min-h-[80px] text-sm p-3 rounded-xl border border-primary/20 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Anda dapat mengosongkan kolom ini jika ingin melewati langkah ini dan langsung menuju langkah pengaturan komisi.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: COMMISSION SETTINGS */}
          {agencyStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-primary">Step 4: Atur Komisi Default Agensi</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Persentase Bagi Hasil Komisi Agensi (%)</label>
                  <select 
                    value={agencyData.defaultCommission}
                    onChange={(e) => updateAgencyData({ defaultCommission: Number(e.target.value) })}
                    className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                  >
                    <option value={10}>10% Biaya Agensi / 90% Bagi Hasil Host</option>
                    <option value={15}>15% Biaya Agensi / 85% Bagi Hasil Host</option>
                    <option value={20}>20% Biaya Agensi / 80% Bagi Hasil Host (Direkomendasikan)</option>
                    <option value={25}>25% Biaya Agensi / 75% Bagi Hasil Host</option>
                  </select>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Persentase ini mewakili potongan default yang diterima agensi dari penghasilan gift host sebelum biaya pemrosesan platform. Anda dapat menyesuaikan persentase ini secara individual per host nanti.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* WIZARD ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            disabled={agencyStep === 1}
            onClick={handleOnboardingBack}
            variant="outline"
            className="border-primary/20 rounded-2xl px-5 text-xs h-9.5"
          >
            Back
          </Button>
          <Button 
            onClick={handleOnboardingNext}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl px-5 text-xs h-9.5 shadow-md animate-pulse-hover"
          >
            {agencyStep === 4 ? "Complete HQ Registration 🚀" : "Next Step"}
          </Button>
        </div>
      </div>
    );
  }

  // AGENSI HQ DASHBOARD RENDER
  return (
    <div className="space-y-6">
      {/* Agency Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-background border border-primary/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[10px] font-black bg-primary/20 text-primary rounded-bl-2xl">
          AGENCY HQ PLATINUM
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-md">
            🏢
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-primary flex items-center gap-1.5 leading-none">
              {agencyData.businessName} Headquarter
              <Sparkles className="h-4.5 w-4.5 text-accent anime-sparkle" />
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              {t("dashboard.agency.title", "HQ Agency Partner")} — manage creators, recruit talents, track split cuts.
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1.5">
          {(["overview", "hosts", "settings"] as const).map((tab) => (
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

      {/* OVERVIEW PANEL */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-card rounded-2xl border border-primary/10 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("dashboard.agency.total_hosts", "Total Hosts Managed")}</span>
                <span className="text-2xl font-black mt-1 text-foreground block">{managedHosts.length}</span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            
            <div className="p-5 bg-card rounded-2xl border border-primary/10 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("dashboard.agency.total_rev", "Managed Hosts Revenue")}</span>
                <span className="text-2xl font-black mt-1 text-foreground block">Rp{totalHostRevenue.toLocaleString()}</span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 bg-card rounded-2xl border border-primary/10 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("dashboard.agency.commission", "Agency Commission Earned")}</span>
                <span className="text-2xl font-black mt-1 text-primary block">Rp{totalAgencyCommission.toLocaleString()}</span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-pink-500/10 text-primary flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base flex items-center gap-1.5 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Revenue Performance (IDR)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_COMMISSION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAgencyCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--primary)" }} />
                    <Area type="monotone" dataKey="AgencyFee" stroke="var(--primary)" fillOpacity={1} fill="url(#colorAgencyCommission)" strokeWidth={2} name="Agency Commission Split (IDR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Invite Host Form Panel */}
            <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base flex items-center gap-1.5 text-foreground">
                <Send className="h-5 w-5 text-primary anime-sparkle" />
                {t("dashboard.agency.add_host", "Recruit Host Partner")}
              </h3>
              <form onSubmit={handleInviteHost} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground">Host Username *</Label>
                  <Input 
                    placeholder="e.g. SakuraChan" 
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="border-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground">Split commission Rate (%)</Label>
                  <select 
                    value={inviteCommission}
                    onChange={(e) => setInviteCommission(Number(e.target.value))}
                    className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                  >
                    <option value={10}>10% Agency / 90% Host</option>
                    <option value={15}>15% Agency / 85% Host</option>
                    <option value={20}>20% Agency / 80% Host</option>
                    <option value={25}>25% Agency / 75% Host</option>
                  </select>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl text-xs py-2.5 h-10 shadow-md"
                >
                  Send Invitation
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HOSTS LIST PANEL */}
      {activeTab === "hosts" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Active Managed Host Network
          </h2>
          
          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Studio Nickname</th>
                  <th className="pb-3">Real Name</th>
                  <th className="pb-3">Partner Since</th>
                  <th className="pb-3">Commission Rate</th>
                  <th className="pb-3">Monthly Volume</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {managedHosts.map((host) => (
                  <tr key={host.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3.5 font-bold text-primary">@{host.username}</td>
                    <td className="py-3.5 font-semibold text-foreground">{host.realName}</td>
                    <td className="py-3.5 text-xs text-muted-foreground">{host.joinedDate}</td>
                    <td className="py-3.5 font-bold">{host.commissionRate}%</td>
                    <td className="py-3.5 font-extrabold text-emerald-500">Rp{host.monthlyRevenue.toLocaleString()}</td>
                    <td className="py-3.5 text-right">
                      <Button 
                        onClick={() => handleRemoveHost(host.id, host.username)}
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-destructive hover:bg-destructive/10 text-xs font-bold rounded-xl"
                      >
                        <UserX className="h-3 w-3 mr-1" /> Terminate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS PANEL */}
      {activeTab === "settings" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Agency Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Agency Business Name *</Label>
                <Input 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Default Recruitment Split (%)</Label>
                <select 
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                >
                  <option value={10}>10% Agency / 90% Host</option>
                  <option value={15}>15% Agency / 85% Host</option>
                  <option value={20}>20% Agency / 80% Host</option>
                  <option value={25}>25% Agency / 75% Host</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Secure Verification Badge
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your agency registration is verified under UUID: <strong>{agencyData.businessRegNumber || "IND-KWW-9831"}</strong>. Any change to your business license document requires contacting support.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-primary/10">
            <Button 
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl px-6 text-xs h-10 shadow-md"
            >
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
