import React, { useState } from "react";
import { Car } from "../../data/cars";
import { CarImage } from "../ui/CarImage";
import { X, Calendar, MapPin, Gauge, Battery, Zap, Sparkles, Check, Flame } from "lucide-react";
import { PriceCounter } from "./PriceCounter";

interface CarDetailModalProps {
  car: Car;
  onClose: () => void;
  onInvestTrigger: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onInvestTrigger
}) => {
  const [activeTab, setActiveTab] = useState<"specs" | "testdrive">("specs");
  
  // Interactive mini forms state inside details modal
  const [fullName, setFullName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [submittedTestDrive, setSubmittedTestDrive] = useState(false);

  const handleBookTestDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !bookingDate) return;
    setSubmittedTestDrive(true);
    setTimeout(() => {
      setSubmittedTestDrive(false);
      setFullName("");
      setBookingDate("");
      setBookingTime("");
      setActiveTab("specs");
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-[#1A1A1A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left column: Visual Showcase */}
        <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[300px] bg-black relative flex flex-col justify-end border-b md:border-b-0 md:border-r border-white/10">
          <CarImage
            model={car.model}
            alt={car.model}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-black/20" />
          
          <div className="relative p-8 space-y-4">
            {car.badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold font-mono tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <Flame className="w-3.5 h-3.5 fill-black" />
                {car.badge}
              </span>
            )}
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 block mb-1">
                {car.category} LINEUP
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                {car.model}
              </h2>
            </div>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed text-pretty">
              {car.description}
            </p>
          </div>
        </div>

        {/* Right column: Specs & Interactive Modules */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          
          {/* Navigation sub-tabs */}
          <div className="flex border-b border-white/5 pb-2">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 px-4 text-xs font-mono uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "specs"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              TECHNICAL MATRIX
            </button>
            <button
              onClick={() => setActiveTab("testdrive")}
              className={`pb-2 px-4 text-xs font-mono uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "testdrive"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              BOOK TEST PILOT
            </button>
          </div>

          {/* Dynamic Content Panel */}
          <div className="flex-1">
            {activeTab === "specs" ? (
              <div className="space-y-6">
                {/* Visual Highlights list */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <Gauge className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">Acceleration</span>
                      <p className="text-sm font-semibold text-white font-mono">{car.specs?.acceleration || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <Battery className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">Range Miles</span>
                      <p className="text-sm font-semibold text-white font-mono">{car.range} mi</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">Top Speed</span>
                      <p className="text-sm font-semibold text-white font-mono">{car.specs?.topSpeed || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">Charging Standard</span>
                      <p className="text-sm font-semibold text-white font-mono">{car.specs?.chargingMinutes || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Additional detailed bullet points */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40 font-mono">Chassis Platform</span>
                    <span className="text-white">BYD e-Platform 3.0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40 font-mono">Battery Cells</span>
                    <span className="text-white">Ultra-Safe Blade Battery</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40 font-mono">Motor Layout</span>
                    <span className="text-white">IPB Intelligent Power system</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/40 font-mono">Model Year</span>
                    <span className="text-white">{car.year} Release</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedTestDrive ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-cyan-950/10 border border-cyan-500/30 rounded-2xl p-6">
                    <div className="p-3 bg-cyan-400 rounded-full text-black">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-lg font-medium text-white tracking-tight">Test Pilot Booked successfully!</h4>
                    <p className="text-xs text-cyan-200 text-balance leading-relaxed">
                      A representative has scheduled an EV delivery trial to your coordinates. Check your email for authentication parameters.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBookTestDrive} className="space-y-4">
                    <h4 className="text-sm font-mono uppercase tracking-widest text-white/50 mb-2">Configure Trial Driving Coordinates</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Your Legal Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Johnathan Doe"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder-white/30 focus:outline-none focus:border-cyan-400 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-400" /> Date
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-cyan-400 font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" /> Prefer Time
                        </label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-cyan-400 font-sans"
                        >
                          <option value="09:00 AM">09:00 AM Central</option>
                          <option value="12:00 PM">12:00 PM Central</option>
                          <option value="03:00 PM">03:00 PM Central</option>
                          <option value="06:00 PM">06:00 PM Central</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F5F5F0] hover:bg-white text-black text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_5px_15px_rgba(255,255,255,0.05)] active:scale-98"
                    >
                      Authenticate and Register Schedule
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Pricing Summary + Purchase options trigger */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/45 font-mono">Membership Offer Space</p>
                <div className="flex items-baseline gap-1.5">
                  <PriceCounter value={car.price} className="text-2xl font-bold text-white tracking-widest font-mono" />
                  <span className="text-white/40 font-mono text-xs">MSRP</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[#00E5FF] font-mono">Special Leasing Allocation</p>
                <span className="text-white font-mono font-medium text-lg">${car.monthlyFinance}</span>
                <span className="text-white/40 text-xs font-mono">/mo</span>
              </div>
            </div>

            <button
              onClick={() => onInvestTrigger(car)}
              className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,229,255,0.25)] active:transform active:scale-[0.98]"
            >
              Secure allocation / Pay Reservation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
