import React, { useState } from "react";
import { Sparkles, RefreshCw, Trophy, AlertTriangle } from "lucide-react";

interface SpinWheelProps {
  authToken: string;
  onSpinSuccess: (newPoints: number) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  authToken,
  onSpinSuccess,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const rewards = [50, 100, 150, 200, 250, 300, 400, 500];

  const handleSpin = async () => {
    if (spinning || loading) return;

    setLoading(true);
    setPrize(null);

    try {
      const res = await fetch("/api/spin-wheel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setSpinning(true);
        // Find which reward sector was won
        const wonPoints = resJson.points_earned;
        const rewardIdx = rewards.indexOf(wonPoints);
        
        // Calculate dynamic matching degree target
        const sectorAngle = 360 / rewards.length;
        // Make it spin 5 full rounds + align exactly to the midpoint of that prize sector
        const targetDegrees = 360 * 5 + (360 - (rewardIdx * sectorAngle + sectorAngle / 2));
        setRotation(targetDegrees);

        // Transition duration is 3.5 seconds
        setTimeout(() => {
          setSpinning(false);
          setPrize(wonPoints);
          onSpinSuccess(resJson.new_points);
        }, 3600);
      } else {
        alert(resJson.error || "You've already spun today! Check in again tomorrow.");
      }
    } catch {
      alert("Error contacting spin wheel logistics.");
    } finally {
      setLoading(false);
    }
  };

  const getSectorColor = (idx: number) => {
    const colors = [
      "#3b82f6", // blue
      "#1e293b", // slate
      "#06b6d4", // cyan
      "#0f172a", // slate dark
      "#14b8a6", // teal
      "#1e293b",
      "#6366f1", // indigo
      "#020617"  // super dark
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-center flex flex-col items-center" id="spin-wheel-module">
      <div className="w-full flex justify-between items-center pb-3 border-b border-slate-800 text-left">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
            GAME OF FORTUNE
          </span>
          <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-200 mt-0.5">
            Hourly Wheel of Points
          </h3>
        </div>
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
      </div>

      <p className="text-xs text-slate-400 max-w-sm self-start text-left leading-normal">
        Test your luck! Spin once daily to receive between +50 and +500 points instantly deposited into your Horizon Club Vault catalog.
      </p>

      {/* Interactive Turning Disc */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        {/* Outer frame border ring */}
        <div className="absolute inset-0 rounded-full border-[6px] border-slate-950 shadow-[0_0_25px_rgba(0,229,255,0.15)] bg-slate-950/40 pointer-events-none z-10"></div>
        
        {/* Indicator marker peg */}
        <div className="absolute -top-1 left-1/2 -ml-2.5 w-5 h-6 z-30 pointer-events-none drop-shadow-md">
          <svg viewBox="0 0 20 24" width="20" height="24">
            <path d="M10 24 L20 4 C20 1.8 15.5 0 10 0 C4.5 0 0 1.8 0 4 Z" fill="#00E5FF" />
          </svg>
        </div>

        {/* Visual Wheel structure */}
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none",
          }}
          className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full" id="svg-spinner-wheel">
            {rewards.map((pts, idx) => {
              const startAngle = (idx * 360) / rewards.length;
              const endAngle = ((idx + 1) * 360) / rewards.length;
              // Path geometry
              const radStart = (Math.PI * (startAngle - 90)) / 180;
              const radEnd = (Math.PI * (endAngle - 90)) / 180;
              const x1 = 100 + 100 * Math.cos(radStart);
              const y1 = 100 + 100 * Math.sin(radStart);
              const x2 = 100 + 100 * Math.cos(radEnd);
              const y2 = 100 + 100 * Math.sin(radEnd);

              // Position text sector
              const textAngle = startAngle + 180 / rewards.length;
              const radText = (Math.PI * (textAngle - 90)) / 180;
              const tx = 100 + 64 * Math.cos(radText);
              const ty = 100 + 64 * Math.sin(radText);

              return (
                <g key={idx}>
                  <path
                    d={`M100 100 L${x1} ${y1} A100 100 0 0 1 ${x2} ${y2} Z`}
                    fill={getSectorColor(idx)}
                    stroke="#111827"
                    strokeWidth="0.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                    fill="#FFFFFF"
                    fontFamily="monospace"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pts}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Central Core Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || loading}
          className="absolute h-14 w-14 rounded-full bg-slate-950 border-4 border-slate-900 text-[10px] font-mono font-black text-cyan-400 hover:text-white flex items-center justify-center cursor-pointer transition shadow-xl z-20 hover:scale-105 active:scale-95 disabled:opacity-40"
          id="btn-spin-action"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <span className="leading-none text-center block tracking-tight font-black uppercase">
              SPIN
            </span>
          )}
        </button>
      </div>

      {/* Congrats Popup Overlay */}
      {prize !== null && (
        <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1.5 flex items-center justify-center gap-3 w-full animate-fade-in" id="spin-result-banner">
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-bounce" />
          <p className="text-xs font-mono text-cyan-300">
            CONGRATS! You won <span className="font-bold text-white uppercase font-sans">+{prize} points</span>! Added to balance.
          </p>
        </div>
      )}
    </div>
  );
};
