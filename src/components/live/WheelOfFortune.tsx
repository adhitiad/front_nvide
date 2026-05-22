"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Prize {
  id: string;
  name: string;
  color: string;
  type: "coin" | "exp" | "item" | "empty";
  value: number;
}

interface WheelOfFortuneProps {
  isVisible: boolean;
  onClose: () => void;
  onSpin: () => Promise<{ prizeId: string; message: string }>;
  prizes: Prize[];
  costPerSpin: number;
}

export default function WheelOfFortune({ isVisible, onClose, onSpin, prizes, costPerSpin }: WheelOfFortuneProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    
    // Visual fast spin start
    setRotation(r => r + 360 * 5); // 5 full spins minimum

    try {
      const result = await onSpin();
      const prizeIndex = prizes.findIndex(p => p.id === result.prizeId);
      
      if (prizeIndex !== -1) {
        // Calculate exact angle to stop at the winning segment
        const segmentAngle = 360 / prizes.length;
        // Target rotation: current 5 spins + align the winning segment to the top (0 degrees)
        // Offset by segmentAngle / 2 to hit the center of the segment
        const targetRotation = rotation + (360 * 5) + (360 - (prizeIndex * segmentAngle)) - (segmentAngle / 2);
        
        // Wait a bit to simulate network while spinning
        setTimeout(() => {
          setRotation(targetRotation);
          setTimeout(() => {
            setWonPrize(prizes[prizeIndex]);
            setIsSpinning(false);
          }, 3500); // Wait for spin animation to finish
        }, 500);
      } else {
        setIsSpinning(false);
      }
    } catch (e) {
      setIsSpinning(false);
    }
  };

  if (!isVisible) return null;

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isSpinning && !wonPrize && onClose()}
      />

      <AnimatePresence mode="wait">
        {wonPrize ? (
          <motion.div
            key="win"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="z-10 bg-card w-80 rounded-3xl p-6 border-2 border-primary shadow-[0_0_30px_var(--primary)] flex flex-col items-center text-center relative"
          >
            <div className="absolute -top-10 animate-bounce">
              <Sparkles className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
            </div>
            
            <h2 className="text-2xl font-heading font-black mt-4 mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              You Won!
            </h2>
            
            <div className="w-24 h-24 rounded-full border-4 shadow-lg flex flex-col items-center justify-center mb-4" style={{ backgroundColor: wonPrize.color, borderColor: "rgba(255,255,255,0.5)" }}>
              {wonPrize.type === 'coin' && <Coins className="w-10 h-10 text-white mb-1" />}
              <span className="text-white font-black text-sm drop-shadow-md leading-tight px-2">{wonPrize.name}</span>
            </div>
            
            <p className="text-sm font-bold text-muted-foreground mb-6">
              Added to your account automatically.
            </p>
            
            <Button onClick={() => setWonPrize(null)} className="w-full rounded-full font-bold h-12 text-md">
              Spin Again
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full rounded-full font-bold mt-2">
              Close
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="wheel"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="z-10 flex flex-col items-center"
          >
            {/* Header */}
            <div className="bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-heading font-black text-lg shadow-lg mb-6 flex items-center gap-2 border border-primary-foreground/20">
              <Sparkles className="w-5 h-5 text-accent anime-sparkle" />
              Wheel of Fortune
              <Sparkles className="w-5 h-5 text-accent anime-sparkle" />
            </div>

            {/* Wheel Container */}
            <div className="relative w-[300px] h-[300px]">
              {/* Center Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-10 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-b-full shadow-lg border-2 border-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-end justify-center pb-1">
                <div className="w-2 h-2 bg-white rounded-full opacity-50" />
              </div>

              {/* The Wheel */}
              <motion.div
                className="w-full h-full rounded-full border-8 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] relative overflow-hidden bg-card"
                animate={{ rotate: rotation }}
                transition={{ duration: isSpinning ? 3.5 : 0, ease: [0.2, 0.8, 0.2, 1] }} // smooth deceleration
              >
                {/* Segments */}
                {prizes.map((prize, i) => {
                  const rotate = i * segmentAngle;
                  return (
                    <div
                      key={prize.id}
                      className="absolute top-0 left-1/2 origin-bottom flex flex-col items-center pt-4 border-r-2 border-white/20"
                      style={{
                        height: "50%",
                        width: "100%", // This approach works best with clip-path or exact CSS triangles for real wheels, but using a simple representation here
                        transform: `translateX(-50%) rotate(${rotate}deg)`,
                        clipPath: `polygon(0 0, 100% 0, 50% 100%)`, // Approximate slice
                        backgroundColor: prize.color,
                        zIndex: 1
                      }}
                    >
                      <span className="text-white font-black text-[10px] w-16 text-center drop-shadow-md leading-tight mt-2 -rotate-90">
                        {prize.name}
                      </span>
                    </div>
                  );
                })}

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] border-4 border-yellow-400 z-10 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full animate-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Spin Button */}
            <div className="mt-8 flex flex-col items-center">
              <button 
                onClick={spinWheel}
                disabled={isSpinning}
                className="relative group"
              >
                <div className="absolute inset-0 bg-yellow-400 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-10 py-4 bg-gradient-to-r from-primary to-accent rounded-full border-4 border-white shadow-xl text-white font-heading font-black text-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                  {isSpinning ? "SPINNING..." : "SPIN NOW"}
                </div>
              </button>
              <p className="text-muted-foreground font-bold text-xs mt-3 bg-card/80 px-4 py-1 rounded-full border border-border/50">
                Cost: <span className="text-amber-500">{costPerSpin} Coins</span>
              </p>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
