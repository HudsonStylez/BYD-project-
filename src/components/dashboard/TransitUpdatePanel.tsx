import React from "react";
import { Navigation, Clock, Activity, AlertTriangle, ShieldCheck, Milestone, Compass } from "lucide-react";
import { CountdownTimer } from "../ui/CountdownTimer";
import { EnvironmentFeed } from "../live/EnvironmentFeed";
import { RoutePolyline } from "../map/RoutePolyline";

interface TransitUpdatePanelProps {
  authToken: string;
  routeIndex: number;
  delaysEncountered: number;
  expeditePaid: number | boolean;
  destinationCity: string;
}

export const TransitUpdatePanel: React.FC<TransitUpdatePanelProps> = ({
  authToken,
  routeIndex,
  delaysEncountered,
  expeditePaid,
  destinationCity,
}) => {
  const totalKm = 2400;
  const coveredKm = Math.round((routeIndex / 100) * totalKm);
  const remainingKm = totalKm - coveredKm;

  return (
    <div className="space-y-6" id="transit-update-dashboard-panel">
      {/* Dynamic top status card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Progress percent card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Route Progress</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white block mt-0.5">
              {routeIndex}% <span className="text-[10px] text-cyan-400 font-normal">Complete</span>
            </span>
          </div>
        </div>

        {/* Distance covered card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Milestone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
              Distance Transited
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-white block mt-0.5">
              {coveredKm.toLocaleString()} / {totalKm} km
            </span>
          </div>
        </div>

        {/* Status indicator card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-lg ${delaysEncountered > 0 && !expeditePaid ? "bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Fleet Security Status</span>
            <span className={`text-xs sm:text-sm font-bold font-mono block mt-0.5 ${delaysEncountered > 0 && !expeditePaid ? "text-amber-400" : "text-emerald-400"}`}>
              {delaysEncountered > 0 && !expeditePaid ? "CUSTOMS AUDIT HOLD" : "OPTIMAL DISPATCH"}
            </span>
          </div>
        </div>
      </div>

      {/* Countdown to next logistical node / checkpoint */}
      <CountdownTimer targetHours={18} label="Cargo Transit Departure Deadline" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mileposts Polyline checkpoints */}
        <RoutePolyline routeIndex={routeIndex} destinationCity={destinationCity} />

        {/* Environmental terminal diagnostic stream */}
        <EnvironmentFeed />
      </div>
    </div>
  );
};
