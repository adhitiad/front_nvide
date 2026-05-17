"use client";

import { useEffect, useRef, useState } from "react";

export function CoinRain({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000); // Durasi hujan koin 5 detik
      return () => clearTimeout(timer);
    }
  }, [active]);

  useEffect(() => {
    if (!show || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const coins: any[] = [];
    const coinCount = 100;

    for (let i = 0; i < coinCount; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 15 + 10,
        speed: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        spin: Math.random() * 10 - 5,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      coins.forEach((coin) => {
        coin.y += coin.speed;
        coin.rotation += coin.spin;

        if (coin.y > canvas.height) {
          coin.y = -20;
          coin.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate((coin.rotation * Math.PI) / 180);
        
        // Draw Gold Coin
        ctx.beginPath();
        ctx.ellipse(0, 0, coin.size, coin.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; // Amber 400
        ctx.fill();
        ctx.strokeStyle = "#d97706"; // Amber 600
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.ellipse(0, 0, coin.size * 0.6, coin.size * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#b45309"; // Amber 700
        ctx.stroke();

        // Symbol $
        ctx.fillStyle = "#b45309";
        ctx.font = `bold ${coin.size * 0.8}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [show]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
