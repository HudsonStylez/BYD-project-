import React, { useState } from "react";
import { Sparkles, Eye, Compass, ShieldCheck } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  techStat: string;
}

export const ArtOfBYDGallery: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: "Dragon Face Aesthetics (BYD Seal)",
      category: "DESIGN VISION",
      description: "Combining historic cultural inspiration with cutting-edge active aerodynamics, creating an instantly recognizable dynamic expression.",
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      techStat: "Wolfgang Egger Vision"
    },
    {
      id: 2,
      title: "Sustainable Oceanic Core (BYD Dolphin)",
      category: "ECOLOGICAL ETHICS",
      description: "Crafting interior upholstery from recycled oceanic plastics and vegan biosynthetics, translating responsibility into pristine luxury comfort.",
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      techStat: "100% Recyclable Fibers"
    },
    {
      id: 3,
      title: "Cell-To-Body (CTB) Fusion (BYD Atto 3)",
      category: "STRUCTURAL ENGINEERING",
      description: "The battery pack serves as the structural underbody of the vehicle. Delivering a massive 50% increase in cabin space and torsional rigidity.",
      imageUrl: "https://images.unsplash.com/photo-1504215680048-db15dd05978b?auto=format&fit=crop&w=800&q=80",
      techStat: "+50% Torsional Rigidity"
    },
    {
      id: 4,
      title: "Luxury Lounge Architecture (BYD Han)",
      category: "INTERIOR COMFORT",
      description: "Integrating high-definition tactile leather touchpoints with Nappa seats, complete with dynamic surrounding acoustic lighting profiles.",
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
      techStat: "Premium Surround Audio"
    },
    {
      id: 5,
      title: "Digital Cockpit Interface (BYD Seal)",
      category: "SMART LINK CONNECT",
      description: "A futuristic wrap-around driving setup featuring rotating center touchscreens, intelligent voice assists, and dynamic driver nodes.",
      imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
      techStat: "DiLink 4.0 Connectivity"
    }
  ];

  return (
    <section className="space-y-10">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span className="w-6 h-[1.5px] bg-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-[#00E5FF] uppercase">Craftsmanship Philosophy</span>
          <span className="w-6 h-[1.5px] bg-cyan-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-sans font-light text-white tracking-tight">
          The <span className="font-semibold text-cyan-300">Art of BYD</span> Horizon Gallery
        </h2>
        <p className="text-white/50 text-xs md:text-sm">
          Where architectural symmetry meets state-of-the-art electric mobility parameters. Inspect our core layout designs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="group relative h-96 rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl transition-all duration-500 hover:border-cyan-500/20"
          >
            {/* Base Image */}
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-45 transform scale-100 group-hover:scale-110 transition-all duration-700"
            />
            
            {/* Visual Tint overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Float badge */}
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-[9px] font-mono tracking-wider uppercase rounded-full backdrop-blur-md">
              {item.category}
            </span>

            {/* Dynamic Card Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 space-y-4 z-10">
              <h3 className="text-xl font-medium text-white tracking-tight flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-white/60 text-xs leading-relaxed">
                {item.description}
              </p>

              {/* Technical stat expansion */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-white/40">ENGINEERING STAT</span>
                <span className="text-cyan-300 font-semibold uppercase">{item.techStat}</span>
              </div>
            </div>

            {/* Glowing Accent Ring on Hover */}
            <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/25 rounded-3xl transition-all duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
};
