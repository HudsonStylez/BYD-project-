import React, { useState } from "react";
import { CheckCircle2, Award, Calendar, RefreshCw, Flame, Coins } from "lucide-react";

interface DailyCheckinProps {
  authToken: string;
  points: number;
  onCheckinSuccess: (newPoints: number) => void;
}

export const DailyCheckin: React.FC<DailyCheckinProps> = ({
  authToken,
  points,
  onCheckinSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [earnedData, setEarnedData] = useState<{ points: number; streak: number } | null>(null);

  const handleCheckin = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/daily-checkin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setEarnedData({
          points: resJson.points_earned,
          streak: resJson.streak_count,
        });
        setSuccessMsg(resJson.message);
        onCheckinSuccess(resJson.new_points);
      } else {
        alert(resJson.error || "Claim failed. You might have already checked in today.");
      }
    } catch {
      alert("Error contacting daily check-in server branch.");
    } finally {
      setLoading(false);
    }
  };

  const daysOfStreak = [
    { label: "Day 1", pts: 50 },
    { label: "Day 2", pts: 50 },
    { label: "Day 3", pts: 150, bonus: "Streak" },
    { label: "Day 4", pts: 50 },
    { label: "Day 5", pts: 50 },
    { label: "Day 6", pts: 50 },
    { label: "Day 7", pts: 350, bonus: "Special" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5" id="daily-checkin-widget">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
            STREAK REWARDS
          </span>
          <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-200 mt-0.5">
            Daily Check-In Station
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2.5 py-1 rounded text-[10px]">
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse fill-orange-500" />
          <span>Active Streak Base</span>
        </div>
      </div>

      {successMsg ? (
        <div className="p-5 bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 rounded-xl space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-300 font-mono uppercase">
              REWARD CLAIMED SUCCESSFULLY
            </h4>
            <p className="text-[11px] text-zinc-400 leading-normal font-mono">
              Claimed +{earnedData?.points} pts today.
              <br />
              Streak advanced to: <span className="text-white font-bold">{earnedData?.streak} days</span>!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-normal">
            Claim 50 base points daily. Maintain checkpoints for massive multiplication milestones at Day 3 (+150 pts total) and Day 7 (+350 pts total)!
          </p>

          {/* Calendear checkpoints layout */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {daysOfStreak.map((day, idx) => {
              const hasBonus = !!day.bonus;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center justify-between transition min-h-[75px] ${
                    hasBonus
                      ? "bg-slate-950 border-amber-500/30 text-amber-400"
                      : "bg-slate-950/70 border-slate-850/80 text-slate-400"
                  }`}
                >
                  <span className="text-[8px] font-mono uppercase block text-slate-500 leading-none mb-1">
                    {day.label}
                  </span>
                  <Coins className={`w-4 h-4 ${hasBonus ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
                  <div className="mt-1">
                    <span className="text-[10px] font-bold font-mono text-white block">
                      +{day.pts}
                    </span>
                    {day.bonus && (
                      <span className="text-[7px] tracking-wider uppercase font-mono font-bold block text-amber-500 leading-none mt-0.5">
                        {day.bonus}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCheckin}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/10"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>Claim Today's Reward Pin</span>
          </button>
        </div>
      )}
    </div>
  );
};
