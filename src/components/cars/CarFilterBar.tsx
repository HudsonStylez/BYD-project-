import React from "react";
import { Search, SlidersHorizontal, Eye, Star, Flame } from "lucide-react";

interface CarFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedBadge: string;
  setSelectedBadge: (val: string) => void;
}

export const CarFilterBar: React.FC<CarFilterBarProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedBadge,
  setSelectedBadge
}) => {
  const categories = ["All", "Sedan", "SUV", "Hatchback", "MPV", "Coupe", "Concept"];
  const badges = [
    { value: "All", label: "All Statuses", icon: null },
    { value: "Popular", label: "Popular", icon: Flame },
    { value: "New", label: "New Release", icon: Star },
    { value: "Coming Soon", label: "Concept & Presell", icon: Eye }
  ];

  return (
    <div className="w-full bg-[#1A1A1A]/95 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
      {/* Top row: search + category filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search BYD models... (e.g. Seal, Dolphin, U9)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
          />
        </div>

        {/* Categories sliding selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "bg-[#111111] border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              {cat === "All" ? "All Form Factors" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-white/5 w-full" />

      {/* Bottom row: badges status filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
          <span className="text-white/60 text-xs tracking-wider uppercase font-mono">Catalog Sorting Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.value}
                onClick={() => setSelectedBadge(b.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-300 ${
                  selectedBadge === b.value
                    ? "bg-white text-[#1A1A1A] font-semibold border border-white shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
                    : "bg-[#111111] border border-white/5 text-white/50 hover:text-white hover:border-white/10"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
