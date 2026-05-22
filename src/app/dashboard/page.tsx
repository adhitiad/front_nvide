"use client";

import React, { useState } from "react";
import { 
  Video, Users, Coins, Trophy, Calendar, 
  Settings, Link as LinkIcon, Share2, Target, 
  Gift, Swords, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MISSIONS = [
  { id: 1, title: "Stream for 2 Hours", progress: 1.5, total: 2, unit: "hrs", reward: "500 EXP", completed: false },
  { id: 2, title: "Receive 10,000 Coins", progress: 8500, total: 10000, unit: "coins", reward: "1,000 Coins", completed: false },
  { id: 3, title: "Win 3 PK Battles", progress: 3, total: 3, unit: "wins", reward: "Exclusive Avatar Frame", completed: true },
];

export default function HostDashboardPage() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* Header Profile */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background p-6 pt-12 rounded-b-[40px] shadow-sm border-b border-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-primary overflow-hidden">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200" alt="Host" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-black text-xl">Sakura_Chan</h1>
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Diamond Host 💎
            </span>
          </div>
          <button className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-primary/10">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-around mt-8">
          <div className="text-center">
            <span className="text-2xl font-black font-heading text-primary">8.4k</span>
            <span className="block text-[10px] font-bold text-muted-foreground">Followers</span>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <span className="text-2xl font-black font-heading text-amber-500">2.1M</span>
            <span className="block text-[10px] font-bold text-muted-foreground">Diamonds</span>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <span className="text-2xl font-black font-heading text-blue-500">42</span>
            <span className="block text-[10px] font-bold text-muted-foreground">Hours</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        
        {/* Go Live Button */}
        <Button 
          onClick={() => setIsStreaming(!isStreaming)}
          className={`w-full h-16 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 ${
            isStreaming 
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
              : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
          }`}
        >
          {isStreaming ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-ping" /> End Live Stream
            </>
          ) : (
            <>
              <Video className="w-6 h-6 fill-white" /> GO LIVE NOW
            </>
          )}
        </Button>

        {/* Live Triggers (Only visible when streaming) */}
        {isStreaming && (
          <div className="bg-card rounded-3xl p-5 border border-primary/10 shadow-sm animate-in slide-in-from-top-4">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> Live Interaction Triggers
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-14 rounded-xl font-bold border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 flex gap-2">
                <Swords className="w-5 h-5" /> Start PK Battle
              </Button>
              <Button variant="outline" className="h-14 rounded-xl font-bold border-purple-500/30 text-purple-500 bg-purple-500/5 hover:bg-purple-500/10 flex gap-2">
                <span className="text-xl">🎡</span> Wheel
              </Button>
            </div>
          </div>
        )}

        {/* Daily Missions */}
        <div className="bg-card rounded-3xl p-5 border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-black text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Daily Missions
            </h2>
            <span className="text-xs font-bold text-muted-foreground">Resets in 4h 12m</span>
          </div>

          <div className="space-y-4">
            {MISSIONS.map(mission => (
              <div key={mission.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{mission.title}</h4>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Reward: {mission.reward}
                    </span>
                  </div>
                  <span className="text-xs font-black text-muted-foreground">
                    {mission.progress}/{mission.total} {mission.unit}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${mission.completed ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                    style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                  />
                </div>
                
                {mission.completed && (
                  <Button size="sm" className="w-full h-8 text-[10px] font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white">
                    Claim Reward
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agency Info */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl p-5 border border-emerald-500/20 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-emerald-600 mb-1">StarTalent Agency</h3>
            <p className="text-xs font-bold text-muted-foreground">You are receiving 60% revenue share.</p>
          </div>
          <Button variant="outline" className="border-emerald-500/50 text-emerald-600 font-bold rounded-xl text-xs h-8">
            View Agency
          </Button>
        </div>

      </div>
    </div>
  );
}
