"use client";

import React, { useState } from "react";
import { Users, TrendingUp, DollarSign, ChevronLeft, Link as LinkIcon, Plus, Target, Medal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const DOWNLINES = [
  { id: 1, name: "Sakura_Chan", level: "Diamond", revShare: "60%", earned: 154000, avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100" },
  { id: 2, name: "GamerBoy99", level: "Gold", revShare: "50%", earned: 85000, avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=100" },
  { id: 3, name: "AsmrKitty", level: "Silver", revShare: "40%", earned: 32000, avatar: "https://images.unsplash.com/photo-1620067645161-0428d08595cb?q=80&w=100" },
];

export default function AgencyPage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://nvide.live/join?ref=stargency_99";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      
      {/* Header */}
      <div className="relative pt-12 pb-16 px-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden rounded-b-[40px]">
        <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <Link href="/profile">
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <span className="font-heading font-black tracking-wider text-sm uppercase text-white">
            Agency Center
          </span>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-heading font-black text-white drop-shadow-md mb-2">StarTalent Agency</h1>
          <div className="flex justify-center gap-2">
            <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Medal className="w-3 h-3 text-yellow-300" /> Platinum Tier
            </span>
            <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-3 py-1 rounded-full">
              42 Hosts
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 space-y-6">
        
        {/* Revenue Card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-primary/10">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Agency Revenue</h3>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-3xl font-black text-emerald-500 leading-none">Rp 12.4M</span>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3" /> +15%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">This Month</span>
              <span className="font-bold text-foreground">Rp 2.1M</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Pending Payout</span>
              <span className="font-bold text-foreground">Rp 450K</span>
            </div>
          </div>
        </div>

        {/* Invite Link */}
        <div className="bg-primary/5 rounded-3xl p-5 border border-primary/20 shadow-sm">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Recruit New Hosts (MLM)
          </h3>
          <p className="text-xs text-muted-foreground mb-4 font-semibold">
            Share this link to recruit hosts. You earn 10% of their earnings permanently.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-background border border-border rounded-xl px-3 py-2 flex items-center overflow-hidden">
              <span className="text-xs text-muted-foreground truncate font-mono">{referralLink}</span>
            </div>
            <Button 
              onClick={copyLink}
              className={`rounded-xl font-bold shadow-md w-24 transition-all ${copied ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"}`}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Downlines (Host List) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-heading font-black text-lg">My Hosts</h2>
            <Button variant="link" className="text-xs font-bold text-primary h-auto p-0">View All</Button>
          </div>
          
          <div className="space-y-3">
            {DOWNLINES.map((host) => (
              <div key={host.id} className="bg-card rounded-2xl p-4 border border-primary/10 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-primary/20">
                  <Image src={host.avatar} alt={host.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">{host.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                      {host.level}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      Share: {host.revShare}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Yield</span>
                  <span className="text-sm font-black text-emerald-500">+{host.earned/1000}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
