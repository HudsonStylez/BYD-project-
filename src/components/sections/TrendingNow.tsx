import React from "react";
import { Flame, ArrowUpRight, TrendingUp, Users } from "lucide-react";
import { PriceCounter } from "../cars/PriceCounter";
import { CarImage } from "../ui/CarImage";
import { Car } from "../../data/cars";

interface TrendingNowProps {
  onViewDetails: (car: Car) => void;
  id?: string;
}

export const TrendingNow: React.FC<TrendingNowProps> = ({ onViewDetails, id }) => {
  // We can fetch details for trending items derived from CAR_FLEET or construct them
  const trendingList = [
    {
      id: 1,
      model: "BYD Seal",
      price: 45900,
      monthlyFinance: 699,
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80",
      stats: "+44% volume index",
      reserveCount: "1,240 secured today",
      category: "Sedan"
    },
    {
      id: 4,
      model: "BYD Han",
      price: 52500,
      monthlyFinance: 799,
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80",
      stats: "+31% volume index",
      reserveCount: "893 secured today",
      category: "Sedan"
    },
    {
      id: 14,
      model: "BYD Yangwang U8",
      price: 145000,
      monthlyFinance: 1999,
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
      stats: "+112% luxury trend",
      reserveCount: "349 secured today",
      category: "Extreme Off-road SUV"
    }
  ];

  return (
    <section id={id} className="space-y-8 bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#00E5FF] font-mono text-xs uppercase tracking-widest">
            <Flame className="w-4 h-4 fill-[#00E5FF]" />
            <span>HEAVY DEMAND SIGNALS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-light text-white tracking-tight">
            Trending <span className="font-semibold text-cyan-300">BYD Allotments</span> This Week
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-white/50 bg-[#111] px-4 py-2 rounded-xl border border-white/5">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>LIVE TRACKING REFRESHING IN real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trendingList.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails(item as any)}
            className="group bg-[#161616] hover:bg-[#1C1C1C] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Image box */}
              <div className="h-40 w-full rounded-xl overflow-hidden bg-black relative border border-white/5">
                <CarImage model={item.model} alt={item.model} className="w-full h-full object-cover opacity-80" />
                <span className="absolute bottom-2.5 left-3 px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono uppercase tracking-wider text-white/60">
                  {item.category}
                </span>
              </div>

              {/* Title row */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white group-hover:text-cyan-400 transition-all font-sans text-lg">
                  {item.model}
                </h3>
                <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                  {item.stats}
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="flex items-baseline gap-2 pt-1">
                <PriceCounter value={item.price} className="text-xl font-bold font-mono text-white" />
                <span className="text-white/40 text-[10px] font-mono">base price</span>
              </div>
            </div>

            {/* Waitlist counts */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-white/55 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {item.reserveCount}
              </span>
              <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
