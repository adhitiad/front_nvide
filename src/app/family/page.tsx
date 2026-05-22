"use client";

import React from "react";
import { Users, ChevronLeft, Trophy, Medal, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const FAMILY_MEMBERS = [
  { id: 1, name: "DragonSlayer", role: "Leader", contribution: 1250000, avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100" },
  { id: 2, name: "KittenKawaii", role: "Co-Leader", contribution: 850000, avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=100" },
  { id: 3, name: "Zoro99", role: "Elite", contribution: 450000, avatar: "https://images.unsplash.com/photo-1620067645161-0428d08595cb?q=80&w=100" },
  { id: 4, name: "SakuraBlossom", role: "Member", contribution: 120000, avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100" },
  { id: 5, name: "NarutoFan", role: "Member", contribution: 50000, avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=100" },
];

export default function FamilyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800')] opacity-20 mix-blend-overlay object-cover" />
        
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Link href="/profile">
            <button className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <button className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="absolute -bottom-8 left-6 flex items-end gap-4 z-10">
          <div className="w-24 h-24 rounded-2xl border-4 border-background bg-card overflow-hidden shadow-xl relative">
            <Image src="https://images.unsplash.com/photo-1620067645161-0428d08595cb?q=80&w=200" alt="Clan Logo" fill className="object-cover" />
          </div>
          <div className="pb-2">
            <h1 className="text-white font-heading font-black text-2xl drop-shadow-md">Neon Genesis</h1>
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/30 flex items-center gap-1 w-max mt-1">
              <Trophy className="w-3 h-3 text-yellow-300" /> Rank #4 Global
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 border border-primary/10 shadow-sm text-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Members</span>
            <span className="font-black text-lg">124<span className="text-xs text-muted-foreground font-semibold">/150</span></span>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-primary/10 shadow-sm text-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Level</span>
            <span className="font-black text-lg text-primary">Lv. 8</span>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-primary/10 shadow-sm text-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Wealth</span>
            <span className="font-black text-lg text-amber-500">2.4M</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-md">
            Contribute
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary">
            Family Chat
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="bg-card rounded-3xl border border-primary/10 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-black text-md flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" /> Contribution Board
            </h2>
            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-md">This Week</span>
          </div>

          <div className="space-y-3">
            {FAMILY_MEMBERS.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition">
                
                {/* Rank Badge */}
                <div className="w-6 flex justify-center">
                  {index === 0 ? <span className="text-xl">🥇</span> : 
                   index === 1 ? <span className="text-xl">🥈</span> : 
                   index === 2 ? <span className="text-xl">🥉</span> : 
                   <span className="text-xs font-black text-muted-foreground">{index + 1}</span>}
                </div>
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden relative bg-muted">
                  <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-foreground leading-tight">{member.name}</h4>
                  <span className="text-[9px] text-muted-foreground font-semibold">{member.role}</span>
                </div>
                
                {/* Score */}
                <div className="text-right">
                  <span className="text-xs font-black text-amber-500 block leading-tight">{member.contribution.toLocaleString()}</span>
                  <span className="text-[8px] text-muted-foreground uppercase font-bold">Points</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="ghost" className="w-full mt-2 text-xs font-bold text-primary">
            View All Members
          </Button>
        </div>

      </div>
    </div>
  );
}
