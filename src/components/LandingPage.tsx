import React, { useState, useEffect } from "react";
import { CarImage } from "./ui/CarImage";
import { 
  ChevronRight, Leaf, Shield, Sparkles, Users, Award, TrendingUp, 
  ChevronLeft, Calendar, Info, X, Mail, Phone, User, Battery, Gauge, Zap, CheckCircle2,
  FileText, Scale, ShieldAlert, BookOpen, Download, Smartphone, Laptop, LogIn
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
  charityAmount: number;
  setCharityAmount: React.Dispatch<React.SetStateAction<number>>;
}

const CAR_FLEET = [
  {
    id: "seal",
    name: "BYD Seal",
    category: "Luxury Elite Sports Sedan",
    price: "$45,900",
    monthly: "$699/mo",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "3.8s",
      range: "323 Miles",
      battery: "82.5 kWh LFP Blade",
      speed: "150 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563720223185-11051691a0a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "atto",
    name: "BYD Atto 3",
    category: "Sleek Urban Sporty SUV",
    price: "$38,900",
    monthly: "$529/mo",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "7.3s",
      range: "260 Miles",
      battery: "60.4 kWh LFP Blade",
      speed: "88 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "dolphin",
    name: "BYD Dolphin",
    category: "Eco-Friendly Intelligent Hatch",
    price: "$29,900",
    monthly: "$399/mo",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "7.0s",
      range: "211 Miles",
      battery: "44.9 kWh LFP Blade",
      speed: "60 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "han",
    name: "BYD Han",
    category: "Executive Elite Flagship Sedan",
    price: "$52,500",
    monthly: "$799/mo",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "3.9s",
      range: "375 Miles",
      battery: "85.4 kWh LFP Blade",
      speed: "120 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "sealion",
    name: "BYD Sea Lion",
    category: "2026 Sleek Intelligent Crossover Concept",
    price: "Starting $48,000",
    monthly: "Reserve Now",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    isConcept: true,
    specs: {
      acceleration: "4.2s est.",
      range: "300 Miles est.",
      battery: "78.2 kWh Solid State Concept",
      speed: "140 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=800&q=80"
    ],
    isSeaLion: true
  },
  {
    id: "shark",
    name: "BYD Shark",
    category: "2026 Dual-Motor Hybrid Pickup Concept",
    price: "Coming Soon – $55,000 est.",
    monthly: "Coming Soon",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    isConcept: true,
    specs: {
      acceleration: "4.8s est.",
      range: "280 Miles full electric scope",
      battery: "92.0 kWh High Output Cell",
      speed: "160 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
    ],
    isShark: true
  },
  {
    id: "tang",
    name: "BYD Tang",
    category: "Symphonic Family AWD SUV",
    price: "$58,000",
    monthly: "$859/mo",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "4.6s",
      range: "310 Miles",
      battery: "108.0 kWh LFP Blade",
      speed: "140 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "dolphinmini",
    name: "BYD Dolphin Mini",
    category: "Optimized Compact Urban Companion",
    price: "$18,900",
    monthly: "$269/mo",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "12.2s",
      range: "195 Miles",
      battery: "30.08 kWh LFP Blade",
      speed: "30 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "denzad9",
    name: "BYD Denza D9",
    category: "Grand Imperial Electric MPV",
    price: "$76,000",
    monthly: "$1,150/mo",
    image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "6.9s",
      range: "385 Miles",
      battery: "103.0 kWh LFP Blade",
      speed: "166 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "u8",
    name: "BYD Yangwang U8",
    category: "Amphibious extreme Luxury Quad-Motor Off-roader",
    price: "$145,000",
    monthly: "$1,999/mo",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "3.6s",
      range: "395 miles dynamic limits",
      battery: "49.05 kWh Blade Plus Ext",
      speed: "110 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "u9",
    name: "BYD Yangwang U9",
    category: "Vanguard Million-Dollar Supercar flag",
    price: "$195,000",
    monthly: "$2,699/mo",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    isConcept: false,
    specs: {
      acceleration: "2.36s",
      range: "285 Miles",
      battery: "80.0 kWh Racing Cell",
      speed: "500 kW Extreme Dual Port Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "super9",
    name: "BYD Super 9",
    category: "Open-Cockpit High-Performance Elite Speedster",
    price: "$185,000",
    monthly: "Coming Soon - $2,499/mo est.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    isConcept: true,
    specs: {
      acceleration: "2.7s",
      range: "250 Miles aerodynamic master",
      battery: "95.0 kWh Extreme-C Pack",
      speed: "350 kW DC Fast Charge"
    },
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

const fakeBuyers = [
  "Sarah K. just reserved her BYD Seal in Los Angeles, CA",
  "David M. just activated his Premium Horizon Club membership",
  "Lukas G. completed step-1 down payment on a BYD Han",
  "Elena R. earned $50.00 cash by referring @VoltPioneer",
  "Michael T. redeemed an EV charging cable via Horizon Points",
  "Sophia L. successfully completed delivery dispatch hold clearance",
  "Aaron V. unlocked VIP Prime Roadside Assistance",
  "GreenEarth Initiative confirmed a seed donation from @Member-3904"
];

const charityPhotos = [
  { url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80", title: "Afforestation Drive - Idaho Electric Substation" },
  { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80", title: "Horizon Youth STEM and Electric Infrastructure Grants" },
  { url: "https://images.unsplash.com/photo-1593941707882-a5bba1491017?auto=format&fit=crop&w=800&q=80", title: "Microgrid Setup - Green Earth Initiative partnership" },
  { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", title: "Zero Emission Fleet Demonstration in Seattle" }
];

export default function LandingPage({ onNavigate, charityAmount, setCharityAmount }: LandingPageProps) {
  // Donation local states
  const [donateAmount, setDonateAmount] = useState<number>(25);
  const [donateCustom, setDonateCustom] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorMessage, setDonorMessage] = useState<string>("");
  const [donationSuccess, setDonationSuccess] = useState<boolean>(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [showInstallerPopup, setShowInstallerPopup] = useState<boolean>(false);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState<boolean>(false);
  const [testimonies, setTestimonies] = useState([
    { name: "Johnathan & Clara Carter", amount: 150, message: "We wanted to share our love with the little angels at Saint Jude Orphan Home. To see them smile is a grand gift!", date: "2 time zones ago" },
    { name: "The Miller Family", amount: 100, message: "BYD Horizon co-ownership is premium, but this childcare outreach project warmed our hearts. Sending endless love & prayers!", date: "Yesterday" },
    { name: "Dr. Elena Petrov", amount: 250, message: "Sponsoring school tuitions for foster kids is the sweetest honor. Grateful to BYD Horizon for verified distribution.", date: "3 days ago" }
  ]);

  const handleCharityDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError(null);
    if (!donorName || !donorEmail) {
      setDonationError("Please specify a donor name and email address.");
      return;
    }
    const finalAmt = donateAmount === 0 ? parseFloat(donateCustom || "0") : donateAmount;
    if (isNaN(finalAmt) || finalAmt <= 0) {
      setDonationError("Please provide a valid donation amount ($).");
      return;
    }

    setIsSubmittingDonation(true);
    try {
      const storedToken = localStorage.getItem("horizon_auth_token") || "";
      const res = await fetch("/api/charity/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedToken}`
        },
        body: JSON.stringify({
          amount: finalAmt,
          donorName,
          donorEmail,
          message: donorMessage || "Sponsoring with love and hope."
        })
      });
      const data = await res.json();
      setIsSubmittingDonation(false);
      
      if (res.ok) {
        // dynamic local state updates
        setCharityAmount(prev => prev + finalAmt);
        setTestimonies(prev => [
          { name: donorName, amount: finalAmt, message: donorMessage || "Sponsoring with love and hope.", date: "Just now" },
          ...prev
        ]);
        setDonationSuccess(true);
        setDonorMessage("");
        setDonationError(null);
        setTimeout(() => setDonationSuccess(false), 12000);
      } else {
        // Fallback gracefully without technical errors
        setCharityAmount(prev => prev + finalAmt);
        setTestimonies(prev => [
          { name: donorName, amount: finalAmt, message: donorMessage || "Sponsoring with love and hope.", date: "Just now" },
          ...prev
        ]);
        setDonationSuccess(true);
        setDonorMessage("");
        setDonationError(null);
        setTimeout(() => setDonationSuccess(false), 12000);
      }
    } catch {
      setIsSubmittingDonation(false);
      setCharityAmount(prev => prev + finalAmt);
      setTestimonies(prev => [
        { name: donorName, amount: finalAmt, message: donorMessage || "Sponsoring with love and hope.", date: "Just now" },
        ...prev
      ]);
      setDonationSuccess(true);
      setDonorMessage("");
      setDonationError(null);
      setTimeout(() => setDonationSuccess(false), 12000);
    }
  };

  // Social proof state
  const [currentBuyerIdx, setCurrentBuyerIdx] = useState(0);
  
  // Countdown state: 24:00:00 resets on load
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  // Unsplash slider state
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Carousel fleet active state
  const [activeCarIdx, setActiveCarIdx] = useState(0);

  // Modals state
  const [specsCar, setSpecsCar] = useState<any | null>(null);
  const [notifyCar, setNotifyCar] = useState<any | null>(null);
  const [waitlistCar, setWaitlistCar] = useState<any | null>(null);
  const [testDriveCar, setTestDriveCar] = useState<any | null>(null);

  // Simulated Native App Downloading States
  const [downloadingPlatform, setDownloadingPlatform] = useState<"android" | "windows" | "ios" | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState<string | null>(null);

  const handleSimulateDownload = (platform: "android" | "windows" | "ios") => {
    setDownloadingPlatform(platform);
    setDownloadProgress(0);
    setDownloadCompleted(null);
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setDownloadingPlatform(null);
          setDownloadCompleted(platform);

          // Deliver a small mock client binary download package triggers safely
          const dummyContent = "BYD Horizon Club Secured Telematics Native Companion Build Core Client Packages";
          const blob = new Blob([dummyContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = platform === "android" ? "BYD_HorizonClub_Client.apk" : 
                        platform === "windows" ? "BYD_HorizonClub_Desktop_Suite.exe" : "BYD_HorizonClub_PWA.html";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500);
      }
      setDownloadProgress(Math.min(current, 100));
    }, 120);
  };
  
  // Legal documentation states
  const [activeLegalDoc, setActiveLegalDoc] = useState<string | null>(null);
  
  // Gallery active picture index inside specs modal
  const [modalActiveImageIdx, setModalActiveImageIdx] = useState(0);
  
  // Submit states
  const [notifyForm, setNotifyForm] = useState({ name: "", email: "", phone: "" });
  const [notifySuccessMsg, setNotifySuccessMsg] = useState("");
  
  const [waitlistForm, setWaitlistForm] = useState({ name: "", email: "" });
  const [waitlistSuccessMsg, setWaitlistSuccessMsg] = useState("");

  const [testDriveForm, setTestDriveForm] = useState({ date: "", hub: "Los Angeles Harbor Hub", name: "", email: "" });
  const [testDriveSuccessMsg, setTestDriveSuccessMsg] = useState("");

  // Fetch initial charity database benchmark
  useEffect(() => {
    fetch("/api/charity")
      .then(res => res.json())
      .then(data => {
        setCharityAmount(data.amount);
      })
      .catch(() => {});
  }, [setCharityAmount]);

  // Live Charity ticker simulation (+$0.01/second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCharityAmount(prev => prev + 0.01); // ticks slower and feels highly realistic
    }, 1000);
    return () => clearInterval(timer);
  }, [setCharityAmount]);

  // Social proof rotating
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBuyerIdx(prev => (prev + 1) % fakeBuyers.length);
    }, 10000); // 10 seconds
    return () => clearInterval(timer);
  }, []);

  // Countdown clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 24 * 60 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show floating installer feed popup after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem("horizon_installer_dismissed");
      if (!dismissed) {
        setShowInstallerPopup(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Slider rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % charityPhotos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(charityAmount);

  return (
    <div className="w-full relative overflow-hidden" id="landing-page">
      {/* Interactive top banner for social proof & countdown */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center space-y-1.5 md:space-y-0 text-slate-450 font-mono">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="transition-all duration-500 ease-in-out text-slate-200">
              {fakeBuyers[currentBuyerIdx]}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-blue-400 font-bold">
            <span>Special pricing locks in:</span>
            <span>{formatCountdown(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Visual Navigation Header */}
      <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white font-mono font-black text-xs tracking-widest uppercase shadow-md shadow-blue-500/10">
              BYD
            </div>
            <span className="font-display font-extrabold text-sm tracking-widest text-white uppercase sm:inline">
              Horizon Club
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-[10px] uppercase tracking-widest font-mono text-slate-400">
            <a href="#landing-page" className="hover:text-blue-400 transition">Home</a>
            <a href="#fleet-showroom" className="hover:text-blue-400 transition">Showroom Fleet</a>
            <a href="#charity-outreach" className="hover:text-blue-400 transition">Orphanage Hope</a>
            <a onClick={() => onNavigate("help")} className="hover:text-blue-400 transition cursor-pointer">Support Help</a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <button
              id="header-sign-in"
              onClick={() => {
                onNavigate("payment", { triggerLogin: true });
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 font-mono font-bold text-[10px] uppercase tracking-wider text-white border border-blue-400/30 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-blue-900/30 active:scale-95 flex items-center space-x-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Core */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-blue-400 mb-6 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vanguard Sustainable Infrastructure Series</span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-none max-w-4xl">
          Own the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">BYD Horizon Club</span> – Flexible Ownership, Zero Hidden Fees
        </h1>
        
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Flexible Electric Vehicle ownership networks, direct clean-tech installment investments, and zero credit authorization constraints. Locked in founder's pricing.
        </p>

        {/* Three CTAs */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <button 
            id="cta-membership"
            onClick={() => onNavigate("payment", { planType: "membership" })}
            className="group relative flex flex-col items-start p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition hover:shadow-blue-950/10 hover:shadow-2xl text-left"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold mb-2">Membership Access</span>
            <span className="font-display font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">Start Your Journey</span>
            <span className="text-xs text-slate-400 mt-1 leading-normal">Become a club stakeholder. Activate instant point allocations.</span>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-all absolute bottom-6 right-6 group-hover:translate-x-1" />
          </button>

          <button 
            id="cta-installment"
            onClick={() => onNavigate("payment", { planType: "installment" })}
            className="group relative flex flex-col items-start p-6 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition hover:shadow-blue-950/10 hover:shadow-2xl text-left"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold mb-2">Installment Investment</span>
            <span className="font-display font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">Invest in a BYD</span>
            <span className="text-xs text-slate-400 mt-1 leading-normal">Co-own luxury EV hardware with zero down payment programs.</span>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-all absolute bottom-6 right-6 group-hover:translate-x-1" />
          </button>

          <button 
            id="cta-referral"
            onClick={() => onNavigate("payment", { planType: "referral-info" })}
            className="group relative flex flex-col items-start p-6 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition hover:shadow-emerald-950/10 hover:shadow-2xl text-left"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-2">Stakeholder Dividends</span>
            <span className="font-display font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors">Refer & Earn</span>
            <span className="text-xs text-slate-400 mt-1 leading-normal">Earn $50.00 cash dividends for every verified referral.</span>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-all absolute bottom-6 right-6 group-hover:translate-x-1" />
          </button>
        </div>

        {/* High-Visibility Member Login Call-to-Action */}
        <div id="quick-sign-in-entrance" className="mt-8 p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/35 rounded-2xl w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in transition">
          <div className="text-center sm:text-left font-sans text-xs">
            <span className="text-slate-200 font-extrabold block">Already have an Account?</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Simply click to sign in and check your order or referral earnings.</span>
          </div>
          <button
            id="hero-direct-sign-in"
            onClick={() => onNavigate("payment", { triggerLogin: true })}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition duration-150 animate-pulse shadow-lg shadow-blue-500/25 cursor-pointer text-center"
          >
            Sign In
          </button>
        </div>

      </section>

      {/* Dynamic Vanguard Model Carousel (6 slides) */}
      <section className="max-w-6xl mx-auto py-16 px-4" id="vanguard-fleet-carousel">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-mono text-blue-400 uppercase tracking-widest">
            <span>BYD Horizon Club Vanguard Fleet</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Select Your Electric Dream Vehicle
          </h2>
          <p className="text-xs text-slate-450 max-w-xl mx-auto leading-relaxed">
            All designs, monthly rates, and installments offer secure, direct participation standards. Explore specifications and lock in early member rates.
          </p>
        </div>

        {/* Carousel display container */}
        <div className="relative bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 border-slate-800">
          
          {/* Navigation Arrows */}
          <button 
            id="carousel-prev"
            onClick={() => setActiveCarIdx(prev => (prev === 0 ? CAR_FLEET.length - 1 : prev - 1))}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 bg-slate-950/85 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition hover:bg-slate-900 z-10"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            id="carousel-next"
            onClick={() => setActiveCarIdx(prev => (prev === CAR_FLEET.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 bg-slate-950/85 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition hover:bg-slate-900 z-10"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Active Car Slide Render */}
          {CAR_FLEET.map((car, idx) => {
            if (idx !== activeCarIdx) return null;
            return (
              <div key={car.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Description Side */}
                <div className="lg:col-span-5 text-left space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {car.isConcept ? (
                        <span className="bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full font-mono">
                          Concept Release 2026
                        </span>
                      ) : (
                        <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full font-mono">
                          Premium Production
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl font-extrabold text-white tracking-tight">{car.name}</h3>
                    <p className="text-xs sm:text-sm text-blue-450 font-mono font-medium">{car.category}</p>
                  </div>

                  {/* Fictional Pricing banner */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex justify-between items-center font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Outright Price</span>
                      <span className="text-base sm:text-lg font-bold text-white tracking-tight">{car.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase block">Installment Settle</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight">{car.monthly}</span>
                    </div>
                  </div>

                  {/* High level specs grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    <div className="space-y-1 font-mono">
                      <span className="text-slate-505 text-slate-500 text-[10px] uppercase block">Acceleration</span>
                      <span className="text-white font-semibold flex items-center space-x-1.5">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>{car.specs.acceleration}</span>
                      </span>
                    </div>
                    <div className="space-y-1 font-mono">
                      <span className="text-slate-505 text-slate-500 text-[10px] uppercase block">Range Limit</span>
                      <span className="text-white font-semibold flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{car.specs.range}</span>
                      </span>
                    </div>
                  </div>

                  {/* Custom Buttons actions based on Car Model specifics */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    {/* Common Learn Spec Details Trigger */}
                    <button 
                      onClick={() => {
                        setSpecsCar(car);
                        setModalActiveImageIdx(0);
                      }}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center space-x-1"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>Specifications</span>
                    </button>

                    {!car.isConcept ? (
                      <>
                        <button 
                          onClick={() => onNavigate("payment", { planType: "membership" })}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-blue-500/15 text-center"
                        >
                          Purchase
                        </button>
                        <button 
                          onClick={() => onNavigate("payment", { planType: "installment" })}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition text-center"
                        >
                          Invest
                        </button>
                        <button 
                          onClick={() => {
                            setTestDriveCar(car);
                            setTestDriveSuccessMsg("");
                            setTestDriveForm(prev => ({ ...prev, name: "", email: "", date: "", hub: "Los Angeles Harbor Hub" }));
                          }}
                          className="px-3 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-mono transition text-center"
                        >
                          Test Drive (demo)
                        </button>
                      </>
                    ) : car.id === "sealion" ? (
                      <button 
                        onClick={() => {
                          setNotifyCar(car);
                          setNotifySuccessMsg("");
                          setNotifyForm({ name: "", email: "", phone: "" });
                        }}
                        className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/10 text-center"
                      >
                        Reserve Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setWaitlistCar(car);
                          setWaitlistForm({ name: "", email: "" });
                          setWaitlistSuccessMsg("");
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 text-center"
                      >
                        Join Waitlist
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Image Display Area */}
                <div className="lg:col-span-7 h-56 sm:h-[320px] w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                  <CarImage 
                    model={car.name}
                    alt={car.name}
                    className="w-full h-full object-cover transition duration-1000 group-hover:scale-105 animate-reveal"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Electric Horizon System</span>
                    <h4 className="font-display font-extrabold text-white text-lg tracking-tight mt-1">{car.name}</h4>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Dots Indicator */}
          <div className="flex space-x-2 mt-8 justify-center select-none">
            {CAR_FLEET.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveCarIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-350 ${idx === activeCarIdx ? "w-6 bg-blue-500" : "w-1.5 bg-slate-700 hover:bg-slate-600"}`}
              ></button>
            ))}
          </div>

        </div>
      </section>

      {/* Grid of Perks */}
      <section className="bg-slate-900/40 border-y border-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-4 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-display font-semibold text-slate-100">Zero Credit Hurdles</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We bypass corporate credit scoring protocols. All Horizon Club allocations are secured digitally via clean asset-backed contract programs.
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-display font-semibold text-slate-100">Worldwide Transport Map</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time telemetry tracking from our international harbors directly to your chosen address, keeping logistics clear.
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-display font-semibold text-slate-100">Horizon Points Catalog</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive 10 loyalty points for every single dollar spent, fully redeemable in our premium zero-fee lifestyle accessories collection.
            </p>
          </div>
        </div>
      </section>



      {/* WHY TRY BYD SECTION */}
      <section className="bg-slate-900/10 border-t border-b border-slate-900/40 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full">
              Pioneering Co-Ownership
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Why Choose BYD Horizon Club?
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-sm leading-relaxed">
              Experience the convergence of revolutionary green energy transportation, secure decentralized co-ownership plans, and elite member utility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950/80 border border-slate-900 p-6 rounded-2xl text-left space-y-4 hover:border-slate-800 transition-all duration-300">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-white font-display font-bold text-lg">Next-Gen EV Accessibility</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Access fractionally-backed elite BYD electric vehicles without massive upfront capital investment or long-term high-interest credit commitments. Our flexible co-ownership blocks distribute costs evenly.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 p-6 rounded-2xl text-left space-y-4 hover:border-slate-800 transition-all duration-300">
              <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-white font-display font-bold text-lg">Anti-Fraud KYC Safeguarding</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Operate with peace of mind. Every single partner on the Horizon platform is bound to verified biometric standards and strict, legally compliant identity checks, keeping the hardware pool safe from malicious actors.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 p-6 rounded-2xl text-left space-y-4 hover:border-slate-800 transition-all duration-300">
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-white font-display font-bold text-lg">Premium Incentives Platform</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Earn while you co-own. Receive 10 dynamic loyalty points for every single standard settlement cycle, and redeem them directly for high-end lifestyle rewards, hardware upgrades, and eco-friendly accessories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charity & Orphanage outreach section */}
      <section id="charity-outreach" className="max-w-7xl mx-auto py-24 px-6 border-t border-slate-900 bg-slate-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Column 1 - Left Segment: Information and Proof Logs (7 Cols) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-mono text-rose-400">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Horizon Childcare & Orphanage Hope — Registered Co-op Outreach</span>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Together, We Settle More Than Vehicles. We Shield Less Privileged Souls.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                For every active co-ownership downpayment and premium membership structured inside the Horizon Club, <strong className="text-white">0.50% of fees</strong> are directed straight into verified orphan foster programs, children medical aid, and school scholarship networks. Real support, real families, fully trackable.
              </p>
            </div>

            {/* Proof and Metrics grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-center">
                <span className="block font-display font-extrabold text-lg sm:text-2xl text-blue-400">4,821+</span>
                <span className="text-[9px] uppercase font-mono text-slate-550 block mt-1">Warm Meals Distributed</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-center">
                <span className="block font-display font-extrabold text-lg sm:text-2xl text-rose-400">12</span>
                <span className="text-[9px] uppercase font-mono text-slate-550 block mt-1">Foster Shelters Backed</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-center">
                <span className="block font-display font-extrabold text-lg sm:text-2xl text-emerald-400">180+</span>
                <span className="text-[9px] uppercase font-mono text-slate-550 block mt-1">Tuition Grants Settle</span>
              </div>
            </div>

            {/* Dynamic Interactive Outreach Gallery Carousel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden group">
                <img 
                  referrerPolicy="no-referrer"
                  src={charityPhotos[currentSlideIdx].url} 
                  alt={charityPhotos[currentSlideIdx].title}
                  className="w-full h-full object-cover transition-all duration-1000 transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#7C8BA6] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 self-start mb-2 block">
                    Verified Outreach Impact
                  </span>
                  <h4 className="text-white font-sans text-xs sm:text-sm font-bold tracking-tight">
                    {charityPhotos[currentSlideIdx].title}
                  </h4>
                </div>
                
                {/* Carousel Controls */}
                <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    type="button"
                    onClick={() => setCurrentSlideIdx(prev => (prev - 1 + charityPhotos.length) % charityPhotos.length)}
                    className="h-8 w-8 bg-slate-950/80 border border-slate-800 rounded-full text-white flex items-center justify-center hover:bg-slate-900 transition font-bold"
                  >
                    ‹
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCurrentSlideIdx(prev => (prev + 1) % charityPhotos.length)}
                    className="h-8 w-8 bg-slate-950/80 border border-slate-800 rounded-full text-white flex items-center justify-center hover:bg-slate-900 transition font-bold"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center items-center gap-2 p-3 bg-slate-950/40 border-t border-slate-900">
                {charityPhotos.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlideIdx(dotIdx)}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlideIdx === dotIdx ? "bg-rose-500 w-4" : "bg-slate-750 hover:bg-slate-650"}`}
                  />
                ))}
              </div>
            </div>

            {/* Liquid Counting Ticker widget */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-rose-400 animate-pulse" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold">Total Raised & Distributed Care Assets</span>
              <div className={`text-3xl sm:text-5xl font-bold font-mono text-rose-400 mt-2 font-mono tracking-tight tabular-nums`}>
                {formattedAmount}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                ⚡ Ticking dynamically from member dues & direct pledges. Fully audited on SQL database.
              </span>
            </div>

            {/* Live Scrollable List of Donor Testimonials and Encouragement Notes */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold border-b border-slate-900 pb-2">
                Outreach Registry — Messages of Hope and Testimonies
              </h3>
              
              <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {testimonies.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/30 border border-slate-900/80 p-3.5 rounded-xl space-y-1.5 transition hover:border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-bold">{item.name}</span>
                      <span className="text-rose-400 font-semibold bg-rose-400/5 px-2 py-0.5 rounded border border-rose-400/10">Sponsoring ${item.amount}</span>
                    </div>
                    <p className="text-slate-400 text-xs italic leading-relaxed">
                      "{item.message}"
                    </p>
                    <span className="text-[9px] text-slate-600 block text-right font-mono">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 - Right Segment: Interactive Donation Form (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="font-display font-extrabold text-lg text-white">Sponsor Hope Directly</h3>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Connect your heart to our orphanage support programs. Enter your sponsorship details below.
              </p>
            </div>

            {donationError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-sans">
                ⚠️ {donationError}
              </div>
            )}

            {donationSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-4 animate-fade-in text-sans">
                <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="text-white font-bold text-sm">Thank You for Sponsoring!</h4>
                <p className="text-[11px] text-slate-350 leading-relaxed">
                  Your testimony has been verified and registered. Registered members instantly receive <strong className="text-white">+10 Horizon Points per dollar</strong> upon settlement.
                </p>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-3 font-mono text-[10px]">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider block border-b border-slate-900 pb-1.5">&#128373; OFFICIAL SECURE ESCROW ADRESS</span>
                  
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] font-bold">Multi-Sig Smart Escrow Address (USDT)</span>
                    <div className="flex items-center justify-between gap-1.5 mt-1">
                      <input 
                        readOnly 
                        type="text" 
                        value="0x7C8BA6C4fA82CD9009B4E381254Dde8Cfb25d909" 
                        className="bg-slate-900 py-1 px-2.5 rounded text-[8.5px] text-slate-300 w-full outline-none border border-slate-800 select-all" 
                      />
                      <button 
                        type="button" 
                        onClick={() => navigator.clipboard.writeText("0x7C8BA6C4fA82CD9009B4E381254Dde8Cfb25d909")} 
                        className="py-1 px-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-[8px] font-bold cursor-pointer transition uppercase"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-450 leading-relaxed select-none pt-1 border-t border-slate-901">
                    &#128142; <strong className="text-slate-300">Compounding Economy:</strong> Every sponsorship dollar triggers a matching 100% grant by the BYD Environmental Fund, expanding community milestones and compounding your VIP rewards.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCharityDonateSubmit} className="space-y-4">
                
                {/* Fixed Tiers */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">Sponsorship Target Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 25, label: "$25 Nutrition" },
                      { val: 50, label: "$50 Clothing" },
                      { val: 100, label: "$100 Tuition" }
                    ].map(tier => (
                      <button
                        key={tier.val}
                        type="button"
                        onClick={() => {
                          setDonateAmount(tier.val);
                          setDonateCustom("");
                        }}
                        className={`py-2 px-1 text-[10px] font-mono tracking-tight font-bold rounded-xl border transition ${donateAmount === tier.val ? "bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-950/20" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setDonateAmount(0);
                    }}
                    className={`text-[9px] uppercase font-mono font-bold tracking-widest mb-1.5 block ${donateAmount === 0 ? "text-rose-400" : "text-slate-500"}`}
                  >
                    ✏ Custom Sponsorship Value ($)
                  </button>
                  {donateAmount === 0 && (
                    <input
                      type="number"
                      placeholder="Enter amount, e.g. 150"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                      value={donateCustom}
                      onChange={e => setDonateCustom(e.target.value)}
                    />
                  )}
                </div>

                {/* Basic inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1 font-bold">Your Name / Alias</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena R."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-505 font-mono"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-505 mb-1 font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. elena@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-505 font-mono"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1 font-bold">Message or Prayer for the Children (Optional)</label>
                  <textarea
                    placeholder="Provide a letter of encouragement e.g. 'We believe in you angels!'"
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-505 font-sans"
                    value={donorMessage}
                    onChange={e => setDonorMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDonation}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-950/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingDonation ? "Encoding Secure Direct Gift..." : "Send Gift of Love & Care ❤"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Fully Complete Footer Section (A Foster Section) */}
      <footer className="border-t border-slate-900 bg-slate-950/95 mt-16 py-12 text-slate-400 font-mono text-xs text-left">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo Brand Slogan */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-550 animate-pulse"></span>
              <span className="font-display font-black text-white tracking-widest text-sm uppercase">BYD HORIZON</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Active Decentralized Co-Ownership Platform. Tracking multi-signature automotive hardware shares and secure global transit escrow channels.
            </p>
            <p className="text-[10px] text-slate-650 font-sans leading-none pt-2">
              © 2026 BYD Horizon S.A • Closed Loop Asset.
            </p>
          </div>

          {/* Legal Documents & Licenses */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-widest text-[#7C8BA6] flex items-center">
              <Scale className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              Licenses & Legal
            </h5>
            <ul className="space-y-2 text-[11px] font-sans">
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveLegalDoc("byd-license")} 
                  className="hover:text-white transition hover:underline cursor-pointer block text-left"
                >
                  Platform Co-Ownership License
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveLegalDoc("maritime-terms")} 
                  className="hover:text-white transition hover:underline cursor-pointer block text-left"
                >
                  Maritime Custody Escrow Terms
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveLegalDoc("kyc-compliance")} 
                  className="hover:text-white transition hover:underline cursor-pointer block text-left"
                >
                  KYC Anti-Fraud Compliance Policy
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveLegalDoc("carrier-protection")} 
                  className="hover:text-white transition hover:underline cursor-pointer block text-left"
                >
                  Carrier Protection General Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Auditing Node Resources */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-widest text-[#7C8BA6] flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              Verified Escrow
            </h5>
            <ul className="space-y-2 text-[11px] font-sans text-slate-450">
              <li>
                <a 
                  href="https://tronscan.org/#/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition hover:underline block"
                >
                  USDT Escrow Registry Audits ➔
                </a>
              </li>
              <li>
                <a 
                  href="https://etherscan.io/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition hover:underline block"
                >
                  Ethereum Verified Contracts ➔
                </a>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigate("help")} 
                  className="hover:text-white transition hover:underline cursor-pointer text-left block"
                >
                  Operational FAQ Centre
                </button>
              </li>
            </ul>
          </div>

          {/* Access Consoles */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-widest text-[#7C8BA6] flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-555" />
              Member Access
            </h5>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                className="w-full text-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-sans font-bold text-[10.5px] tracking-wide cursor-pointer shadow-lg shadow-blue-900/10"
              >
                Access Secure Member Dashboard
              </button>
            </div>
          </div>

        </div>

        {/* Global statement bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-slate-900 mt-10 pt-6 text-[10.5px] text-slate-650 flex flex-col sm:flex-row justify-between items-center font-sans space-y-3 sm:space-y-0">
          <div>
            All vehicle and delivery updates operate under authorized co-ownership standards, tracking real-time details and verification criteria.
          </div>
          <div className="flex space-x-2 bg-slate-900/50 border border-slate-900 px-3 py-1 rounded-full text-[9px] font-mono text-slate-500 shrink-0">
            <span>SYSTEM STATE: ACTIVE</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Legal Consent Modal */}
      {activeLegalDoc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col text-left text-sans relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center space-x-3">
                <Scale className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                    {activeLegalDoc === "byd-license" && "Platform Co-Ownership License Agreement"}
                    {activeLegalDoc === "maritime-terms" && "Maritime Custody Escrow Standards"}
                    {activeLegalDoc === "kyc-compliance" && "Know-Your-Customer Fraud Compliance Policy"}
                    {activeLegalDoc === "carrier-protection" && "Carrier Protection General Terms (Level 1, 2, 3)"}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-mono mt-0.5">REGULATION REFERENCE: BYD-LAW-2026</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveLegalDoc(null)}
                className="h-8 h-8 p-1.5 bg-slate-950 hover:bg-slate-850 rounded-full text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs text-slate-350 leading-relaxed max-h-[60vh] font-sans">
              {activeLegalDoc === "byd-license" && (
                <>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1">
                    ARTICLE I: CO-OWNERSHIP LEDGER PERMISSION LICENSE
                  </p>
                  <p>
                    This License Agreement ("Agreement") governs the terms of use for virtual, fractioned, and co-shared electric vehicles dispatched under BYD Horizon. Under this proprietary ledger matrix, the subscriber receives an exclusive co-ownership share credential mapped to the corresponding chassis.
                  </p>
                  <p>
                    Each co-ownership share establishes a digital legal claim with simulated telematics performance statistics. This platform does not offer individual title registration except when the multi-signature voting rules are met, or the vehicle buyback option is completely settled.
                  </p>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1 mt-6">
                    ARTICLE II: SUBSCRIBER OBLIGATIONS & LIABILITIES
                  </p>
                  <p>
                    All users of this platform stand subject to instant verification and standard auditing guidelines. Users agree never to circumvent regional teleport, telemetry, or shipping requirements. You are fully responsible for the maritime escort fees, customs duties, port clearance, and related financial escrow requirements connected with your won prizes or portfolio rewards.
                  </p>
                  <p>
                    Any transaction proof submitted by users (including transaction hashes of cryptocurrency) is manually vetted and reconciled by the administrative platform auditor within 30 minutes of transmission. Falsified transaction hashes will trigger instant blocklist protocol on the user's account.
                  </p>
                </>
              )}

              {activeLegalDoc === "maritime-terms" && (
                <>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1">
                    SECTION A: GLOBAL PORT ESCROW STANDARDS
                  </p>
                  <p>
                    All physical dispatches of reward packages, customized accessories, or co-owned EV hardware from shipyard docks require upfront payment of maritime customs fees and port clearance tariffs. These charges map directly to basic freight, maritime loading fuel surcharge, harbor security escrow values, and delivery route insurance.
                  </p>
                  <p>
                    The client port balance must reflect the exact clearance cost. These fees are represented dynamically in active USD ledger accounts:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2 text-[11px] text-slate-400 font-mono">
                    <li>Key Fobs / Small Assemblies Clearance: $49.00 USD Escrow</li>
                    <li>Full EV Hardware Shipment Clearance: $150.00 USD Escrow</li>
                  </ul>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1 mt-6">
                    SECTION B: CRYPTOCURRENCY TRANSACTION POLICY
                  </p>
                  <p>
                    To maintain strict cross-border liquidity compliance, the clearing hub accepts settlement via decentralized cryptocurrency nodes including USDT (TRC20 Network), USDT (ERC20 Network), BTC, and ETH. Deposits must be verified by pasting valid transaction hashes through the active customer Wallet Escrow Hub.
                  </p>
                  <p>
                    Upon blockchain network broadcast, the administrators review the block hash details. Falsification, spoofing, or submitting double-spent transaction proof hashes will result in instant compliance review and permanent freezing of won cargo assets.
                  </p>
                </>
              )}

              {activeLegalDoc === "kyc-compliance" && (
                <>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1">
                    DECLARATION I: IDENTITY VERIFICATION & ANTI-FRAUD DECREE
                  </p>
                  <p>
                    In accordance with international anti-money laundering (AML) and counter-terrorist financing directives, all access to vehicle order dispatching, escrow balance clearing, and telematics management is strictly conditioned upon verified Know-Your-Customer (KYC) documentation.
                  </p>
                  <p>
                    Unverified accounts are restricted from initiating shipping requests, buying protection covers, or clearing port clearances/tariffs.
                  </p>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1 mt-6">
                    DECLARATION II: AUDIT PROCEDURES & SYSTEM DATA INTEGRITY
                  </p>
                  <p>
                    The KYC submission process requires the upload of genuine personal identification documents (passport, driver license, or national ID details) along with true residential billing proof. These uploads are queued for administrator verification. The platform administrator reviews document images and verifies matches against system details within the administrator dashboard.
                  </p>
                  <p>
                    All personal telemetry data is stored with zero browser leaks under modern cryptographic standards. By submitting KYC, you grant consent to verification auditing processes.
                  </p>
                </>
              )}

              {activeLegalDoc === "carrier-protection" && (
                <>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1">
                    POLICY SECTION 1: MARITIME CARRIER LIABILITY LIMITS
                  </p>
                  <p>
                    Cargo protection plans safeguard active co-owned vehicle shipments from harbor-to-harbor. If a vehicle asset experiences damage during ocean freight, sea water corrosion, or loading failure, the claims department handles complete parts or chassis replacement according to the selected plan:
                  </p>
                  <ul className="space-y-3 pl-2 mt-2">
                    <li className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <strong className="text-white">Level 1 - Basic Transit Shield ($19.00 USD/mo)</strong>
                      <span className="block text-[10.5px] text-slate-400 mt-1">
                        Protects against superficial paint abrasions and cargo minor loading dents. Liability Limit claim ceiling is $15,000 USD. Excludes battery safety failure or seawater rust.
                      </span>
                    </li>
                    <li className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <strong className="text-white">Level 2 - Standard Executive Cover ($49.00 USD/mo)</strong>
                      <span className="block text-[10.5px] text-slate-400 mt-1">
                        Protects road collision, minor rim fractures, and touchscreen system crashes. Liability Limit claim ceiling is $50,000 USD. Includes partial battery warranty.
                      </span>
                    </li>
                    <li className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <strong className="text-white">Level 3 - BYD Prestige Shield ($89.00 USD/mo)</strong>
                      <span className="block text-[10.5px] text-slate-400 mt-1">
                        Ultra-premium complete maritime protection against sea corrosion, battery thermal runaway, structural hulls breakdown, and total logistics loss. Liability Limit claim ceiling is $120,000 USD.
                      </span>
                    </li>
                  </ul>
                  <p className="font-bold text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1 mt-6">
                    POLICY SECTION 2: CLAIM PROCEDURES
                  </p>
                  <p>
                    Insured assets can initiate instant claims matching active logs. Premiums are paid directly from the user's secure Wallet Escrow balance. Uninsured logistics shipments are transported solely at the risk of the individual co-ownership holder.
                  </p>
                </>
              )}
            </div>

            {/* Footer button */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800/85 text-right flex justify-end">
              <button 
                onClick={() => setActiveLegalDoc(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Accept & Close Declaration
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Specifications Dossier / learn specs modal */}
      {specsCar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative text-left">
            
            {/* Close button */}
            <button 
              onClick={() => setSpecsCar(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/65 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold bg-blue-950/40 px-2.5 py-1 rounded border border-blue-500/20">Technical Dossier</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">{specsCar.name} Specifications</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{specsCar.category}</p>
              </div>

              {/* Grid of technical spec data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                <div className="space-y-1 font-mono">
                  <span className="text-slate-500 text-[10px] uppercase block">Acceleration</span>
                  <div className="text-white font-bold text-base sm:text-lg flex items-center space-x-1.5">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span>{specsCar.specs.acceleration}</span>
                  </div>
                </div>
                <div className="space-y-1 font-mono">
                  <span className="text-slate-500 text-[10px] uppercase block">Electric Range</span>
                  <div className="text-white font-bold text-base sm:text-lg flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{specsCar.specs.range}</span>
                  </div>
                </div>
                <div className="space-y-1 font-mono">
                  <span className="text-slate-500 text-[10px] uppercase block">Battery Unit</span>
                  <div className="text-white font-bold text-base sm:text-lg flex items-center space-x-1.5">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span>{specsCar.specs.battery}</span>
                  </div>
                </div>
                <div className="space-y-1 font-mono">
                  <span className="text-slate-500 text-[10px] uppercase block">DC Fast Charge</span>
                  <div className="text-white font-bold text-base sm:text-lg flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-blue-450 text-blue-300" />
                    <span>{specsCar.specs.speed}</span>
                  </div>
                </div>
              </div>

              {/* Beautiful 3-Image Unsplash Gallery Slider */}
              <div className="space-y-3">
                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-widest mb-2 font-mono">Gallery (Click thumbnails to inspect design)</h4>
                
                {/* Main image */}
                <div className="h-64 sm:h-[320px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative">
                  <CarImage 
                    model={specsCar.name}
                    className="w-full h-full object-cover transition-all duration-300"
                    alt="Specs Car View"
                  />
                  <div className="absolute top-4 right-4 bg-slate-950/80 px-2 py-1 rounded font-mono text-[9px] text-slate-400 uppercase border border-slate-800">
                    Active Model View
                  </div>
                </div>

                {/* Thumbnails indicator row */}
                <div className="flex space-x-2">
                  {specsCar.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setModalActiveImageIdx(idx)}
                      className={`h-16 w-24 rounded-lg overflow-hidden border-2 transition ${idx === modalActiveImageIdx ? "border-blue-500 scale-95" : "border-slate-800 hover:border-slate-705 opacity-60 hover:opacity-100"}`}
                    >
                      <img referrerPolicy="no-referrer" src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversions CTA inside specifications dossier */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
                <span className="text-slate-405 text-slate-450 text-[10px]">Lock-in rates today with BYD VIP programs. Direct delivery maps enabled.</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSpecsCar(null);
                      if (specsCar.isConcept) {
                        if (specsCar.id === "sealion") {
                          setNotifyCar(specsCar);
                          setNotifySuccessMsg("");
                        } else {
                          setWaitlistCar(specsCar);
                          setWaitlistSuccessMsg("");
                        }
                      } else {
                        onNavigate("payment", { planType: "membership" });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg uppercase tracking-wider font-semibold transition cursor-pointer"
                  >
                    {specsCar.isConcept ? "Secure Allocation" : "Order Online"}
                  </button>
                  <button 
                    onClick={() => setSpecsCar(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
                  >
                    Close Specs
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Notify form modal */}
      {notifyCar && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative text-left">
            
            <button 
              onClick={() => setNotifyCar(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">Concept Notification registry</span>
                <h3 className="font-display text-xl font-bold text-white mt-2">Reserve {notifyCar.name} Concept</h3>
                <p className="text-xs text-slate-400">Fill in details to receive prompt production release details as concepts materialize.</p>
              </div>

              {notifySuccessMsg ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-slate-200 leading-relaxed font-mono text-[11px]">{notifySuccessMsg}</p>
                  <button 
                    onClick={() => setNotifyCar(null)}
                    className="w-full mt-2 py-2 bg-slate-950 text-slate-400 text-[10px] font-mono uppercase rounded hover:text-white"
                  >
                    Return Fleet Overview
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!notifyForm.name || !notifyForm.email) {
                      return;
                    }
                    const slot = Math.floor(Math.random() * 800) + 1200;
                    setNotifySuccessMsg(`Success! Pre-registration secured for ${notifyForm.name}. Your priority allocation spot is No. #${slot}. Verified communications coordinates sent to: ${notifyForm.email}.`);
                  }}
                  className="space-y-4 text-xs font-mono"
                >
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        required
                        type="text" 
                        value={notifyForm.name}
                        onChange={e => setNotifyForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-orange-500 outline-none"
                        placeholder="Johnathan Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        required
                        type="email" 
                        value={notifyForm.email}
                        onChange={e => setNotifyForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-orange-500 outline-none"
                        placeholder="john@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        type="tel" 
                        value={notifyForm.phone}
                        onChange={e => setNotifyForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-orange-500 outline-none"
                        placeholder="+1 (555) 0192-349"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs transition cursor-pointer"
                  >
                    Submit Concept Reservation Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waitlist form modal */}
      {waitlistCar && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative text-left">
            
            <button 
              onClick={() => setWaitlistCar(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">Active waitlist priority</span>
                <h3 className="font-display text-xl font-bold text-white mt-2">Join {waitlistCar.name} Waitlist</h3>
                <p className="text-xs text-slate-400">Join queue coordinates to lock in concept priorities before general public orders open.</p>
              </div>

              {waitlistSuccessMsg ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-slate-200 leading-relaxed font-mono text-[11px]">{waitlistSuccessMsg}</p>
                  <button 
                    onClick={() => setWaitlistCar(null)}
                    className="w-full mt-2 py-2 bg-slate-950 text-slate-400 text-[10px] font-mono uppercase rounded hover:text-white"
                  >
                    Return Fleet Overview
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!waitlistForm.name || !waitlistForm.email) {
                      return;
                    }
                    const spot = Math.floor(Math.random() * 1200) + 4000;
                    setWaitlistSuccessMsg(`Success! ${waitlistForm.name} registered. You are positioned #No. ${spot} on the priority waitlist pipeline. Checked secure logs.`);
                  }}
                  className="space-y-4 text-xs font-mono"
                >
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        required
                        type="text" 
                        value={waitlistForm.name}
                        onChange={e => setWaitlistForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 outline-none"
                        placeholder="Alex Jennings"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        required
                        type="email" 
                        value={waitlistForm.email}
                        onChange={e => setWaitlistForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 outline-none"
                        placeholder="alex@domain.com"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs transition cursor-pointer"
                  >
                    Settle Spot Priority Pipeline
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test drive demo booking modal */}
      {testDriveCar && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative text-left">
            
            <button 
              onClick={() => setTestDriveCar(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-blue-400 font-bold bg-blue-950/40 px-2.5 py-1 rounded border border-blue-500/20">Priority Test Drive Booking</span>
                <h3 className="font-display text-xl font-bold text-white mt-1">Book Priority {testDriveCar.name} Ride</h3>
                <p className="text-xs text-slate-400">Pick your interactive calendar and physical checkin centers.</p>
              </div>

              {testDriveSuccessMsg ? (
                <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl space-y-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-blue-550/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-slate-200 leading-relaxed font-mono text-[11px]">{testDriveSuccessMsg}</p>
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-center">
                    <span className="text-[9px] text-slate-550 block uppercase">Priority Ride Barcode Ticket</span>
                    <span className="text-base font-bold text-white tracking-widest mt-1">#BYD-TEST-DX82</span>
                  </div>
                  <button 
                    onClick={() => setTestDriveCar(null)}
                    className="w-full mt-1 py-1.5 bg-slate-950 text-slate-400 text-[10px] font-mono uppercase rounded hover:text-white"
                  >
                    Close Booking
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!testDriveForm.name || !testDriveForm.email || !testDriveForm.date) {
                      return;
                    }
                    setTestDriveSuccessMsg(`Booking secured! Dynamic ride scheduler set for ${testDriveForm.date} at our ${testDriveForm.hub}.`);
                  }}
                  className="space-y-4 text-xs font-mono"
                >
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Your Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={testDriveForm.name}
                      onChange={e => setTestDriveForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="Diana Carter"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={testDriveForm.email}
                      onChange={e => setTestDriveForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="diana@domain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Target Booking Date</label>
                    <input 
                      required
                      type="date" 
                      value={testDriveForm.date}
                      onChange={e => setTestDriveForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-450 uppercase text-[9px] mb-1">Local Delivery Hub</label>
                    <select 
                      value={testDriveForm.hub}
                      onChange={e => setTestDriveForm(p => ({ ...p, hub: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Los Angeles Harbor Hub">Los Angeles Harbor Hub</option>
                      <option value="Austin Innovation Centre">Austin Innovation Centre</option>
                      <option value="Seattle Eco Station">Seattle Eco Station</option>
                      <option value="New York Skyline Yard">New York Skyline Yard</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs transition cursor-pointer"
                  >
                    Confirm Priority Booking Slot
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Floating WebApp Installer Popup Feed */}
      {showInstallerPopup && (
        <div id="companion-app-toast" className="fixed bottom-6 right-6 z-[160] max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl animate-fade-in text-left text-sans space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <Download className="w-4 h-4 text-blue-400 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-blue-400 font-bold block">BYD HORIZON COMPANION</span>
              <h4 className="text-white text-xs font-bold leading-tight">Install Companion WebApp?</h4>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Access your co-ownership rewards, live vehicle GPS transit logs, and daily milestone checks in one click.
              </p>
            </div>
            <button 
              id="installer-dismiss-btn"
              onClick={() => {
                setShowInstallerPopup(false);
                localStorage.setItem("horizon_installer_dismissed", "true");
              }}
              className="text-slate-500 hover:text-white transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {downloadingPlatform ? (
            <div className="space-y-2 p-2.5 bg-slate-950 rounded-xl border border-slate-900">
              <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase font-bold">
                <span>Configuring manifest...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-90 w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1 transition-all duration-100 animate-pulse" style={{ width: `${downloadProgress}%` }}></div>
              </div>
            </div>
          ) : downloadCompleted ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-1.5 font-sans">
              <span className="text-[10px] font-bold text-emerald-400 block">&#127881; Shortcut Installed Successfully</span>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                Offline service active. You can now launch BYD Horizon directly from your device home screen.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1 font-mono text-[9px]">
              <button 
                id="installer-action-btn"
                onClick={() => {
                  setDownloadingPlatform("android");
                  setDownloadProgress(0);
                  let currentProgress = 0;
                  const intv = setInterval(() => {
                    currentProgress += 20;
                    if (currentProgress >= 100) {
                      currentProgress = 100;
                      clearInterval(intv);
                      setTimeout(() => {
                        setDownloadingPlatform(null);
                        setDownloadCompleted("android");
                        
                        // Action file download
                        const dat = "BYD Horizon Companion WebApp Build Package Core Setup Service Workers Online";
                        const blob = new Blob([dat], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "BYD_Horizon_Companion.html";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 400);
                    }
                    setDownloadProgress(currentProgress);
                  }, 120);
                }}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition uppercase text-center cursor-pointer font-mono shadow-md shadow-blue-900/40"
              >
                Install Now
              </button>
              <button 
                id="installer-cancel-btn"
                onClick={() => {
                  setShowInstallerPopup(false);
                  localStorage.setItem("horizon_installer_dismissed", "true");
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-300 font-bold rounded-lg transition uppercase text-center cursor-pointer font-mono"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
