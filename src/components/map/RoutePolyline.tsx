import React from "react";
import { CheckCircle2, Circle, Navigation, ArrowRight } from "lucide-react";

interface WaypointLeg {
  stage: number;
  name: string;
  location: string;
  description: string;
}

interface RoutePolylineProps {
  routeIndex: number;
  destinationCity: string;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  routeIndex,
  destinationCity,
}) => {
  // Define structural legs of the logistics transit
  const checkpoints: WaypointLeg[] = [
    {
      stage: 0,
      name: "Origin Port Inbound",
      location: "Port of Los Angeles, CA",
      description: "Freight offloaded from trans-pacific ocean carrier and entered into smart trailer fleet.",
    },
    {
      stage: 25,
      name: "Stop 1: Charging Grid Congestion",
      location: "San Bernardino Depot, CA",
      description: "Fast-charging buffer check and high-voltage grid queue scheduling.",
    },
    {
      stage: 50,
      name: "Stop 2: Import Customs Inspection",
      location: "Tucson Logistics Gateway",
      description: "Customs declaration validation and serial number auditing clearance.",
    },
    {
      stage: 75,
      name: "Stop 3: Ad-hoc Severe Weather",
      location: "El Paso Route Interchange",
      description: "Severe heat index evaluation and LFP Blade Battery thermals calibration.",
    },
    {
      stage: 100,
      name: "Final Destination Terminal",
      location: `${destinationCity || "City Center Airport Depot"}`,
      description: "Unloading bay clearance, detailed delivery inspection, and smart key activation.",
    },
  ];

  // Calculations for remaining segments
  const totalDistanceKm = 2400; // Total simulated distance
  const currentDistanceKm = Math.round((routeIndex / 100) * totalDistanceKm);
  const remainingDistanceKm = totalDistanceKm - currentDistanceKm;

  // Assuming average speed is 60 km/h and progression updates happen dynamically
  const remainingHours = Math.round(remainingDistanceKm / 60);
  const remainingDays = Math.floor(remainingHours / 24);
  const remainingHrsOfLastDay = remainingHours % 24;

  const etaString =
    remainingDistanceKm === 0
      ? "ARRIVED AT TERMINAL"
      : remainingDays > 0
      ? `${remainingDays}d ${remainingHrsOfLastDay}h remaining`
      : `${remainingHours}h remaining`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5" id="route-milestones-checklist">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
            Milestones Tracker
          </span>
          <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-200 mt-0.5">
            Logistics Pipeline Nodes
          </h3>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-zinc-500 uppercase block">Distance Traveled</span>
          <span className="text-xs font-bold text-cyan-400">
            {currentDistanceKm.toLocaleString()} / {totalDistanceKm} km
          </span>
        </div>
      </div>

      {/* Graphical polyline pipeline */}
      <div className="relative flex flex-col space-y-4">
        {checkpoints.map((leg, idx) => {
          const isPassed = routeIndex >= leg.stage;
          const isCurrent =
            routeIndex >= leg.stage &&
            (idx === checkpoints.length - 1 || routeIndex < checkpoints[idx + 1].stage);

          return (
            <div key={idx} className="flex gap-4 relative items-start group">
              {/* Connector line */}
              {idx < checkpoints.length - 1 && (
                <div
                  className={`absolute left-[11px] top-[24px] bottom-[-20px] w-[2px] transition duration-500 ${
                    routeIndex >= checkpoints[idx + 1].stage ? "bg-cyan-500" : "bg-slate-850"
                  }`}
                />
              )}

              {/* Bullet Node marker */}
              <div className="relative z-10 mt-1">
                {isPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400 bg-slate-950 rounded-full" />
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-slate-750 bg-slate-950 rounded-full" />
                )}
              </div>

              {/* Checkpoint text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                  <h4
                    className={`text-xs font-bold font-mono tracking-tight transition ${
                      isCurrent ? "text-cyan-400 font-bold" : isPassed ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {leg.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono italic">
                    {leg.location}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  {leg.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Distance remaining summary card */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-850/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 transform rotate-45" />
          <span className="text-slate-400">ETA Estimate:</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400">{etaString}</span>
          {remainingDistanceKm > 0 && (
            <>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-slate-300">{remainingDistanceKm} km left</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
