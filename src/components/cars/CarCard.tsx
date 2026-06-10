import React, { useRef, useState } from "react";
import { Car } from "../../data/cars";
import { WishlistButton } from "./WishlistButton";
import { PriceCounter } from "./PriceCounter";
import { CarImage } from "../ui/CarImage";
import { Gauge, Battery, Zap, Plus, ArrowRight } from "lucide-react";

interface CarCardProps {
  car: Car;
  onViewDetails: (car: Car) => void;
  onCompareToggle: (car: Car) => void;
  isCompared: boolean;
  onInvestTrigger: (car: Car) => void;
  id?: string;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onViewDetails,
  onCompareToggle,
  isCompared,
  onInvestTrigger,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative mouse cursor coordinates inside card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Calculate tilt degrees (max 10-12 degrees for refined feel)
    setRotateX(-normalizedY * 12);
    setRotateY(normalizedX * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id={id}
      className="group relative bg-[#1A1A1A]/85 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 backdrop-blur-md flex flex-col hover:border-cyan-500/30 hover:shadow-[0_20px_50px_rgba(0,229,255,0.08)] cursor-pointer"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
        transition: "transform 0.1s ease-out, border-color 0.4s ease, shadow 0.4s ease"
      }}
      onClick={() => onViewDetails(car)}
    >
      {/* Dynamic Background Halo Accent (Electric Cyan gradient reflecting cursor hover) */}
      <div 
        className="absolute -inset-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(circle 350px at ${rotateY * 15 + 150}px ${-rotateX * 15 + 150}px, rgba(0, 229, 255, 0.12), transparent)`
        }}
      />

      {/* Badge Ribbon */}
      {car.badge && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold font-mono tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          {car.badge}
        </span>
      )}

      {/* Favorite Heart Trigger */}
      <div className="absolute top-4 right-4 z-10">
        <WishlistButton carId={car.id} />
      </div>

      {/* Hero Visual Block */}
      <div className="h-60 overflow-hidden relative bg-[#111] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent z-10 pointer-events-none" />
        <CarImage
          model={car.model}
          alt={car.model}
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Model classification watermark */}
        <span className="absolute bottom-3 left-4 text-xs font-mono tracking-widest uppercase text-white/30">
          {car.category}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              {car.model}
            </h3>
            <span className="text-white/40 font-mono text-xs">{car.year}</span>
          </div>

          <p className="text-white/60 text-xs leading-relaxed line-clamp-2 min-h-8">
            {car.description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 font-mono">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-whitesmoke/5 border border-white/5">
              <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
                <Gauge className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">0-60</span>
              </div>
              <span className="text-xs text-white font-medium">{car.specs?.acceleration || "N/A"}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-whitesmoke/5 border border-white/5">
              <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
                <Battery className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Range</span>
              </div>
              <span className="text-xs text-white font-medium">{car.range} mi</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-whitesmoke/5 border border-white/5">
              <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Size</span>
              </div>
              <span className="text-xs text-white font-medium truncate max-w-[50px]">{car.specs?.batteryKwh.split(" ")[0] || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Pricing tag + Action layouts */}
        <div className="mt-5 pt-2 flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Base Price</p>
              <PriceCounter value={car.price} className="text-lg font-bold text-white tracking-widest" />
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Finance From</p>
              <span className="text-[#00E5FF] font-mono text-sm font-semibold">${car.monthlyFinance}</span>
              <span className="text-white/40 text-[9px] font-mono">/mo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {/* Compare trigger button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCompareToggle(car);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-mono transition-all duration-300 ${
                isCompared
                  ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isCompared ? "rotate-45" : "rotate-0"} transition-transform duration-300`} />
              {isCompared ? "Compared" : "Compare"}
            </button>

            {/* Invest or Order button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInvestTrigger(car);
              }}
              className="flex items-center justify-center gap-1 px-3 py-2.5 bg-[#F5F5F0] hover:bg-white text-black font-semibold text-xs rounded-xl tracking-wider uppercase transition-all shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-95"
            >
              Secure
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
