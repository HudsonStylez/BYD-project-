import React, { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Cpu, RefreshCw, Layers } from "lucide-react";

interface LogMessage {
  time: string;
  module: "BATTERY" | "GPS" | "DRIVE" | "SAFETY" | "GRID";
  message: string;
  type: "info" | "warning" | "success";
}

export const EnvironmentFeed: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sampleLogs: LogMessage[] = [
    { time: "11:32:05", module: "BATTERY", message: "Thermic regulation: LFP cell block core operating at 29.4°C. Perfect cooling ratio.", type: "success" },
    { time: "11:32:15", module: "DRIVE", message: "Inverter pulse: 450V active voltage output. Consuming 15.6 kWh/100km.", type: "info" },
    { time: "11:32:32", module: "GPS", message: "Coordinate delta resolved: Transit carriage matching lane waypoint 34.", type: "info" },
    { time: "11:32:48", module: "SAFETY", message: "Front-facing radar scan active. Distance-gap ratio matched on highway carrier.", type: "info" },
    { time: "11:33:04", module: "GRID", message: "Type 2 bypass: Supercharger feedback diagnostic: 0% power fluctuations.", type: "success" },
    { time: "11:33:14", module: "BATTERY", message: "Blade assembly thermal variance checking: 0.05V deviation standard deviation.", type: "success" },
    { time: "11:33:28", module: "GRID", message: "Customs declaration hold detected on carrier telemetry headers. Retrying token.", type: "warning" },
  ];

  useEffect(() => {
    // Populate initial logs
    setLogs(sampleLogs);

    const logGenerator = setInterval(() => {
      const now = new Date();
      const time = now.toTimeString().split(" ")[0];
      const randomBase = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
      
      const newLog: LogMessage = {
        time,
        module: randomBase.module,
        message: randomBase.message,
        type: randomBase.type,
      };

      setLogs((prev) => [...prev.slice(-12), newLog]); // Keep last 12 log lines
    }, 4500);

    return () => clearInterval(logGenerator);
  }, []);

  // Soft auto scroll to bottom for terminal atmosphere
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col h-[280px]" id="cyber-environment-terminal-logs">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3.5">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Environment Telemetry Terminal
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[9px] text-emerald-400 font-mono font-semibold uppercase">SYS_OK</span>
        </div>
      </div>

      {/* Logger feed text container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar"
      >
        {logs.map((log, idx) => {
          const typeColor =
            log.type === "warning"
              ? "text-amber-400"
              : log.type === "success"
              ? "text-emerald-400"
              : "text-cyan-400";

          const moduleBadge =
            log.module === "BATTERY"
              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
              : log.module === "GRID"
              ? "bg-purple-950/40 text-purple-400 border border-purple-900/40"
              : "bg-blue-950/40 text-blue-400 border border-blue-900/40";

          return (
            <div key={idx} className="flex items-start gap-2.5 pb-1 select-none animate-reveal-text">
              <span className="text-slate-600 font-medium shrink-0">[{log.time}]</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${moduleBadge} uppercase shrink-0`}>
                {log.module}
              </span>
              <span className={`leading-normal ${typeColor}`}>
                {log.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
