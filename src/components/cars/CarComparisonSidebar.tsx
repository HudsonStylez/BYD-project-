import React, { useState, useEffect } from "react";
import { Car, BYD_VEHICLE_FLEET } from "../../data/cars";
import { CarImage } from "../ui/CarImage";
import { 
  X, 
  Sparkles, 
  Scale, 
  AlertCircle, 
  Activity, 
  Settings, 
  CheckCircle2, 
  Percent, 
  ShieldCheck, 
  ArrowRight, 
  RotateCw,
  Sliders,
  HelpCircle
} from "lucide-react";

interface CarComparisonSidebarProps {
  comparedCars: Car[];
  onAddCar: (car: Car) => void;
  onRemoveCar: (car: Car) => void;
  onClearAll: () => void;
  onClose: () => void;
  onInvestTrigger: (car: Car) => void;
}

export const CarComparisonSidebar: React.FC<CarComparisonSidebarProps> = ({
  comparedCars,
  onAddCar,
  onRemoveCar,
  onClearAll,
  onClose,
  onInvestTrigger
}) => {
  // Active Inspection states
  const [activeInspectCar, setActiveInspectCar] = useState<Car | null>(comparedCars[0] || null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionStep, setInspectionStep] = useState(0);
  const [inspectionFocus, setInspectionFocus] = useState<"standard" | "performance" | "high-load">("performance");
  const [inspectionDone, setInspectionDone] = useState(false);

  // Sync active inspection candidate when compared lineup changes
  useEffect(() => {
    if (comparedCars.length > 0) {
      if (!activeInspectCar || !comparedCars.some(c => c.id === activeInspectCar.id)) {
        setActiveInspectCar(comparedCars[0]);
        setInspectionStep(0);
        setIsInspecting(false);
        setInspectionDone(false);
      }
    } else {
      setActiveInspectCar(null);
    }
  }, [comparedCars, activeInspectCar]);

  if (comparedCars.length === 0) return null;

  // Filter out cars that are already selected for comparison
  const availableToAdd = BYD_VEHICLE_FLEET.filter(
    (fc) => !comparedCars.some((cc) => cc.id === fc.id)
  );

  // Simulated Inspection steps
  const stepsList = [
    { name: "Rigid Chassis Envelope Stress Test", desc: "Verifying Cell-to-Body (CTB) integrity & load balancing coefficients under Simulated Drift torque." },
    { name: "Alloy Thermal dissipation diagnostics", desc: "Checking ventilation windalloy pathways, Brembo caliper response, and tire tread depth profile." },
    { name: "Telemetry Node & Snapdragon Handshake", desc: "Aligning DiLink 5G digital antennas, swiveling accelerometer matrices, and live GPS ping-response ratios." },
    { name: "Neural Vision & Lidar Scan Alignment", desc: "Calibrating DiPilot active radar laser sweep guides, pedestrian emergency buffers, and cruise stability." }
  ];

  // Start actual telemetry inspection run
  const triggerInspectionRun = (car: Car) => {
    setActiveInspectCar(car);
    setIsInspecting(true);
    setInspectionStep(0);
    setInspectionDone(false);
  };

  // Automated progress sweeps through step ticks
  useEffect(() => {
    let timer: any;
    if (isInspecting && activeInspectCar) {
      timer = setInterval(() => {
        setInspectionStep((prev) => {
          if (prev >= stepsList.length - 1) {
            clearInterval(timer);
            setIsInspecting(false);
            setInspectionDone(true);
            return stepsList.length - 1;
          }
          return prev + 1;
        });
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isInspecting, activeInspectCar]);

  // Determine diagnostic telemetry parameters based on focus mode & car metrics
  const getInspectionOutputs = (car: Car) => {
    const isConcept = car.category === "Concept";
    const readiness = isConcept ? 98.7 : 99.8;
    const grade = isConcept ? "S-GRADE prototype (CLEAR)" : "GRADE A+ (PASS)";
    
    let thermalEnvelope = "Stable 34.5°C";
    let chassisFlex = "0.08mm structural flex (Nominal)";
    let dilutionCoeff = "No deviation log";
    
    if (inspectionFocus === "standard") {
      thermalEnvelope = "Eco-optimized 29.1°C";
      chassisFlex = "0.12mm (Eco mode cushion)";
    } else if (inspectionFocus === "high-load") {
      thermalEnvelope = "Heavy-stress load 41.2°C";
      chassisFlex = "0.04mm (Ultra-rigid response)";
      dilutionCoeff = "Escort balance optimized";
    }

    return {
      readiness,
      grade,
      thermalEnvelope,
      chassisFlex,
      dilutionCoeff,
      telemetrySyncCode: `BYD-SEC-${car.id}0${car.year}-STABLE`,
    };
  };

  const currentReports = activeInspectCar ? getInspectionOutputs(activeInspectCar) : null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-3xl bg-[#131518] border-l border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
      
      {/* Sidebar Header */}
      <div className="p-5 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="text-cyan-400 w-5 h-5 animate-spin-slow" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">
            Studio Fleet Specs & Inspector matrix
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-red-400 transition-all font-bold cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content body (Comparison upper, Inspection lower) */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        
        {/* Helper instruction */}
        {comparedCars.length < 2 && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-orange-500/5 border border-orange-400/20 text-orange-200 text-[11px] font-mono leading-relaxed">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
            <span>SELECT AT LEAST 2 MODELS BELOW TO ANALYZE PARAMETRIC DATA DEVIATIONS. ({comparedCars.length}/3 IN MATRIX)</span>
          </div>
        )}

        {/* 3-Column Comparative Grid */}
        <div className="grid grid-cols-3 gap-3.5">
          {comparedCars.map((car) => {
            const isCurrentlySelectedForInspect = activeInspectCar?.id === car.id;
            return (
              <div 
                key={car.id} 
                className={`relative rounded-2xl p-3 flex flex-col justify-between space-y-3.5 border transition-all duration-300 ${
                  isCurrentlySelectedForInspect 
                    ? "bg-slate-950/90 border-cyan-500/45 shadow-[inset_0_1px_15px_rgba(6,182,212,0.15)]" 
                    : "bg-slate-900/40 border-slate-850"
                }`}
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemoveCar(car)}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-red-900/30 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/50 rounded-full transition-all cursor-pointer z-10"
                  title="Remove Model"
                >
                  <X className="w-2.5 h-2.5" />
                </button>

                {/* Car Portrait & Brand info */}
                <div className="space-y-2">
                  <div className="h-16 w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                    <CarImage model={car.model} alt={car.model} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-tight font-mono truncate">
                      {car.model}
                    </h4>
                    <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">{car.category}</p>
                  </div>
                </div>

                {/* Specifications comparing metrics */}
                <div className="space-y-2 pt-2 border-t border-slate-850/60 text-[10px] font-mono">
                  <div className="flex justify-between items-baseline border-b border-slate-850/40 pb-1">
                    <span className="text-slate-500">MSRP:</span>
                    <span className="text-slate-200 font-bold">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-850/40 pb-1">
                    <span className="text-slate-500">LEASE:</span>
                    <span className="text-yellow-400 font-bold">${car.monthlyFinance}/mo</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-850/40 pb-1">
                    <span className="text-slate-500">0-60MPH:</span>
                    <span className="text-slate-200">{car.specs?.acceleration || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-850/40 pb-1">
                    <span className="text-slate-500">EPA RANGE:</span>
                    <span className="text-slate-200">{car.range} mi</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">BATTERY:</span>
                    <span className="text-slate-200 truncate max-w-[55px] text-right" title={car.specs?.batteryKwh}>
                      {car.specs?.batteryKwh ? car.specs.batteryKwh.split(" ")[0] : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Micro Actions block */}
                <div className="space-y-1.5 pt-2 border-t border-slate-850/60">
                  {/* Select for Inspection */}
                  <button
                    type="button"
                    onClick={() => triggerInspectionRun(car)}
                    className={`w-full py-1.5 flex items-center justify-center gap-1 font-mono text-[9px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                      isCurrentlySelectedForInspect
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-sm"
                        : "bg-[#111] hover:bg-slate-800 text-cyan-300 hover:text-white border-cyan-500/20"
                    }`}
                  >
                    <Activity className={`w-3 h-3 ${isInspecting && isCurrentlySelectedForInspect ? "animate-pulse" : ""}`} />
                    <span>{isCurrentlySelectedForInspect && isInspecting ? "Inspecting..." : "Determine Inspect"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onInvestTrigger(car)}
                    className="w-full py-1 bg-white hover:bg-slate-200 text-black font-semibold font-mono text-[9px] uppercase rounded-lg tracking-wide transition-all cursor-pointer"
                  >
                    Secure Space
                  </button>
                </div>
              </div>
            );
          })}

          {/* Placeholders WITH ACTIVE VISUAL SELECTION LIST FOR REMAINING VEHICLES */}
          {comparedCars.length < 3 &&
            Array.from({ length: 3 - comparedCars.length }).map((_, i) => (
              <div
                key={i}
                className="border border-dashed border-slate-800 rounded-2xl flex flex-col items-stretch justify-between p-3 text-center bg-slate-900/10 min-h-[290px] transition-all hover:bg-slate-900/20 space-y-3"
              >
                <div className="flex flex-col items-center justify-center pt-2 shrink-0">
                  <Sparkles className="w-5 h-5 text-slate-600 mb-1 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block">Empty Slot</span>
                  <p className="text-[8px] text-slate-500 font-mono">Matrix Slot #{comparedCars.length + i + 1}</p>
                </div>
                
                {availableToAdd.length > 0 ? (
                  <div className="flex-1 flex flex-col justify-end min-h-0 space-y-1.5 overflow-hidden">
                    <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider text-left font-semibold">
                      Quick Add Options:
                    </p>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[145px] pr-1 text-left custom-scrollbar scrollbar-thin">
                      {availableToAdd.map((fc) => (
                        <button
                          key={fc.id}
                          type="button"
                          onClick={() => onAddCar(fc)}
                          className="w-full p-1.5 bg-slate-950/80 hover:bg-cyan-500/15 border border-slate-900 hover:border-cyan-500/30 rounded-xl text-left transition-all duration-300 flex items-center gap-1.5 cursor-pointer group/item text-xs font-mono"
                        >
                          <div className="w-7 h-5 rounded overflow-hidden shrink-0 bg-black border border-slate-850">
                            <CarImage model={fc.model} alt={fc.model} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-[#E2E8F0] font-bold group-hover/item:text-cyan-300 transition-colors truncate">
                              {fc.model}
                            </div>
                            <div className="text-[7.5px] text-slate-500">
                              ${(fc.price / 1000).toFixed(1)}k
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[8.5px] font-mono text-slate-600 block py-4">All models loaded in comparison.</span>
                )}
              </div>
            ))}
        </div>

        {/* ----------------- DIAGNOSTIC TELEMETRY INSPECTION LABORATORY ----------------- */}
        {activeInspectCar && (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4 text-left relative overflow-hidden" id="diagnostics-lab-deck">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-850 pb-2.5 gap-2">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#00E5FF] font-black uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Jadai Studios Diagnostic Engine
                </span>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Inspecting: {activeInspectCar.model}
                </h4>
              </div>

              {/* Diagnostic focus modifier */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                <span className="text-[8px] font-mono text-slate-500 uppercase px-1">Calib Focus:</span>
                {[
                  { id: "standard", label: "ECO" },
                  { id: "performance", label: "PERF" },
                  { id: "high-load", label: "HEAVY" }
                ].map((focusItem) => (
                  <button
                    key={focusItem.id}
                    onClick={() => setInspectionFocus(focusItem.id as any)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      inspectionFocus === focusItem.id 
                        ? "bg-cyan-500 text-black font-black" 
                        : "text-slate-450 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {focusItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live sweep state */}
            {isInspecting ? (
              <div className="space-y-3.5 py-2 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline font-mono text-[9px]">
                    <span className="text-cyan-400 font-bold uppercase animate-pulse">
                      ● RUNNING ACTIVE SWEEP // STEP {inspectionStep + 1} OF 4
                    </span>
                    <span className="text-slate-400 font-bold font-mono">
                      {Math.round(((inspectionStep + 1) / 4) * 100)}% Complete
                    </span>
                  </div>
                  {/* Digital high-tech progress bars */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((inspectionStep + 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Details of active inspection process */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-white/50 block font-bold uppercase">
                    Analyzing parameter: {stepsList[inspectionStep].name}
                  </span>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    {stepsList[inspectionStep].desc}
                  </p>
                </div>
              </div>
            ) : inspectionDone && currentReports ? (
              // Inspection final clearance matrix reports
              <div className="space-y-3.5 py-1 animate-fade-in">
                
                {/* Visual badge of official checklist status */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="font-mono text-left">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Inspection Clearance Rating</span>
                      <span className="text-xs text-white font-black uppercase tracking-wide">
                        {currentReports.grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Readiness Score</span>
                    <span className="text-amber-400 font-black text-sm">
                      {currentReports.readiness}%
                    </span>
                  </div>
                </div>

                {/* Subsystem specific reports list */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-[#111] p-2.5 rounded-xl border border-slate-850 space-y-0.5">
                    <span className="text-slate-500 block">CHASSIS INTEGRITY:</span>
                    <span className="text-slate-200 font-medium">{currentReports.chassisFlex}</span>
                  </div>
                  <div className="bg-[#111] p-2.5 rounded-xl border border-slate-850 space-y-0.5">
                    <span className="text-slate-500 block">THERMAL ENVELOPE:</span>
                    <span className="text-slate-200 font-medium">{currentReports.thermalEnvelope}</span>
                  </div>
                  <div className="bg-[#111] p-2.5 rounded-xl border border-slate-850 space-y-0.5">
                    <span className="text-slate-500 block">DEVIATION DETECTED:</span>
                    <span className="text-emerald-400 font-bold uppercase">{currentReports.dilutionCoeff}</span>
                  </div>
                  <div className="bg-[#111] p-2.5 rounded-xl border border-slate-850 space-y-0.5">
                    <span className="text-slate-500 block">TELEMETRY KEY:</span>
                    <span className="text-cyan-400 font-bold max-w-full truncate block" title={currentReports.telemetrySyncCode}>
                      {currentReports.telemetrySyncCode}
                    </span>
                  </div>
                </div>

                {/* Micro report action */}
                <div className="flex items-center justify-between gap-4 pt-1.5">
                  <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                    All safety systems have passed the standard Jadai Studios sandbox audit parameters.
                  </p>
                  <button
                    onClick={() => triggerInspectionRun(activeInspectCar)}
                    className="py-1.5 px-3 rounded-lg border border-slate-850 hover:border-cyan-500/40 text-[9px] font-mono text-slate-400 hover:text-white uppercase transition-all duration-300 cursor-pointer flex items-center gap-1 whitespace-nowrap bg-transparent"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                    <span>Recalibrate</span>
                  </button>
                </div>

              </div>
            ) : (
              // Idle layout prompting user to start diagnostics
              <div className="p-6 text-center border border-dashed border-slate-850 rounded-xl bg-slate-900/10 space-y-2 flex flex-col items-center justify-center">
                <Sliders className="w-5 h-5 text-slate-550 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-350 block uppercase font-bold tracking-wide">
                    Diagnostics Idle
                  </span>
                  <p className="text-[9.5px] text-slate-500 max-w-sm leading-relaxed">
                    Choose one of your compared vehicles on the top panel and click <strong>"Determine Inspect"</strong> to execute precise structural component checks.
                  </p>
                </div>
                
                <button
                  onClick={() => triggerInspectionRun(activeInspectCar)}
                  className="py-1.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-bold font-mono rounded-lg uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  ⚡ Start Inspect Sweep (750ms)
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer disclaimer */}
      <div className="p-4 bg-slate-950 border-t border-slate-850 text-center font-mono text-[9px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>BYD e-Platform 3.0 Standardized Sandbox telemetry benchmarks</span>
        <span className="text-cyan-400">Jadai Studios Diagnostics Active: YES</span>
      </div>
    </div>
  );
};
