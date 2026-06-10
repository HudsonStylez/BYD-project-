import React, { useState, useEffect } from "react";
import { Play, Pause, Video, Eye, ShieldAlert, Monitor, Terminal } from "lucide-react";

export interface WebcamSource {
  id: number;
  name: string;
  video_url: string;
  thumbnail_url?: string;
  is_active: number;
}

interface LiveWebcamGridProps {
  authToken: string;
}

const defaultWebcams: WebcamSource[] = [
  { id: 1, name: "BYD Factory – Shenzhen Assembly Hub", video_url: "https://assets.mixkit.co/videos/preview/mixkit-automated-assembly-line-in-a-factory-42296-large.mp4", is_active: 1 },
  { id: 2, name: "San Jose – Route 101 Carrier Lane", video_url: "https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-42295-large.mp4", is_active: 1 },
  { id: 3, name: "LA Charging station – Mega Charger", video_url: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43187-large.mp4", is_active: 1 },
  { id: 4, name: "Shanghai Port – Container Loading", video_url: "https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-42295-large.mp4", is_active: 1 },
  { id: 5, name: "BYD Design Lab – R&D Center", video_url: "https://assets.mixkit.co/videos/preview/mixkit-tech-futuristic-car-driving-through-a-highway-43288-large.mp4", is_active: 1 },
  { id: 6, name: "Blade Battery Lab – Testing Bay 4", video_url: "https://assets.mixkit.co/videos/preview/mixkit-wind-turbine-turning-in-the-wind-42301-large.mp4", is_active: 1 },
  { id: 7, name: "Yangwang U8 Offroad Trial Sandbox", video_url: "https://assets.mixkit.co/videos/preview/mixkit-tech-futuristic-car-driving-through-a-highway-43288-large.mp4", is_active: 1 },
  { id: 8, name: "Paint Shop – Intelligent Robotic Spray", video_url: "https://assets.mixkit.co/videos/preview/mixkit-automated-assembly-line-in-a-factory-42296-large.mp4", is_active: 1 },
  { id: 9, name: "Denza Assembly Station – Final Quality Control", video_url: "https://assets.mixkit.co/videos/preview/mixkit-automated-assembly-line-in-a-factory-42296-large.mp4", is_active: 1 },
  { id: 10, name: "Inbound Port Clearance Carrier Depot", video_url: "https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-42295-large.mp4", is_active: 1 },
  { id: 11, name: "Aero Testing Center – Wind Tunnel", video_url: "https://assets.mixkit.co/videos/preview/mixkit-wind-turbine-turning-in-the-wind-42301-large.mp4", is_active: 1 },
  { id: 12, name: "LFP Chemistry Synthesis - Tank Bay", video_url: "https://assets.mixkit.co/videos/preview/mixkit-automated-assembly-line-in-a-factory-42296-large.mp4", is_active: 1 },
  { id: 13, name: "Seattle Transit Hub - Delivery Row b", video_url: "https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-42295-large.mp4", is_active: 1 },
  { id: 14, name: "BYD Silicon Valley Lab - Drive Core QC", video_url: "https://assets.mixkit.co/videos/preview/mixkit-tech-futuristic-car-driving-through-a-highway-43288-large.mp4", is_active: 1 },
  { id: 15, name: "Dallas Freight Hub - Transit Line C", video_url: "https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-42295-large.mp4", is_active: 1 }
];

export const LiveWebcamGrid: React.FC<LiveWebcamGridProps> = ({ authToken }) => {
  const [sources, setSources] = useState<WebcamSource[]>(defaultWebcams);
  const [selectedCam, setSelectedCam] = useState<WebcamSource | null>(defaultWebcams[0]);
  const [playing, setPlaying] = useState(true);
  const [timestamp, setTimestamp] = useState("");
  const [videoError, setVideoError] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<"All" | "Manufacturing" | "Logistics" | "Research">("All");

  const getCamCategory = (camName: string): "Manufacturing" | "Logistics" | "Research" => {
    const name = camName.toLowerCase();
    if (name.includes("factory") || name.includes("assembly") || name.includes("paint") || name.includes("shop") || name.includes("assembly station")) {
      return "Manufacturing";
    }
    if (name.includes("transit") || name.includes("port") || name.includes("freight") || name.includes("route") || name.includes("carrier") || name.includes("depot")) {
      return "Logistics";
    }
    return "Research";
  };

  const categoriesConfig = [
    { id: "All", label: "🌐 ALL FEEDS", count: sources.length },
    { id: "Manufacturing", label: "🏭 MFG & ASSEMBLY", count: sources.filter(c => getCamCategory(c.name) === "Manufacturing").length },
    { id: "Logistics", label: "🚛 LOGISTICS & PORTS", count: sources.filter(c => getCamCategory(c.name) === "Logistics").length },
    { id: "Research", label: "🧪 R&D & TESTING", count: sources.filter(c => getCamCategory(c.name) === "Research").length }
  ] as const;

  const filteredSources = sources.filter((cam) => {
    if (activeCategory === "All") return true;
    return getCamCategory(cam.name) === activeCategory;
  });

  useEffect(() => {
    // Dynamic Timestamp update
    const timer = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toLocaleString("en-US", { hour12: false }));
    }, 1000);

    // Fetch dynamic cams from database if available
    fetch("/api/webcams")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setSources(data);
          setSelectedCam(data[0]);
        }
      })
      .catch(() => {
        // fallback to default compiled array
      });

    return () => clearInterval(timer);
  }, []);

  const selectCamera = (cam: WebcamSource) => {
    setSelectedCam(cam);
    setVideoError(null);
  };

  const handleCategoryChange = (cat: "All" | "Manufacturing" | "Logistics" | "Research") => {
    setActiveCategory(cat);
    const firstOfCat = sources.find((c) => {
      if (cat === "All") return true;
      return getCamCategory(c.name) === cat;
    });
    if (firstOfCat) {
      setSelectedCam(firstOfCat);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6" id="webcam-grid-module">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-3 gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF] font-bold block">
            FACILITIES TELEPRESENCE COCKPIT
          </span>
          <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-200 mt-0.5">
            15+ Live Telemetry Video Feeds
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] bg-slate-950 px-2.5 py-1 rounded border border-slate-850 self-start text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Active CCTV Feeds: {sources.filter((c) => c.is_active === 1).length}</span>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-850/80">
        {categoriesConfig.map((catObj) => (
          <button
            key={catObj.id}
            onClick={() => handleCategoryChange(catObj.id)}
            className={`px-3 py-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeCategory === catObj.id
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <span>{catObj.label}</span>
            <span className={`px-1.5 py-0.5 text-[8px] rounded font-mono ${activeCategory === catObj.id ? "bg-cyan-400 text-black font-extrabold" : "bg-slate-900 text-slate-500"}`}>
              {catObj.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main large monitor layout */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-950 group shadow-2xl">
            {/* Blinking watermark */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-black/60 px-2 py-0.5 rounded border border-white/5 pointer-events-none">
              <span className={`h-2 w-2 rounded-full bg-red-500 ${playing && "animate-pulse"}`}></span>
              <span className="text-[9px] text-white font-mono uppercase tracking-wider">REC</span>
            </div>

            <div className="absolute top-4 right-4 z-20 bg-black/60 px-2.5 py-0.5 rounded border border-white/5 text-[9px] text-slate-300 font-mono pointer-events-none">
              {timestamp || "LOADING FEED CLOCK..."}
            </div>

            {/* Static Scanline Overlays */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-40"></div>

            {selectedCam && playing && !videoError ? (
              <video
                src={selectedCam.video_url}
                autoPlay
                muted
                loop
                onError={() => setVideoError(selectedCam.id)}
                className="w-full h-full object-cover opacity-70"
              />
            ) : (
              /* CCTV aesthetic fallback representation when video failed or paused */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 relative">
                {/* Visual noise particle matrix style */}
                <div className="absolute inset-0 opacity-[0.03] bg-local bg-radial-grid"></div>
                <Monitor className="w-12 h-12 text-cyan-400/40 animate-pulse mb-3" />
                <div className="space-y-1 z-10">
                  <h4 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                    CCTV:{selectedCam?.name.split("–")[0].toUpperCase() || "MONITOR-OFFLINE"}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">
                    Signal standard route loop validation pending.
                  </p>
                </div>
              </div>
            )}

            {/* Controls panel overlay bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-300 font-mono font-bold truncate max-w-[170px] sm:max-w-xs flex items-center space-x-2">
                <span className="text-cyan-400">[{selectedCam ? `CAM-${selectedCam.id}` : "CAM-NONE"}]</span>
                <span className="text-slate-400">|</span>
                <span className="text-white text-[11px] font-semibold">{selectedCam?.name || "No Camera Selected"}</span>
                <span className="text-slate-450 text-[9px] uppercase tracking-widest bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                  {selectedCam ? getCamCategory(selectedCam.name) : ""}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Small thumbnail directory picker list */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-3 flex flex-col h-[320px] lg:h-auto max-h-[380px]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold px-2 mb-2 block">
            Camera Node Index ({filteredSources.length})
          </span>
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 custom-scrollbar">
            {filteredSources.map((cam) => {
              const works = cam.is_active === 1;
              const isSelected = selectedCam?.id === cam.id;
              const camCat = getCamCategory(cam.name);

              return (
                <button
                  key={cam.id}
                  onClick={() => works && selectCamera(cam)}
                  className={`w-full p-2 rounded-xl border text-left text-xs transition duration-150 flex items-center space-x-2.5 ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-400 font-bold"
                      : works
                      ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200"
                      : "bg-slate-950 border-transparent opacity-40 text-slate-600 cursor-not-allowed"
                  }`}
                  disabled={!works}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full flex-shrink-0 relative flex items-center justify-center ${
                      works ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    {works && isSelected && (
                      <span className="absolute h-4 w-4 rounded-full bg-cyan-400 opacity-40 animate-ping"></span>
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <span className="block text-[11px] truncate">{cam.name}</span>
                    <span className="block text-[8px] font-mono tracking-widest text-[#00E5FF] uppercase font-bold mt-0.5">
                      NODE {cam.id.toString().padStart(2, "0")} • {camCat}
                    </span>
                  </div>
                  <Eye className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              );
            })}
            {filteredSources.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-[10px] py-8">
                No active feeds in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
