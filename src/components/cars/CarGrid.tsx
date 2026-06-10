import React, { useState, useEffect, useRef } from "react";
import { Car } from "../../data/cars";
import { CarCard } from "./CarCard";
import { Loader2 } from "lucide-react";

interface CarGridProps {
  search: string;
  selectedCategory: string;
  selectedBadge: string;
  onViewDetails: (car: Car) => void;
  onCompareToggle: (car: Car) => void;
  comparedList: Car[];
  onInvestTrigger: (car: Car) => void;
}

export const CarGrid: React.FC<CarGridProps> = ({
  search,
  selectedCategory,
  selectedBadge,
  onViewDetails,
  onCompareToggle,
  comparedList,
  onInvestTrigger
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 8; // Load 8 cars at a time for smooth infinite scrolling

  const observerRef = useRef<HTMLDivElement>(null);

  // Sync / Reset when filters or search terms change
  useEffect(() => {
    setOffset(0);
    setCars([]);
    setHasMore(true);
    fetchCars(0, true);
  }, [search, selectedCategory, selectedBadge]);

  // Fetch from Express SQLite API
  const fetchCars = async (currentOffset: number, isReset = false) => {
    setLoading(true);
    try {
      const url = new URL("/api/cars", window.location.origin);
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("offset", currentOffset.toString());
      
      if (selectedCategory !== "All") {
        url.searchParams.append("category", selectedCategory);
      }
      if (search) {
        url.searchParams.append("search", search);
      }
      if (selectedBadge !== "All") {
        url.searchParams.append("badge", selectedBadge);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        
        if (isReset) {
          setCars(data);
        } else {
          setCars((prev) => {
            // Filter duplicates out to prevent issues
            const existingIds = new Set(prev.map(c => c.id));
            const freshCars = data.filter((c: Car) => !existingIds.has(c.id));
            return [...prev, ...freshCars];
          });
        }

        if (data.length < limit) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load cars from backend server:", err);
    } finally {
      setLoading(false);
    }
  };

  // IntersectionObserver for Infinite Scroll triggering
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextOffset = offset + limit;
          setOffset(nextOffset);
          fetchCars(nextOffset);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading, offset]);

  return (
    <div className="space-y-10">
      {cars.length === 0 && !loading ? (
        <div className="text-center py-20 bg-[#1A1A1A]/80 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest mb-3">No matching vehicles found</p>
          <p className="text-white/60 text-xs text-balance">
            Try adjusting your model parameters, category selectors or badge selections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onViewDetails={onViewDetails}
              onCompareToggle={onCompareToggle}
              isCompared={comparedList.some((c) => c.id === car.id)}
              onInvestTrigger={onInvestTrigger}
            />
          ))}
          
          {/* Skeleton Loaders */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A]/85 border border-white/5 rounded-3xl h-[470px] animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl h-48 w-full" />
                  <div className="h-6 bg-white/10 rounded-lg w-2/3" />
                  <div className="h-4 bg-white/5 rounded-lg w-1/3" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 bg-white/5 rounded-xl" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-white/5 rounded-lg w-24" />
                  <div className="h-10 bg-white/10 rounded-xl w-24" />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Manual Scroll fallback observer handle */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center items-center py-12">
          {loading ? (
            <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-xs uppercase tracking-wider">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              Ingesting premium inventory logs...
            </div>
          ) : (
            <button
              onClick={() => {
                const nextOffset = offset + limit;
                setOffset(nextOffset);
                fetchCars(nextOffset);
              }}
              className="py-3 px-6 bg-[#1A1A1A]/90 border border-white/10 rounded-xl hover:border-cyan-400/50 hover:bg-black text-white/80 hover:text-white transition-all text-xs font-mono uppercase tracking-widest active:scale-95 duration-300"
            >
              Examine More Fleet
            </button>
          )}
        </div>
      )}
    </div>
  );
};
