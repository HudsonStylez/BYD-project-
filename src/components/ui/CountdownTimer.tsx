import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetHours?: number; // Count down from X hours
  label?: string;
  onExpiry?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetHours = 24,
  label = "Next Logistics Checkpoint",
  onExpiry,
}) => {
  const [timeLeft, setTimeLeft] = useState(targetHours * 3600);

  useEffect(() => {
    // Generate a fixed future timestamp or countdown locally
    const savedEndTime = localStorage.getItem(`countdown_end_${label}`);
    let endTime: number;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime, 10);
    } else {
      endTime = Date.now() + targetHours * 3600 * 1000;
      localStorage.setItem(`countdown_end_${label}`, endTime.toString());
    }

    const updateTimer = () => {
      const current = Date.now();
      const diff = Math.max(0, Math.floor((endTime - current) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(timer);
        if (onExpiry) onExpiry();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetHours, label]);

  const formatTime = () => {
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;

    return {
      hours: hrs.toString().padStart(2, "0"),
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatTime();

  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between" id="countdown-timer-widget">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Clock className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block">
            {label}
          </span>
          <span className="text-[11px] text-slate-400 font-sans tracking-tight mt-0.5 block">
            Automatic coordinate refresh
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 font-mono">
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm sm:text-base font-bold text-white tabular-nums tracking-widest">
            {hours}
          </div>
          <span className="text-[7px] text-slate-500 uppercase tracking-wider mt-1 font-semibold">HR</span>
        </div>
        <span className="text-slate-500 font-bold mb-4 animate-ping">:</span>
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm sm:text-base font-bold text-neutral-200 tabular-nums tracking-widest">
            {minutes}
          </div>
          <span className="text-[7px] text-slate-500 uppercase tracking-wider mt-1 font-semibold">MIN</span>
        </div>
        <span className="text-slate-500 font-bold mb-4 animate-ping">:</span>
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm sm:text-base font-bold text-cyan-400 tabular-nums tracking-widest">
            {seconds}
          </div>
          <span className="text-[7px] text-slate-500 uppercase tracking-wider mt-1 font-semibold">SEC</span>
        </div>
      </div>
    </div>
  );
};
