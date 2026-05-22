"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coins, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LuckyBagProps {
  isVisible: boolean;
  onClaim: () => Promise<{ success: boolean; coins: number; message: string }>;
  onClose: () => void;
}

export default function LuckyBag({ isVisible, onClaim, onClose }: LuckyBagProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [result, setResult] = useState<{ success: boolean; coins: number; message: string } | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setResult(null);
      setIsClaiming(false);
    }
  }, [isVisible]);

  const handleTap = async () => {
    if (isClaiming || result) return;
    setIsClaiming(true);
    
    try {
      const res = await onClaim();
      setResult(res);
    } catch (err) {
      setResult({ success: false, coins: 0, message: "Network error" });
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Backdrop when result is shown */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!result ? (
          /* Floating Lucky Bag */
          <motion.div
            key="bag"
            initial={{ y: -200, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{ 
              y: { type: "spring", bounce: 0.5 },
              rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative pointer-events-auto cursor-pointer group"
            onClick={handleTap}
          >
            {/* Glow behind bag */}
            <div className="absolute inset-0 bg-yellow-400 blur-2xl rounded-full opacity-40 animate-pulse group-hover:opacity-60 transition-opacity" />
            
            <div className={`w-32 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl shadow-[0_10px_25px_rgba(220,38,38,0.6)] border-4 border-yellow-400 flex flex-col items-center justify-center relative overflow-hidden ${isClaiming ? 'animate-bounce' : 'anime-float'}`}>
              
              {/* Gold string tie */}
              <div className="absolute top-0 w-16 h-4 border-b-4 border-yellow-400 rounded-b-full" />
              
              <Gift className="w-12 h-12 text-yellow-300 drop-shadow-md z-10" />
              <span className="text-yellow-100 font-heading font-black text-xs mt-1 z-10 drop-shadow-md uppercase tracking-widest">
                Lucky Bag
              </span>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </div>

            {/* Click me label */}
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap"
            >
              TAP TO OPEN!
            </motion.div>
          </motion.div>
        ) : (
          /* Result Modal */
          <motion.div
            key="result"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="bg-card w-72 rounded-3xl p-6 relative pointer-events-auto border border-primary/20 shadow-2xl flex flex-col items-center text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {result.success ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg mb-4 relative anime-pulse-hover">
                  <Coins className="w-10 h-10 text-white drop-shadow-md" />
                  <Sparkles className="absolute -right-2 -top-2 w-6 h-6 text-yellow-400 anime-sparkle" />
                </div>
                <h2 className="font-heading font-black text-xl text-foreground mb-1">Congratulations!</h2>
                <p className="text-sm font-bold text-muted-foreground mb-4">
                  You received <span className="text-amber-500 text-lg">{result.coins}</span> coins
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">😢</span>
                </div>
                <h2 className="font-heading font-black text-xl text-foreground mb-1">Oh no!</h2>
                <p className="text-xs font-bold text-muted-foreground mb-4">
                  {result.message || "Better luck next time!"}
                </p>
              </>
            )}

            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold shadow-md">
              Awesome
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
