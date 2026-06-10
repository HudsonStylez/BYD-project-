import React, { useState, useEffect, useRef } from "react";
import { Gauge, ShieldCheck, Zap, RotateCw, ZoomIn, ZoomOut, Compass, Sparkles, AlertCircle, HelpCircle, Layers } from "lucide-react";

interface InspectHotspot {
  name: string;
  specs: string;
  desc: string;
  top: string;
  left: string;
}

interface ComponentSpec {
  name: string;
  description: string;
  imageUrl: string;
  stats: Record<string, string>;
}

interface CarModelSpec {
  name: string;
  tagline: string;
  range: string;
  power: string;
  acceleration: string;
  drag: string;
  basePrice: string;
  exteriors: Record<number, string>; // 0, 90, 180, 270 degrees
  cabin: ComponentSpec;
  wheels: ComponentSpec;
  seats: ComponentSpec;
  console: ComponentSpec;
}

export const CarInspectSection: React.FC<{ model?: string }> = ({ model }) => {
  const [activeModel, setActiveModel] = useState<string>(model || "BYD Seal");
  const [activeTab, setActiveTab] = useState<"exterior" | "cabin" | "wheels" | "seats" | "console">("exterior");
  const [angle, setAngle] = useState<number>(0); // 0, 90, 180, 270
  const [zoom, setZoom] = useState<number>(1.1);
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);
  const [hudActive, setHudActive] = useState<boolean>(true);

  const modelsCatalog: Record<string, CarModelSpec> = {
    "BYD Seal": {
      name: "BYD Seal",
      tagline: "High-Performance Ocean-Inspired Sport Sedan",
      range: "323 miles EPA",
      power: "530 BHP • Dual Motor AWD",
      acceleration: "3.8s (0-60 mph)",
      drag: "0.219 Cd",
      basePrice: "$45,900",
      exteriors: {
        0: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
        90: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
        180: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
        270: "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&w=800&q=80"
      },
      cabin: {
        name: "Oceanic Command Cabin",
        description: "Intricately curved dashboard layout resembling ocean waves, finished with double-stitched eco-Alcantara and adaptive crystal trim.",
        imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
        stats: { Layout: "Driver Centric", Soundproof: "Double Glazed Acoustic Glass", Materials: "Sustainable Recycled Composite" }
      },
      wheels: {
        name: "19-inch Blade Windalloy Wheels",
        description: "Bi-color aerodynamic alloy wheels reducing rotational drag by 8.4% with red Brembo high-performance calipers.",
        imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "19 inch", Tire: "Continental SportContact 7", Calipers: "Ventilated 4-Piston" }
      },
      seats: {
        name: "Ergonomic Sports Bucket Seats",
        description: "One-piece integrated sports seats with structural side support, providing 12-way electronic seat shifting and memory presets.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        stats: { Adjustability: "12-Way Electronic", Comfort: "Ventilation & Seat Warmers", Trim: "Premium Perforated Leather" }
      },
      console: {
        name: "15.6\" Swiveling智能 Dilink Monitor",
        description: "Signature crystal-clear rotating screen with prompt auto-orienting gyroscope technology, powered by Snapdragon EV processing chips.",
        imageUrl: "https://images.unsplash.com/photo-1504215680048-db15dd05978b?auto=format&fit=crop&w=800&q=80",
        stats: { Screen: "15.6-inch UHD IPS", OS: "DiLink EV 5G Platform", Connectivity: "Native Over-the-Air (OTA) Updates" }
      }
    },
    "BYD Atto 3": {
      name: "BYD Atto 3",
      tagline: "Bold and Dynamic Urban Electric SUV Crossover",
      range: "260 miles EPA",
      power: "201 BHP • Front-Wheel Drive",
      acceleration: "7.3s (0-60 mph)",
      drag: "0.29 Cd",
      basePrice: "$38,900",
      exteriors: {
        0: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        90: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        180: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
        270: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
      },
      cabin: {
        name: "Fitness-Inspired Tech Cabin",
        description: "The gym-inspired interior featuring treaded gym patterns, guitar-string door pockets, and dumbell vents.",
        imageUrl: "https://images.unsplash.com/photo-1504215680048-db15dd05978b?auto=format&fit=crop&w=800&q=80",
        stats: { Concept: "Wellness & Playful", Safety: "DiPilot L2 Driver Assistant", Atmosphere: "Multi-color Dynamic Ambient LEDs" }
      },
      wheels: {
        name: "18-inch Windcatcher Alloy Wheels",
        description: "Optimized turbine alloy blades engineered to guide crosswind air streamline safely past the wheel arches.",
        imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "18 inch", Compound: "Eco Grip Low-Noise Tires", Efficiency: "+2.5% Aerodynamic range gain" }
      },
      seats: {
        name: "Duo-Tone Luxury Sport Seats",
        description: "Contrast red-on-grey sports chairs engineered with pressure-relief memory cushions for tireless city traffic commuting.",
        imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
        stats: { Material: "Eco-Luxe Vegan Leather", Support: "Orthopedic lumbar brace", Headrest: "Fully Integrated Headrest pillow" }
      },
      console: {
        name: "12.8\" Intelligent swiveling Media Panel",
        description: "Highly responsive rotating infotainment monitor synced with live telemetry analytics channels.",
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
        stats: { Display: "12.8-inch HD", Integration: "Wireless Apple CarPlay / Android Auto", Updates: "Integrated App Store" }
      }
    },
    "BYD Dolphin": {
      name: "BYD Dolphin",
      tagline: "Agile, Fluid, and Playful Urban Commuter Hatch",
      range: "211 miles EPA",
      power: "94 BHP • Highly Efficient FWD",
      acceleration: "7.0s (0-50 mph)",
      drag: "0.27 Cd",
      basePrice: "$29,900",
      exteriors: {
        0: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
        90: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80",
        180: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        270: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80"
      },
      cabin: {
        name: "Ocean-Flow Compact Cockpit",
        description: "Curved door-release toggles resembles dolphin flippers. Ergonomically optimized dashboard keeps small tools accessible in any city.",
        imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
        stats: { Width: "Comfort space maximized", Cargo: "345L flexible boot storage", Lighting: "Warm Sky Glow panorama LEDs" }
      },
      wheels: {
        name: "16-inch Tri-Spoke Aero Alloys",
        description: "Lightweight and resilient wheels custom molded to sustain tight city turns with maximum comfort.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "16 inch", Weight: "Superlight 7.2kg alloys", Tires: "Silent Ride Premium Compound" }
      },
      seats: {
        name: "Fibre-Cloud Eco Seats",
        description: "Finished with breathable composite textiles that stay completely cool under warm sunlight.",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        stats: { Material: "Sustainable Bio-Textile", Weighting: "Featherlight structures", Cleaning: "Spill-resistant protective coating" }
      },
      console: {
        name: "10.1\" DiLink Control Surface",
        description: "Rotates smoothly on command. High-contrast display ensures reading telemetry is effortless.",
        imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "10.1-inch High Contrast", Speed: "Octa-core media processor", Maps: "Bespoke GPS Live Navigation routing" }
      }
    },
    "BYD Han": {
      name: "BYD Han",
      tagline: "Executive Flagship Business Luxury Sedan",
      range: "375 miles EPA",
      power: "517 BHP • High Torque Dual-Motor AWD",
      acceleration: "3.9s (0-60 mph)",
      drag: "0.233 Cd",
      basePrice: "$52,500",
      exteriors: {
        0: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
        90: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
        180: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
        270: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=800&q=80"
      },
      cabin: {
        name: "Imperial Luxury Lounge",
        description: "Bespoke executive cabin adorned with genuine hand-polished European rosewood, solid aluminum speaker grilles, and hand-stitched leather panels.",
        imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
        stats: { Trim: "Genuine Rosewood", Audio: "Dynaudio 12-Speaker 775W Sound", Ambiance: "128-Color customizable fiber lights" }
      },
      wheels: {
        name: "20-inch Prestige Multi-Spoke Alloys",
        description: "Heavy forged luxury rims layered with soundproofing insulation pockets to block tyre road noise on highway voyages.",
        imageUrl: "https://images.unsplash.com/photo-1601362840469-8143476ab131?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "20 inch Prestige", Tires: "Michelin Pilot Sport EV", Braking: "6-Piston High-Speed Brembo setup" }
      },
      seats: {
        name: "Nappa Leather Executive Thrones",
        description: "Ultra-comfortable ventilated seats with built-in hot stone massage modules and a customizable tilt of up to 45 degrees.",
        imageUrl: "https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?auto=format&fit=crop&w=800&q=80",
        stats: { Material: "Full-Grain Nappa Leather", Massage: "8-Node Custom Back Massage", RearSeat: "Command screen built in armrest" }
      },
      console: {
        name: "15.6\" UHD Smart Infotainment Swivel Screen",
        description: "Rotary crystal screen commanding advanced maps, active multi-zone climate, and autonomous drive diagnostics.",
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        stats: { Display: "15.6 in 4K IPS", Processor: "Premium Snapdragon Cockpit chip", Security: "Biometric Face-ID driver config" }
      }
    },
    "BYD Tang": {
      name: "BYD Tang",
      tagline: "Uncompromised 7-Seater Family Luxury SUV",
      range: "310 miles EPA",
      power: "509 BHP • Electronic Realtime AWD",
      acceleration: "4.4s (0-60 mph)",
      drag: "0.33 Cd",
      basePrice: "$58,000",
      exteriors: {
        0: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
        90: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
        180: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        270: "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&w=800&q=80"
      },
      cabin: {
        name: "Grand Horizon Family Space",
        description: "Spacious three-row luxury seating layout configured with double-stitched eco-luxe microfibres and an integrated ion air filtration purifier.",
        imageUrl: "https://images.unsplash.com/photo-1563720223185-11051691a0a5?auto=format&fit=crop&w=800&q=80",
        stats: { Capacity: "7-Passenger 3-Row", Filtration: "PM2.5 Active Ion Purifier", Panoramic: "Skyline Dual-pane Electric Moonroof" }
      },
      wheels: {
        name: "22-inch Carbon Aerograde Alloys",
        description: "Bold charcoal-finished aluminum alloy rims with high thermal dissipation capabilities designed for mountainous heavy towing load stability.",
        imageUrl: "https://images.unsplash.com/photo-1562141961-b5d241586a50?auto=format&fit=crop&w=800&q=80",
        stats: { Size: "22 inch", Braking: "Ventilated large sports steel rotors", Suspension: "DiSus-C Intelligent active dampening" }
      },
      seats: {
        name: "Modular Quick-Fold Premium Seats",
        description: "Plush seats that automatically collapse into the flat floor layout at the click of a button, expanding tail-cargo capacity.",
        imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
        stats: { Rows: "Foldable 2nd & 3rd rows", Comfort: "Multi-zone climate venting nodes", Volume: "Up to 1650L storage volume" }
      },
      console: {
        name: "Command Center HUD & Rotating Panel",
        description: "Full smart cockpit overlay with a 15.6-inch tablet, paired with a projection Head-Up Display directly on the windshield glass.",
        imageUrl: "https://images.unsplash.com/photo-1600706432502-75a0e2b4eed2?auto=format&fit=crop&w=800&q=80",
        stats: { HUD: "W-HUD 11.5 in Projection", Center: "15.6\" Rotary Media Center", Audio: "Prestige 12-Speaker Sound" }
      }
    }
  };

  const selectedSpec = modelsCatalog[activeModel] || modelsCatalog["BYD Seal"];

  // Handle continuous rotation
  useEffect(() => {
    let orbitTimer: any;
    if (isOrbiting && activeTab === "exterior") {
      orbitTimer = setInterval(() => {
        setAngle((prev) => {
          const next = prev + 90;
          return next >= 360 ? 0 : next;
        });
      }, 2500);
    }
    return () => {
      if (orbitTimer) clearInterval(orbitTimer);
    };
  }, [isOrbiting, activeTab]);

  useEffect(() => {
    if (model && modelsCatalog[model]) {
      setActiveModel(model);
    }
  }, [model]);

  // Determine current active display image
  let activeDisplayUrl = "";
  let activeDisplayName = "";
  let activeDisplayDesc = "";
  let activeDisplayStats: Record<string, string> = {};

  if (activeTab === "exterior") {
    // Round angle to nearest 0, 90, 180, 270
    const resolvedAngle = [0, 90, 180, 270].includes(angle) ? angle : 0;
    activeDisplayUrl = selectedSpec.exteriors[resolvedAngle];
    activeDisplayName = `Exterior Perspective – ${resolvedAngle}° View`;
    activeDisplayDesc = `Precision engineered chassis body demonstrating the fluid design profile, aerodynamic contours, and optimized active grille lines.`;
    activeDisplayStats = {
      Range: selectedSpec.range,
      Acceleration: selectedSpec.acceleration,
      Power: selectedSpec.power,
      DragCoefficient: selectedSpec.drag
    };
  } else {
    const comp: ComponentSpec = selectedSpec[activeTab];
    activeDisplayUrl = comp.imageUrl;
    activeDisplayName = comp.name;
    activeDisplayDesc = comp.description;
    activeDisplayStats = comp.stats;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 relative" id="byd-hall-of-beauty-spec-zone">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-600 rounded-t-3xl" />
      
      {/* Showroom Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
            ✦ HIGH PRECISION 360° DIGITAL SHOWROOM ✦
          </span>
          <h3 className="font-display font-black text-xl text-white tracking-tight uppercase flex items-center gap-2">
            <span>BYD HALL OF BEAUTY • COMPONENT VEHICLE INSPECTOR</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Interact with the actual mechanical setup, wheels, seats, cabins, and swiveling dashboard arrays.
          </p>
        </div>

        {/* Model quick select toggles */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {Object.keys(modelsCatalog).map((mKey) => (
            <button
              key={mKey}
              onClick={() => {
                setActiveModel(mKey);
                setActiveTab("exterior");
                setAngle(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${activeModel === mKey ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"}`}
            >
              {mKey}
            </button>
          ))}
        </div>
      </div>

      {/* Main Showroom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Showroom Controls & Component Toggles */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="space-y-4 text-left">
            
            {/* View Mode Component Selector */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF] font-bold block border-b border-white/5 pb-1">
                Select Active Component
              </span>
              <div className="flex flex-col space-y-1.5">
                {[
                  { id: "exterior", label: "🚘 Vehicle Body (360° Rotate)" },
                  { id: "cabin", label: "🛋️ Inside Lounge Cabin" },
                  { id: "wheels", label: "🛞 Alloy Wheels & Tires" },
                  { id: "seats", label: "💺 Premium Seats Layout" },
                  { id: "console", label: "📟 Rotary Smart Console" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (item.id !== "exterior") {
                        setIsOrbiting(false);
                      }
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold text-left transition duration-200 cursor-pointer border ${activeTab === item.id ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30 shadow-md" : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 360° Rotation Controller Panel (only visible for vehicle body) */}
            {activeTab === "exterior" && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Angle Perspective</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{angle}° View</span>
                </div>
                
                {/* 4 Quadrants manual selective buttons for premium precision */}
                <div className="grid grid-cols-4 gap-1">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => {
                        setAngle(deg);
                        setIsOrbiting(false);
                      }}
                      className={`py-2 px-1 text-[11px] font-mono rounded-lg border transition ${angle === deg ? "bg-white/10 text-cyan-400 border-cyan-500/30" : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"}`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOrbiting(!isOrbiting)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-[10px] font-bold uppercase flex items-center justify-center space-x-1 border transition cursor-pointer ${isOrbiting ? "bg-red-950/20 text-red-400 border-red-500/20 animate-pulse" : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/5"}`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isOrbiting ? "Stop Auto-Orbit" : "Run Auto-Orbit"}</span>
                </button>
              </div>
            )}

            {/* Zoom / Dimension Magnifier */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">Telemetry Zoom</span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setZoom(z => Math.max(0.8, z - 0.15))} 
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-mono text-xs text-white bg-slate-950 p-1.5 rounded-lg border border-slate-900">
                  {Math.round(zoom * 100)}%
                </div>
                <button 
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.15))} 
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Core HUD status box */}
          <div className="bg-black/40 p-3.5 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-500 space-y-1 block text-left">
            <div className="flex justify-between">
              <span>VEHICLE:</span>
              <span className="text-white">{selectedSpec.name.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>EST_BASE_PRICE:</span>
              <span className="text-cyan-400 font-bold">{selectedSpec.basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span>RENDER_STATE:</span>
              <span className="text-emerald-400">HARDWARE_ACCELERATED</span>
            </div>
          </div>
        </div>

        {/* Center: Immersive Interactive Canvas frame */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-850 rounded-3xl p-5 flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden group shadow-2xl">
          
          <div 
            className="absolute inset-0 transition-all duration-700 opacity-20 mix-blend-color-dodge pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(6, 182, 212, 0.4) 0%, transparent 80%)`
            }}
          />

          {/* Tactical Overlay HUD Lines */}
          {hudActive && (
            <div className="absolute inset-0 border border-cyan-500/10 rounded-3xl p-4 flex flex-col justify-between pointer-events-none z-10 font-mono text-[9px] text-slate-500/80">
              <div className="flex justify-between items-baseline">
                <span>HUD_SCANNER_v4.5A // LINK_REGIONAL_OK</span>
                <span className="text-cyan-400/90 animate-pulse font-bold">● TELEMETRY ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>AZIMUTH_INDEX: {angle}° / ROTATION_LOCK_OFF</span>
                <span>BYD PRESTIGE CLASSIFICATION</span>
              </div>
            </div>
          )}

          {/* Active Image and Hotspot Interactive Anchor */}
          <div className="flex-1 w-full flex items-center justify-center relative my-4">
            
            {/* Ambient Platform Base under the car */}
            {activeTab === "exterior" && (
              <div 
                className="absolute w-80 h-80 rounded-full border border-dashed border-cyan-500/30 opacity-40 bottom-1.5 transition-all duration-100 animate-spin-slow"
                style={{
                  transform: `perspective(500px) rotateX(72deg) rotateZ(${angle}deg)`,
                }}
              />
            )}

            <div 
              className="relative transition-all duration-500 ease-out z-10 w-full max-w-[400px] flex justify-center"
              style={{
                transform: `scale(${zoom})`,
              }}
            >
              <img
                src={activeDisplayUrl}
                alt={activeDisplayName}
                className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_20px_35px_rgba(6,182,212,0.25)] transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              
              {/* Dynamic light laser scanner overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-scan leading-none pointer-events-none rounded-2xl" />
            </div>
            
          </div>

          <div className="w-full text-center text-slate-400 font-mono text-[10px] bg-slate-900/60 py-2 px-3 rounded-lg border border-slate-850/60 select-none z-10">
            {activeDisplayName.toUpperCase()} • Precise {modelsCatalog[activeModel].name} specs loaded dynamically.
          </div>
        </div>

        {/* Right Side: Technical Specs & Detailed Analysis Board */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          
          {/* Active Component Deep Analysis Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-bold border-b border-white/5 pb-1.5">
                🔎 Component Analysis
              </span>

              <div className="space-y-4 animate-fade-in mt-2">
                <h5 className="text-xs font-bold text-white uppercase font-sans">
                  {activeDisplayName}
                </h5>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {activeDisplayDesc}
                </p>

                <div className="pt-3 border-t border-slate-850/80 space-y-3">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">⚙️ Component Mechanics:</span>
                  
                  {Object.entries(activeDisplayStats).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-baseline font-sans text-[11px] border-b border-white/5 pb-1.5">
                      <span className="text-slate-500 font-medium">{key}:</span>
                      <span className="text-slate-200 font-mono font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setHudActive(!hudActive)}
              className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-850 text-[10px] rounded-xl font-mono text-slate-400 hover:text-white uppercase transition cursor-pointer border border-slate-800"
            >
              {hudActive ? "Disable HUD overlay" : "Enable HUD overlay"}
            </button>
          </div>

          {/* Model Core Specification Panel */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5 text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b border-white/5 pb-1.5">
              📈 MODEL CORE SPECS
            </span>

            <div className="space-y-2.5 text-[11px] font-sans">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500 leading-relaxed font-medium">Estimated Range:</span>
                <span className="font-mono text-white text-right font-semibold">{selectedSpec.range}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500 leading-relaxed font-medium">Acceleration:</span>
                <span className="font-mono text-white text-right font-semibold">{selectedSpec.acceleration}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500 leading-relaxed font-medium">Full Chassis Power:</span>
                <span className="font-mono text-white text-right font-semibold">{selectedSpec.power}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 leading-relaxed font-medium">Base Price:</span>
                <span className="font-mono text-cyan-400 text-right font-bold">{selectedSpec.basePrice}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
