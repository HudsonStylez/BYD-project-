import React, { useState } from "react";
import { Car } from "../../data/cars";
import { CarFilterBar } from "../cars/CarFilterBar";
import { CarGrid } from "../cars/CarGrid";
import { Sparkles } from "lucide-react";

interface AllModelsGridProps {
  onViewDetails: (car: Car) => void;
  onCompareToggle: (car: Car) => void;
  comparedList: Car[];
  onInvestTrigger: (car: Car) => void;
  id?: string;
}

export const AllModelsGrid: React.FC<AllModelsGridProps> = ({
  onViewDetails,
  onCompareToggle,
  comparedList,
  onInvestTrigger,
  id
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBadge, setSelectedBadge] = useState("All");

  return (
    <section id={id} className="w-full space-y-12">
      {/* Structural Headers with Accent lines */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400 block" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">Interactive Showroom Grid</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-sans text-white tracking-tight font-light">
            All BYD Models <span className="font-semibold text-cyan-300">Bento Megagrid</span>
          </h2>
          <p className="text-white/40 text-xs md:text-sm max-w-xl leading-relaxed">
            Examine over 24+ high-fidelity models, zero-emission flagships, open-cockpit speedster concepts and amphibious off-road platforms.
          </p>
        </div>

        {/* Floating badge for active indicators */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-[#1F1F1F] text-xs font-mono text-white/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Syncing Global Logistics...</span>
        </div>
      </div>

      {/* Embedded Filtering System */}
      <CarFilterBar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBadge={selectedBadge}
        setSelectedBadge={setSelectedBadge}
      />

      {/* Bento Grid layout representing infinite records */}
      <CarGrid
        search={search}
        selectedCategory={selectedCategory}
        selectedBadge={selectedBadge}
        onViewDetails={onViewDetails}
        onCompareToggle={onCompareToggle}
        comparedList={comparedList}
        onInvestTrigger={onInvestTrigger}
      />
    </section>
  );
};
