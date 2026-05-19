"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useSubscriptionStore, VIPPlan } from "@/store/useSubscriptionStore";
import { Check, Scissors, History, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClipSubscriptionPage() {
  const t = useLanguageStore((state) => state.t);
  
  // Store
  const { plans, activeSubscription, history, subscribeToPlan, loading } = useSubscriptionStore();
  
  // State
  const [promoFirstHost, setPromoFirstHost] = useState(true);

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const isPromo = planId === "vip1" && promoFirstHost;
    const price = isPromo && plan.promoPrice ? plan.promoPrice : plan.price;

    const success = await subscribeToPlan(planId, isPromo);
    if (success) {
      toast.success(`Successfully subscribed to ${plan.name}! 🚀 Total: Rp${price.toLocaleString()}`);
      if (planId === "vip1") {
        setPromoFirstHost(false); // Promo used
      }
    } else {
      toast.error(t("alerts.error_occurred", "Failed to process subscription."));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2 relative overflow-hidden p-6 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl">
        <Crown className="h-10 w-10 text-primary mx-auto anime-sparkle" />
        <h1 className="text-3xl font-heading font-black text-primary uppercase tracking-tight">
          {t("ai_clip.title", "AI Clip VIP Subscription")}
        </h1>
        <p className="text-sm text-muted-foreground font-semibold max-w-xl mx-auto">
          {t("ai_clip.subtitle", "Get high-quality automated clip highlights generated straight from your livestreams by our state-of-the-art anime AI engines!")}
        </p>

        {/* Current Active Subscription Status */}
        {activeSubscription ? (
          <div className="inline-flex items-center gap-3 mt-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
            <Zap className="h-4 w-4 text-accent" />
            <span>Active Plan: {activeSubscription.planName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Remaining Quota: {activeSubscription.quotaRemaining} / {activeSubscription.quotaTotal} clips</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-muted border border-primary/10 rounded-full text-xs font-bold text-muted-foreground">
            <Scissors className="h-4 w-4" />
            <span>No active AI Clip VIP plan. Subscribe below to start clipping!</span>
          </div>
        )}
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const isVIP1 = plan.id === "vip1";
          const showPromo = isVIP1 && promoFirstHost;
          const displayPrice = showPromo && plan.promoPrice ? plan.promoPrice : plan.price;

          return (
            <div 
              key={plan.id}
              className={`p-6 bg-card rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.id === "vip2" 
                  ? "border-primary ring-2 ring-primary/20 scale-105 md:scale-103 z-10" 
                  : "border-primary/15"
              }`}
            >
              {/* Featured banner for VIP2 */}
              {plan.id === "vip2" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  MOST POPULAR
                </div>
              )}

              {/* Promo Banner for VIP1 */}
              {showPromo && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider anime-sparkle">
                  {t("ai_clip.promo_tag", "First Host Promo!")}
                </div>
              )}

              <div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">AI HIGHLIGHTS</span>
                  <h3 className="text-xl font-heading font-black text-foreground flex items-center gap-1.5">
                    {plan.name}
                    {plan.id === "vip3" && <Crown className="h-4.5 w-4.5 text-accent" />}
                  </h3>
                </div>

                {/* Price block */}
                <div className="py-4 border-b border-primary/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-muted-foreground">Rp</span>
                    <span className="text-3xl font-black text-primary tracking-tight">
                      {displayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/mo</span>
                  </div>
                  {showPromo && (
                    <p className="text-[10px] text-accent font-extrabold mt-1 line-through opacity-85">
                      Normal Price: Rp{plan.price.toLocaleString()}
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-muted-foreground mt-2">
                    Durasi: 1 bulan
                  </p>
                </div>

                {/* Features list */}
                <div className="py-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground italic">"{plan.description}"</p>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-semibold">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/5">
                <Button 
                  disabled={loading}
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full font-bold text-xs rounded-2xl h-10 shadow-md ${
                    plan.id === "vip2" 
                      ? "bg-primary hover:bg-primary/95 text-primary-foreground animate-pulse-hover" 
                      : "bg-background hover:bg-primary/5 border border-primary/20 text-primary"
                  }`}
                >
                  {loading ? "Memproses..." : "Langganan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="p-6 bg-card rounded-3xl border border-primary/10 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base flex items-center gap-1.5">
          <History className="h-5 w-5 text-primary" />
          {t("ai_clip.history", "VIP Subscription History")}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/10 text-xs font-bold text-muted-foreground">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Plan Name</th>
                <th className="pb-3">Price Paid</th>
                <th className="pb-3">Purchase Date</th>
                <th className="pb-3">Expiry Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-xs font-semibold">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-primary/5">
                  <td className="py-3 font-mono">{item.id}</td>
                  <td className="py-3 text-primary font-bold">{item.planName}</td>
                  <td className="py-3 font-extrabold text-emerald-500">Rp{item.pricePaid.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                  <td className="py-3 text-muted-foreground">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground italic font-semibold">
                    No subscriptions purchased yet. Choose a VIP plan above to unlock clipping features!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
