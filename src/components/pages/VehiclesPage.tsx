import React, { useState, useEffect } from "react";
import { Car } from "../../data/cars";
import { AllModelsGrid } from "../sections/AllModelsGrid";
import { ArtOfBYDGallery } from "../sections/ArtOfBYDGallery";
import { TrendingNow } from "../sections/TrendingNow";
import { OwnerReviews } from "../sections/OwnerReviews";
import { BYDNewsFeed } from "../sections/BYDNewsFeed";
import { CarDetailModal } from "../cars/CarDetailModal";
import { CarComparisonSidebar } from "../cars/CarComparisonSidebar";
import { Compass, Scale, LayoutGrid, X } from "lucide-react";

interface VehiclesPageProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
  id?: string;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ onNavigate, id }) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [comparedList, setComparedList] = useState<Car[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronize comparison clicks
  const handleCompareToggle = (car: Car) => {
    setComparedList((prev) => {
      const exists = prev.find((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        // limit to 3 cars
        alert("Maximum of 3 cars can be compared simultaneously inside the matrix.");
        return prev;
      }
      setSidebarOpen(true);
      return [...prev, car];
    });
  };

  const handleRemoveCar = (car: Car) => {
    setComparedList((prev) => prev.filter((c) => c.id !== car.id));
  };

  const handleClearAll = () => {
    setComparedList([]);
    setSidebarOpen(false);
  };

  const handleInvestTrigger = (car: Car) => {
    // Navigate straight to payment flow with car selected
    onNavigate("payment", {
      type: "installment",
      vehicleModel: car.model,
      price: car.price,
      monthlyFinance: car.monthlyFinance
    });
  };

  return (
    <div id={id} className="min-h-screen bg-[#F5F5F0] dark:bg-[#111111] transition-all duration-300">
      
      {/* Decorative Top header visual layout */}
      <div className="relative overflow-hidden bg-[#1A1A1A] py-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.06),transparent_45%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">Interactive Showroom</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-sans text-white font-light tracking-tight">
            BYD <span className="font-semibold text-cyan-300">Horizon Fleet</span> Catalog
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-2xl leading-relaxed">
            Welcome to the future of high-performance electric transportation. Examine extensive galleries, dynamic art forms, and secure purchase or leasing allocations through our secure blockchain payment gateway.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {/* All Models Mega Grid */}
        <AllModelsGrid
          onViewDetails={(car) => setSelectedCar(car)}
          onCompareToggle={handleCompareToggle}
          comparedList={comparedList}
          onInvestTrigger={handleInvestTrigger}
        />

        {/* Trending allotments row */}
        <TrendingNow onViewDetails={(car) => setSelectedCar(car)} />

        {/* Art of BYD detailed designs block */}
        <ArtOfBYDGallery />

        {/* Owner reviews section block */}
        <OwnerReviews />

        {/* Simulated press news milstone dispatches feed */}
        <BYDNewsFeed />
      </div>

      {/* Car Detail Overlay Modal */}
      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onInvestTrigger={handleInvestTrigger}
        />
      )}

      {/* Comparison Drawer Layer */}
      {comparedList.length > 0 && sidebarOpen && (
        <CarComparisonSidebar
          comparedCars={comparedList}
          onAddCar={handleCompareToggle}
          onRemoveCar={handleRemoveCar}
          onClearAll={handleClearAll}
          onClose={() => setSidebarOpen(false)}
          onInvestTrigger={handleInvestTrigger}
        />
      )}

      {/* Floating compare activation pill */}
      {comparedList.length > 0 && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#00E5FF] hover:bg-cyan-400 text-black px-5 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-widest shadow-[0_5px_20px_rgba(0,229,255,0.4)] transition-all active:scale-95"
        >
          <Scale className="w-4 h-4 animate-bounce" />
          <span>Compare Matrix ({comparedList.length})</span>
        </button>
      )}

    </div>
  );
};
