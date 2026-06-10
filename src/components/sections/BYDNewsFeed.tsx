import React from "react";
import { ListCollapse, Calendar, Milestone, Radio, Flame } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  badge: string;
}

export const BYDNewsFeed: React.FC = () => {
  const newsList: NewsItem[] = [
    {
      id: 1,
      title: "Wolfgang Egger discloses 'Active Aerofold' concept layout metrics",
      category: "DESIGN PROGRESS",
      date: "May 25, 2026",
      excerpt: "BYD's Head of Global Design Wolfgang Egger outlines new carbon fiber aerodynamic layouts, achieving an unprecedented drag coefficient of just 0.175 Cd.",
      badge: "HOT RELEASE"
    },
    {
      id: 2,
      title: "Solid-state blade generation enters pilot scale clear testing",
      category: "BATTERY INNOVATION",
      date: "May 04, 2026",
      excerpt: "The latest solid-phase salt-LFP battery variant successfully passes continuous high-temperature testing protocols, yielding double current packaging density benchmarks.",
      badge: "RESEARCH"
    },
    {
      id: 3,
      title: "Horizon Club logs milestone donation to world green reforestation",
      category: "CHARITY NEWS",
      date: "April 18, 2026",
      excerpt: "Thanks to membership ledger growth and crypto coordinate clearing fees, the Horizon Green Earth initiative successfully dispatches $420,000 for emergency carbon credit reforestation.",
      badge: "IMPACT"
    }
  ];

  return (
    <section className="space-y-8 bg-[#111] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Horizon News Intelligence</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-light text-white tracking-tight">
            Latest <span className="font-semibold text-cyan-300">BYD Milestones</span> & Insights
          </h2>
        </div>

        <div className="text-xs font-mono text-white/40">
          Showing 3 active dispatches
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {newsList.map((item) => (
          <div
            key={item.id}
            className="bg-[#1A1A1A]/80 border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase border border-cyan-500/15 bg-cyan-500/5 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                  {item.badge}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white tracking-tight leading-snug line-clamp-2">
                {item.title}
              </h3>

              <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                {item.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
