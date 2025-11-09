"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
  audioLevel: number;
  isActive: boolean;
}

export default function Waveform({ audioLevel, isActive }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bars = 20;
    const barWidth = 3;
    const gap = 2;
    const maxHeight = 40;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isActive) {
        // Draw flat line when inactive
        ctx.fillStyle = "#334155";
        for (let i = 0; i < bars; i++) {
          const x = i * (barWidth + gap);
          ctx.fillRect(x, canvas.height / 2 - 1, barWidth, 2);
        }
        return;
      }

      // Draw animated bars based on audio level
      const time = Date.now() / 100;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + gap);

        // Create wave effect with audio level influence
        const wave = Math.sin(time + i * 0.5) * 0.3 + 0.7;
        const height = Math.max(2, wave * audioLevel * maxHeight);

        const y = (canvas.height - height) / 2;

        // Gradient color based on level
        const intensity = Math.min(1, audioLevel * 1.5);
        const r = Math.floor(34 + intensity * 188); // 34 -> 222
        const g = Math.floor(193 + intensity * 0); // 193 -> 193
        const b = Math.floor(195 + intensity * 0); // 195 -> 195

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, barWidth, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <div className="flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={120}
        height={50}
        className="rounded"
        aria-label="Audio level visualization"
      />
    </div>
  );
}
