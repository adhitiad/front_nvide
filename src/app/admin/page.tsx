"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/useLanguageStore";
import { 
  Users, 
  UserCheck, 
  Building2, 
  Video, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Check, 
  X, 
  Eye, 
  Ban, 
  UserPlus, 
  Sparkles,
  DollarSign,
  AlertTriangle,
  Settings
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

// Mock Data for Admin Dashboard
const MOCK_STATS = {
  totalUsers: 14205,
  totalHosts: 384,
  totalAgencies: 18,
  activeStreams: 42,
  todayTransactions: 84300000, // IDR
  bannedUsers: 97
};

const MOCK_REVENUE_DATA = [
  { name: "Mon", PlatformFee: 2400000, Subscriptions: 1200000, PrivateRooms: 3400000, Gifts: 4500000 },
  { name: "Tue", PlatformFee: 3100000, Subscriptions: 1400000, PrivateRooms: 4100000, Gifts: 5200000 },
  { name: "Wed", PlatformFee: 2800000, Subscriptions: 1300000, PrivateRooms: 3900000, Gifts: 4900000 },
  { name: "Thu", PlatformFee: 4500000, Subscriptions: 1900000, PrivateRooms: 5800000, Gifts: 6700000 },
  { name: "Fri", PlatformFee: 5200000, Subscriptions: 2100000, PrivateRooms: 6900000, Gifts: 8100000 },
  { name: "Sat", PlatformFee: 6800000, Subscriptions: 2800000, PrivateRooms: 8200000, Gifts: 9800000 },
  { name: "Sun", PlatformFee: 7200000, Subscriptions: 3100000, PrivateRooms: 9100000, Gifts: 11200000 },
];

const MOCK_ACTIVE_STREAMS = [
  { id: "str1", host: "SakuraChan", title: "Sunday Cosplay ASMR 🌸", viewers: 1840, couple: "Miku & Kaito cosplay partner" },
  { id: "str2", host: "KuroNeko", title: "Chitchat Room + Lovense interactive 🎮", viewers: 940, couple: "Asuka & Shinji vibe" },
  { id: "str3", host: "SenpaiKun", title: "Anime Song Cover Request 🎸", viewers: 420, couple: "Ren & Rinka partner" }
];

const INITIAL_USERS = [
  { id: "u1", username: "otaku_senpai", email: "otaku@mail.com", role: "user", status: "active" },
  { id: "u2", username: "sakura_host", email: "sakura@mail.com", role: "host", status: "active" },
  { id: "u3", username: "banned_troll", email: "troll@mail.com", role: "user", status: "banned" },
  { id: "u4", username: "kawaii_agency", email: "agency@mail.com", role: "agency", status: "active" },
  { id: "u5", username: "akihabara_host", email: "akiba@mail.com", role: "host", status: "active" },
];

const INITIAL_KYC = [
  { id: "k1", username: "ChibiMiku", realName: "Miku Hatsune", kycDocType: "KTP", docNumber: "3171012345670001", country: "Indonesia", status: "pending", selfieUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=miku", docPhotoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=doc1" },
  { id: "k2", username: "GamerTatsuya", realName: "Tatsuya Shiba", kycDocType: "Passport", docNumber: "A9876543", country: "Vietnam", status: "pending", selfieUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=tatsuya", docPhotoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=doc2" },
  { id: "k3", username: "UsagiCos", realName: "Usagi Tsukino", kycDocType: "Driver License", docNumber: "1234-5678-90", country: "Japan", status: "pending", selfieUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=usagi", docPhotoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=doc3" },
  { id: "k4", username: "PrideAlice", realName: "Alice Rainbow", kycDocType: "KTP", docNumber: "3171019999970002", country: "Indonesia", status: "pending", selfieUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alice", docPhotoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=doc4" },
];

const INITIAL_REPORTS = [
  { id: "r1", reporter: "Watanabe", reportedUser: "spammer_kun", type: "Spam", reason: "Spamming link in live chat room", status: "pending", streamTitle: "Chill Vibe chat" },
  { id: "r2", reporter: "Hikari", reportedUser: "host_hacker", type: "Violence", reason: "Host showing violent knife stunts", status: "pending", streamTitle: "Unboxing stuff" },
  { id: "r3", reporter: "Kenshin", reportedUser: "rainbow_unicorn", type: "lgbt_content", reason: "Promoting LGBT themes directly on stream banner", status: "pending", streamTitle: "Let's talk relationships" }
];

const INITIAL_HOSTS = [
  { id: "h1", username: "SakuraChan", realName: "Sakura Kinomoto", agency: "CLAMP Agency", streamHours: 124, tokensEarned: 45000, status: "active" },
  { id: "h2", username: "KuroNeko", realName: "Ruri Gokou", agency: "Neko Neko Production", streamHours: 89, tokensEarned: 28000, status: "active" },
  { id: "h3", username: "AsukaCos", realName: "Asuka Langley", agency: "None", streamHours: 14, tokensEarned: 3500, status: "suspended" },
];

const INITIAL_AGENCIES = [
  { id: "a1", businessName: "CLAMP Agency", owner: "kawaii_agency", hostsCount: 12, commissionRate: 20, joinedDate: "2026-03-10", status: "active" },
  { id: "a2", businessName: "Neko Neko Production", owner: "neko_boss", hostsCount: 5, commissionRate: 15, joinedDate: "2026-04-05", status: "active" },
  { id: "a3", businessName: "Kadokawa Agency", owner: "kadokawa_rep", hostsCount: 22, commissionRate: 10, joinedDate: "2026-02-01", status: "active" },
];

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";
  const t = useLanguageStore((state) => state.t);

  // States
  const [users, setUsers] = useState(INITIAL_USERS);
  const [kycRequests, setKycRequests] = useState(INITIAL_KYC);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [hosts, setHosts] = useState(INITIAL_HOSTS);
  const [agencies, setAgencies] = useState(INITIAL_AGENCIES);
  const [editingAgency, setEditingAgency] = useState<any | null>(null);
  const [agencyCommissionInput, setAgencyCommissionInput] = useState("");
  
  const [giftFee, setGiftFee] = useState("10");
  const [privateFee, setPrivateFee] = useState("10");
  const [minWithdraw, setMinWithdraw] = useState("100000");
  const [safetySensitivity, setSafetySensitivity] = useState("high");

  const handleToggleHostStatus = (hostId: string, username: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    setHosts(hosts.map(h => h.id === hostId ? { ...h, status: nextStatus } : h));
    toast.success(`Host @${username} status changed to ${nextStatus}.`);
  };

  const handleUpdateAgencyCommission = (agencyId: string) => {
    const rate = Number(agencyCommissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Please enter a valid percentage between 0 and 100!");
      return;
    }
    setAgencies(agencies.map(a => a.id === agencyId ? { ...a, commissionRate: rate } : a));
    toast.success(`Commission rate updated successfully to ${rate}%`);
    setEditingAgency(null);
  };
  
  // Modals / Details States
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  
  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  
  const [reportFilter, setReportFilter] = useState("all");

  // Handlers
  const handleBanUser = (userId: string, username: string, reason = "Violating policies") => {
    // Check if LGBT content violation triggers instant permanent ban notification
    setUsers(users.map(u => u.id === userId ? { ...u, status: "banned" } : u));
    toast.success(`User @${username} has been permanently banned.`);
  };

  const handleUnbanUser = (userId: string, username: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "active" } : u));
    toast.success(`User @${username} is unbanned.`);
  };

  const handleVerifyKYC = (kycId: string, status: "approved" | "rejected", reason = "") => {
    const kyc = kycRequests.find(k => k.id === kycId);
    if (!kyc) return;

    // LGBT promotion check logic
    const lgbtKeywords = ["lgbt", "gay", "lesbian", "bisexual", "transgender", "queer", "pride", "rainbow", "homosexual"];
    const containsLgbt = lgbtKeywords.some(kw => 
      kyc.username.toLowerCase().includes(kw) || 
      kyc.realName.toLowerCase().includes(kw)
    );

    if (status === "approved" && containsLgbt) {
      toast.error("KYC Ditolak otomatis oleh sistem: Profil mengandung unsur promosi LGBT (melanggar Kebijakan Konten Non-LGBT NVide Live).");
      setKycRequests(kycRequests.map(k => k.id === kycId ? { ...k, status: "rejected" } : k));
      setSelectedKyc(null);
      return;
    }

    // Region restriction logic check
    const acceptedCountries = ["Indonesia", "Malaysia", "Philippines", "Vietnam", "Thailand", "Singapore", "Spain", "Brazil"];
    if (status === "approved" && !acceptedCountries.includes(kyc.country)) {
      toast.error(t("alerts.kyc_denied_region", "KYC ditolak. Negara Anda saat ini belum didukung untuk siaran."));
      setKycRequests(kycRequests.map(k => k.id === kycId ? { ...k, status: "rejected" } : k));
      setSelectedKyc(null);
      return;
    }

    setKycRequests(kycRequests.map(k => k.id === kycId ? { ...k, status } : k));
    toast.success(`KYC request for @${kyc.username} has been ${status}.`);
    setSelectedKyc(null);
  };

  const handleReportAction = (reportId: string, action: "ban_host" | "terminate" | "dismiss", reportedUser: string) => {
    if (action === "ban_host") {
      setUsers(users.map(u => u.username === reportedUser ? { ...u, status: "banned" } : u));
      toast.success(`Permanently banned violator @${reportedUser}. Stream terminated.`);
    } else if (action === "terminate") {
      toast.success(`Stream of @${reportedUser} terminated successfully.`);
    } else {
      toast.info("Report dismissed.");
    }
    setReports(reports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
  };

  return (
    <div className="space-y-6">
      {/* Tab Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-primary uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 anime-sparkle text-accent" />
            {t("dashboard.admin.title", "Admin Dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Onii-chan / Onee-sama, manage the stream world with pride!
          </p>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: t("dashboard.admin.stats.total_users", "Total Users"), value: MOCK_STATS.totalUsers, icon: Users, color: "bg-pink-500/10 text-pink-500" },
              { label: t("dashboard.admin.stats.total_hosts", "Total Hosts"), value: MOCK_STATS.totalHosts, icon: UserCheck, color: "bg-violet-500/10 text-violet-500" },
              { label: t("dashboard.admin.stats.total_agencies", "Total Agencies"), value: MOCK_STATS.totalAgencies, icon: Building2, color: "bg-amber-500/10 text-amber-500" },
              { label: t("dashboard.admin.stats.active_streams", "Active Streams"), value: MOCK_STATS.activeStreams, icon: Video, color: "bg-sky-500/10 text-sky-500" },
              { label: t("dashboard.admin.stats.today_tx", "Today's Trans."), value: `Rp${(MOCK_STATS.todayTransactions / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-500" },
              { label: t("dashboard.admin.stats.banned_users", "Banned Users"), value: MOCK_STATS.bannedUsers, icon: ShieldAlert, color: "bg-rose-500/10 text-rose-500" }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-4 bg-card rounded-3xl border border-primary/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-1.5 rounded-xl ${stat.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black mt-2 text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart Section */}
          <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                Platform Revenue Sources (IDR)
              </h2>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                Weekly Performance
              </span>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorPrivate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--primary)" }} />
                  <Area type="monotone" dataKey="PlatformFee" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPlatform)" strokeWidth={2} name="Gift Commission (10%)" />
                  <Area type="monotone" dataKey="PrivateRooms" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrivate)" strokeWidth={2} name="Private Calls (10%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Streams Panel */}
          <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live Streams Monitoring
            </h2>
            <div className="overflow-x-auto">
              <table className="mobile-card-table w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                    <th className="pb-3">Host Username</th>
                    <th className="pb-3">Stream Title</th>
                    <th className="pb-3">Viewers</th>
                    <th className="pb-3">Partner Info</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 text-sm">
                  {MOCK_ACTIVE_STREAMS.map((stream) => (
                    <tr key={stream.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 font-bold text-primary">@{stream.host}</td>
                      <td className="py-3 font-semibold">{stream.title}</td>
                      <td className="py-3 font-extrabold text-sky-500">{stream.viewers} 👤</td>
                      <td className="py-3 text-xs text-muted-foreground italic">{stream.couple}</td>
                      <td className="py-3 text-right">
                        <Button 
                          onClick={() => handleBanUser(stream.id, stream.host, "Violated livestream policies")}
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-destructive hover:bg-destructive/10 text-xs font-bold"
                        >
                          <Ban className="h-3 w-3 mr-1" /> Terminate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("dashboard.admin.user_management", "User Management")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search username/email..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-9.5 w-60 rounded-full border-primary/20 bg-background"
                />
              </div>
              <select 
                value={userRoleFilter} 
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="h-9.5 rounded-full border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="host">Hosts</option>
                <option value="agency">Agencies</option>
                <option value="admin">Admins</option>
              </select>
              <select 
                value={userStatusFilter} 
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="h-9.5 rounded-full border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {users
                  .filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .filter(u => userRoleFilter === "all" || u.role === userRoleFilter)
                  .filter(u => userStatusFilter === "all" || u.status === userStatusFilter)
                  .map((usr) => (
                    <tr key={usr.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 font-bold">@{usr.username}</td>
                      <td className="py-3.5 text-muted-foreground">{usr.email}</td>
                      <td className="py-3.5 font-bold text-xs uppercase text-primary">{usr.role}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          usr.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {usr.status === "active" ? (
                          <Button 
                            onClick={() => handleBanUser(usr.id, usr.username)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:bg-destructive/10 text-xs font-bold"
                          >
                            <Ban className="h-3 w-3 mr-1" /> Ban User
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUnbanUser(usr.id, usr.username)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold"
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Unban
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC VERIFICATION TAB */}
      {activeTab === "kyc" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {t("dashboard.admin.kyc_pending", "KYC Verification Queue")}
          </h2>

          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Real Name</th>
                  <th className="pb-3">Doc Type</th>
                  <th className="pb-3">Doc Number</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {kycRequests.filter(k => k.status === "pending").map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 font-bold text-primary">@{kyc.username}</td>
                    <td className="py-4 font-semibold">{kyc.realName}</td>
                    <td className="py-4 text-xs font-bold text-muted-foreground">{kyc.kycDocType}</td>
                    <td className="py-4 font-mono text-xs">{kyc.docNumber}</td>
                    <td className="py-4 font-semibold">{kyc.country}</td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <Button 
                        onClick={() => setSelectedKyc(kyc)}
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-primary/20 text-xs font-bold rounded-xl"
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Docs
                      </Button>
                    </td>
                  </tr>
                ))}
                {kycRequests.filter(k => k.status === "pending").length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-semibold">
                      Onii-chan, no KYC verification request in queue! 🌟
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* KYC Details Modal */}
          {selectedKyc && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-card w-full max-w-lg border border-primary/20 rounded-3xl shadow-2xl p-6 relative overflow-hidden animate-pulse-hover">
                <button 
                  onClick={() => setSelectedKyc(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-1">
                  <Sparkles className="h-5 w-5 anime-sparkle" />
                  KYC Verification: @{selectedKyc.username}
                </h3>
                
                <div className="space-y-4">
                  {(["lgbt", "gay", "lesbian", "bisexual", "transgender", "queer", "pride", "rainbow", "homosexual"].some(kw => 
                    selectedKyc.username.toLowerCase().includes(kw) || 
                    selectedKyc.realName.toLowerCase().includes(kw)
                  )) && (
                    <div className="p-3 bg-red-500/10 border-2 border-red-500/30 text-red-500 dark:text-red-400 rounded-2xl text-[11px] leading-relaxed">
                      <p className="font-bold">⚠️ SISTEM REJEKSI OTOMATIS (ANTI-LGBT POLICY):</p>
                      <p className="mt-1">Profil atau nama pendaftar terdeteksi mengandung istilah promosi LGBT. Berdasarkan kebijakan platform NVide Live, segala bentuk konten LGBT dilarang keras dan pendaftaran ini ditolak secara otomatis oleh sistem.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <p className="text-muted-foreground uppercase">Real Name</p>
                      <p className="text-foreground text-sm font-black">{selectedKyc.realName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase">Country/Region</p>
                      <p className="text-foreground text-sm font-black">{selectedKyc.country}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase">Doc Type & Number</p>
                      <p className="text-foreground text-sm font-mono">{selectedKyc.kycDocType} - {selectedKyc.docNumber}</p>
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">KYC Document Photo</p>
                      <div className="h-36 bg-muted border border-primary/20 rounded-2xl flex items-center justify-center text-muted-foreground text-xs font-bold overflow-hidden relative group">
                        <img src={selectedKyc.docPhotoUrl} alt="Doc Photo" className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Selfie Photo</p>
                      <div className="h-36 bg-muted border border-primary/20 rounded-2xl flex items-center justify-center text-muted-foreground text-xs font-bold overflow-hidden relative">
                        <img src={selectedKyc.selfieUrl} alt="Selfie Photo" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-primary/10">
                    <Button 
                      onClick={() => handleVerifyKYC(selectedKyc.id, "rejected")}
                      variant="ghost" 
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-2xl px-5 text-xs h-10"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                    <Button 
                      onClick={() => handleVerifyKYC(selectedKyc.id, "approved")}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl px-5 text-xs h-10 shadow-md"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve / Verify
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary animate-sparkle" />
              {t("dashboard.admin.reports_title", "Content Violation Reports")}
            </h2>
            <div className="flex items-center gap-2">
              <select 
                value={reportFilter} 
                onChange={(e) => setReportFilter(e.target.value)}
                className="h-9.5 rounded-full border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
              >
                <option value="all">All Violations</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="lgbt_content">LGBT Content</option>
                <option value="Violence">Violence</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Reporter</th>
                  <th className="pb-3">Reported User</th>
                  <th className="pb-3">Violation Type</th>
                  <th className="pb-3">Stream / Message Context</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {reports
                  .filter(r => reportFilter === "all" || r.status === reportFilter || r.type === reportFilter)
                  .map((rep) => {
                    const isLGBT = rep.type === "lgbt_content";
                    return (
                      <tr key={rep.id} className={`hover:bg-primary/5 transition-colors ${rep.status === "resolved" ? "opacity-60" : ""}`}>
                        <td className="py-4 font-semibold text-muted-foreground">@{rep.reporter}</td>
                        <td className="py-4 font-bold text-primary">@{rep.reportedUser}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isLGBT ? "bg-rose-600/20 text-rose-600 border border-rose-600/30" : "bg-orange-500/10 text-orange-500"
                          }`}>
                            {rep.type === "lgbt_content" ? "LGBT CONTENT (CRITICAL)" : rep.type}
                          </span>
                        </td>
                        <td className="py-4 text-xs italic text-muted-foreground">"{rep.streamTitle}"</td>
                        <td className="py-4 text-xs max-w-xs truncate">{rep.reason}</td>
                        <td className="py-4 text-right flex justify-end gap-1.5">
                          {rep.status === "pending" && (
                            <>
                              {isLGBT ? (
                                <Button 
                                  onClick={() => handleBanUser(rep.id, rep.reportedUser, "Violating anti-LGBT rules")}
                                  className="h-8 bg-destructive hover:bg-destructive/95 text-destructive-foreground text-[10px] font-extrabold rounded-xl"
                                >
                                  <Ban className="h-3 w-3 mr-1" /> Permanent Ban (Instant)
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    onClick={() => handleReportAction(rep.id, "ban_host", rep.reportedUser)}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-destructive/20 text-destructive text-[10px] font-bold rounded-xl"
                                  >
                                    Ban
                                  </Button>
                                  <Button 
                                    onClick={() => handleReportAction(rep.id, "dismiss", rep.reportedUser)}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-muted-foreground text-[10px] font-bold rounded-xl"
                                  >
                                    Dismiss
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                          {rep.status === "resolved" && (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">
                              RESOLVED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOSTS TAB */}
      {activeTab === "hosts" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Host Partners Management
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search hosts..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 h-9.5 w-60 rounded-full border-primary/20 bg-background"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Real Name</th>
                  <th className="pb-3">Agency Network</th>
                  <th className="pb-3">Stream Hours</th>
                  <th className="pb-3">Tokens Earned</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {hosts
                  .filter(h => h.username.toLowerCase().includes(userSearch.toLowerCase()) || h.realName.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((hst) => (
                    <tr key={hst.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 font-bold text-primary">@{hst.username}</td>
                      <td className="py-3.5 font-semibold">{hst.realName}</td>
                      <td className="py-3.5 text-muted-foreground font-semibold">{hst.agency}</td>
                      <td className="py-3.5 font-bold">{hst.streamHours} hrs</td>
                      <td className="py-3.5 text-amber-500 font-extrabold">{hst.tokensEarned.toLocaleString()} 🪙</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          hst.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {hst.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Button 
                          onClick={() => handleToggleHostStatus(hst.id, hst.username, hst.status)}
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 text-xs font-bold ${hst.status === "active" ? "text-destructive hover:bg-destructive/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
                        >
                          {hst.status === "active" ? "Suspend Host" : "Activate Host"}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AGENCIES TAB */}
      {activeTab === "agencies" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Agency Networks HQ
          </h2>

          <div className="overflow-x-auto">
            <table className="mobile-card-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                  <th className="pb-3">Agency Name</th>
                  <th className="pb-3">Owner Username</th>
                  <th className="pb-3">Hosts Count</th>
                  <th className="pb-3">Agency Comm. Rate</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 font-black text-foreground">{agency.businessName}</td>
                    <td className="py-4 font-semibold text-primary">@{agency.owner}</td>
                    <td className="py-4 font-bold">{agency.hostsCount} hosts</td>
                    <td className="py-4 font-bold text-violet-500">{agency.commissionRate}%</td>
                    <td className="py-4 text-muted-foreground">{agency.joinedDate}</td>
                    <td className="py-4 text-right">
                      <Button 
                        onClick={() => {
                          setEditingAgency(agency);
                          setAgencyCommissionInput(String(agency.commissionRate));
                        }}
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-primary/20 text-xs font-bold rounded-xl"
                      >
                        Edit Commission
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Agency Commission Modal */}
          {editingAgency && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-card w-full max-w-sm border border-primary/20 rounded-3xl shadow-2xl p-6 relative">
                <button 
                  onClick={() => setEditingAgency(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-1.5">
                  Edit commission for {editingAgency.businessName}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Commission Rate (%)</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={agencyCommissionInput}
                        onChange={(e) => setAgencyCommissionInput(e.target.value)}
                        className="border-primary/20 font-bold"
                      />
                      <span className="font-extrabold text-sm text-primary">%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button 
                      onClick={() => setEditingAgency(null)}
                      variant="ghost" 
                      className="text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleUpdateAgencyCommission(editingAgency.id)}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl shadow-md"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === "revenue" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
              Detailed Platform Revenue Distribution
            </h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 font-extrabold px-3 py-1 rounded-full uppercase">
              LIVE STATUS
            </span>
          </div>

          {/* Detailed stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Livestream Gift Revenue", value: "Rp38,500,000", desc: "10% Platform fee applied", color: "text-rose-500" },
              { label: "Private 1-on-1 Call Revenue", value: "Rp31,600,000", desc: "10% Platform fee applied", color: "text-purple-500" },
              { label: "VIP Clip Subscription", value: "Rp14,200,000", desc: "100% Platform direct purchase", color: "text-amber-500" },
              { label: "Total Platform Profit Share", value: "Rp21,210,000", desc: "Total accrued commission", color: "text-emerald-500" }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-background border border-primary/10 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</span>
                <p className={`text-xl font-black mt-2 ${item.color}`}>{item.value}</p>
                <p className="text-[9px] text-muted-foreground italic mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Revenue Area Chart */}
          <div className="p-4 bg-background border border-primary/10 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground mb-4">Accrued Profit Flow Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlatformFee" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorGifts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--primary)" }} />
                  <Area type="monotone" dataKey="PlatformFee" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPlatformFee)" strokeWidth={2} name="Commission Profit (IDR)" />
                  <Area type="monotone" dataKey="Gifts" stroke="#eab308" fillOpacity={1} fill="url(#colorGifts)" strokeWidth={2} name="Gross Gifts Sent (IDR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            HQ Platform Configurations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-background/50 border border-primary/5 p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-primary">Fee & Commission Rates</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Livestream Gifts Platform Fee (%)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={giftFee} 
                      onChange={(e) => setGiftFee(e.target.value)} 
                      className="border-primary/20 font-bold" 
                    />
                    <span className="font-bold text-sm text-primary">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Private Room Calls Platform Fee (%)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={privateFee} 
                      onChange={(e) => setPrivateFee(e.target.value)} 
                      className="border-primary/20 font-bold" 
                    />
                    <span className="font-bold text-sm text-primary">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-background/50 border border-primary/5 p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-primary">Withdrawal & Security Parameters</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Minimum Withdrawal Amount (IDR)</label>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary">Rp</span>
                    <Input 
                      type="number" 
                      value={minWithdraw} 
                      onChange={(e) => setMinWithdraw(e.target.value)} 
                      className="border-primary/20 font-bold" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">AI Stream Scanner Sensitivity</label>
                  <select 
                    value={safetySensitivity} 
                    onChange={(e) => setSafetySensitivity(e.target.value)} 
                    className="w-full h-9.5 rounded-xl border border-primary/20 bg-background text-sm font-semibold px-3 focus:outline-none"
                  >
                    <option value="low">Low (Alert only)</option>
                    <option value="medium">Medium (Warn & Flag)</option>
                    <option value="high">High (Auto-terminate & Ban violator)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              onClick={() => toast.success("Platform settings successfully saved and applied system-wide!")}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl px-6 py-2.5 shadow-md"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
