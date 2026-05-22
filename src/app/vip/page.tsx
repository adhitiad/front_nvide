"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Sparkles, Check, ChevronLeft, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const VIP_TIERS = [
  {
    id: "svip",
    name: "SVIP",
    price: "150,000",
    color: "from-pink-500 to-purple-600",
    icon: Star,
    features: [
      "Exclusive Pink Chat Name",
      "Daily 500 Coins Login Bonus",
      "Special SVIP Entry Effect",
      "Exclusive Avatar Border"
    ]
  },
  {
    id: "mvp",
    name: "MVP",
    price: "350,000",
    color: "from-blue-400 to-cyan-500",
    icon: Zap,
    features: [
      "All SVIP Features",
      "Daily 1,500 Coins Login Bonus",
      "Custom Neon Chat Bubble",
      "Private Stream Access (No extra fee)",
      "MVP Exclusive Gifts"
    ],
    popular: true
  },
  {
    id: "king",
    name: "KING",
    price: "1,000,000",
    color: "from-amber-400 to-orange-600",
    icon: Crown,
    features: [
      "All MVP Features",
      "Daily 5,000 Coins Login Bonus",
      "Golden Dragon Entry Animation",
      "Global Broadcast Messages (3/day)",
      "Direct Call with Hosts",
      "King Exclusive VIP Concierge"
    ]
  }
];

export default function VipPage() {
  const [activeTier, setActiveTier] = useState("mvp");

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      
      {/* Header */}
      <div className="relative pt-12 pb-20 px-4 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-black pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <Link href="/profile">
            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <span className="font-heading font-black tracking-wider text-sm uppercase text-amber-400 flex items-center gap-1">
            <Crown className="w-4 h-4" /> VIP Center
          </span>
          <div className="w-8" />
        </div>

        <div className="relative z-10 text-center space-y-2">
          <h1 className="text-3xl font-heading font-black">
            Unlock <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">Premium</span> Privileges
          </h1>
          <p className="text-sm text-neutral-400 font-bold max-w-xs mx-auto">
            Stand out in the crowd. Get exclusive entry effects, daily coins, and private access.
          </p>
        </div>
      </div>

      {/* Tiers Container */}
      <div className="px-4 -mt-12 relative z-20 space-y-4">
        {VIP_TIERS.map((tier) => (
          <motion.div 
            key={tier.id}
            onClick={() => setActiveTier(tier.id)}
            className={`relative rounded-3xl p-1 overflow-hidden transition-all duration-300 cursor-pointer ${
              activeTier === tier.id ? "scale-100 shadow-[0_0_30px_rgba(251,191,36,0.3)]" : "scale-[0.97] opacity-80"
            }`}
          >
            {/* Animated border for active */}
            {activeTier === tier.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-orange-500 to-amber-300 animate-[spin_4s_linear_infinite]" />
            )}
            
            <div className={`relative h-full bg-neutral-900 rounded-[22px] p-5 flex flex-col ${activeTier === tier.id ? "bg-opacity-95" : ""}`}>
              
              {tier.popular && (
                <div className="absolute top-0 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-b-lg shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xl leading-none">{tier.name}</h3>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Monthly Sub</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-bold block mb-0.5">IDR</span>
                  <span className="font-black text-xl">{tier.price}</span>
                  <span className="text-[10px] text-neutral-400 font-bold block">/ month</span>
                </div>
              </div>

              {/* Features List */}
              <AnimatePresence>
                {activeTier === tier.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 mt-4 pt-4 border-t border-white/10"
                  >
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-200">{feature}</span>
                      </div>
                    ))}
                    
                    <Button className={`w-full mt-4 rounded-xl font-bold bg-gradient-to-r ${tier.color} border-none shadow-lg py-6`}>
                      Subscribe to {tier.name}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
