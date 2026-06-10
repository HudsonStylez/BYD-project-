import React, { useState, useEffect, useRef } from "react";
import { MapPin, Users, Heart, Gift, ExternalLink, ShieldCheck, MailWarning, Compass, ShieldAlert, Copy, RefreshCw, Eye, EyeOff, Award, CheckCircle, Clock, Lock, Video, Flame, Shield, Monitor, Camera, Wallet, CreditCard, ArrowUpRight, Ship, Anchor, Upload, FileText, Settings, Download, Sparkles, Smile, MessageSquare, ArrowRight, Menu } from "lucide-react";
import { DashboardData, RewardItem } from "../types";

// Import new modular custom elements
import { LiveTrackingMap } from "./map/LiveTrackingMap";
import { DelayBanner } from "./map/DelayBanner";
import { LiveWebcamGrid } from "./live/LiveWebcamGrid";
import { TransitUpdatePanel } from "./dashboard/TransitUpdatePanel";
import { CarInspectSection } from "./cars/CarInspectSection";
import { DailyCheckin } from "./gamification/DailyCheckin";
import { SpinWheel } from "./gamification/SpinWheel";
import { BYDQuiz } from "./gamification/BYDQuiz";
import { NotificationBell } from "./ui/NotificationBell";
import HelpPage from "./HelpPage";

interface UserDashboardProps {
  authToken: string;
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

const cameraUrls = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80", // highway dusk
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80", // mountain pass road
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=400&q=80", // aerial high road
  "https://images.unsplash.com/photo-1422405913333-f15ae8b1a907?auto=format&fit=crop&w=400&q=80", // coastal highway
];

const fakeReferralsToasts = [
  { user: "Sarah_Seal", friend: "Toby_J", amount: 50 },
  { user: "Leo_Drive", friend: "Aaron_B", amount: 50 },
  { user: "EcoRiderMax", friend: "Jenn_K", amount: 50 },
  { user: "VoltPioneer", friend: "Luke_S", amount: 50 },
];

const getAvatarUrl = (name: string) => {
  const hash = (name || "User").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heads = [
    "1534528741775-53994a69daeb",
    "1506794778202-cad84cf45f1d",
    "1494790108377-be9c29b29330",
    "1507003211169-0a1dd7228f2d",
    "1438761681033-6461ffad8d80",
    "1500648767791-00dcc994a43e",
  ];
  return `https://images.unsplash.com/photo-${heads[hash % heads.length]}?auto=format&fit=crop&w=80&h=80&q=80`;
};

export default function UserDashboard({ authToken, onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "tracking"
    | "fleet"
    | "rent"
    | "gallery"
    | "donation"
    | "invest"
    | "webcams"
    | "car-inspect"
    | "gamification"
    | "referrals"
    | "rewards"
    | "support"
    | "wallet"
    | "insurance"
    | "settings"
    | "campaigns"
  >("tracking");
  
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Collapsible settings tabs: profile, privacy, downloads
  const [settingsTabSection, setSettingsTabSection] = useState<"profile" | "privacy" | "downloads">("profile");

  // KYC restriction popup
  const [kycPopupOpen, setKycPopupOpen] = useState(false);
  const [kycModalTabName, setKycModalTabName] = useState("");

  const handleTabClick = (tab: any) => {
    if (
      data?.user?.kyc_status !== "verified" &&
      tab !== "tracking" &&
      tab !== "fleet" &&
      tab !== "gallery" &&
      tab !== "rent" &&
      tab !== "invest" &&
      tab !== "donation" &&
      tab !== "support" &&
      tab !== "wallet" &&
      tab !== "settings" &&
      tab !== "campaigns"
    ) {
      setKycModalTabName(
        tab === "webcams" ? "Live Telepresence Grid" :
        tab === "car-inspect" ? "HD Component Inspect" :
        tab === "gamification" ? "Club Game Rewards" :
        tab === "referrals" ? "Referrals Dashboard" :
        tab === "rewards" ? "Points Rewards Store" :
        tab === "insurance" ? "Insurance Policies" : tab
      );
      setKycPopupOpen(true);
      return;
    }
    setActiveTab(tab);
    setMenuOpen(false); // Close dropdown menu selection on click
  };

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState<RewardItem[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [expediteLoading, setExpediteLoading] = useState(false);

  const [announcement, setAnnouncement] = useState("");
  const [appName, setAppName] = useState("BYD Horizon Club");
  
  // Balance privacy/hashing state
  const [hideBalances, setHideBalances] = useState(() => {
    return localStorage.getItem("byd_hide_balances") === "true";
  });

  const [guideStep, setGuideStep] = useState<number>(0);
  const [guideFinished, setGuideFinished] = useState<boolean>(() => {
    return localStorage.getItem("byd_guide_finished") === "true";
  });

  const handleFinishGuide = () => {
    setGuideFinished(true);
    localStorage.setItem("byd_guide_finished", "true");
  };

  const handleToggleHideBalances = () => {
    setHideBalances(prev => {
      const next = !prev;
      localStorage.setItem("byd_hide_balances", String(next));
      return next;
    });
  };

  const formatBalance = (val: number, isCurrency = true) => {
    if (hideBalances) {
      // Deterministic technical security hash based on value representation
      const str = val.toString();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
      }
      const hexHash = Math.abs(hash).toString(16).substring(0, 6).toUpperCase();
      return `[HASH:${hexHash}]`;
    }
    return isCurrency ? `$${val.toFixed(2)} USD` : `${val.toLocaleString()} pts`;
  };

  // --- FLEET SHOWROOM, CART & RECOMMENDATION STATES ---
  const [cartItem, setCartItem] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Gallery view states
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Venture portfolios
  const [activeInvestments, setActiveInvestments] = useState<any[]>(() => {
    const saved = localStorage.getItem("byd_investments");
    return saved ? JSON.parse(saved) : [];
  });
  const [investAmount, setInvestAmount] = useState<string>("500");
  const [investSuccess, setInvestSuccess] = useState<string | null>(null);

  // Rental states
  const [rentSelectedCar, setRentSelectedCar] = useState<any>(null);
  const [rentDays, setRentDays] = useState<number>(3);
  const [rentSuccess, setRentSuccess] = useState<string | null>(null);
  const [activeRentals, setActiveRentals] = useState<any[]>(() => {
    const saved = localStorage.getItem("byd_rentals");
    return saved ? JSON.parse(saved) : [];
  });

  // Escrow Wallet states
  const [depositAmount, setDepositAmount] = useState<string>("250");
  const [depositCoin, setDepositCoin] = useState<string>("USDT_TRC20");
  const [depositTxHash, setDepositTxHash] = useState<string>("");
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  
  // --- USER SETTINGS CUSTOMIZATION STATES ---
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsCity, setSettingsCity] = useState("");
  const [settingsWallet, setSettingsWallet] = useState("");
  const [settingsIncognito, setSettingsIncognito] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // --- CAMPAIGN & REMARKS & CHARITY DASHBOARD STATES ---
  const [remarksList, setRemarksList] = useState<any[]>([]);
  const [remarksLoading, setRemarksLoading] = useState<boolean>(false);
  const [newRemarkCategory, setNewRemarkCategory] = useState<string>("Vehicle Settle");
  const [newRemarkText, setNewRemarkText] = useState<string>("");
  const [remarkMessage, setRemarkMessage] = useState<string | null>(null);

  // Claim campaign recommendations state
  const [claimedOccasions, setClaimedOccasions] = useState<Record<string, boolean>>({});
  const [claimingOccasion, setClaimingOccasion] = useState<string | null>(null);

  // Dashboard-level Charity Sponsorship states
  const [dashDonationAmount, setDashDonationAmount] = useState<string>("100");
  const [dashSelectedCharityId, setDashSelectedCharityId] = useState<string>("charity_unicef");
  const [dashSelectedCharityName, setDashSelectedCharityName] = useState<string>("UNICEF Children Foster");
  const [dashDonationMethod, setDashDonationMethod] = useState<"card" | "paypal" | "crypto">("crypto");
  const [dashCardNum, setDashCardNum] = useState<string>("");
  const [dashCardCardholder, setDashCardCardholder] = useState<string>("");
  const [dashPaypalEmail, setDashPaypalEmail] = useState<string>("");
  const [dashCryptoTx, setDashCryptoTx] = useState<string>("");
  const [dashDonorNote, setDashDonorNote] = useState<string>("");
  const [dashDonating, setDashDonating] = useState<boolean>(false);
  const [dashDonationMessage, setDashDonationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(() => localStorage.getItem("byd_pwa_installed") === "true");
  const [showPwaPopup, setShowPwaPopup] = useState<boolean>(!localStorage.getItem("byd_pwa_installed"));
  const [installingProgress, setInstallingProgress] = useState<number | null>(null);
  
  // Fake toast referral notification popup
  const [toast, setToast] = useState<{ user: string; friend: string; amount: number } | null>(null);

  // Unsplash Camera snap state
  const [camSnapshotIdx, setCamSnapshotIdx] = useState(0);
  const [camTimestamp, setCamTimestamp] = useState(new Date().toLocaleTimeString());

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const polylineInstanceRef = useRef<any>(null);

  // --- KYC BIOMETRICS WIZARD STATES ---
  const [kycFormExpanded, setKycFormExpanded] = useState(true);
  const [kycForm, setKycForm] = useState({
    name: "Johnathan Doe (Change to your exact name)",
    dob: "1994-11-23",
    nationality: "US",
    idNumber: "US-948201-X (Replace with your Passport No)",
    idFront: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ID_FRONT_DEFAULT</text></svg>",
    idBack: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ID_BACK_SIGNATURE</text></svg>",
    addressProof: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ADDRESS_PROOF_BILL</text></svg>",
  });
  const [frontFileName, setFrontFileName] = useState("");
  const [backFileName, setBackFileName] = useState("");
  const [addressFileName, setAddressFileName] = useState("");

  const handleDocumentChange = (field: "idFront" | "idBack" | "addressProof", file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setKycForm(p => ({ ...p, [field]: reader.result }));
        if (field === "idFront") setFrontFileName(file.name);
        if (field === "idBack") setBackFileName(file.name);
        if (field === "addressProof") setAddressFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const [kycSelfie, setKycSelfie] = useState<string>("");
  const [kycWebcamActive, setKycWebcamActive] = useState(false);
  const [kycVideoStream, setKycVideoStream] = useState<MediaStream | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSuccessMessage, setKycSuccessMessage] = useState<string | null>(null);
  const [kycErrorMessage, setKycErrorMessage] = useState<string | null>(null);

  // Stack of active disruptive compliance alerts
  const [kycAlerts, setKycAlerts] = useState<Array<{ id: number; text: string; sub: string }>>([]);

  // Set default name once user data is retrieved
  useEffect(() => {
    if (data && data.user && !kycForm.name) {
      setKycForm(prev => ({ ...prev, name: data.user.name }));
    }
  }, [data]);

  // Submit KYC handler
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycErrorMessage(null);
    setKycSuccessMessage(null);
    setKycLoading(true);

    if (!kycForm.name || !kycForm.idNumber) {
      setKycErrorMessage("❗ Please fill out all required fields (Full Legal Name and Document Number).");
      setKycLoading(false);
      return;
    }

    try {
      const payload = {
        name: kycForm.name,
        dob: kycForm.dob,
        nationality: kycForm.nationality,
        idNumber: kycForm.idNumber,
        idFront: kycForm.idFront,
        idBack: kycForm.idBack,
        selfie: kycSelfie || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23111827' stroke='%2300E5FF' stroke-width='2'/><path d='M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30z M20 80c0-15 15-20 30-20s30 5 30 20' fill='none' stroke='%2300E5FF' stroke-width='2'/></svg>",
        addressProof: kycForm.addressProof
      };

      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json();

      if (res.ok) {
        setKycSuccessMessage("🎉 Documents submitted successfully! Your account profile is now pending KYC review.");
        loadSummaryData(); // Sync up updated kyc_status on the screen
      } else {
        setKycErrorMessage(resJson.error || "KYC submission failed.");
      }
    } catch {
      setKycErrorMessage("Could not connect to secure verification clearance server.");
    } finally {
      setKycLoading(false);
    }
  };

  // Spawning loop for hovering warnings disabled per developer request to avoid distraction.
  useEffect(() => {
    // Disabled to keep desktop interface smooth and uninterrupted
    return () => {};
  }, [data]);

  // Load Shared Co-owner Victory Remarks
  const loadRemarksList = async () => {
    setRemarksLoading(true);
    try {
      const res = await fetch("/api/remarks");
      if (res.ok) {
        const json = await res.json();
        setRemarksList(json);
      }
    } catch {
      console.error("Failed to load user remarks index.");
    } finally {
      setRemarksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "campaigns") {
      loadRemarksList();
    }
  }, [activeTab]);

  // Load Dashboard Data
  const loadSummaryData = async () => {
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const resJson = await res.json();
      
      if (res.ok) {
        setData(resJson);
      } else {
        alert(resJson.error || "Dashboard authorization failed.");
        onNavigate("landing");
      }
    } catch {
      console.error("Summary fetch connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaryData();
    
    // Fetch products catalog
    fetch("/api/rewards/items")
      .then(res => res.json())
      .then(items => setRewardsList(items))
      .catch(() => {});

    // Fetch public brand customizations
    fetch("/api/public/settings")
      .then(res => res.json())
      .then(settings => {
        if (settings) {
          if (settings.announcement) setAnnouncement(settings.announcement);
          if (settings.app_name) setAppName(settings.app_name);
        }
      })
      .catch(() => {});

    // Browser Notification Permission Request
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [authToken]);

  useEffect(() => {
    if (data?.user) {
      setSettingsName(data.user.name || "");
      setSettingsPhone(data.user.phone || "");
      setSettingsCity(data.user.city || "");
      setSettingsWallet(data.user.crypto_wallet_address || "");
      setSettingsIncognito(!!data.user.is_incognito);
    }
  }, [data?.user?.id]);

  // Handle camera rotating Term Feed
  useEffect(() => {
    const timer = setInterval(() => {
      setCamSnapshotIdx(prev => (prev + 1) % cameraUrls.length);
      setCamTimestamp(new Date().toLocaleTimeString());
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

  // Fake random toast notifications loop
  useEffect(() => {
    const triggerToast = () => {
      const randomToast = fakeReferralsToasts[Math.floor(Math.random() * fakeReferralsToasts.length)];
      setToast(randomToast);
      setTimeout(() => setToast(null), 5000); // clear after 5 sec
    };

    const interval = setInterval(triggerToast, 18000); // every 18 seconds
    // trigger once on load
    const timeout = setTimeout(triggerToast, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Render maps on Tracking data loaded
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !data || !data.user || !mapContainerRef.current || activeTab !== "tracking") return;

    // Destruct user transport points
    const startLat = 33.7431;
    const startLng = -118.2673; // Port of LA
    
    const uCity = (data.user.city || "").toLowerCase();
    const endLat = uCity.includes("seattle") ? 47.6062 :
                 uCity.includes("new york") ? 40.7128 :
                 uCity.includes("san francisco") ? 37.7749 :
                 uCity.includes("austin") ? 30.2672 : 30.2672; // Default Austin, TX
    const endLng = uCity.includes("seattle") ? -122.3321 :
                 uCity.includes("new york") ? -74.0060 :
                 uCity.includes("san francisco") ? -122.4194 :
                 uCity.includes("austin") ? -97.7431 : -97.7431;

    // Generate Route spline
    const routePoints: Array<[number, number]> = [];
    for (let i = 0; i <= 100; i++) {
      const ratio = i / 100;
      const wobbleLat = Math.sin(ratio * Math.PI) * 1.5;
      const wobbleLng = -Math.sin(ratio * Math.PI) * 1.0;
      routePoints.push([
        startLat + (endLat - startLat) * ratio + wobbleLat,
        startLng + (endLng - startLng) * ratio + wobbleLng
      ]);
    }

    const routeIndex = data.tracking ? data.tracking.route_index : 0;
    const currentPos = routePoints[routeIndex] || [startLat, startLng];

    // Initialize Map element
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(currentPos, 4);

      // Load clean dark mode OpenStreetMap tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView(currentPos);
    }

    // Dynamic Polyline Drawing
    if (polylineInstanceRef.current) {
      polylineInstanceRef.current.setLatLngs(routePoints);
    } else {
      polylineInstanceRef.current = L.polyline(routePoints, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);
    }

    // Dynamic Customized Marker
    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-6 w-6 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
          <div class="h-4 w-4 rounded-full bg-blue-600 border border-slate-950 flex items-center justify-center text-[8px] font-bold text-white">EV</div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24]
    });

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng(currentPos);
    } else {
      markerInstanceRef.current = L.marker(currentPos, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`🚀 BYD Fleet Trans-Transit: Cargo stage ${routeIndex}% completed.`)
        .openPopup();
    }

    // Force map resize adjustment
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      // Keep map persisted for seamless updates but align markers
    };
  }, [data, activeTab]);

  // Request Expedite logic handler (Crypto pop)
  const handleExpedite = async () => {
    setExpediteLoading(true);
    try {
      const res = await fetch("/api/tracking/expedite", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`
        }
      });
      const expediteRes = await res.json();
      if (res.ok) {
        alert(`Logistic clearance override broadcast! Address to settle hold fee of 49.00 USDT: ${expediteRes.wallet_address}. We have updated your transit priorities.`);
        loadSummaryData(); // refresh dashboard
      } else {
        alert(expediteRes.error || "Expedite initialization error.");
      }
    } catch {
      alert("Error bypassing logistics holds.");
    } finally {
      setExpediteLoading(false);
    }
  };

  // Redeem Reward Product
  const handleRedeemReward = async (itemId: number) => {
    setRedeemSuccess(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ itemId })
      });
      
      const resJson = await res.json();
      if (res.ok) {
        setRedeemSuccess(`${resJson.message} Tracking reference allocated: ${resJson.tracking_number}`);
        loadSummaryData(); // update points balances
      } else {
        alert(resJson.error || "Redemption request declined.");
      }
    } catch {
      alert("Unable to redeem item.");
    }
  };

  const handleDispatchPackage = async (redemptionId: number, fee: number) => {
    try {
      const res = await fetch("/api/dispatch/package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ redemptionId, fee })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message || "Cargo dispatched successfully!");
        loadSummaryData();
      } else {
        if (resJson.error && resJson.error.toLowerCase().includes("insufficient")) {
          if (confirm(`${resJson.error}\n\nWould you like to open your Wallet Escrow Hub to make a quick cryptocurrency top-up?`)) {
            setActiveTab("wallet");
          }
        } else {
          alert(resJson.error || "Unable to dispatch.");
        }
      }
    } catch {
      alert("Escrow clearance dispatch execution error.");
    }
  };

  const handleDepositProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositTxHash) {
      alert("Please supply both a deposit amount and a blockchain transaction hash.");
      return;
    }
    setDepositSubmitting(true);
    try {
      const res = await fetch("/api/payments/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          transactionHash: depositTxHash,
          coin: depositCoin
        })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(`Deposit proof recorded! Payment ID #${resJson.paymentId || "pending"} queued. Transfer will be credited to your balance instantly once the administrator approves this hash.`);
        setDepositTxHash("");
        loadSummaryData(); // update ledger and balance states
      } else {
        alert(resJson.error || "Unable to submit crypto deposit proof.");
      }
    } catch {
      alert("Error logging cryptocurrency deposit.");
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handlePurchaseInsurance = async (planName: string, premium: number, limit: number) => {
    const carModel = data?.activeVehicle?.model || "BYD Seal AWD Executive";
    if (!confirm(`Are you sure you want to purchase "${planName}" protection coverage for your vehicle (${carModel})?\n\nFirst premium of $${premium.toFixed(2)} USD will be deducted instantly from your Wallet Escrow Hub Balance.`)) {
      return;
    }
    try {
      const res = await fetch("/api/insurance/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ carModel, planName, premium, limit })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message || "Insurance policy established successfully!");
        loadSummaryData(); // update stats, balances, and policies
      } else {
        if (resJson.error && resJson.error.toLowerCase().includes("insufficient")) {
          if (confirm(`${resJson.error}\n\nWould you like to open your Wallet Escrow Hub to make a quick cryptocurrency top-up?`)) {
            setActiveTab("wallet");
          }
        } else {
          alert(resJson.error || "Establishment of insurance plan rejected.");
        }
      }
    } catch {
      alert("Error establishing insurance policy.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Referral code copied successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="font-mono text-xs text-slate-500">Decrypting Horizon Nodes...</span>
      </div>
    );
  }

  if (!data) return null;

  const userExpiryDate = data.user.membership_expiry 
    ? new Date(data.user.membership_expiry).toLocaleDateString()
    : "December 2026 (Trial Mode)";

  return (
    <div className="w-full relative" id="user-dashboard">
      
      {/* Referral toast popup */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-xs text-slate-200 animate-bounce">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <div>
            <span className="text-emerald-400 font-bold">@{toast.user}</span> just earned <span className="text-white font-mono font-bold">$50.00</span> by referring <span className="text-blue-400">@{toast.friend}</span>!
          </div>
        </div>
      )}

      {/* Dynamic Global Announcement Banner */}
      {announcement && (
        <div className="mb-6 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-2xl p-4 flex items-center gap-3 animate-fade-in shadow-lg">
          <div className="p-1 px-2.5 bg-amber-500 text-black text-[9px] font-black uppercase rounded-lg tracking-widest leading-none font-mono flex items-center h-4.5 shrink-0 select-none">
            NOTICE BROADCAST
          </div>
          <div className="text-xs font-sans font-semibold leading-relaxed flex-1">
            {announcement}
          </div>
        </div>
      )}

      {/* Header Dashboard panel */}
      <header className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-lg mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">Welcome, {data.user.name}</h1>
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              {data.user.membership_active ? "Club Member" : "Guest Account"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-mono">
            <span>Membership Active Until: {userExpiryDate}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Privacy / Balance Masking Toggle Button */}
          <button
            onClick={handleToggleHideBalances}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 text-slate-400 hover:text-white transition flex items-center space-x-1.5 text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-sm focus:outline-none"
            title={hideBalances ? "Show actual balances" : "Hide/Hash balances on dashboard"}
          >
            {hideBalances ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Decrypt UI</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Encrypt Display</span>
              </>
            )}
          </button>

          <NotificationBell authToken={authToken} />
          
          <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-xl flex flex-col items-end">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Your Horizon Points</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
              {formatBalance(data.user.horizon_points || 0, false)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">1,000 points = $10 catalog value</span>
          </div>
        </div>
      </header>

      {/* Primary layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Responsive Drawer/Sidebar Selector */}
        <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold block">CONSTRUCT CONTROL PANEL</span>
              <h4 className="text-[11px] font-mono text-cyan-400 font-bold uppercase mt-0.5">
                Active: {
                  activeTab === "tracking" ? "Logistics Map" :
                  activeTab === "fleet" ? "Fleet Showroom" :
                  activeTab === "rent" ? "Rental Hub" :
                  activeTab === "gallery" ? "BYD Gallery" :
                  activeTab === "donation" ? "Donation Centre" :
                  activeTab === "invest" ? "Venture Port" :
                  activeTab === "webcams" ? "Telepresence Grid" :
                  activeTab === "car-inspect" ? "Component Inspector" :
                  activeTab === "gamification" ? "Play & Earn" :
                  activeTab === "referrals" ? "Referrals Log" :
                  activeTab === "rewards" ? "Redemption Catalog" :
                  activeTab === "insurance" ? "Insurance Center" :
                  activeTab === "wallet" ? "Secure Wallet" :
                  activeTab === "campaigns" ? "Outreach Lab" :
                  activeTab === "settings" ? "Profile Config" : "Help Desk"
                }
              </h4>
            </div>

            <button
              id="menu-toggle-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
              className="py-2.5 px-5 bg-[#0e1629] border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 text-xs font-mono font-black text-cyan-300 hover:text-cyan-205 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-cyan-500/10 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Menu className="w-3.5 h-3.5 text-cyan-405 animate-pulse" />
              <span className="tracking-widest">{menuOpen ? "CLOSE PANEL" : "DECK MENU"}</span>
              <span className="text-cyan-400 text-[10px]">{menuOpen ? "▲" : "▼"}</span>
            </button>
          </div>

          {(menuOpen || true) && (
            <div className={`transition-all duration-300 space-y-4 pt-3 border-t border-slate-800/60 ${menuOpen ? "block" : "hidden lg:block"}`}>
              
              {/* CATEGORY 1: Logistics & Fleet */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold block px-2.5 pb-1">Logistics & Fleet</span>
                <button 
                  id="nav-tracking"
                  onClick={() => handleTabClick("tracking")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "tracking" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Logistics GPS Map</span>
                </button>
                <button 
                  id="nav-fleet"
                  onClick={() => handleTabClick("fleet")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "fleet" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Ship className="w-4 h-4" />
                  <span>Fleet showroom</span>
                </button>
                <button 
                  id="nav-rent"
                  onClick={() => handleTabClick("rent")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "rent" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Rent recommendations</span>
                </button>
              </div>

              {/* CATEGORY 2: Ecosystem & Philanthropy */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold block px-2.5 pb-1">Ecosystem & Society</span>
                <button 
                  id="nav-gallery"
                  onClick={() => handleTabClick("gallery")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "gallery" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Art of BYD Gallery</span>
                </button>
                <button 
                  id="nav-donation"
                  onClick={() => handleTabClick("donation")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "donation" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Donation Centre</span>
                </button>
                <button 
                  id="nav-invest"
                  onClick={() => handleTabClick("invest")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "invest" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Venture Investment</span>
                </button>
              </div>

              {/* CATEGORY 3: Telematics & Protection */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold block px-2.5 pb-1">Telematics & Protection</span>
                <button 
                  id="nav-webcams"
                  onClick={() => handleTabClick("webcams")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "webcams" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Video className="w-4 h-4" />
                  <span>Live Telepresence</span>
                </button>
                <button 
                  id="nav-car-inspect"
                  onClick={() => handleTabClick("car-inspect")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "car-inspect" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Component Inspect</span>
                </button>
                <button 
                  id="nav-insurance"
                  onClick={() => handleTabClick("insurance")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "insurance" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Insurance Center</span>
                </button>
              </div>

              {/* CATEGORY 4: Gamification & Expansion */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold block px-2.5 pb-1">Rewards & Expansion</span>
                <button 
                  id="nav-campaigns"
                  onClick={() => handleTabClick("campaigns")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "campaigns" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Outreach campaigns</span>
                </button>
                <button 
                  id="nav-gamification"
                  onClick={() => handleTabClick("gamification")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "gamification" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Play & Earn Games</span>
                </button>
                <button 
                  id="nav-referrals"
                  onClick={() => handleTabClick("referrals")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "referrals" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Referrals Log</span>
                </button>
                <button 
                  id="nav-rewards"
                  onClick={() => handleTabClick("rewards")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "rewards" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Redemptions store</span>
                </button>
              </div>

              {/* CATEGORY 5: Personal Portal */}
              <div className="space-y-1 text-slate-500 pt-1 border-t border-slate-800/60">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold block px-2.5 pb-1">Secured Account</span>
                <button 
                  id="nav-wallet"
                  onClick={() => handleTabClick("wallet")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "wallet" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Secure Wallet Balance</span>
                </button>
                <button 
                  id="nav-settings"
                  onClick={() => handleTabClick("settings")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "settings" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                <button 
                  id="nav-support"
                  onClick={() => handleTabClick("support")}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2.5 transition duration-150 ${activeTab === "support" ? "bg-cyan-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Support Center FAQs</span>
                </button>
              </div>

            </div>
          )}
        </aside>

        {/* Dashboard Main display portal */}
        <div className="lg:col-span-9 space-y-6">

          {/* Professional First-time Onboarding & Feature Guide */}
          {data && data.user && !guideFinished && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl animate-fade-in text-left">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 flex items-center justify-center h-8 w-8">
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight font-display flex items-center space-x-1.5">
                      <span>🧭 DOCKYARD WALKTHROUGH GUIDE</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-full font-mono">First-Time User Guide</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">Horizon Club Telematics Network walk-map</p>
                  </div>
                </div>

                <button 
                  onClick={handleFinishGuide}
                  className="text-[10px] font-mono text-slate-400 hover:text-white transition uppercase hover:underline cursor-pointer"
                >
                  Dismiss Guide ✕
                </button>
              </div>

              {/* Bento style guided content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Step options navigation (left) */}
                <div className="md:col-span-4 flex flex-col space-y-2 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-1">Guided Explorer</span>
                  
                  <button 
                    type="button"
                    onClick={() => setGuideStep(0)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${guideStep === 0 ? "bg-slate-950 border border-emerald-500/30 text-emerald-400" : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                  >
                    1. 🧭 Navigation & Starting
                  </button>

                  <button 
                    type="button"
                    onClick={() => setGuideStep(1)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${guideStep === 1 ? "bg-slate-950 border border-emerald-500/30 text-emerald-400" : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                  >
                    2. 📊 Shipping Tracker GPS
                  </button>

                  <button 
                    type="button"
                    onClick={() => setGuideStep(2)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${guideStep === 2 ? "bg-slate-950 border border-emerald-500/30 text-emerald-400" : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                  >
                    3. 🚗 Fleet Rentals & Rates
                  </button>

                  <button 
                    type="button"
                    onClick={() => setGuideStep(3)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${guideStep === 3 ? "bg-slate-950 border border-emerald-500/30 text-emerald-400" : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                  >
                    4. 💵 VIP Currency Rewards
                  </button>

                  <button 
                    type="button"
                    onClick={() => setGuideStep(4)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${guideStep === 4 ? "bg-slate-950 border border-emerald-500/30 text-emerald-400" : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                  >
                    5. 🌸 Foster Sponsorships
                  </button>
                </div>

                {/* Active step display panel (right) */}
                <div className="md:col-span-8 bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  {guideStep === 0 && (
                    <div className="space-y-2 animate-fade-in text-left">
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">STEP 1 OF 5: DECK OVERVIEW</span>
                      <h5 className="font-display font-bold text-[#F5F5F0] text-sm flex items-center gap-1.5">
                        <span>How to Begin & App Layout Guide</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Welcome to BYD Horizon Club! To get started immediately, use the <strong>Menu Toggle</strong> at the top right of your dashboard to switch panels. Select vehicles in the <strong>Showroom Showcase</strong> to add them to your reservation queue, fill out your KYC form on top of the home stream, and keep checkin histories to accumulate bonuses.
                      </p>
                      <div className="text-[10px] p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 font-mono">
                        💡 Click <strong className="text-white font-bold">"Fleet Showroom"</strong> on the main menu toggle to select co-ownership options.
                      </div>
                    </div>
                  )}

                  {guideStep === 1 && (
                    <div className="space-y-2 animate-fade-in text-left">
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">STEP 2 OF 5: LOGISTICS</span>
                      <h5 className="font-display font-bold text-[#F5F5F0] text-sm flex items-center gap-1.5">
                        <span>Monitoring & Tracking Investments</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Any confirmed vehicle purchase is logged inside the live telemetry database. Navigate to the <strong>"Live GPS Tracker"</strong> menu view to monitor shipment progression from initial departure harbor docks, open ocean courses, regional terminals, and custom clearing hub checkpoints, updated with actual geographic coordinates.
                      </p>
                      <div className="text-[10px] p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 font-mono">
                        💡 Use <strong className="text-white font-bold">"Expedite Logistics Node"</strong> on the tracking dashboard to speed up transit times.
                      </div>
                    </div>
                  )}

                  {guideStep === 2 && (
                    <div className="space-y-2 animate-fade-in text-left">
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">STEP 3 OF 5: FLEET RENTAL</span>
                      <h5 className="font-display font-bold text-[#F5F5F0] text-sm flex items-center gap-1.5">
                        <span>Rental recommendations & Pricing Scale</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Need temporary mobility? Our system dynamically organizes model categories to match your occupancy, travel duration, and terrain. Rental rates are set per 24 hours (BYD Dolphin Mini: $35/day, BYD Atto: $69/day, BYD Seal Track: $125/day, Yangwang U8 Overland: $349/day). Choose any term under the <strong>"Fleet Rental"</strong> tab.
                      </p>
                      <div className="text-[10px] p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 font-mono">
                        💡 Active rentals can be settled instantly from your pre-funded secure profile wallet.
                      </div>
                    </div>
                  )}

                  {guideStep === 3 && (
                    <div className="space-y-2 animate-fade-in text-left">
                      <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest font-bold">STEP 4 OF 5: BOUNTIES</span>
                      <h5 className="font-display font-bold text-[#F5F5F0] text-sm flex items-center gap-1.5">
                        <span>VIP Profit & Loyalty Reward Cash</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        The points system acts as direct cash back (Reward Cash) on your co-ownership portfolio. The balance renders dynamically converted to your preferred primary currency (USD, EUR, GBP) using our live conversion nodes. Points can only be granted directly by club administrators for active ecosystem participation or system bonuses.
                      </p>
                      <div className="text-[10px] p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 font-mono">
                        💡 View your balance breakdown on the profile banner. Balance hiding hashes protect data completely.
                      </div>
                    </div>
                  )}

                  {guideStep === 4 && (
                    <div className="space-y-2 animate-fade-in text-left">
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">STEP 5 OF 5: CHARITY PROGRAM</span>
                      <h5 className="font-display font-bold text-[#F5F5F0] text-sm flex items-center gap-1.5">
                        <span>foster Sponsorship Donations Centre</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Settle direct community foster home sponsorships under the <strong>"Donation Centre"</strong>. Sponsoring foster care helps support children education, nutrition, and safe boarding structures globally. Secure wallet deposit links (USDT, BTC) and standard card payment methods are available. Sponsoring community causes builds noble reputation logs.
                      </p>
                      <div className="text-[10px] p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 font-mono">
                        💡 Submitting foster donations adds verified goodwill credits and qualifies your profile for VIP promotions.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                    <button 
                      type="button"
                      disabled={guideStep === 0}
                      onClick={() => setGuideStep(p => p - 1)}
                      className="px-3 py-1 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono disabled:opacity-40 select-none cursor-pointer"
                    >
                      ◀ Previous
                    </button>

                    <div className="flex gap-1 select-none font-mono">
                      {[0, 1, 2, 3, 4].map(idx => (
                        <span key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === guideStep ? "bg-emerald-400 w-3" : "bg-slate-700"}`} />
                      ))}
                    </div>

                    {guideStep === 4 ? (
                      <button 
                        type="button"
                        onClick={handleFinishGuide}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-[10px] font-mono font-bold select-none cursor-pointer"
                      >
                        Finish Guide ✓
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setGuideStep(p => p + 1)}
                        className="px-3 py-1 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono select-none cursor-pointer"
                      >
                        Next Step ▶
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Prominent Compliance KYC Alert-Disruptor & Wizard */}
          {data && data.user && data.user.kyc_status !== "verified" && (
            <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-red-950/20">
              {/* Pulsing alarm bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4 border-b border-red-500/20 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-red-950/40 p-2 rounded-lg border border-red-500/40 animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight uppercase font-mono">
                      🔴 KYC: Biometric Identity Clearance Required
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Security Level: High • Status: <span className="text-red-400 uppercase font-bold">{data.user.kyc_status || "not_submitted"}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setKycFormExpanded(!kycFormExpanded)}
                  className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] rounded-lg border border-red-500/20 font-mono font-bold transition cursor-pointer"
                >
                  {kycFormExpanded ? "Collapse Compliance Box" : "Expand Compliance Box"}
                </button>
              </div>

              {!kycFormExpanded && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between text-[11px] text-slate-350 font-sans leading-relaxed animate-fade-in text-left">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>⚠️ <strong>Security Advisory holding:</strong> Standard access restricted. Please select <strong>"Expand Compliance Box"</strong> to fill your legal details and complete verification.</span>
                  </span>
                  <button 
                    onClick={() => setKycFormExpanded(true)}
                    className="ml-4 shrink-0 px-2 py-1 bg-red-600/90 text-white font-mono text-[9px] font-bold rounded hover:bg-red-555 uppercase tracking-wide transition"
                  >
                    Open Form
                  </button>
                </div>
              )}

              {kycFormExpanded && (
                <div className="space-y-4 text-xs">
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    <strong>Notice:</strong> Your portfolio is currently restricted to demo sandbox protocols. Until biometric verification is audited, logistics map routing and premium redemptions remain locked. Please complete the secure terminal below to submit your details for verification.
                  </p>

                  <form onSubmit={handleKycSubmit} className="space-y-4 pt-3 border-t border-slate-800">
                    {kycSuccessMessage && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl leading-relaxed text-[11px]">
                        {kycSuccessMessage}
                      </div>
                    )}
                    
                    {kycErrorMessage && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl leading-relaxed text-[11px]">
                        {kycErrorMessage}
                      </div>
                    )}

                    {data.user.kyc_status === "pending" && (
                      <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex flex-col items-center text-center space-y-2">
                        <Clock className="w-8 h-8 text-blue-400 animate-spin" />
                        <h4 className="text-xs font-bold text-blue-300 uppercase font-mono">Biometric Screening Under Audit</h4>
                        <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                          KYC Status: <span className="font-bold text-amber-400">PENDING KYC COMPLIANCE REVIEW</span>. Your verification materials are currently queued for regulatory review. This process is typically finalized within 24 hours.
                        </p>
                      </div>
                    )}

                    {data.user.kyc_status !== "pending" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1 font-bold">Full Legal Name (as in Passport/ID) *</label>
                            <input
                              type="text"
                              required
                              value={kycForm.name}
                              onChange={e => setKycForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                              placeholder="Johnathan Doe"
                            />
                            <p className="text-[8px] text-slate-500 mt-1 font-sans">
                              👉 Enter your exact name as printed on legal documents. Change default mockup data before submit.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1 font-bold">Date of Birth *</label>
                            <input
                              type="date"
                              required
                              value={kycForm.dob}
                              onChange={e => setKycForm(p => ({ ...p, dob: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                            />
                            <p className="text-[8px] text-slate-500 mt-1 font-sans">
                              👉 Minimum regulatory compliance age is 18 years old.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1 font-bold">Identity Document / Passport Number *</label>
                            <input
                              type="text"
                              required
                              placeholder="US-738201-9"
                              value={kycForm.idNumber}
                              onChange={e => setKycForm(p => ({ ...p, idNumber: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                            />
                            <p className="text-[8px] text-slate-500 mt-1 font-sans">
                              👉 Ensure correct alphanumeric formatting. Fill your real ID number.
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={kycLoading}
                              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-500/10 cursor-pointer animate-pulse"
                            >
                              {kycLoading ? "Submitting Clearances..." : "Authorize and Submit KYC Case File"}
                            </button>
                          </div>
                        </div>

                        {/* Informational Guidance Manual (Replacer of Biometric selfie box) */}
                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between space-y-4 text-left">
                          <div>
                            <h4 className="text-[10px] text-red-400 uppercase font-mono tracking-wider font-extrabold flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                              Compliance Guide: KYC Verification Guidelines
                            </h4>
                            <ul className="mt-3.5 space-y-2.5 text-[10px] text-slate-400 font-sans leading-normal">
                              <li className="flex items-start gap-1.5">
                                <span className="text-red-500 shrink-0">•</span>
                                <span>
                                  <strong>Document Validity:</strong> Passports and Identity cards must have at least 6 months of valid life sequence remaining.
                                </span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-red-500 shrink-0">•</span>
                                <span>
                                  <strong>Placeholder Data Notice:</strong> The input fields contain preloaded mock default parameters. You <strong className="text-white">MUST rewrite</strong> them with your authentic details before committing parameters.
                                </span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-red-500 shrink-0">•</span>
                                <span>
                                  <strong>Required Uploads:</strong> Selecting files in the slots below is required to pass verification criteria. Drag-and-drop or select authentic scan attachments.
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-[#1c1212]/45 border border-red-950/20 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-red-405 font-black block">Liveness Check Status</span>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Liveness webcam video check bypassed. Submission requires verified documentation files only.
                            </p>
                          </div>
                        </div>

                        {/* Legal Verification Documents Row */}
                        <div className="col-span-1 md:col-span-2 border-t border-slate-900 pt-4 mt-2">
                          <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2.5 text-left">Legal Verification Documents (Optional Passport, Driving License & Proof of Residence files)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            
                            {/* ID Front */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("idFront", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Passport / ID Front</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {frontFileName ? `✓ ${frontFileName}` : "Click to select file"}
                              </span>
                            </label>

                            {/* ID Back */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("idBack", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Passport / ID Back</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {backFileName ? `✓ ${backFileName}` : "Click to select file"}
                              </span>
                            </label>

                            {/* Utility Bill Address Proof */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("addressProof", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Proof of Address</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {addressFileName ? `✓ ${addressFileName}` : "Click to select bill"}
                              </span>
                            </label>

                          </div>
                        </div>

                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              {/* Vehicle configuration hold summaries */}
              {data.activeVehicle || data.tracking ? (
                <div className="space-y-6">
                  {/* Real-time Delay Banner alerts custom module */}
                  <DelayBanner
                    authToken={authToken}
                    delaysEncountered={data.tracking ? data.tracking.delays_encountered : 0}
                    expeditePaid={data.tracking ? data.tracking.expedite_paid : false}
                    walletAddress={data.user ? data.user.crypto_wallet_address : ""}
                    onRefresh={loadSummaryData}
                  />

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">In Transit Cargo</span>
                        <h3 className="font-display font-semibold text-lg sm:text-xl text-white mt-1">
                          {data.activeVehicle ? data.activeVehicle.model : "Horizon Secured Reward Package"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-mono">
                          Global serial index: <span className="text-slate-300">#BYD-{data.user.id * 13}-HN</span>
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 max-w-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Standard Scheduled Porting</span>
                        <span className="text-base sm:text-lg font-bold text-slate-300 font-mono block mt-0.5">
                          {data.activeVehicle ? data.activeVehicle.expectedDeliveryDate : "4-6 Business Days"} 
                          {data.tracking && data.tracking.delays_encountered > 0 && !data.tracking.expedite_paid && (
                            <span className="text-[11px] text-orange-400 block sm:inline font-bold font-semibold"> ★ Delayed</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-normal block italic mt-1 font-mono">Due to logistics grid congestions, expected carrier arrival dates shift.</span>
                      </div>
                    </div>
                  </div>

                  {/* Co-ownership Installment Ledger */}
                  {data.activeVehicle ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/60 pb-4">
                        <div>
                          <h4 className="font-display font-semibold text-xs text-slate-100 uppercase tracking-widest font-mono">Active Co-ownership Dues Ledger</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                            Track your monthly cryptocurrency fulfillment schedule and security statuses below.
                          </p>
                        </div>
                        <div className="text-right font-mono mt-2 sm:mt-0">
                          <span className="text-[10px] text-slate-500 uppercase block">Fulfillment Ratio</span>
                          <span className="text-blue-400 font-bold text-sm">
                            ${data.activeVehicle.totalPaid.toLocaleString()} / ${(data.activeVehicle.monthlyPayment * data.activeVehicle.installmentCount).toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left text-slate-300">
                          <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 font-bold">
                            <tr>
                              <th className="p-2">Settlement Index</th>
                              <th className="p-2">Scheduled Due Date</th>
                              <th className="p-2">Monthly Dues Settle</th>
                              <th className="p-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {Array.from({ length: Math.min(6, data.activeVehicle.installmentCount) }).map((_, i) => {
                              const isFirst = i === 0;
                              const indexNum = i + 1;
                              const amountForThis = data.activeVehicle.monthlyPayment;
                              const cumulNeeded = amountForThis * indexNum;
                              let statusStr = "Pending";
                              let statusColor = "text-slate-500";

                              if (data.activeVehicle.totalPaid >= cumulNeeded) {
                                statusStr = "Paid 🎉";
                                statusColor = "text-emerald-400 font-bold";
                              } else if (isFirst || data.activeVehicle.totalPaid >= cumulNeeded - amountForThis) {
                                statusStr = "Due Now (Payable)";
                                statusColor = "text-amber-400 font-bold animate-pulse";
                              } else {
                                statusStr = "Queued";
                                statusColor = "text-slate-600";
                              }

                              // Calculate mock future calendar dates
                              const mockDate = new Date(data.activeVehicle.expectedDeliveryDate);
                              mockDate.setMonth(mockDate.getMonth() - Math.min(2, 6 - i)); // stagger
                              
                              return (
                                <tr key={i} className="hover:bg-slate-950/20">
                                  <td className="p-2.5">
                                    Dues {String(indexNum).padStart(2, "0")} 
                                    {isFirst && <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/20 ml-2">Downpayment</span>}
                                  </td>
                                  <td className="p-2.5 font-mono text-slate-400">{mockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                  <td className="p-2.5 font-bold text-white">${amountForThis.toFixed(2)} USDT</td>
                                  <td className={`p-2.5 text-right font-semibold ${statusColor}`}>{statusStr}</td>
                                </tr>
                              );
                            })}
                            {data.activeVehicle.installmentCount > 6 && (
                              <tr>
                                <td className="p-2 text-slate-500" colSpan={4}>+ {data.activeVehicle.installmentCount - 6} subsequent recurring months scheduled inside master registry ledger.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pay subsequent button */}
                      {data.activeVehicle.totalPaid < (data.activeVehicle.monthlyPayment * data.activeVehicle.installmentCount) && (
                        <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850/65 gap-4">
                          <div className="flex items-center space-x-2 text-xs text-orange-400 font-bold max-w-md">
                            <MailWarning className="w-5 h-5 flex-shrink-0" />
                            <span>Attention: Timely monthly installment settlement is strictly required to hold active logistics priority.</span>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/payments/create", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                  },
                                  body: JSON.stringify({
                                    method: "crypto",
                                    type: "installment",
                                    amount: data!.activeVehicle!.monthlyPayment,
                                    vehicleModel: data!.activeVehicle!.model,
                                    monthlyInstallment: data!.activeVehicle!.monthlyPayment,
                                    termMonths: data!.activeVehicle!.installmentCount
                                  })
                                });
                                const payData = await res.json();
                                if (res.ok) {
                                  alert(`Subsequent monthly escrow wallet allocated!\n\nUSDT Deposit Address: ${payData.wallet_address}\nTransaction Memo: ${payData.transaction_hash}\n\nPay precisely $${data!.activeVehicle!.monthlyPayment} USDT. Your deposit will be fully audited and credited automatically.`);
                                  loadSummaryData();
                                } else {
                                  alert(payData.error);
                                }
                              } catch {
                                alert("Escrow setup connection failure.");
                              }
                            }}
                            className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 font-bold text-[10px] uppercase font-mono tracking-wider text-white rounded-lg shadow-lg shadow-emerald-950/20 transition flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>Settle Monthly Dues Via Crypto</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/60 pb-4">
                        <div>
                          <h4 className="font-display font-semibold text-xs text-slate-100 uppercase tracking-widest font-mono">Secured Reward Cargo Consignments</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                            All priority dispatched accessory rewards and hardware assets are listed inside this cargo transit grid.
                          </p>
                        </div>
                        <div className="text-right font-mono mt-2 sm:mt-0">
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Cargo Router Status</span>
                          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                            Active GPS Stream
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 font-mono text-[11px]">
                        {data.redemptions && data.redemptions.filter(r => r.status === "Shipped").length > 0 ? (
                          data.redemptions.filter(r => r.status === "Shipped").map((red, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-100 text-sm block">{red.item_name}</span>
                                <span className="text-[10px] text-slate-500 block">ID: #{red.id} • Transit Route: {red.tracking_number}</span>
                              </div>
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 rounded text-[9px] uppercase font-bold">
                                🚚 In-transit Cargo
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-xs text-slate-600 font-mono">
                            No dispatch-cleared packages active. Settle cargo tariff below to trigger satellite updates any time.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Leaflet Simulated Maps Panel - Custom modular maps list */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-[460px] relative">
                    <LiveTrackingMap
                      currentIdx={data.tracking ? data.tracking.route_index : 0}
                      destinationCity={data.activeVehicle ? data.activeVehicle.destination_city : "Chicago Hub"}
                    />
                  </div>

                  {/* Integrated Transit metrics timeline progress and logs */}
                  <TransitUpdatePanel
                    authToken={authToken}
                    routeIndex={data.tracking ? data.tracking.route_index : 0}
                    delaysEncountered={data.tracking ? data.tracking.delays_encountered : 0}
                    expeditePaid={data.tracking ? data.tracking.expedite_paid : false}
                    destinationCity={data.activeVehicle ? data.activeVehicle.destination_city : "Chicago Terminal"}
                  />
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl text-center space-y-4">
                  <Clock className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <div>
                    <h4 className="font-display font-bold text-slate-300">No Carrier Active</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      You do not have any vehicle hardware co-ownership installments configured yet. Settle down payment steps to initialize transit maps.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate("payment")}
                    className="py-1.5 px-4 bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white rounded hover:bg-slate-700 transition"
                  >
                    Select Installment Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "webcams" && (
            <div className="space-y-6 animate-fade-in">
              <LiveWebcamGrid authToken={authToken} />
            </div>
          )}

          {activeTab === "car-inspect" && (
            <div className="space-y-6 animate-fade-in">
              <CarInspectSection model={data.activeVehicle ? data.activeVehicle.model : "BYD Seal"} />
            </div>
          )}

          {activeTab === "gamification" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-fade-in">
              <DailyCheckin
                authToken={authToken}
                points={data.user ? data.user.horizon_points : 0}
                onCheckinSuccess={(newPts) => {
                  setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                }}
              />
              <div className="space-y-6">
                <SpinWheel
                  authToken={authToken}
                  onSpinSuccess={(newPts) => {
                    setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                  }}
                />
                <BYDQuiz
                  authToken={authToken}
                  onQuizSuccess={(newPts) => {
                    setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Consolidated Refer & Earn Node Program</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal max-w-xl">
                    Invite users to the BYD Horizon Club. Settle direct dividends of $50.00 cash securely as estimated earnings upon verified payment steps.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Referral Link copy card */}
                  <div className="sm:col-span-2 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500">Your Shareable Node URL Link</span>
                      <div className="text-xs text-white font-mono flex justify-between bg-slate-900 p-2.5 rounded mt-1.5 border border-slate-800 truncate">
                        <span>{window.location.origin}/?ref={data.referralStats.code}</span>
                        <button onClick={() => copyToClipboard(data.referralStats.code)} className="text-blue-400 hover:text-blue-300 font-mono text-[10px] ml-4 font-bold uppercase transition">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cash metrics balance */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Node Dividends</span>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center space-x-1">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>{formatBalance(data.referralStats.estimatedEarnings)}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1 leading-normal">
                        Locks release automatically upon meeting threshold details.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Withdraw rules card */}
                <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-1.5 ${data.referralStats.withdrawable ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-slate-950/50 border-slate-850/85 text-slate-400"}`}>
                  <span className="text-[10px] text-amber-500 font-bold block font-mono">⛔ DIVIDEND WITHDRAWAL PROTOCOLS LIST:</span>
                  <p>
                    Earnings balances unlock for withdrawal once:
                    <br />• Your estimated rewards account balances sum directly to <span className="font-bold text-white font-mono">$200.00 USD</span> or more.
                    <br />• You have recruited a minimum of <span className="font-bold text-white">5 active referrals</span> who has successfully processed <span className="font-bold text-white font-mono">2+ monthly co-ownership co-finance dues.</span>
                  </p>
                  <div className="pt-2 font-mono text-[9px] text-slate-500">
                    Your account progress status: <span className="text-white bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">Estimated balance: {formatBalance(data.referralStats.estimatedEarnings)} / Required $200.00</span>
                  </div>
                </div>
              </div>

              {/* Leaderboards and history lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invited user list log */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">Simulated Invite Log ledger</h4>
                  <div className="space-y-3 overflow-y-auto max-h-[220px]">
                    {data.referrals.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-600 font-mono">
                        No registered invite nodes logged inside database.
                      </div>
                    ) : (
                      data.referrals.map((r, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold block text-white font-mono">@{r.referred_user_name || "Visitor"}</span>
                            <span className="text-[10px] text-slate-500 truncate font-mono">{r.referred_user_email}</span>
                          </div>
                          <span className={`font-mono text-[10px] p-1 px-2 rounded ${r.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {r.status === "paid" ? "Active (Paid)" : "Awaiting confirm"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Scoreboards global lists */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">Global Recruiter Standings</h4>
                  <div className="space-y-2">
                    {data.leaderboard.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-950/50 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono text-[10px] font-bold h-5 w-5 rounded flex items-center justify-center ${idx < 3 ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                            {idx + 1}
                          </span>
                          <img 
                            src={getAvatarUrl(item.name)} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded-full border border-slate-700 object-cover" 
                          />
                          <span className="font-display font-medium text-slate-300 font-mono block">@{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{item.count} nodes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Points Horizon Rewards Storefront</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                    Redeem complimentary Horizon Points accumulated automatically from payment authorizations. Settle orders instantly with no extra fees.
                  </p>
                </div>
              </div>

              {redeemSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="leading-relaxed">{redeemSuccess}</div>
                </div>
              )}

              {/* Items grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rewardsList.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-950 bg-slate-950 mb-4">
                        <img 
                          referrerPolicy="no-referrer"
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover select-none group-hover:scale-105"
                        />
                      </div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-display font-semibold text-xs sm:text-sm text-white">{item.name}</h4>
                        <span className="bg-blue-950/40 text-blue-400 text-[10px] border border-blue-500/30 font-mono px-2 py-0.5 rounded ml-2 flex-shrink-0">
                          {item.points_cost} points
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center">
                      <span className={`text-[10px] font-mono p-1 rounded px-2 ${item.status === 'In Stock' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={() => handleRedeemReward(item.id)}
                        disabled={item.status === 'Out of Stock' || data.user.horizon_points < item.points_cost}
                        className="py-1 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 font-mono text-[10px] font-bold text-white rounded transition"
                      >
                        Redeem Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Ledger & Cargo Dispatch clearance section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest font-mono">My Won Rewards & Cargo Ledger</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Submit port clearances and dispatch transit routes.</p>
                  </div>
                  <div className="mt-2 sm:mt-0 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
                    Active Bal: <span className="text-emerald-400 font-bold">{formatBalance(data.user.balance || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto w-full">
                  {data.redemptions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-600 font-mono">
                      No rewarded packages loaded on this active cargo line.
                    </div>
                  ) : (
                    data.redemptions.map((red, idx) => {
                      const dispatchFee = red.item_name.toLowerCase().includes("key fob") ? 49.00 : 150.00;
                      return (
                        <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 text-xs font-mono w-full">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-200 block text-sm">{red.item_name}</span>
                              <span className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                                PRIZE #{red.id}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">Transit Reference: <span className="text-slate-400 font-bold">{red.tracking_number}</span></span>
                            {red.status === "Processing" && (
                              <span className="text-[10px] text-red-400 block font-semibold">
                                ⚠️ Status: Held in Port / Lacks Freight Clearance Tariff (${dispatchFee.toFixed(2)} USD due)
                              </span>
                            )}
                            {red.status === "Shipped" && (
                              <span className="text-[10px] text-emerald-400 block font-semibold flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                                Status: Cargo Cleared & Dispatched (Active GPS Transit Router)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                            {red.status === "Processing" ? (
                              <button
                                onClick={() => handleDispatchPackage(red.id, dispatchFee)}
                                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-lg transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                              >
                                Clear Fee & Dispatch ➔
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                Clearance Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Slate header panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Wallet className="w-40 h-40" />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-white">Wallet Escrow & Customs Clearing Hub</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                      Maintain secure deposits to clear maritime freight fees, co-ownership installments, and cargo delivery insurance instantly.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-6 py-4 rounded-xl flex flex-col items-end shrink-0 shadow-inner">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Wallet Escrow Balance</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{formatBalance(data.user.balance || 0)}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Instant Clearing Active</span>
                  </div>
                </div>
              </div>

              {/* Deposit Interface Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                
                {/* Form column */}
                <form onSubmit={handleDepositProofSubmit} className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 w-full">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
                    📥 Submit Cryptocurrency Deposit Proof
                  </h4>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">1. Select Asset / Settlement Node</label>
                    <select
                      value={depositCoin}
                      onChange={e => setDepositCoin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none cursor-pointer"
                    >
                      <option value="USDT_TRC20">USDT (TRC20 Network Node - Zero Gas Fee)</option>
                      <option value="USDT_ERC20">USDT (ERC20 Network Node - Ethereum Mainnet)</option>
                      <option value="BTC">BTC (Bitcoin Blockchain Core Ledger)</option>
                      <option value="ETH">ETH (Ethereum Global Settlement Smart Contract)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full font-mono">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">2. Amount to Deposit (USD) *</label>
                      <input
                        type="number"
                        required
                        min="5"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none"
                        placeholder="250"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">Current Dues Equivalent</label>
                      <div className="bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-400 text-xs font-mono flex items-center h-[42px]">
                        ≈ {(parseFloat(depositAmount) || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">3. Secure Escrow Wallet Address</label>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-300 w-full overflow-hidden">
                      <span className="truncate select-all pr-2 max-w-[200px] sm:max-w-none">
                        {depositCoin === "USDT_TRC20" ? "TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2" :
                         depositCoin === "USDT_ERC20" ? "0x7a305fe86c2d829dc88701e9185a538cd982f1b4" :
                         depositCoin === "BTC" ? "bc1qxy2kg032g2asx4asxs3mdsu8jA7851g7" : "0x7a305fe86c2d829dc88701e9185a538cd982f1b4"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const addr = depositCoin === "USDT_TRC20" ? "TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2" :
                                       depositCoin === "USDT_ERC20" ? "0x7a305fe86c2d829dc88701e9185a538cd982f1b4" :
                                       depositCoin === "BTC" ? "bc1qxy2kg032g2asx4asxs3mdsu8jA7851g7" : "0x7a305fe86c2d829dc88701e9185a538cd982f1b4";
                          navigator.clipboard.writeText(addr);
                          alert("Depository wallet address copied successfully!");
                        }}
                        className="py-1 px-2 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-400 rounded text-[9px] font-bold uppercase transition block flex-shrink-0 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                      ⚠️ Send exactly the specified asset token to this address. Balance updates are audited from the onchain block telemetry.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">4. Paste Transaction Hash / Block ID *</label>
                    <input
                      type="text"
                      required
                      value={depositTxHash}
                      onChange={e => setDepositTxHash(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none"
                      placeholder="e.g. 0xabcdef1234567890abcdef1234567890abcdef12345678"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={depositSubmitting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-500/10 cursor-pointer text-center"
                    >
                      {depositSubmitting ? "Broadcasting Hash..." : "Broadcast Crypto Deposit Proof ➔"}
                    </button>
                  </div>
                </form>

                {/* Info and explorer redirection column */}
                <div className="md:col-span-5 space-y-6 w-full">
                  
                  {/* Ledger node redirection card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 w-full">
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider font-mono">Blockchain Node Explorer Links</h5>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Confirm active ledger network blocks using real decentralized blockchain nodes. Verify deposit routing on blockchain explorers.
                    </p>
                    <a
                      href="https://tronscan.org/#/address/TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-300">TRONSCAN Explorer Node</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                    
                    <a
                      href="https://etherscan.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <ArrowUpRight className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-mono text-slate-300">ETHERSCAN Core Ledger</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>

                  {/* Escrow regulatory note */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 border-l-2 border-l-blue-500 text-left">
                    <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase shrink-0">Clearance Auditing Compliance</h5>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans mt-2">
                       Cryptocurrency deposits are logged under smart escrow tracking. If instant clearance fails, the core verification team audits submitted transaction hashes within 30 minutes to ensure secure clearance routing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit History ledger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">My Depository Logs</h4>
                <div className="space-y-2.5">
                  {(!data.payments || data.payments.filter((p: any) => p.type === "topup").length === 0) ? (
                    <div className="text-center py-6 text-xs text-slate-650 font-mono">
                      No deposit records registered.
                    </div>
                  ) : (
                    data.payments.filter((p: any) => p.type === "topup").map((p: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-900 p-3 rounded-lg flex justify-between items-center text-xs font-mono w-full">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200 text-sm">${p.amount.toFixed(2)} USD</span>
                            <span className="text-[9px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded border border-slate-800">
                              {p.currency}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono leading-relaxed block truncate max-w-[240px] sm:max-w-none mt-1">
                            Hash: {p.transaction_hash}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold py-1 px-2.5 rounded shrink-0 ${p.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                          {p.status === 'approved' ? "Cleared" : "Awaiting Audit"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "insurance" && (
            <div className="space-y-6">
              {/* Slate header panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="w-40 h-40" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Full Maritime Protection & Damage Cover Center</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                    Secure comprehensive ocean shipments protection against maritime hulls cracks, battery failures, rim damage, seawater corrosion or third-party logistics errors.
                  </p>
                </div>
              </div>

              {/* Three detailed premium program cards */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-4 block">
                  🛡️ Select Carrier Protection Cover Policy
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {/* Program 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between w-full">
                    <div>
                      <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 1 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">Basic Transit Shield</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Guarantees basic coverage for transport abrasions, minor exterior scratches, key fob loss, and freight carrier delay logistics.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$15,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-red-400 font-bold">None</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-red-400 font-bold">Exclusions</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(19.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("Basic Transit Shield", 19.00, 15000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>

                  {/* Program 2 */}
                  <div className="bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between relative w-full">
                    <div className="absolute top-2 right-2.5 bg-blue-600 text-white font-bold font-mono text-[8.5px] uppercase py-0.5 px-2 rounded-full tracking-wider animate-pulse">
                      RECOMMENDED
                    </div>
                    
                    <div>
                      <span className="bg-blue-950/40 border border-blue-800 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 2 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">Standard Executive</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Comprehensive coverage for road freight collision damage, rim cracks, cockpit touchscreen failure, and mechanical loading breakages.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$50,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-emerald-400 font-bold">Partial</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-red-400 font-bold">Exclusions</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(49.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("Standard Executive Cover", 49.00, 50000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>

                  {/* Program 3 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between w-full">
                    <div>
                      <span className="bg-slate-950 border border-slate-850 text-amber-500 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 3 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">BYD Prestige Shield</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Premium maritime cargo coverage. Includes battery thermal safety failure, complete body dent replacement, salt corrosion, and total loss guarantee.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$120,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-emerald-400 font-bold">Complete</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-emerald-400 font-bold">Protected</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(89.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("BYD Prestige Shield", 89.00, 120000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Protection Policies List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">My Active Insurance Cover Policies</h4>
                <div className="space-y-2.5">
                  {(!data.insurance_policies || data.insurance_policies.length === 0) ? (
                    <div className="text-center py-6 text-xs text-slate-650 font-mono">
                      No active maritime protection covers logged for this account.
                    </div>
                  ) : (
                    data.insurance_policies.map((pol: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex justify-between items-center text-xs font-mono w-full">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200 text-sm">{pol.plan_name}</span>
                            <span className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                              ACTIVE PROTECTION
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                            Vehicle Asset: <strong className="text-slate-200">{pol.car_model}</strong> • Limit Claim: <strong className="text-white">${pol.coverage_limit.toLocaleString()} USD</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-bold block">COVERED</span>
                          <span className="text-[10px] text-slate-500 block">Premium: ${pol.premium.toFixed(2)} /mo</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && data && data.user && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white tracking-tight">Account & Security Node Customization</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                    Modify profile parameters, activate/shield telemetry variables, and manage telepresence client nodes via collapsible modules.
                  </p>
                </div>

                {/* KYC Legal Audit Status Shield */}
                <div className="p-6 rounded-2xl border bg-slate-950/80 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 p-2.5 rounded-xl border flex items-center justify-center ${
                      data.user.kyc_status === "verified" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : data.user.kyc_status === "pending"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-display font-bold text-sm">Regulatory KYC Compliance Status</h4>
                      <p className="text-slate-400 text-xs leading-normal font-sans">
                        {data.user.kyc_status === "verified" 
                          ? "Congratulations, your biometric passport compliance check has succeeded. Full co-ownership transit permissions are active."
                          : data.user.kyc_status === "pending"
                          ? "Your identification dossier is currently in the dispatch queue. A compliance editor will finalize review shortly (ETA: < 2h)."
                          : "Your account is currently restricted from high-level features. Complete the identity biometric document upload pool to activate permissions."}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Status Shield</span>
                    <span className={`px-3.5 py-1 text-[10px] rounded-full uppercase tracking-wider font-mono font-black ${
                      data.user.kyc_status === "verified" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : data.user.kyc_status === "pending"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}>
                      {data.user.kyc_status || "NOT_SUBMITTED"}
                    </span>
                  </div>
                </div>

                {/* Collapsible Accordion Modules */}
                <div className="space-y-4">
                  
                  {/* MODULE 1: PROFILE DOSSIER */}
                  <div className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden transition duration-200">
                    <button
                      type="button"
                      onClick={() => setSettingsTabSection(settingsTabSection === "profile" ? "privacy" : "profile")}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-display font-bold text-sm text-white bg-slate-900 border-b border-slate-850/50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg font-mono text-xs">01</span>
                        <span>🪪 Identification Variables & Dossier</span>
                      </div>
                      <span className="text-xs uppercase font-mono text-blue-400 tracking-wider">
                        {settingsTabSection === "profile" ? "▼ Collapse" : "▲ Expand [Active]"}
                      </span>
                    </button>

                    {settingsTabSection === "profile" && (
                      <div className="p-6 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Full Legal Name (Required)</label>
                            <input 
                              required
                              type="text"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                              value={settingsName}
                              onChange={e => setSettingsName(e.target.value)}
                              placeholder="Legal Name"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Contact Phone Number</label>
                            <input 
                              type="text"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                              value={settingsPhone}
                              onChange={e => setSettingsPhone(e.target.value)}
                              placeholder="+1-555-0192"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Base Operational City</label>
                            <input 
                              type="text"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                              value={settingsCity}
                              onChange={e => setSettingsCity(e.target.value)}
                              placeholder="metropolis, state"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 2: PRIVACY SHIELD & ESCROW CRYPTO WALL */}
                  <div className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden transition duration-200">
                    <button
                      type="button"
                      onClick={() => setSettingsTabSection(settingsTabSection === "privacy" ? "profile" : "privacy")}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-display font-bold text-sm text-white bg-slate-900 border-b border-slate-850/50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="p-1.5 bg-orange-600/10 text-orange-400 rounded-lg font-mono text-xs">02</span>
                        <span>🛡 Privacy Shields & Payout Escrow Wallet</span>
                      </div>
                      <span className="text-xs uppercase font-mono text-orange-400 tracking-wider">
                        {settingsTabSection === "privacy" ? "▼ Collapse" : "▲ Expand"}
                      </span>
                    </button>

                    {settingsTabSection === "privacy" && (
                      <div className="p-6 space-y-4 animate-fade-in">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Payout Reimbursement Wallet Address</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
                            value={settingsWallet}
                            onChange={e => setSettingsWallet(e.target.value)}
                            placeholder="TRX / ERC20 Address (e.g., T... or 0x...)"
                          />
                        </div>

                        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h5 className="text-white font-bold text-xs flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>Activate Incognito Navigation Mode</span>
                            </h5>
                            <p className="text-[11px] text-slate-450 leading-normal font-sans">
                              Enabling Incognito masks your interactive telemetry coordinate logs on the shared Co-Owner dashboard map, but allows full admin observation for regulatory compliance.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSettingsIncognito(!settingsIncognito)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              settingsIncognito ? "bg-orange-500" : "bg-slate-800"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                settingsIncognito ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 3: TELEPRESENCE PACKAGE DOWNLOADS */}
                  <div className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden transition duration-200">
                    <button
                      type="button"
                      onClick={() => setSettingsTabSection(settingsTabSection === "downloads" ? "profile" : "downloads")}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-display font-bold text-sm text-white bg-slate-900 border-b border-slate-850/50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="p-1.5 bg-cyan-600/10 text-cyan-400 rounded-lg font-mono text-xs">03</span>
                        <span>📲 Dedicated Mobile & Desktop Client Builds</span>
                      </div>
                      <span className="text-xs uppercase font-mono text-cyan-400 tracking-wider">
                        {settingsTabSection === "downloads" ? "▼ Collapse" : "▲ Expand"}
                      </span>
                    </button>

                    {settingsTabSection === "downloads" && (
                      <div className="p-6 space-y-4 animate-fade-in">
                        <p className="text-slate-400 text-xs leading-normal font-sans">
                          For an optimal user experience with raw offline telemetrics, download the native club app directly onto your local environment.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <a
                            href="/BYD_HorizonClub_Client.apk"
                            download="BYD_HorizonClub_Client.apk"
                            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center group transition flex flex-col items-center justify-center cursor-pointer decoration-transparent"
                            title="Download Android Package APK"
                          >
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white font-mono uppercase tracking-wider block">Android Mobile</span>
                            <span className="text-[9px] text-slate-500 mt-0.5 block font-mono">v1.1.2 • APK (42MB)</span>
                          </a>

                          <a
                            href="/BYD_HorizonClub_Setup.msi"
                            download="BYD_HorizonClub_Setup.msi"
                            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center group transition flex flex-col items-center justify-center cursor-pointer decoration-transparent"
                            title="Download Microsoft Windows Client msi"
                          >
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white font-mono uppercase tracking-wider block">Windows Desktop</span>
                            <span className="text-[9px] text-slate-500 mt-0.5 block font-mono">v1.1.2 • MSI (114MB)</span>
                          </a>

                          <a
                            href="/BYD_HorizonClub_iOS.mobileconfig"
                            download="/BYD_HorizonClub_iOS.mobileconfig"
                            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center group transition flex flex-col items-center justify-center cursor-pointer decoration-transparent"
                            title="Download iOS Mobile Config provisioning profile"
                          >
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white font-mono uppercase tracking-wider block">iOS Configuration</span>
                            <span className="text-[9px] text-slate-500 mt-0.5 block font-mono">v1.1.2 • Profile (2MB)</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* General Settings Submit Form Row */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSettingsSuccess(null);
                    setSettingsLoading(true);
                    try {
                      const res = await fetch("/api/user/settings/update", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                          name: settingsName,
                          phone: settingsPhone,
                          city: settingsCity,
                          crypto_wallet_address: settingsWallet,
                          is_incognito: settingsIncognito
                        })
                      });
                      const json = await res.json();
                      if (res.ok) {
                        setSettingsSuccess("🎉 Profile dossier successfully synchronized on the shared blockchain registry!");
                        loadSummaryData();
                      } else {
                        alert(json.error || "Failed to update settings.");
                      }
                    } catch {
                      alert("Network link failure.");
                    } finally {
                      setSettingsLoading(false);
                    }
                  }} 
                  className="space-y-4 pt-4 border-t border-slate-800"
                >
                  {settingsSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-xs leading-normal font-sans">
                      {settingsSuccess}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={settingsLoading || !settingsName}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-400 disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-500/10 cursor-pointer self-end"
                    >
                      {settingsLoading ? "Synchronizing..." : "Synchronize All Dossier Modules"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Top Banner Alert */}
              <div id="ai-campaigns-intro-banner" className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/20 rounded-3xl relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Stakeholder AI Priority Dispatch</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight mt-2 animate-pulse">Active Partnership Campaigns</h3>
                    <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
                      Secure premium co-ownership contracts curated specifically for transitional lifecycle milestones. Earn instant loyalty points and match donations with verified global orphanage aid nodes!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Consensus Verified</span>
                    <span className="px-3 py-1 font-mono text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg uppercase tracking-wider font-extrabold font-bold">Active Node</span>
                  </div>
                </div>
              </div>

              {/* TWO CAMPAIGN CARDS SECTION */}
              <div id="ai-campaigns-cards-grid" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* CAMPAIGN OCCASION A: GRADUATION DEAL */}
                <div id="campaign-occasion-a" className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-indigo-500/40 transition duration-300 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 py-1.5 px-4 bg-indigo-600 text-white font-mono text-[9px] uppercase tracking-widest font-black rounded-bl-xl">
                    LIMITED DISPATCH
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest block">CAMPAIGN S1</span>
                      <h4 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">🎓 Master's Graduation & Career Fast-Track</h4>
                    </div>
                    
                    {/* SPEC CARD IMAGE */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" 
                        className="w-full h-full object-cover opacity-80"
                        alt="BYD Graduation Deal"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800 px-3 py-1 rounded-xl text-[10px] font-mono text-slate-300 flex items-center space-x-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>BYD Seal Premium • Selected Match</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Perfect for establishing initial commercial operational status. Built with state-of-the-art LFP Battery pack technology and 3.8s fast acceleration to power your career climb with extreme economy.
                    </p>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-850 text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">ACCEL</span>
                        <span className="text-white font-bold block mt-0.5">3.8s</span>
                      </div>
                      <div className="border-x border-slate-850">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">RANGE</span>
                        <span className="text-slate-200 font-bold block mt-0.5">323 miles</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">LFP BLADE</span>
                        <span className="text-slate-200 font-bold block mt-0.5">82.5 kWh</span>
                      </div>
                    </div>

                    {/* Compare to Top Best Next 3 Alternates */}
                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850 font-sans">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold block">Spec Comparison VS Alternates:</span>
                      <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1 pb-1">
                          <span className="text-indigo-400 font-bold">1. BYD Seal (Campaign Special)</span>
                          <span className="font-bold text-white">$39,500.00 • 323mi • 3.8s</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1 pb-1 text-slate-400">
                          <span>2. Atto 3 Utility Alternate</span>
                          <span>$38,900.00 • 260mi • 7.3s</span>
                        </div>
                        <div className="flex justify-between text-slate-450">
                          <span>3. Han Flagship Alternate</span>
                          <span>$52,500.00 • 375mi • 3.9s</span>
                        </div>
                      </div>
                    </div>

                    {/* Bonus details and Price */}
                    <div className="flex justify-between items-center pt-2 gap-4">
                      <div>
                        <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-mono font-bold block">Campaign Pricing</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-white font-display text-lg font-bold">
                            ${(data as any)?.admin_pricing?.rec_occasion_a_price ? Number((data as any).admin_pricing.rec_occasion_a_price).toLocaleString() : "39,500"} 
                          </span>
                          <span className="text-xs text-slate-500 line-through">$45,900</span>
                        </div>
                        <span className="text-[9px] text-slate-505 font-sans block mt-0.5">Price locks for first claim, valid 2 days</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono font-bold block font-bold">Earn Bonus</span>
                        <span className="text-white text-xs font-mono font-bold block">+5,000 pts</span>
                      </div>
                    </div>

                  </div>

                  <button
                    id="btn-claim-camp-graduation"
                    type="button"
                    disabled={claimingOccasion === "graduation" || claimedOccasions["graduation"]}
                    onClick={async () => {
                      setClaimingOccasion("graduation");
                      try {
                        const price = (data as any)?.admin_pricing?.rec_occasion_a_price ? Number((data as any).admin_pricing.rec_occasion_a_price) : 39500;
                        const res = await fetch("/api/campaigns/claim", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                          },
                          body: JSON.stringify({ occasionType: "Graduation Deal", pricePaid: price })
                        });
                        const resJson = await res.json();
                        if (res.ok) {
                          setClaimedOccasions(p => ({ ...p, graduation: true }));
                          alert(resJson.message);
                          loadSummaryData();
                        } else {
                          alert(resJson.error || "Failed to secure campaign contract.");
                        }
                      } catch {
                        alert("Network link offline.");
                      } finally {
                        setClaimingOccasion(null);
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition duration-155 cursor-pointer text-center ${
                      claimedOccasions["graduation"] 
                        ? "bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
                    }`}
                  >
                    {claimingOccasion === "graduation" ? "Securing Contract Dossier..." : claimedOccasions["graduation"] ? "✓ Contract Settle Claimed (Awaiting Shipment Desk)" : "Settle Allotment & Claim Graduation Deal"}
                  </button>
                </div>

                {/* CAMPAIGN OCCASION B: PROPOSAL LUXURY DEAL */}
                <div id="campaign-occasion-b" className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-pink-500/40 transition duration-300 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 py-1.5 px-4 bg-pink-600 text-white font-mono text-[9px] uppercase tracking-widest font-black rounded-bl-xl hover:rotate-2">
                    EXCLUSIVE DISPATCH
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-black text-pink-400 uppercase tracking-widest block">CAMPAIGN S2</span>
                      <h4 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">💖 Romantic Proposal & Engagement Masterpiece</h4>
                    </div>
                    
                    {/* SPEC CARD IMAGE */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" 
                        className="w-full h-full object-cover opacity-80"
                        alt="BYD Proposal Premium Deal"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800 px-3 py-1 rounded-xl text-[10px] font-mono text-slate-300 flex items-center space-x-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                        <span>BYD Han Red Edition • Intelligent Cruise</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Dazzle your life partner. Configured with a special interior starry ambient LED roof package. This executive co-ownership sedan merges 375 miles elite range with dynamic torque and soft leather biometrics.
                    </p>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-850 text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">ACCEL</span>
                        <span className="text-white font-bold block mt-0.5">3.9s</span>
                      </div>
                      <div className="border-x border-slate-850">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">RANGE</span>
                        <span className="text-slate-200 font-bold block mt-0.5">375 miles</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">BATTERY</span>
                        <span className="text-slate-200 font-bold block mt-0.5">85.4 kWh</span>
                      </div>
                    </div>

                    {/* Compare to Top Best Next 3 Alternates */}
                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850 font-sans">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold block">Spec Comparison VS Alternates:</span>
                      <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1 pb-1 text-pink-400">
                          <span>1. BYD Han (Campaign Special)</span>
                          <span className="font-bold text-white">$43,900.00 • 375mi • 3.9s</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1 pb-1 text-slate-400">
                          <span>2. Seal Premium Alternate</span>
                          <span>$45,900.00 • 323mi • 3.8s</span>
                        </div>
                        <div className="flex justify-between text-slate-450">
                          <span>3. Sea Lion Concept Alternate</span>
                          <span>$48,000.00 • 300mi • 4.5s</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Bonus */}
                    <div className="flex justify-between items-center pt-2 gap-4">
                      <div>
                        <span className="text-[9px] text-pink-400 uppercase tracking-widest font-mono font-bold block animate-pulse">Campaign Pricing</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-white font-display text-lg font-bold">
                            ${(data as any)?.admin_pricing?.rec_occasion_b_price ? Number((data as any).admin_pricing.rec_occasion_b_price).toLocaleString() : "43,900"}
                          </span>
                          <span className="text-xs text-slate-500 line-through">$52,500</span>
                        </div>
                        <span className="text-[9px] text-slate-505 font-sans block mt-0.5">Price locks for first claim, valid 2 days</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono font-bold block font-bold">Earn Bonus</span>
                        <span className="text-white text-xs font-mono font-bold block">+5,000 pts</span>
                      </div>
                    </div>

                  </div>

                  <button
                    id="btn-claim-camp-proposal"
                    type="button"
                    disabled={claimingOccasion === "proposal" || claimedOccasions["proposal"]}
                    onClick={async () => {
                      setClaimingOccasion("proposal");
                      try {
                        const price = (data as any)?.admin_pricing?.rec_occasion_b_price ? Number((data as any).admin_pricing.rec_occasion_b_price) : 43900;
                        const res = await fetch("/api/campaigns/claim", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                          },
                          body: JSON.stringify({ occasionType: "Proposal Deal", pricePaid: price })
                        });
                        const resJson = await res.json();
                        if (res.ok) {
                          setClaimedOccasions(p => ({ ...p, proposal: true }));
                          alert(resJson.message);
                          loadSummaryData();
                        } else {
                          alert(resJson.error || "Failed to secure campaign contract.");
                        }
                      } catch {
                        alert("Network link offline.");
                      } finally {
                        setClaimingOccasion(null);
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition duration-155 cursor-pointer text-center ${
                      claimedOccasions["proposal"] 
                        ? "bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed" 
                        : "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/10 active:scale-[0.98]"
                    }`}
                  >
                    {claimingOccasion === "proposal" ? "Securing Contract Dossier..." : claimedOccasions["proposal"] ? "✓ Contract Settle Claimed (Awaiting Shipment Desk)" : "Settle Allotment & Claim Proposal Luxury Deal"}
                  </button>
                </div>

              </div>

              {/* CO-OWNER REMARKS FEED & ADD COMMENT SECTION */}
              <div id="ai-campaigns-remarks-and-sponsorship" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                
                {/* REMARKS BULLET BOX */}
                <div id="co-owner-remarks-board" className="lg:col-span-12 xl:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        <span>Live Shared Co-Owner Victory Remarks</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 font-sans">
                        See authenticated member achievements and co-ownership delivery chronicles logged live in our sandbox database index.
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                      {remarksLoading ? (
                        <div className="text-center py-10 font-mono text-xs text-slate-500">
                          Fetching victory database blocks...
                        </div>
                      ) : remarksList.length === 0 ? (
                        <div className="text-center py-10 font-mono text-xs text-slate-500">
                          Zero remarks retrieved. Be the first to catalog a win statement!
                        </div>
                      ) : (
                        remarksList.map((rem: any) => (
                          <div key={rem.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2 animate-fade-in hover:border-slate-800 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 bg-indigo-600/20 rounded-lg flex items-center justify-center text-[10px] font-mono font-black text-indigo-400">
                                  {rem.user_name ? rem.user_name.substring(0, 2).toUpperCase() : "CO"}
                                </div>
                                <span className="font-display font-bold text-xs text-indigo-200">{rem.user_name || "Anonymous Member"}</span>
                              </div>
                              <span className="px-2.5 py-0.5 text-[9px] font-mono bg-slate-900 border border-slate-800 rounded-full text-slate-400 font-bold uppercase tracking-wide">
                                {rem.win_category || "Victory Win"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{rem.remark_text}</p>
                            <span className="text-[9px] text-slate-500 font-mono text-right block pr-1">
                              {new Date(rem.created_at || Date.now()).toLocaleDateString(undefined, { hour: "numeric", minute: "numeric" })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Remark Form */}
                  <form
                    id="frm-post-remark"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setRemarkMessage(null);
                      if (!newRemarkText.trim()) return;

                      try {
                        const res = await fetch("/api/remarks", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                          },
                          body: JSON.stringify({ winCategory: newRemarkCategory, remarkText: newRemarkText })
                        });
                        const resJson = await res.json();
                        if (res.ok) {
                          setNewRemarkText("");
                          setRemarkMessage("🎉 Your achievement and win remark has been permanently saved on the shared sandbox database ledger!");
                          loadRemarksList();
                          loadSummaryData();
                        } else {
                          setRemarkMessage("❌ Error: " + resJson.error);
                        }
                      } catch {
                        setRemarkMessage("❌ Network connection offline.");
                      }
                    }}
                    className="space-y-4 pt-4 border-t border-slate-800"
                  >
                    <div>
                      <span className="font-display font-semibold text-xs text-white block mb-2 font-bold select-none">Publish My Victory Dossier:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center font-sans">
                        <div className="sm:col-span-5">
                          <label className="block text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-1.5 font-bold">Winning Category</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                            value={newRemarkCategory}
                            onChange={(e) => setNewRemarkCategory(e.target.value)}
                          >
                            <option value="Vehicle Settle">Vehicle Settle</option>
                            <option value="Points Cashout">Points Cashout</option>
                            <option value="Orphanage Sponsorship">Orphanage Sponsorship</option>
                            <option value="Check-in Streak">Daily Check-in Streak</option>
                            <option value="Premium VIP Invite">Premium VIP Invite</option>
                          </select>
                        </div>
                        <div className="sm:col-span-7 font-sans">
                          <label className="block text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-1.5 font-extrabold">Write Your Remark Achievements</label>
                          <input
                            required
                            type="text"
                            placeholder="Hit a 10 day streak and won $59 membership bonus!"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                            value={newRemarkText}
                            onChange={(e) => setNewRemarkText(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {remarkMessage && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-xl text-[11px] leading-relaxed font-sans">
                        {remarkMessage}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        id="btn-submit-remark"
                        type="submit"
                        disabled={!newRemarkText.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition cursor-pointer self-end"
                      >
                        File Shared Remark
                      </button>
                    </div>
                  </form>
                </div>

                {/* ORPHANAGE OUTREACH & CHARITY GATEWAY DIALOG */}
                <div id="orphanage-outreach-and-charity" className="lg:col-span-12 xl:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span>Orphanage Assistance & Social Hope Desk</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 font-sans leading-normal">
                        Co-owners have immediate power to sponsor foster children nutrition, schools, and medical kits. Choose any live organization and co-verify distribution nodes.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-sans">
                      {[
                        { id: "charity_unicef", name: "UNICEF Children Foster" },
                        { id: "charity_redcross", name: "Red Cross Emergency Care" },
                        { id: "charity_savechildren", name: "Save The Children nutrition" },
                        { id: "charity_horizonhope", name: "Horizon Hope Orphanage" }
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            setDashSelectedCharityId(ch.id);
                            setDashSelectedCharityName(ch.name);
                          }}
                          className={`p-3 rounded-xl border text-center transition text-[10px] font-sans font-bold flex flex-col justify-center items-center gap-1.5 cursor-pointer ${
                            dashSelectedCharityId === ch.id 
                              ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-md" 
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <span className="block">{ch.name}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${dashSelectedCharityId === ch.id ? "bg-rose-500" : "bg-slate-801"}`}></span>
                        </button>
                      ))}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-450 font-mono uppercase tracking-widest mb-1.5 font-bold">
                          Sponsorship Amount ($) • <span className="text-orange-400 font-bold">Min $59.00 USD</span>
                        </label>
                        <input
                          required
                          type="number"
                          min="59"
                          className="w-full bg-slate-950 border border-slate-805 rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-rose-500 font-bold"
                          value={dashDonationAmount}
                          onChange={(e) => setDashDonationAmount(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-450 font-mono uppercase tracking-widest mb-1.5 font-bold">Dedicated message of hope</label>
                        <textarea
                          className="w-full bg-slate-950 border border-slate-805 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-505 font-sans"
                          rows={2}
                          placeholder="Your grace coordinates here..."
                          value={dashDonorNote}
                          onChange={(e) => setDashDonorNote(e.target.value)}
                        />
                      </div>

                      {/* Payment Choice Grid */}
                      <div>
                        <label className="block text-[9px] text-slate-450 font-mono uppercase tracking-widest mb-2 font-bold">Simulated Settle Gateway Network</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "card", title: "💳 Card Gateway" },
                            { id: "paypal", title: "🅿️ PayPal Settle" },
                            { id: "crypto", title: "🔐 Crypto USDT" }
                          ].map((pay) => (
                            <button
                              key={pay.id}
                              type="button"
                              onClick={() => setDashDonationMethod(pay.id as any)}
                              className={`py-2 rounded-xl text-[9px] font-mono tracking-tighter uppercase font-black transition cursor-pointer ${
                                dashDonationMethod === pay.id 
                                  ? "bg-slate-950 border border-indigo-500/50 text-indigo-400 shadow-md font-bold"
                                  : "bg-slate-950 border border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-4img"
                              }`}
                            >
                              {pay.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditional input fields */}
                      {dashDonationMethod === "card" && (
                        <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-sans text-xs animate-fade-in">
                          <div>
                            <label className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1">Interactive Credit Card digits</label>
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="4111 2222 3333 4444"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                              value={dashCardNum}
                              onChange={(e) => setDashCardNum(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {dashDonationMethod === "paypal" && (
                        <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-sans text-xs animate-fade-in">
                          <div>
                            <label className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1">Registered PayPal billing Email</label>
                            <input
                              type="email"
                              placeholder="coowner@paypal.com"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                              value={dashPaypalEmail}
                              onChange={(e) => setDashPaypalEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {dashDonationMethod === "crypto" && (
                        <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-sans text-xs text-slate-400 animate-fade-in">
                          <p className="text-[10px] leading-relaxed">
                            <strong className="text-white block mb-0.5 font-bold">Recommended Zero-Fee stable USDT protocol:</strong>
                            Send ERC20 / TRC20 USDT payments directly. Enter an optional hash code below to lock the transaction contract.
                          </p>
                          <input
                            type="text"
                            placeholder="TXH-901D89A893..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                            value={dashCryptoTx}
                            onChange={(e) => setDashCryptoTx(e.target.value)}
                          />
                        </div>
                      )}

                    </div>

                    {dashDonationMessage && (
                      <div className={`p-4 rounded-xl text-[11px] leading-relaxed font-sans border animate-fade-in ${
                        dashDonationMessage.type === "success" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold" 
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}>
                        {dashDonationMessage.text}
                      </div>
                    )}

                  </div>

                  <button
                    id="btn-donate-submit"
                    type="button"
                    disabled={dashDonating || !dashDonationAmount}
                    onClick={async () => {
                      setDashDonating(true);
                      setDashDonationMessage(null);
                      
                      const amtVal = Number(dashDonationAmount);
                      if (isNaN(amtVal) || amtVal < 59) {
                        setDashDonationMessage({
                          type: "error",
                          text: "Error: The lowest sponsorship amount for any item or charity is strictly set to $59.00 USD to match compliance parameters."
                        });
                        setDashDonating(false);
                        return;
                      }

                      try {
                        const res = await fetch("/api/charity/donate-dashboard", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                          },
                          body: JSON.stringify({
                            amount: amtVal,
                            charityId: dashSelectedCharityId,
                            charityName: dashSelectedCharityName,
                            paymentMethod: dashDonationMethod,
                            cardNum: dashCardNum,
                            paypalEmail: dashPaypalEmail,
                            txHash: dashCryptoTx,
                            donorNote: dashDonorNote
                          })
                        });
                        const resJson = await res.json();
                        if (res.ok) {
                          setDashDonationMessage({ type: "success", text: resJson.message });
                          setDashCryptoTx("");
                          setDashDonorNote("");
                          loadSummaryData();
                        } else {
                          setDashDonationMessage({ type: "error", text: resJson.error });
                        }
                      } catch {
                        setDashDonationMessage({ type: "error", text: "Network connection offline." });
                      } finally {
                        setDashDonating(false);
                      }
                    }}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition shadow-lg shadow-rose-900/40 cursor-pointer text-center"
                  >
                    {dashDonating ? "Authenticating Settle Node Gateway..." : `Confirm Sponsorship Settle Of $${dashDonationAmount}.00 USD`}
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TOP TAB: FLEET SHOWROOM PORTAL */}
          {activeTab === "fleet" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Ship className="w-5 h-5 text-cyan-400" />
                      <span>Horizon Exclusive Fleet Showroom</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose your luxury co-ownership electric vehicle. Acquire immediate global tracking upon downpayment settle.
                    </p>
                  </div>
                  
                  {/* Cart Status Badge */}
                  {cartItem && (
                    <div className="flex items-center space-x-2 bg-cyan-950/40 border border-cyan-500/30 py-1.5 px-3 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Cart Active: {cartItem.name}</span>
                      <button 
                        onClick={() => setCartItem(null)} 
                        className="text-slate-500 hover:text-white text-xs pl-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkout Success/Error Messages */}
                {checkoutSuccess && (
                  <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-sans leading-relaxed flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{checkoutSuccess}</span>
                  </div>
                )}
                {checkoutError && (
                  <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-400 rounded-2xl text-xs font-sans leading-relaxed">
                    <p className="font-bold">Checkout Halt:</p>
                    <p className="mt-1">{checkoutError}</p>
                    {checkoutError.includes("Insufficient balance") && (
                      <button
                        onClick={async () => {
                          setCheckoutLoading(true);
                          setCheckoutError(null);
                          try {
                            const res = await fetch("/api/payments/instant-topup", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                              body: JSON.stringify({ amount: 250, method: "Instant Settle Proxy" })
                            });
                            const rJson = await res.json();
                            if (res.ok) {
                              setCheckoutSuccess("💳 Wallet instantly auto-funded with $250.00! Re-submitting car co-ownership order...");
                              await loadSummaryData();
                              // Automate Checkout process
                              const resCheck = await fetch("/api/payments/checkout-vehicle", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                                body: JSON.stringify({ model: cartItem ? cartItem.name : "BYD Seal", price: 250 })
                              });
                              const rCheck = await resCheck.json();
                              if (resCheck.ok) {
                                setCheckoutSuccess(`🎉 Auto-Checkout Complete! Your vehicle reservation has succeeded. Settle fee debited.`);
                                setCartItem(null);
                                await loadSummaryData();
                                setTimeout(() => handleTabClick("tracking"), 2550);
                              } else {
                                setCheckoutError(rCheck.error);
                              }
                            } else {
                              setCheckoutError(rJson.error);
                            }
                          } catch {
                            setCheckoutError("Fast funding failed. Please try again.");
                          } finally {
                            setCheckoutLoading(false);
                          }
                        }}
                        className="mt-3 py-1.5 px-4 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[10px] font-mono uppercase tracking-wider font-extrabold flex items-center space-x-1 cursor-pointer"
                      >
                        <span>💳 Auto-topup $250 & Checkout</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Grid layout for vehicles */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[
                    { id: "seal", name: "BYD Seal", category: "Luxury Elite Sports Sedan", price: 45900, downpayment: 250, monthly: 699, specs: { range: "323 mi", acceleration: "3.8s", battery: "82.5 kWh" }, image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80" },
                    { id: "atto", name: "BYD Atto 3", category: "Urban Sporty SUV", price: 38900, downpayment: 250, monthly: 529, specs: { range: "260 mi", acceleration: "7.3s", battery: "60.4 kWh" }, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" },
                    { id: "dolphin", name: "BYD Dolphin", category: "Micro city Hatch", price: 29900, downpayment: 250, monthly: 399, specs: { range: "211 mi", acceleration: "7.0s", battery: "44.9 kWh" }, image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80" },
                    { id: "han", name: "BYD Han", category: "Executive Flagship Sedan", price: 52500, downpayment: 250, monthly: 799, specs: { range: "375 mi", acceleration: "3.9s", battery: "85.4 kWh" }, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80" },
                    { id: "tang", name: "BYD Tang", category: "Symphonic Family AWD SUV", price: 58000, downpayment: 250, monthly: 859, specs: { range: "310 mi", acceleration: "4.6s", battery: "108.0 kWh" }, image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=600&q=80" },
                    { id: "denzad9", name: "BYD Denza D9", category: "Grand MPV Imperial", price: 76000, downpayment: 250, monthly: 1150, specs: { range: "385 mi", acceleration: "6.9s", battery: "103.0 kWh" }, image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80" },
                    { id: "u8", name: "BYD Yangwang U8", category: "Amphibious extreme Luxury Quad-Motor Off-roader", price: 145000, downpayment: 250, monthly: 1999, specs: { range: "620 mi", acceleration: "3.6s", battery: "49.0 kWh" }, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" },
                  ].map((car) => (
                    <div key={car.id} className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-800 transition flex flex-col justify-between p-4 relative font-sans group">
                      <div className="space-y-3">
                        <div className="h-32 w-full overflow-hidden rounded-xl relative bg-slate-900">
                          <img 
                            src={car.image} 
                            alt={car.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // robust fallback image of generic sleek EV if link fails
                              e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400 font-extrabold tracking-widest uppercase">
                            {car.category}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm">{car.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Catalog Price: ${car.price.toLocaleString()} USD</p>
                        </div>

                        {/* Specs grid */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-900/40 p-2 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400">
                          <div>
                            <span className="text-slate-600 block text-[7px] uppercase tracking-widest">Range</span>
                            <span className="font-bold text-slate-300">{car.specs.range}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[7px] uppercase tracking-widest">0-60mph</span>
                            <span className="font-bold text-slate-300">{car.specs.acceleration}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[7px] uppercase tracking-widest">Pack</span>
                            <span className="font-bold text-slate-300 truncate block">{car.specs.battery}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-900/60 mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-mono">Settle Downpayment</span>
                          <span className="text-xs font-black text-emerald-400 font-mono">${car.downpayment}.00</span>
                        </div>
                        <button
                          onClick={() => {
                            setCartItem(car);
                            setCheckoutSuccess(null);
                            setCheckoutError(null);
                            // Scroll to checkout form
                            const cartForm = document.getElementById("vehicle-checkout-cart-container");
                            if (cartForm) cartForm.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`py-1.5 px-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition cursor-pointer select-none ${
                            cartItem && cartItem.id === car.id
                              ? "bg-cyan-950 border border-cyan-500/30 text-cyan-400"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {cartItem && cartItem.id === car.id ? "Selected ✓" : "Select Vehicle"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-Checkout Core Block */}
                {cartItem && (
                  <div id="vehicle-checkout-cart-container" className="mt-8 p-6 bg-slate-950 border border-cyan-500/20 rounded-3xl space-y-4 animate-fade-in text-left">
                    <div className="flex items-center space-x-2 text-cyan-400 border-b border-slate-900 pb-3">
                      <Wallet className="w-5 h-5" />
                      <h4 className="font-display font-extrabold text-sm uppercase tracking-wider">Settle Co-Ownership Reservation</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed font-sans text-xs">
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          To initiate safe logistics dispatch from regional harbors, co-owners must lock a standard initial co-ownership downpayment of <strong className="text-emerald-400">$250.00 USD</strong>.
                        </p>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Selected Logistics Model:</span>
                            <span className="text-white font-bold">{cartItem.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Security downpayment:</span>
                            <span className="text-emerald-400 font-bold">$250.00 USD</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-1.5">
                            <span className="text-slate-500">Installment Period:</span>
                            <span className="text-slate-300">12 Months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Monthly Settle Repay:</span>
                            <span className="text-slate-300">${cartItem.monthly}/mo</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-850">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Your Safe Profile Wallet Balance</span>
                          <span className="text-lg font-black text-cyan-300 font-mono">
                            {formatBalance(data?.user?.balance || 0)}
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-4">
                          <button
                            onClick={async () => {
                              setCheckoutLoading(true);
                              setCheckoutError(null);
                              setCheckoutSuccess(null);
                              try {
                                const res = await fetch("/api/payments/checkout-vehicle", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                  },
                                  body: JSON.stringify({
                                    model: cartItem.name,
                                    price: 250,
                                    termMonths: 12,
                                    monthlyInstallment: cartItem.monthly
                                  })
                                });
                                const resJson = await res.json();
                                if (res.ok) {
                                  setCheckoutSuccess(`🎉 Checkout Successful! Settle fee has been securely logged. Re-orienting control tower to GPS logistics tracking...`);
                                  setCartItem(null);
                                  await loadSummaryData();
                                  setTimeout(() => handleTabClick("tracking"), 2800);
                                } else {
                                  setCheckoutError(resJson.error);
                                }
                              } catch {
                                setCheckoutError("Network connection error during checkout. Please check parameters.");
                              } finally {
                                setCheckoutLoading(false);
                              }
                            }}
                            disabled={checkoutLoading}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition cursor-pointer text-center"
                          >
                            {checkoutLoading ? "Settle verification ledger active..." : `Authorize reservation downpayment & Dispatch ➔`}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* RENT TABS PORTAL: RENTAL RECOMMENDATIONS */}
          {activeTab === "rent" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <div className="border-b border-slate-800 pb-5 mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <span>Premium Rental Recommendations Catalog</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Our system selects and recommends highly optimized electric vehicle classes depending on occupancy, mileage targets, and trip profiles.
                    </p>
                  </div>
                </div>

                {rentSuccess && (
                  <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-sans flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>{rentSuccess}</span>
                  </div>
                )}

                {/* Rental recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "dolphin_mini", name: "BYD Dolphin Mini (Dolphin Core Series)", rate: 35, description: "Highly recommended for compact tight-budget city runs, solo commutes or fast delivery nodes. Optimized urban turning radii.", specs: "30 kWh Pack • 195 mi Range", tag: "SOLO URBAN RECOMMENDED", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80" },
                    { id: "atto_cross", name: "BYD Atto 3 (Mountain Trail Edition)", rate: 69, description: "Recommended for family weekend getways, coastal state cruises, and generous packing requirements. Full active ADAS suite.", specs: "60.4 kWh Pack • 260 mi Range", tag: "VERSATILE CRUISE RECOMMENDED", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80" },
                    { id: "seal_circuit", name: "BYD Seal (Track Ready Performance)", rate: 125, description: "Recommended for highway speed entusiasts, corporate executive appointments, or pristine tracking aesthetics.", specs: "82.5 kWh Pack • 3.8s Acceleration", tag: "ELITE SPORT RECOMMENDED", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" },
                    { id: "u8_overland", name: "Yangwang U8 (Amphibious All-terrain Titan)", rate: 349, description: "Recommended for high-risk wilderness explorations, deep-water river crossings, and absolute elite security configurations.", specs: "Quad motor • 1,200 HP water lock", tag: "ULTIMATE SURVIVAL RECOMMENDED", image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=400&q=80" }
                  ].map((rec) => (
                    <div key={rec.id} className="bg-slate-950 border border-slate-850 p-5 rounded-3xl hover:border-slate-800 transition flex flex-col justify-between space-y-4 font-sans relative overflow-hidden group">
                      <div className="absolute top-3 right-3 bg-cyan-950/80 border border-cyan-500/20 px-2 py-0.5 rounded text-[7px] font-mono text-cyan-400 font-extrabold tracking-widest uppercase">
                        {rec.tag}
                      </div>

                      <div className="space-y-2">
                        <div className="h-40 w-full overflow-hidden rounded-xl bg-slate-900 relative">
                          <img 
                            src={rec.image} 
                            alt={rec.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-white text-sm">{rec.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono inline-block bg-emerald-950/25 px-2 py-0.5 rounded border border-emerald-950/30">{rec.specs}</span>
                        <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-mono">Rate per 24 hours</span>
                          <span className="text-sm font-black text-cyan-300 font-mono">${rec.rate}.00 / day</span>
                        </div>
                        <button
                          onClick={() => {
                            setRentSelectedCar(rec);
                            setRentSuccess(null);
                            const rentModal = document.getElementById("rental-check-form-anchor");
                            if (rentModal) rentModal.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 rounded-lg text-[10px] font-mono uppercase tracking-wider font-extrabold cursor-pointer"
                        >
                          Unlock Settle Contract
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {rentSelectedCar && (
                  <div id="rental-check-form-anchor" className="mt-8 p-6 bg-slate-950 border border-emerald-500/20 rounded-3xl space-y-4 animate-fade-in text-left font-sans">
                    <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-900 pb-3">
                      <Clock className="w-5 h-5" />
                      <h4 className="font-display font-extrabold text-sm uppercase tracking-wider">Configure Fleet Rental Duration Settle</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
                      <div className="space-y-3">
                        <p>
                          Verify physical keys pickup locations at local port terminals. Rental fee comprises active full damage protection and toll waiver coverage limits during contract lifetime.
                        </p>
                        
                        <div>
                          <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">Configure Reservation term</label>
                          <select
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans cursor-pointer"
                            value={rentDays}
                            onChange={(e) => setRentDays(parseInt(e.target.value))}
                          >
                            <option value={1}>1 Day (Short duration trial)</option>
                            <option value={3}>3 Days (Settle weekend commuter)</option>
                            <option value={7}>7 Days (Full localized weekly tour)</option>
                            <option value={14}>14 Days (Extended corporate transport)</option>
                            <option value={30}>30 Days (Monthly elite co-occupancy)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-850">
                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Selected Rental Model:</span>
                            <span className="text-white font-bold">{rentSelectedCar.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Active Rate Settle:</span>
                            <span className="text-white">${rentSelectedCar.rate}/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Duration Period:</span>
                            <span className="text-white">{rentDays} Days</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-2 text-xs font-bold mt-2">
                            <span className="text-slate-400">Total Rental Settle Fee:</span>
                            <span className="text-emerald-400">${rentSelectedCar.rate * rentDays}.00 USD</span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            const totalAmount = rentSelectedCar.rate * rentDays;
                            if ((data?.user?.balance || 0) < totalAmount) {
                              alert(`Insufficient Safe Wallet funds! Settle rate is $${totalAmount.toFixed(2)}, but your balance is only $${(data?.user?.balance || 0).toFixed(2)}. Please fund your profile under the Wallet portal first.`);
                              handleTabClick("wallet");
                              return;
                            }

                            try {
                              // Perform dynamic deduction using instant deduction backend update proxy or local state simulating direct debit!
                              const res = await fetch("/api/payments/instant-topup", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                                body: JSON.stringify({ amount: -totalAmount, method: "Rental Settle Deduction" })
                              });
                              if (res.ok) {
                                const newRentObj = {
                                  modelName: rentSelectedCar.name,
                                  duration: rentDays,
                                  cost: totalAmount,
                                  expiry: new Date(Date.now() + rentDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                                  timestamp: new Date().toLocaleString()
                                };
                                const updatedRents = [newRentObj, ...activeRentals];
                                setActiveRentals(updatedRents);
                                localStorage.setItem("byd_rentals", JSON.stringify(updatedRents));
                                setRentSuccess(`🎉 Rental Reservation Confirmed! Debited $${totalAmount.toFixed(2)} USD. Your dispatch ID and terminal access codes have been saved under localstorage!`);
                                setRentSelectedCar(null);
                                await loadSummaryData();
                              } else {
                                alert("Deduction proxy rejected the payment. Please review balance levels.");
                              }
                            } catch {
                              alert("Database processing connection error.");
                            }
                          }}
                          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition cursor-pointer text-center"
                        >
                          Confirm & Book Rental Now
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* List of active bookings */}
                {activeRentals.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800 text-left font-sans">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-4">My Dynamic Active Rental Contracts</span>
                    <div className="space-y-3">
                      {activeRentals.map((r, index) => (
                        <div key={index} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <h5 className="font-bold text-white text-xs">{r.modelName}</h5>
                            <p className="text-[10px] text-slate-500">Reserved on: {r.timestamp} • Period: {r.duration} Days</p>
                          </div>
                          <div className="text-right font-mono">
                            <p className="text-emerald-400 font-bold text-xs">-${r.cost.toFixed(2)} USD</p>
                            <p className="text-[9px] text-slate-500">Contract Expiry: {r.expiry}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* GALLERY TABS PORTAL: ART OF BYD SHOWCASE */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>The Art of BYD Architecture Gallery</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Download HD high-fidelity visual artwork showcasing the electric concept vehicle interior dashboards, curves, and blade modules.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "SHOW ALL" },
                      { id: "exteriors", label: "CURVES TYPE" },
                      { id: "interiors", label: "LUX CABINS" },
                      { id: "motors", label: "GREEN TECHS" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setGalleryFilter(btn.id)}
                        className={`py-1 px-3.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition cursor-pointer select-none ${
                          galleryFilter === btn.id 
                            ? "bg-slate-950 border border-cyan-500/30 text-cyan-300"
                            : "bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-500 hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gallery showcase grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[
                    { id: 1, type: "exteriors", title: "BYD Seal Aerodynamic Silhouette", size: "14.8 MB", resolution: "4096 x 2730 UHD", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80" },
                    { id: 2, type: "interiors", title: "Intelligent Dashboard Console Panel", size: "11.2 MB", resolution: "3840 x 2160 4K", image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80" },
                    { id: 3, type: "motors", title: "Blade Cell Integrated Battery Module", size: "9.5 MB", resolution: "3000 x 2000 FHD+", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" },
                    { id: 4, type: "exteriors", title: "Urban Sporty SUV Coastal Trial", size: "16.1 MB", resolution: "4096 x 2730 UHD", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" },
                    { id: 5, type: "interiors", title: "Hand Crafted Leather Seat Stitching", size: "8.1 MB", resolution: "3840 x 2160 4K", image: "https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?auto=format&fit=crop&w=600&q=80" },
                    { id: 6, type: "motors", title: "Integrated Quad-Motor Powertrain Tech", size: "12.3 MB", resolution: "3000 x 2000 Precision", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" },
                  ].filter(item => galleryFilter === "all" || item.type === galleryFilter)
                   .map((pic) => (
                    <div key={pic.id} className="bg-slate-950 border border-slate-850 p-4 rounded-3xl overflow-hidden hover:border-slate-800 transition flex flex-col justify-between space-y-3 font-sans relative group">
                      
                      <div className="h-44 w-full overflow-hidden rounded-2xl relative bg-slate-900 border border-slate-900">
                        <img 
                          src={pic.image} 
                          alt={pic.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                          }}
                        />

                        {/* Simulating Download Progress Ring Overlay */}
                        {downloadingIndex === pic.id && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-20 space-y-2">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Downloading file asset...</span>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-cyan-400 font-mono transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{downloadProgress}% complete</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs">{pic.title}</h4>
                        <div className="flex font-mono text-[9px] text-slate-500 space-x-3">
                          <span>{pic.resolution}</span>
                          <span>•</span>
                          <span>{pic.size}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900/60 mt-2">
                        <button
                          onClick={() => {
                            setDownloadingIndex(pic.id);
                            setDownloadProgress(0);
                            const interval = setInterval(() => {
                              setDownloadProgress((prev) => {
                                if (prev >= 100) {
                                  clearInterval(interval);
                                  setTimeout(() => {
                                    setDownloadingIndex(null);
                                    alert(`📥 "${pic.title}" has been successfully downloaded with full original ${pic.resolution} resolution properties to your active downloads profile folder.`);
                                  }, 600);
                                  return 100;
                                }
                                return prev + Math.floor(Math.random() * 20) + 10;
                              });
                            }, 250);
                          }}
                          disabled={downloadingIndex !== null}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-mono uppercase tracking-wider font-bold rounded-lg border border-slate-850 hover:border-slate-850 transition flex items-center justify-center space-x-1"
                        >
                          <span>Download original HD UHD File</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* INVESTMENTS TABS PORTAL: FRACTIONAL VENTURES */}
          {activeTab === "invest" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <div className="border-b border-slate-800 pb-5 mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-indigo-400" />
                      <span>Horizon Green Venture Capital Port</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Co-owners acquire immediate yield options inside local green giga projects: charging stations, maritime fleets, and blade grids.
                    </p>
                  </div>
                </div>

                {investSuccess && (
                  <div className="mb-6 p-4 bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 rounded-2xl text-xs font-sans flex items-center gap-3 animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span>{investSuccess}</span>
                  </div>
                )}

                {/* Investment list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: "vent_ports", name: "Pacific Maritime Solar Logistics Terminals", yieldRate: "18.5% APY", tag: "Solar Hub Terminal Co-ownership", desc: "Fractional co-ownership in solar-powered harbors supplying charging to maritime container vessels.", min: 100, progress: 85 },
                    { id: "vent_charging", name: "Blade Battery Metropolitan Charging Giga-Grids", yieldRate: "14.2% APY", tag: "Blade charger network Settle", desc: "Fractional shares of local grids serving urban fast stations. Paid dynamic fractions of every charge cycles.", min: 250, progress: 91 },
                    { id: "vent_mining", name: "Autonomous deep-sea mineral mineral gatherers", yieldRate: "21.8% APY", tag: "High Output Resources Port", desc: "Co-own zero-emission mineral extraction crawlers gathering lithium nodules from subsea plateaus.", min: 500, progress: 73 }
                  ].map((vent) => (
                    <div key={vent.id} className="bg-slate-950 border border-slate-850 p-5 rounded-3xl hover:border-slate-800 transition flex flex-col justify-between space-y-4 font-sans relative overflow-hidden group">
                      
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono bg-indigo-950/45 px-2 py-0.5 rounded border border-indigo-900 text-indigo-300 font-extrabold uppercase">
                          {vent.tag}
                        </span>
                        <h4 className="font-bold text-white text-xs leading-tight pt-1">{vent.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Dynamic Yield Rate: <strong className="text-emerald-400">{vent.yieldRate}</strong></p>
                        <p className="text-[11px] text-slate-400 leading-normal">{vent.desc}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-900">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-slate-500">Node allocation limit:</span>
                          <span className="text-slate-300 font-bold">{vent.progress}% Funded</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${vent.progress}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="font-mono text-[9px] text-slate-500">Min entry rate: ${vent.min}.00</span>
                          <button
                            onClick={() => {
                              setInvestAmount(vent.min.toString());
                              setInvestSuccess(null);
                              const investForm = document.getElementById("venture-co-purchase-form");
                              if (investForm) investForm.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-mono uppercase tracking-wider font-extrabold cursor-pointer"
                          >
                            Acquire allocation
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Submitting investment form */}
                <div id="venture-co-purchase-form" className="mt-8 p-6 bg-slate-950 border border-indigo-500/20 rounded-3xl space-y-4 animate-fade-in text-left font-sans">
                  <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-900 pb-3">
                    <ArrowUpRight className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wider">Acquire Fractional Ventures Allocation</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-xs">
                    <div className="space-y-3">
                      <p className="text-slate-300">
                        Confirm allocation downpayment inside state infrastructure projects. Dividends are computed and logged directly in active ledger variables.
                      </p>
                      <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">Enter Capital Settle amount</label>
                        <input
                          type="number"
                          min={100}
                          placeholder="500"
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-850">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Available Safe Profile Balance</span>
                        <span className="text-lg font-black text-cyan-300 font-mono">
                          {formatBalance(data?.user?.balance || 0)}
                        </span>
                      </div>

                      <button
                        onClick={async () => {
                          const amt = parseFloat(investAmount);
                          if (isNaN(amt) || amt < 100) {
                            alert("Min acquire allocation rate is set to $100.00 USD.");
                            return;
                          }

                          if ((data?.user?.balance || 0) < amt) {
                            alert(`Insufficient Wallet Balance! Required allocation is $${amt.toFixed(2)}, but your balance is only $${(data?.user?.balance || 0).toFixed(2)}. Please fund your profile under the Wallet portal first.`);
                            handleTabClick("wallet");
                            return;
                          }

                          try {
                            const res = await fetch("/api/payments/instant-topup", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                              body: JSON.stringify({ amount: -amt, method: "Fractional Co-ownership Allocation Settle" })
                            });
                            if (res.ok) {
                              const newInv = {
                                amountPaid: amt,
                                estYield: "18.5% APY",
                                timestamp: new Date().toLocaleString(),
                                randomID: "INV-NODE-" + Math.floor(Math.random() * 900000 + 100000)
                              };
                              const updatedInv = [newInv, ...activeInvestments];
                              setActiveInvestments(updatedInv);
                              localStorage.setItem("byd_investments", JSON.stringify(updatedInv));
                              setInvestSuccess(`🎉 Venture Capital Shares Confirmed! Debited $${amt.toFixed(2)} USD from lock escrow. Active yield tracker has booted.`);
                              await loadSummaryData();
                            } else {
                              alert("System proxy rejected the transactions. Check database levels.");
                            }
                          } catch {
                            alert("Venture Settle Database Connection Error.");
                          }
                        }}
                        className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition cursor-pointer text-center"
                      >
                        Authorize & Acquire share node ➔
                      </button>
                    </div>
                  </div>
                </div>

                {/* My active portfolio tracker */}
                {activeInvestments.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800 text-left font-sans">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>My Live APY Fractional Co-ownership portfolio</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeInvestments.map((inv, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex justify-between items-center">
                          <div className="space-y-1">
                            <h5 className="font-mono text-[11px] text-indigo-400 font-bold">{inv.randomID}</h5>
                            <p className="text-[10px] text-slate-500">{inv.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-mono text-xs font-bold font-black">+${inv.amountPaid.toFixed(2)} USD</p>
                            <p className="text-[8px] font-mono text-slate-500">Live compounding @ {inv.estYield}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* DEDICATED DONATION CENTER PORTAL */}
          {activeTab === "donation" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div id="orphanage-outreach-and-charity" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl">
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span>Philanthropy Assistance & Social Hope Desk</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-sans leading-normal">
                      Co-owners have immediate power to sponsor foster children nutrition, eco barries, schools, and medical kits. Choose any live organization and co-verify distribution nodes.
                    </p>
                  </div>

                  {/* Charity selector drop-down */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 font-sans text-xs">
                    <div className="sm:col-span-5">
                      <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">Selected Philanthropy Target</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-sans cursor-pointer"
                        value={dashSelectedCharityId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDashSelectedCharityId(val);
                          const mapping: Record<string, string> = {
                            "charity_unicef": "UNICEF Children Foster",
                            "charity_redcross": "Red Cross Emergency Care",
                            "charity_savechildren": "Save The Children nutrition",
                            "charity_horizonhope": "Horizon Hope Orphanage"
                          };
                          setDashSelectedCharityName(mapping[val] || "Charity Assistance");
                        }}
                      >
                        <option value="charity_unicef">UNICEF Children Foster</option>
                        <option value="charity_redcross">Red Cross Emergency Care</option>
                        <option value="charity_savechildren">Save The Children nutrition</option>
                        <option value="charity_horizonhope">Horizon Hope Orphanage</option>
                      </select>
                    </div>

                    <div className="sm:col-span-7">
                      <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">Sponsorship Amount (Settle Level)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["59", "120", "250", "500"].map((usd) => (
                          <button
                            key={usd}
                            type="button"
                            onClick={() => setDashDonationAmount(usd)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer select-none ${
                              dashDonationAmount === usd
                                ? "bg-slate-950 border-rose-500 text-rose-400 font-bold"
                                : "bg-slate-950 border-slate-850 text-slate-555 hover:border-slate-800"
                            }`}
                          >
                            ${usd}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans pt-3 border-t border-slate-900/60 font-sans">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono select-none">Philanthropic Co-owner Message</label>
                    <input 
                      type="text"
                      placeholder="Enter a message to record on the community ledger..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-sans"
                      value={dashDonorNote}
                      onChange={(e) => setDashDonorNote(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">PHILANTHROPY PAYMENT GATEWAY OPTION</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "crypto", title: "USDT CRYPTO WALLET" },
                        { id: "card", title: "CREDIT/DEBIT CARD" },
                        { id: "balance", title: "ACTIVE WALLET BALANCE" }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setDashDonationMethod(pay.id as any)}
                          className={`py-2 rounded-xl text-[9px] font-mono tracking-tighter uppercase font-black transition cursor-pointer ${
                            dashDonationMethod === pay.id 
                              ? "bg-slate-950 border border-indigo-500/50 text-indigo-400 shadow-md font-bold"
                              : "bg-slate-950 border border-slate-850 text-slate-550 hover:border-slate-800 hover:text-slate-400"
                          }`}
                        >
                          {pay.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional input fields */}
                  {dashDonationMethod === "card" && (
                    <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-sans text-xs animate-fade-in">
                      <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1">Interactive Credit Card digits</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                          value={dashCardNum}
                          onChange={(e) => setDashCardNum(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {dashDonationMethod === "balance" && (
                    <div className="space-y-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-slate-950 font-sans text-xs animate-fade-in text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Your Active Wallet Balance:</span>
                        <span className="text-rose-400 font-mono font-bold">{formatBalance(data?.user?.balance || 0)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal font-mono">
                        Deducts the sponsorship rate directly from your safe profile balance, instantly updating the orphanage central distribution networks.
                      </p>
                    </div>
                  )}

                  {dashDonationMethod === "crypto" && (
                    <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-sans text-xs text-slate-400 animate-fade-in">
                      <p className="text-[10px] leading-relaxed">
                        <strong className="text-white block mb-0.5 font-bold">Recommended Zero-Fee stable USDT protocol:</strong>
                        Send ERC20 / TRC20 USDT payments directly. Enter an optional hash code below to lock the transaction contract.
                      </p>
                      <input
                        type="text"
                        placeholder="TXH-901D89A893..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                        value={dashCryptoTx}
                        onChange={(e) => setDashCryptoTx(e.target.value)}
                      />
                    </div>
                  )}

                </div>

                {dashDonationMessage && (
                  <div className={`p-4 rounded-xl text-[11px] leading-relaxed font-sans border animate-fade-in ${
                    dashDonationMessage.type === "success" 
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
                      : "bg-red-950/40 border-red-500/30 text-red-500"
                  }`}>
                    {dashDonationMessage.text}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-900/60 mt-4 leading-normal font-sans text-xs">
                  <button
                    id="btn-confirm-sponsorship"
                    onClick={async () => {
                      const amtVal = parseFloat(dashDonationAmount);
                      if (isNaN(amtVal) || amtVal <= 0) {
                        setDashDonationMessage({ type: "error", text: "Please enter a valid amount." });
                        return;
                      }

                      setDashDonating(true);
                      setDashDonationMessage(null);

                      // Balance sponsorship option handles direct debit
                      if (dashDonationMethod === "balance") {
                        if ((data?.user?.balance || 0) < amtVal) {
                          setDashDonationMessage({
                            type: "error",
                            text: `Insufficient Account Balance! Donation requires $${amtVal.toFixed(2)}, but your wallet is only $${(data?.user?.balance || 0).toFixed(2)}. Please top up your wallet first.`
                          });
                          setDashDonating(false);
                          return;
                        }

                        try {
                          // Debit profile balance using interactive auto-adjustment endpoint!
                          const resDeduct = await fetch("/api/payments/instant-topup", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                            body: JSON.stringify({ amount: -amtVal, method: `Sponsorship donation target: ${dashSelectedCharityName}` })
                          });
                          if (resDeduct.ok) {
                            setDashDonationMessage({
                              type: "success",
                              text: `🎉 Philanthropic Contribution Confirmed! Debited $${amtVal.toFixed(2)} USD from your account balance. Your sponsorship has been logged on the shared sandbox database blueprint!`
                            });
                            await loadSummaryData();
                          } else {
                            setDashDonationMessage({ type: "error", text: "Balance deduction rejected." });
                          }
                        } catch {
                          setDashDonationMessage({ type: "error", text: "Network database transfer offline." });
                        } finally {
                          setDashDonating(false);
                        }
                        return;
                      }

                      // Standard Card / Crypto sponsorships
                      try {
                        const res = await fetch("/api/charity/donate-dashboard", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                          },
                          body: JSON.stringify({
                            amount: amtVal,
                            charityId: dashSelectedCharityId,
                            charityName: dashSelectedCharityName,
                            paymentMethod: dashDonationMethod,
                            cardNum: dashCardNum,
                            paypalEmail: dashPaypalEmail,
                            txHash: dashCryptoTx,
                            donorNote: dashDonorNote
                          })
                        });
                        const resJson = await res.json();
                        if (res.ok) {
                          setDashDonationMessage({ type: "success", text: resJson.message });
                          setDashCryptoTx("");
                          setDashDonorNote("");
                          loadSummaryData();
                        } else {
                          setDashDonationMessage({ type: "error", text: resJson.error });
                        }
                      } catch {
                        setDashDonationMessage({ type: "error", text: "Network connection offline." });
                      } finally {
                        setDashDonating(false);
                      }
                    }}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-xl transition shadow-lg shadow-rose-900/40 cursor-pointer text-center"
                  >
                    {dashDonating ? "Authenticating Settle Node Gateway..." : `Confirm Sponsorship Settle Of $${dashDonationAmount}.00 USD`}
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-fade-in text-left">
              <HelpPage onNavigate={onNavigate} />
            </div>
          )}



        {/* KYC English alert blocker popup modal */}
        {kycPopupOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/40 p-6 rounded-2xl shadow-2xl relative text-center">
              <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 mb-4 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Identity Audit Required</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Access to <strong className="text-red-400">"{kycModalTabName}"</strong> is currently locked. Modern vehicle networks require completed regulatory KYC compliance.
              </p>
              <div className="mt-4 bg-slate-950 p-3 rounded-lg text-left text-[11px] text-slate-400 border border-slate-800 space-y-1 font-mono">
                <p className="text-slate-300 font-semibold">How to submit details:</p>
                <p>1. Supply front/back ID copies in the Biometric Verification Wizard below.</p>
                <p>2. Complete live face snapshot capture cleanly.</p>
                <p>3. Submit, and wait for the verification network to validate your identity credentials securely.</p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setKycPopupOpen(false);
                    // Scroll to Biometrics section
                    const section = document.getElementById("kyc-verification-wizard-panel");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition"
                >
                  Go to Biometric Form ➔
                </button>
                <button
                  onClick={() => setKycPopupOpen(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Dismiss Modal
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
