import React, { useState, useEffect } from "react";
import { CreditCard, Shield, ChevronRight, Lock, Copy, CheckCircle, RefreshCcw, HelpCircle, ShieldAlert, Camera, Check, FileText, Upload, Eye, EyeOff } from "lucide-react";

interface PaymentFlowProps {
  initialPlan?: string;
  triggerLogin?: boolean;
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
  onLoginSuccess: (token: string, user: any) => void;
}

const CAR_MODELS = [
  { id: "seal", name: "BYD Seal (Luxury Sedan)", price: 45000, monthly12: 250, monthly24: 150 },
  { id: "han", name: "BYD Han (Executive Edition)", price: 55000, monthly12: 350, monthly24: 210 },
  { id: "atto", name: "BYD Atto 3 (Sporty SUV)", price: 35000, monthly12: 180, monthly24: 110 },
  { id: "dolphin", name: "BYD Dolphin (Eco Compact)", price: 24500, monthly12: 120, monthly24: 75 }
];

export default function PaymentFlow({ initialPlan, triggerLogin, onNavigate, onLoginSuccess }: PaymentFlowProps) {
  const [step, setStep] = useState(1); // 1: Signup, 2: Choose Plan, 3: Choose Payment, 4: Blockchain Awaiting, 5: KYC Verification
  
  // Login vs Sign up toggler view
  const [isLoginView, setIsLoginView] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  // Registration States
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referral_code: "",
    city: ""
  });
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // KYC States
  const [kycForm, setKycForm] = useState({
    name: "",
    dob: "",
    nationality: "USA",
    idNumber: ""
  });
  const [kycFiles, setKycFiles] = useState<{ idFront: string; idBack: string; addressProof: string }>({
    idFront: "",
    idBack: "",
    addressProof: ""
  });
  const [selfieSrc, setSelfieSrc] = useState<string>("");
  const [kycStep, setKycStep] = useState(1); // 1: Identity fields, 2: Upload Files, 3: Webcam comparison
  const [kycProgress, setKycProgress] = useState(0);
  const [kycStatusMessage, setKycStatusMessage] = useState("");
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Plan Selection States
  const [planType, setPlanType] = useState<"membership" | "installment">("membership");
  const [selectedCarId, setSelectedCarId] = useState("seal");
  const [selectedTerm, setSelectedTerm] = useState<12 | 24>(12);

  // Payment Timing Simulations
  const [selectedMethod, setSelectedMethod] = useState<"card" | "paypal" | "crypto" | "paystack" | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [processTimer, setProcessTimer] = useState(20);
  const [cardLockedUntil, setCardLockedUntil] = useState<number | null>(null);
  const [paypalLockedUntil, setPaypalLockedUntil] = useState<number | null>(null);
  const [countdownString, setCountdownString] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Paystack Simulated Interactive Overlay State
  const [paystackStage, setPaystackStage] = useState<"none" | "input" | "otp" | "loading" | "success">("none");
  const [paystackCardNumber, setPaystackCardNumber] = useState("");
  const [paystackExpiry, setPaystackExpiry] = useState("");
  const [paystackCvv, setPaystackCvv] = useState("");
  const [paystackPin, setPaystackPin] = useState("");
  const [paystackOtp, setPaystackOtp] = useState("");

  // Crypto Pending State
  const [pendingCryptoDetail, setPendingCryptoDetail] = useState<{
    wallet_address: string;
    amount: number;
    transaction_hash: string;
    payment_id: number;
  } | null>(null);

  // Autoload URL reference search parameters if user came with a referral
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setSignupForm(prev => ({ ...prev, referral_code: refCode.trim().toUpperCase() }));
    }
    
    if (initialPlan === "installment") {
      setPlanType("installment");
    }
  }, [initialPlan]);

  useEffect(() => {
    if (triggerLogin) {
      setIsLoginView(true);
    }
  }, [triggerLogin]);

  // Handle countdown locks for Payment Methods due to Timeout Congestion failures
  useEffect(() => {
    let interval: any;
    if (cardLockedUntil || paypalLockedUntil) {
      interval = setInterval(() => {
        const now = Date.now();
        let counts = "";
        
        if (cardLockedUntil) {
          const diffCard = Math.ceil((cardLockedUntil - now) / 1000);
          if (diffCard <= 0) {
            setCardLockedUntil(null);
          } else {
            const m = Math.floor(diffCard / 60);
            const s = diffCard % 60;
            counts += `Stripe lock: ${m}:${s.toString().padStart(2, "0")}. `;
          }
        }

        if (paypalLockedUntil) {
          const diffPaypal = Math.ceil((paypalLockedUntil - now) / 1000);
          if (diffPaypal <= 0) {
            setPaypalLockedUntil(null);
          } else {
            const m = Math.floor(diffPaypal / 60);
            const s = diffPaypal % 60;
            counts += `PayPal lock: ${m}:${s.toString().padStart(2, "0")}`;
          }
        }
        
        setCountdownString(counts);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cardLockedUntil, paypalLockedUntil]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      
      if (res.ok) {
        // Simple signup then sign in
        setIsLoginView(true);
        setLoginForm({ email: signupForm.email, password: "" });
        setErrorMessage("🎉 BYD Profile registered successfully! Please log in with your credentials to access your global dashboard.");
      } else {
        setErrorMessage(data.error || "A processing error occurred during signup.");
      }
    } catch {
      setErrorMessage("Could not connect to authentication services.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      
      if (res.ok) {
        setAuthToken(data.token);
        setUser(data.user);
        onLoginSuccess(data.token, data.user);
        
        // If login belongs to administrator, navigate to administrative control panel
        if (data.user?.is_admin) {
          onNavigate("admin");
        } else {
          // Go straight to user's dashboard!
          onNavigate("dashboard");
        }
      } else {
        setErrorMessage(data.error || "Incorrect email address or security credentials.");
      }
    } catch {
      setErrorMessage("Could not connect to local validation server.");
    } finally {
      setRegLoading(false);
    }
  };

  const syncKycDbStatus = async () => {
    errorMessage && setErrorMessage("");
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        onLoginSuccess(authToken, data.user);
        if (data.user.kyc_status === "verified") {
          alert("🎉 System confirmed: Your legal identity has been VERIFIED. Proceeding to package configuration!");
          setStep(2); // Go to Choose Plan
        } else {
          alert(`Verification check: SQLite status is currently "${data.user.kyc_status}". Please go to the homepage, click the "Jadai Studios" link at the very bottom of the page 5 times to open the panel, choose "KYC Identity Audits", click APPROVED, and return here.`);
        }
      }
    } catch {
      alert("Verification link failure.");
    }
  };

  const handleKycSubmit = async () => {
    setKycSubmitting(true);
    setKycProgress(5);
    setKycStatusMessage("Opening secure validation port...");
    
    // Simulate progression
    const intervals = [
      { p: 25, m: "Auditing document consistency..." },
      { p: 50, m: "Analyzing biometric structural facial symmetry..." },
      { p: 75, m: "Cross-correlating documents with verification records..." },
      { p: 90, m: "Verifying live biometric liveness check match..." },
      { p: 100, m: "Uploading secure identity token to secure database..." }
    ];

    let currentIdx = 0;
    const progressTimer = setInterval(async () => {
      if (currentIdx < intervals.length) {
        setKycProgress(intervals[currentIdx].p);
        setKycStatusMessage(intervals[currentIdx].m);
        currentIdx++;
      } else {
        clearInterval(progressTimer);
        
        // Execute actual submit
        try {
          const res = await fetch("/api/kyc/submit", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
              name: kycForm.name,
              dob: kycForm.dob,
              nationality: kycForm.nationality,
              idNumber: kycForm.idNumber,
              idFront: kycFiles.idFront || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%231E293B'/></svg>",
              idBack: kycFiles.idBack || "",
              selfie: selfieSrc || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%231E293B'/></svg>",
              addressProof: kycFiles.addressProof || ""
            })
          });

          const data = await res.json();
          if (res.ok) {
            setUser(prev => ({ ...prev, kyc_status: "pending" }));
            // Trigger parent login state sync
            onLoginSuccess(authToken, { ...user, kyc_status: "pending" });
          } else {
            alert(data.error || "Submission failure.");
          }
        } catch {
          alert("Internal link connection failure.");
        } finally {
          setKycSubmitting(false);
          setKycProgress(0);
        }
      }
    }, 800);
  };

  const handleProceedPaymentMethod = () => {
    // Sandbox Bypass: if identity is not verified, automatically qualify the user for Sandbox trials
    if (user && user.kyc_status !== "verified") {
      setUser(prev => prev ? { ...prev, kyc_status: "verified" } : null);
      onLoginSuccess(authToken, { ...user, kyc_status: "verified" });
    }
    setStep(3);
    if (planType === "installment") {
      // Support credit card processing as well for premium card-linking test scenarios
      setSelectedMethod("card");
    }
  };

  const selectedCar = CAR_MODELS.find(c => c.id === selectedCarId);
  const paymentAmount = planType === "membership" 
    ? 199.00 
    : (selectedTerm === 12 ? selectedCar?.monthly12 : selectedCar?.monthly24) || 250.00;

  const handleExecutePayment = async () => {
    if (planType === "installment" && selectedMethod !== "crypto" && selectedMethod !== "paystack" && selectedMethod !== "card" && selectedMethod !== "paypal") {
      setPaymentError("A secure transaction settlement is required for active hardware installment co-ownership contracts.");
      return;
    }

    if (!selectedMethod) {
      alert("Please choose a payment method to settle your lock-price.");
      return;
    }

    setPaymentError("");

    if (selectedMethod === "paystack") {
      // Launch inline Paystack secure operating overlay
      setPaystackStage("input");
      return;
    }

    if (selectedMethod === "card" || selectedMethod === "paypal") {
      setIsProcessingLocal(true);
      setProcessTimer(3);
      
      setTimeout(async () => {
        try {
          const res = await fetch("/api/payments/card/success", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
              amount: paymentAmount,
              type: planType === "membership" ? "membership" : "installment",
              vehicleModel: planType === "installment" ? selectedCar?.name : undefined,
              termMonths: planType === "installment" ? selectedTerm : undefined,
              monthlyInstallment: planType === "installment" ? paymentAmount : undefined,
              cardNumber: paystackCardNumber || (selectedMethod === "card" ? "4111 2222 3333 4810" : "PAYPAL-SETTLE-8830"),
              cardPin: paystackPin || "1234"
            })
          });

          const data = await res.json();
          setIsProcessingLocal(false);
          if (res.ok) {
            alert(`🎉 Transaction Succeeded!\n\n${data.message}`);
            onNavigate("dashboard");
          } else {
            setPaymentError(data.error || "Sandbox transaction declined.");
          }
        } catch {
          setIsProcessingLocal(false);
          setPaymentError("Gateway link connection error. Please retry.");
        }
      }, 1500);
      
      return;
    }

    // Crypto Chosen path: Call backend to create pending block index
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          method: "crypto",
          type: planType === "membership" ? "membership" : "installment",
          amount: paymentAmount,
          vehicleModel: planType === "installment" ? selectedCar?.name : undefined,
          monthlyInstallment: planType === "installment" ? paymentAmount : undefined,
          termMonths: planType === "installment" ? selectedTerm : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPendingCryptoDetail(data);
        setStep(4); // Awaiting Cryptos Screen
      } else {
        alert(data.error || "Failed database allocation.");
      }
    } catch {
      alert("Error initiating payment record.");
    }
  };

  const handlePaystackCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paystackCardNumber || !paystackExpiry || !paystackCvv) {
      alert("Please fill out complete card fields.");
      return;
    }
    setPaystackStage("loading");
    setTimeout(() => {
      setPaystackStage("otp");
    }, 1500);
  };

  const handlePaystackOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paystackOtp) {
      alert("Please enter security Pin or OTP code validation.");
      return;
    }

    setPaystackStage("loading");
    try {
      const res = await fetch("/api/payments/paystack/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: paymentAmount,
          type: planType === "membership" ? "membership" : "installment",
          vehicleModel: planType === "installment" ? selectedCar?.name : undefined,
          monthlyInstallment: planType === "installment" ? paymentAmount : undefined,
          termMonths: planType === "installment" ? selectedTerm : undefined
        })
      });

      const d = await res.json();
      if (res.ok) {
        setPaystackStage("success");
        setTimeout(() => {
          setPaystackStage("none");
          onNavigate("dashboard");
        }, 2500);
      } else {
        alert(d.error || "Paystack gateway validation exception.");
        setPaystackStage("input");
      }
    } catch {
      alert("Network exception communicating with Paystack secure server.");
      setPaystackStage("input");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4" id="payment-flow">
      {/* Visual Step Tracker banner */}
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-900 max-w-xl mx-auto text-xs font-mono text-slate-500">
        <span className={`px-2 py-1 rounded ${step === 1 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold" : "text-slate-500"}`}>1. Register</span>
        <ChevronRight className="w-4 h-4 text-slate-700" />
        <span className={`px-2 py-1 rounded ${step === 2 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold" : "text-slate-500"}`}>2. Package</span>
        <ChevronRight className="w-4 h-4 text-slate-700" />
        <span className={`px-2 py-1 rounded ${step === 3 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold" : "text-slate-500"}`}>3. Checkout</span>
        <ChevronRight className="w-4 h-4 text-slate-700" />
        <span className={`px-2 py-1 rounded ${step === 4 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold" : "text-slate-500"}`}>4. Escrow Status</span>
      </div>

      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-lg mx-auto">
          {!isLoginView ? (
            <>
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-white">Create Club Account</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Settle secure logins to lock-in Founder rates. Zero hidden costs.</p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-xl leading-relaxed">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={signupForm.name}
                    onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Sarah Jennings"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Email Port</label>
                    <input 
                      required
                      type="email"
                      value={signupForm.email}
                      onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Phone Line</label>
                    <input 
                      required
                      type="tel"
                      value={signupForm.phone}
                      onChange={e => setSignupForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Security Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showSignupPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white focus:outline-none"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Delivery City</label>
                    <input 
                      required
                      type="text"
                      value={signupForm.city}
                      onChange={e => setSignupForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Austin, TX"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Referral Code <span className="text-[9px] text-slate-500 lowercase">(optional)</span></label>
                    <input 
                      type="text"
                      value={signupForm.referral_code}
                      onChange={e => setSignupForm(p => ({ ...p, referral_code: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="BYD-REF-XXXX"
                    />
                  </div>
                </div>

                <button 
                  id="submit-register"
                  disabled={regLoading}
                  type="submit" 
                  className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-500 transition text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center space-x-2"
                >
                  <span>{regLoading ? "Compiling secure vaults..." : "Register & Settle Packages"}</span>
                </button>
              </form>
              <div className="text-center mt-6">
                <button 
                  onClick={() => { setIsLoginView(true); setErrorMessage(""); }}
                  className="text-xs text-blue-400 hover:underline font-mono"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-white">Access Member Dashboard</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Input your email and password to load your Horizon workspace.</p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-xl leading-relaxed">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5 font-bold">Email Address</label>
                  <input 
                    required
                    type="text"
                    value={loginForm.email}
                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                    placeholder="name@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1.5 font-bold">Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white focus:outline-none"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  id="submit-login"
                  disabled={regLoading}
                  type="submit" 
                  className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-500 transition text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center space-x-2"
                >
                  <span>{regLoading ? "Authorizing..." : "Sign In"}</span>
                </button>
              </form>
              <div className="text-center mt-6">
                <button 
                  onClick={() => { setIsLoginView(false); setErrorMessage(""); }}
                  className="text-xs text-blue-400 hover:underline font-mono"
                >
                  Don't have an account? Sign Up now
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-white">Select Your Horizon Program</h2>
            <p className="text-xs text-slate-400 mt-1.5">Select a one-time membership plan or set up co-ownership installments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Plan A: Membership */}
            <div 
              onClick={() => setPlanType("membership")}
              className={`p-6 sm:p-8 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${planType === "membership" ? "bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-950/5" : "bg-slate-900/50 border-slate-800/80 hover:border-slate-800"}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">Immediate Access</span>
                    <h3 className="font-display font-bold text-lg mt-2 text-white">Horizon Club Membership</h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-white">$199</span>
                    <span className="text-[10px] text-slate-500 block">one-time fee</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Perfect for non-vehicle owners who want to collect high fidelity dividends, refer nodes, and spend complimentary points in the luxury store.
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Complimentary 2,000 Horizon Points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active Referral Link ($50 Dividend Rate)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>72-hour Priority Support Escalate Line</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <input 
                  type="radio" 
                  checked={planType === "membership"}
                  onChange={() => {}}
                  className="h-4 w-4 accent-blue-500" 
                />
              </div>
            </div>

            {/* Plan B: Installment */}
            <div 
              onClick={() => setPlanType("installment")}
              className={`p-6 sm:p-8 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${planType === "installment" ? "bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-950/5" : "bg-slate-900/50 border-slate-800/80 hover:border-slate-800"}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-550/30 font-mono">Hardware Asset</span>
                    <h3 className="font-display font-bold text-lg mt-2 text-white">BYD Co-ownership installment</h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-white">$0</span>
                    <span className="text-[10px] text-slate-500 block">down payment</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Commit to a flexible hardware installment path. Set a plan for your desired vehicle and track delivery.
                </p>

                {planType === "installment" && (
                  <div className="space-y-4 bg-slate-950 border border-slate-800 p-4 rounded-xl mb-4" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Select Car Model</label>
                      <select 
                        value={selectedCarId}
                        onChange={e => {
                          e.stopPropagation();
                          setSelectedCarId(e.target.value);
                        }}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {CAR_MODELS.map(car => (
                          <option key={car.id} value={car.id}>
                            {car.name} (${car.price.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-between space-x-4">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Payment Term</label>
                        <select 
                          value={selectedTerm}
                          onChange={e => {
                            e.stopPropagation();
                            setSelectedTerm(Number(e.target.value) as 12 | 24);
                          }}
                          onClick={e => e.stopPropagation()}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value={12}>12 Months Term</option>
                          <option value={24}>24 Months Term</option>
                        </select>
                      </div>
                      <div className="text-right flex flex-col justify-end">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Cost Per Month</span>
                        <span className="text-blue-400 font-bold font-mono text-base">
                          ${selectedTerm === 12 ? selectedCar?.monthly12 : selectedCar?.monthly24} / mo
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Real-time logistics tracking map access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Full membership benefits (referrals enabled)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Flexible payment terms</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 flex justify-between items-center">
                <input 
                  type="radio" 
                  checked={planType === "installment"}
                  onChange={() => {}}
                  className="h-4 w-4 accent-blue-500" 
                />
              </div>
            </div>
          </div>

          {planType === "installment" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h4 className="font-display font-semibold text-xs text-slate-100 uppercase tracking-widest mb-4 font-mono">Simulated Amortization Ledger</h4>
              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-2">Installment Index</th>
                      <th className="p-2">Outstanding Principal</th>
                      <th className="p-2">Interest Portion</th>
                      <th className="p-2">Monthly Dues Settle</th>
                      <th className="p-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-2">Dues 01 (Due Today)</td>
                      <td className="p-2">${selectedCar?.price.toLocaleString()}</td>
                      <td className="p-2">0.00%</td>
                      <td className="p-2 font-bold text-white">${paymentAmount}</td>
                      <td className="p-2 text-right text-amber-500">Awaiting Checkout</td>
                    </tr>
                    <tr>
                      <td className="p-2">Dues 02 (In 30 days)</td>
                      <td className="p-2">${((selectedCar?.price || 0) - paymentAmount).toLocaleString()}</td>
                      <td className="p-2">0.00%</td>
                      <td className="p-2">${paymentAmount}</td>
                      <td className="p-2 text-right text-slate-500">Pending</td>
                    </tr>
                    <tr>
                      <td className="p-2">Dues 03 (In 60 days)</td>
                      <td className="p-2">${((selectedCar?.price || 0) - (paymentAmount * 2)).toLocaleString()}</td>
                      <td className="p-2">0.00%</td>
                      <td className="p-2">${paymentAmount}</td>
                      <td className="p-2 text-right text-slate-500">Pending</td>
                    </tr>
                    <tr>
                      <td className="p-2">Dues 04+</td>
                      <td className="p-2">Decentralized decay</td>
                      <td className="p-2">0.00%</td>
                      <td className="p-2">${paymentAmount}</td>
                      <td className="p-2 text-right text-slate-500">Pending</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleProceedPaymentMethod}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs tracking-wider uppercase transition flex items-center space-x-2 shadow-lg shadow-blue-900/10"
            >
              <span>Configure Settle Method</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10">
            <h2 className="font-display text-xl font-bold text-center text-white mb-2">Secure Dues Escrow Settlement</h2>
            {planType === "installment" ? (
              <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 rounded-xl leading-relaxed text-center font-mono">
                ⚠️ <strong className="text-white">IMMEDIATE PAYMENT REQUIRED:</strong>
                <br />The first installment due of <span className="text-emerald-400 font-bold">${paymentAmount.toFixed(2)} USDT</span> is due immediately. Stabilized cryptocurrency is required for blockchain smart contract deployment.
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center mb-8 font-mono">Amount pending: <span className="text-blue-400 font-bold">${paymentAmount.toFixed(2)} USD</span></p>
            )}

            {paymentError && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-xl leading-relaxed font-mono">
                ⚠️ {paymentError}
              </div>
            )}

            {countdownString && (
              <div className="mb-6 p-3 bg-amber-950/40 border border-amber-500/20 text-[10px] text-amber-300 rounded-xl font-mono text-center">
                ⛔ Automated safety block: {countdownString}
              </div>
            )}

            {isProcessingLocal ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-600 border-t-blue-500"></div>
                <div className="text-center">
                  <h4 className="font-display font-medium text-slate-200">Executing transaction protocols...</h4>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Simulating secure gateways. Elapsed timer: {processTimer}s</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stripe */}
                <div 
                  onClick={() => {
                    if (!cardLockedUntil) setSelectedMethod("card");
                  }}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${cardLockedUntil ? "opacity-35 cursor-not-allowed bg-slate-950/50 border-slate-900" : "cursor-pointer"} ${selectedMethod === "card" ? "bg-slate-950 border-blue-500/60" : "bg-slate-950 border-slate-800 hover:border-slate-705"}`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">Credit Card - Stripe Gateway Instance</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Standard consumer sandbox checkout
                      </span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="pm"
                    disabled={!!cardLockedUntil}
                    checked={selectedMethod === "card"}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-500"
                  />
                </div>
 
                {/* PayPal */}
                <div 
                  onClick={() => {
                    if (!paypalLockedUntil) setSelectedMethod("paypal");
                  }}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${paypalLockedUntil ? "opacity-35 cursor-not-allowed bg-slate-950/50 border-slate-900" : "cursor-pointer"} ${selectedMethod === "paypal" ? "bg-slate-950 border-blue-500/60" : "bg-slate-950 border-slate-800 hover:border-slate-705"}`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">PayPal Integrated Express</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Verify credentials on sandbox popup terminal
                      </span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="pm"
                    disabled={!!paypalLockedUntil}
                    checked={selectedMethod === "paypal"}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-500"
                  />
                </div>

                {/* Paystack Gateway Option */}
                <div 
                  onClick={() => setSelectedMethod("paystack")}
                  className={`p-4 rounded-xl border flex items-center justify-between transition cursor-pointer bg-slate-950 ${selectedMethod === "paystack" ? "border-cyan-500/60 shadow-lg shadow-cyan-950/5" : "border-slate-800 hover:border-slate-700"}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1 px-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                      Paystack
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Paystack Unified Payment Gateway</h4>
                      <span className="text-[10px] text-cyan-400 font-mono">★ Settle immediately via Mastercard, Visa, NGN Bank Transfer or Verve.</span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="pm"
                    checked={selectedMethod === "paystack"}
                    onChange={() => {}}
                    className="h-4 w-4 accent-cyan-500"
                  />
                </div>

                {/* Cryptocurrency */}
                <div 
                  onClick={() => setSelectedMethod("crypto")}
                  className={`p-4 rounded-xl border flex items-center justify-between transition cursor-pointer bg-slate-950 ${selectedMethod === "crypto" ? "border-emerald-500/60 shadow-lg shadow-emerald-950/5" : "border-slate-800 hover:border-slate-700"}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                      Stable
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Cryptocurrency (USDT - ERC20/TRC20)</h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">★ Required Settle Node. Instant Escrow Confirmation.</span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="pm"
                    checked={selectedMethod === "crypto"}
                    onChange={() => {}}
                    className="h-4 w-4 accent-emerald-500"
                  />
                </div>

                {selectedMethod === "card" && (
                  <div className="mt-6 p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-4 text-left">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-900">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">Linked Visa/Mastercard Authorization</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Standard Card Number</label>
                        <input 
                          type="text"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-505 font-mono"
                          placeholder="4111 2222 3333 4810"
                          value={paystackCardNumber}
                          onChange={e => setPaystackCardNumber(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-505 font-mono uppercase tracking-widest mb-1.5 font-bold">Expiry Date</label>
                          <input 
                            type="text"
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-505 font-mono"
                            placeholder="12/28"
                            value={paystackExpiry}
                            onChange={e => setPaystackExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-505 font-mono uppercase tracking-widest mb-1.5 font-bold">Security CVV</label>
                          <input 
                            type="password"
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-505 font-mono"
                            placeholder="***"
                            maxLength={3}
                            value={paystackCvv}
                            onChange={e => setPaystackCvv(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold text-amber-400">Master Security Authorization PIN (4 digits)</label>
                        <input 
                          type="password"
                          required
                          className="w-full bg-slate-905 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          placeholder="1234"
                          maxLength={4}
                          value={paystackPin}
                          onChange={e => setPaystackPin(e.target.value)}
                        />
                        <span className="text-[9px] text-slate-500 block mt-1 font-mono">This PIN secures your hardware dispatch registry lock. Keep it safe.</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "paypal" && (
                  <div className="mt-6 p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-4 text-left">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-900">
                      <CreditCard className="w-4 h-4 text-yellow-500" />
                      <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">PayPal Integrated Express</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-slate-505 font-mono uppercase tracking-widest mb-1.5 font-bold">PayPal Email Address</label>
                        <input 
                          type="email"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-505 font-mono"
                          placeholder="client@horizon-member.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-550 font-mono uppercase tracking-widest mb-1.5 font-bold">PayPal Password</label>
                        <input 
                          type="password"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-505 font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <button 
                    id="execute-purchase"
                    onClick={handleExecutePayment}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/10"
                  >
                    <Lock className="w-4 h-4 text-blue-200" />
                    <span>Submit Payment Authorization</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && pendingCryptoDetail && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <RefreshCcw className="w-6 h-6" />
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-white">Awaiting Ledger confirmations</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              To complete your settlement immediately, send precisely <span className="text-emerald-400 font-bold font-mono">{paymentAmount.toFixed(2)} USDT</span> or Bitcoin equivalent to the escrow wallet.
            </p>
          </div>

          {/* QR Code generator placeholder */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl inline-block max-w-[200px]">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${pendingCryptoDetail.wallet_address}`} 
              alt="Payment QR" 
              className="w-40 h-40 object-contain rounded-lg mx-auto"
            />
            <span className="text-[9px] uppercase font-mono text-slate-500 block mt-2 text-center">Escrow Wallet QR</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-3 max-w-md mx-auto">
            <div>
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Copy Wallet Address (USDT - TRC20/ERC20)</span>
              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded mt-1">
                <span className="text-xs text-slate-300 font-mono truncate mr-2">{pendingCryptoDetail.wallet_address}</span>
                <button onClick={() => copyToClipboard(pendingCryptoDetail.wallet_address)} className="text-slate-500 hover:text-white transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Deposit Transaction Memo hash</span>
              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded mt-1">
                <span className="text-xs text-slate-300 font-mono truncate mr-2">{pendingCryptoDetail.transaction_hash}</span>
                <button onClick={() => copyToClipboard(pendingCryptoDetail.transaction_hash)} className="text-slate-500 hover:text-white transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl max-w-md mx-auto space-y-2 leading-relaxed text-xs text-slate-400">
            <span className="text-[10px] text-amber-500 block font-bold font-mono">⚠️ LEDGER CHECK NOTICE DETAILS:</span>
            <span>Once your blockchain broadcast completes, the local database records will update automatically on three standard block confirmations.</span>
            <span className="block font-semibold mt-1 text-slate-300">
              You can access your secure dashboard console right now to monitor logistics, copy referral links, and view your orders.
            </span>
          </div>

          <div className="pt-4 flex flex-col space-y-2 max-w-xs mx-auto">
            <button 
              id="confirm-crypto-next"
              onClick={() => onNavigate("dashboard")}
              className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs rounded-xl shadow-lg transition"
            >
              Enter Club Console Dashboard
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="max-w-2xl mx-auto">
          {/* Status Check blocks */}
          {user?.kyc_status === "verified" ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Identity Successfully Verified</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                  Regulatory compliance audits have passed! Standard features, point transfers, and hardware co-ownership installments are unlocked.
                </p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs uppercase tracking-wider"
              >
                Configure Your Horizon Program
              </button>
            </div>
          ) : user?.kyc_status === "pending" ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6">
              <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white font-sans uppercase">Identity Audit Pending Review</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Your legal identification dossiers have been logged into the SQLite compliance queue and are awaiting review from the administration log (Aduits queue wait: 1-2 mins).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-3 bg-slate-950 rounded-xl text-left border border-slate-850 font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 block">SUBMITTED BY</span>
                  <span className="text-slate-200 mt-0.5 block truncate">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SYSTEM STATUS</span>
                  <span className="text-amber-400 mt-0.5 block font-bold">MANUAL_AUDIT</span>
                </div>
              </div>

              <div className="py-2 flex flex-col space-y-2 max-w-sm mx-auto">
                <button 
                  onClick={syncKycDbStatus}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition text-white font-bold text-xs uppercase tracking-wider rounded-xl font-mono flex items-center justify-center space-x-1.5"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Sync Profile Audits</span>
                </button>
              </div>

              {/* Developer Bypass Sandbox guide */}
              <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl text-left text-xs max-w-sm mx-auto space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-orange-400 font-mono tracking-wider block">🔍 ADMIN BYPASS SHORTCUT</span>
                <p className="text-[10px] text-slate-350 leading-relaxed">
                  To pass this screen instantly: go to the homepage, click <strong>Jadai Studios</strong> in the footer <strong>5 times</strong> to open the admin panel. Select <strong>KYC Identity Audits</strong> tab, click <strong>"APPROVE"</strong> on your registered record, then return here and click <strong>"Sync Profile Audits"</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
              {/* Steppers */}
              <div>
                <h3 className="font-display font-bold text-lg text-white">Legal Identification & Biometrics Verification</h3>
                <p className="text-[11px] text-slate-400 mt-1">To ensure investment security compliance, please register your credential portfolio.</p>
                
                <div className="h-1 w-full bg-slate-800 rounded mt-6 flex overflow-hidden">
                  <div className={`h-full bg-blue-500 transition-all duration-300 ${kycStep === 1 ? 'w-1/3' : kycStep === 2 ? 'w-2/3' : 'w-full'}`} />
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2">
                  <span className={kycStep >= 1 ? 'text-blue-400 font-bold' : ''}>1. DOSSIER DETAILS</span>
                  <span className={kycStep >= 2 ? 'text-blue-400 font-bold' : ''}>2. UPLOAD LEGAL DOCUMENT scans</span>
                  <span className={kycStep >= 3 ? 'text-blue-400 font-bold' : ''}>3. BIOMETRICS LIVENESS SCAN</span>
                </div>
              </div>

              {/* Step 1: Text Credentials */}
              {kycStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-950/10 text-xs text-blue-300 leading-relaxed">
                    🌟 <strong>Federal Compliance Note:</strong> Your name must exactly match your official tax document or passport ID.
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Full Legal Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                      value={kycForm.name}
                      onChange={e => setKycForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Jean-Luc Picard"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Date of Birth</label>
                      <input 
                        required
                        type="date"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                        value={kycForm.dob}
                        onChange={e => setKycForm(p => ({ ...p, dob: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Nationality Code</label>
                      <input 
                        required
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                        value={kycForm.nationality}
                        onChange={e => setKycForm(p => ({ ...p, nationality: e.target.value }))}
                        placeholder="e.g. USA (ISO countries)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">ID Card or Passport serial number</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                      value={kycForm.idNumber}
                      onChange={e => setKycForm(p => ({ ...p, idNumber: e.target.value }))}
                      placeholder="e.g. A9345-9204A"
                    />
                  </div>

                  <button 
                    disabled={!kycForm.name || !kycForm.dob || !kycForm.idNumber}
                    onClick={() => setKycStep(2)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition font-bold text-xs text-white uppercase tracking-wider rounded-xl font-mono mt-4"
                  >
                    CONTINUE TO SCANS UPLOADER
                  </button>
                </div>
              )}

              {/* Step 2: Drags Files uploads */}
              {kycStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-950/10 text-xs text-blue-300 leading-relaxed">
                    📁 DRAG-&-DROP or click to file clear JPG/PNG scans of your identification.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Front scan uploader */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-455 uppercase block">1. ID FRONT (REQUIRED)</span>
                      <div className="border border-dashed border-slate-800 hover:border-blue-500/60 transition bg-slate-950 p-4 h-36 rounded-xl flex flex-col justify-center items-center text-center relative cursor-pointer overflow-hidden">
                        {kycFiles.idFront ? (
                          <div className="w-full h-full relative">
                            <img src={kycFiles.idFront} alt="ID Front preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            <button onClick={() => setKycFiles(p => ({ ...p, idFront: '' }))} className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-[8px] font-semibold text-white px-1.5 py-0.5 rounded uppercase font-mono">Remove</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                            <label className="text-[10px] text-slate-400 block cursor-pointer">
                              <span>Drag frontal scan or click</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setKycFiles(p => ({ ...p, idFront: reader.result as string }));
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back scan uploader */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-455 uppercase block">2. ID BACKPAGE SCAN</span>
                      <div className="border border-dashed border-slate-800 hover:border-blue-500/60 transition bg-slate-950 p-4 h-36 rounded-xl flex flex-col justify-center items-center text-center relative cursor-pointer overflow-hidden">
                        {kycFiles.idBack ? (
                          <div className="w-full h-full relative">
                            <img src={kycFiles.idBack} alt="ID Back preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            <button onClick={() => setKycFiles(p => ({ ...p, idBack: '' }))} className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-[8px] font-semibold text-white px-1.5 py-0.5 rounded uppercase font-mono">Remove</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                            <label className="text-[10px] text-slate-400 block cursor-pointer">
                              <span>Upload backend panel</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setKycFiles(p => ({ ...p, idBack: reader.result as string }));
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Proof of Address uploader */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-455 uppercase block">3. PROOF OF RESIDENCY (utility bill, less than 90 days)</span>
                    <div className="border border-dashed border-slate-800 hover:border-blue-500/60 transition bg-slate-950 p-4 h-28 rounded-xl flex flex-col justify-center items-center text-center relative cursor-pointer overflow-hidden">
                      {kycFiles.addressProof ? (
                        <div className="w-full h-full relative">
                          <img src={kycFiles.addressProof} alt="Address preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <button onClick={() => setKycFiles(p => ({ ...p, addressProof: '' }))} className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-[8px] font-semibold text-white px-1.5 py-0.5 rounded uppercase font-mono">Remove</button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <FileText className="w-5 h-5 text-slate-500 mx-auto" />
                          <label className="text-[10px] text-slate-400 block cursor-pointer">
                            <span>Drop residential invoice bank proof</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => setKycFiles(p => ({ ...p, addressProof: reader.result as string }));
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={() => setKycStep(1)}
                      className="w-1/2 py-2.5 bg-slate-950 border border-slate-850 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl font-mono"
                    >
                      GO BACK
                    </button>
                    <button 
                      disabled={!kycFiles.idFront}
                      onClick={() => setKycStep(3)}
                      className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition font-bold text-xs text-white uppercase tracking-wider rounded-xl font-mono"
                    >
                      PROCEED TO BIOMETRICS
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Webcam Biometric Liveness check */}
              {kycStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-950/10 text-xs text-blue-300 leading-relaxed text-left">
                    📷 <strong>Biometric Live Capture:</strong> Standard alignment requires face within oval nodes.
                  </div>

                  <div className="mx-auto w-52 h-52 bg-slate-950 border border-slate-800 rounded-full overflow-hidden flex flex-col justify-center items-center relative shadow-inner">
                    {/* Glowing Scanner Circles overlay */}
                    <div className="absolute inset-2 border border-blue-500/20 rounded-full animate-ping pointer-events-none" />
                    <div className="absolute inset-5 border border-cyan-500/10 rounded-full pointer-events-none" />

                    {selfieSrc ? (
                      <img src={selfieSrc} alt="Webcam snapped selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                       <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
                        {webcamActive ? (
                          videoStream ? (
                            <video 
                              id="webcam-element" 
                              className="w-full h-full object-cover" 
                              autoPlay 
                              playsInline 
                              muted 
                              ref={el => {
                                if (el && videoStream) el.srcObject = videoStream;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 relative">
                              {/* Biometric dynamic mesh animation overlay */}
                              <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                              <div className="absolute top-[30%] bottom-[30%] left-0 right-0 border-y border-emerald-500/10 pointer-events-none" />
                              <div className="absolute left-[30%] right-[30%] top-0 bottom-0 border-x border-emerald-500/10 pointer-events-none" />
                              <div className="w-12 h-12 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center animate-spin mb-2">
                                <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
                              </div>
                              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest text-center animate-pulse">Scanning Liveness</span>
                              <span className="text-[7px] font-mono text-slate-500 uppercase mt-1 leading-normal text-center">BIOMETRICS FALLBACK LIVE GATE</span>
                            </div>
                          )
                        ) : (
                          <div className="space-y-2 p-3 text-slate-500">
                            <Camera className="w-8 h-8 mx-auto text-blue-400" />
                            <span className="text-[9px] block leading-normal uppercase">Liveness frame capture ready</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Camera control buttons */}
                  <div className="flex justify-center space-x-3">
                    {!selfieSrc ? (
                      !webcamActive ? (
                        <button 
                          onClick={async () => {
                            // Request webcam stream
                            setWebcamActive(true);
                            try {
                              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                              setVideoStream(stream);
                            } catch {
                              // Fallback simulated frame snapshot handled nicely via active simulation gate
                            }
                          }}
                          className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg flex items-center space-x-1.5"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-400" />
                          <span>Enable Webcam</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const videoEl = document.getElementById("webcam-element") as HTMLVideoElement;
                            if (videoEl && videoStream) {
                              const canvas = document.createElement("canvas");
                              canvas.width = videoEl.videoWidth || 640;
                              canvas.height = videoEl.videoHeight || 480;
                              const ctx = canvas.getContext("2d");
                              if (ctx) {
                                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                                setSelfieSrc(canvas.toDataURL("image/jpeg"));
                              }
                              videoStream.getTracks().forEach(t => t.stop());
                              setVideoStream(null);
                              setWebcamActive(false);
                            } else {
                              // Frame snapped fallback vector
                              setSelfieSrc("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='#0f172a' stroke='#00E5FF' stroke-width='2'/><path d='M50 30a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M25 75c0-12 12-16 25-16s25 4 25 16' fill='none' stroke='#00E5FF' stroke-width='2'/></svg>");
                              setWebcamActive(false);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg"
                        >
                          Snap Verification Selfie
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => {
                          setSelfieSrc("");
                        }}
                        className="px-4 py-2 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg"
                      >
                        Retake Photo
                      </button>
                    )}
                  </div>

                  {/* Submit progression indicator */}
                  {kycSubmitting ? (
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl max-w-md mx-auto space-y-3">
                      <div className="flex justify-between text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                        <span>{kycStatusMessage}</span>
                        <span>{kycProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${kycProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-6 flex space-x-3">
                      <button 
                        onClick={() => {
                          if (videoStream) {
                            videoStream.getTracks().forEach(t => t.stop());
                            setVideoStream(null);
                          }
                          setWebcamActive(false);
                          setKycStep(2);
                        }}
                        className="w-1/2 py-2.5 bg-slate-950 border border-slate-850 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl font-mono"
                      >
                        BACK
                      </button>
                      <button 
                        onClick={handleKycSubmit}
                        className="w-1/2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 font-bold text-xs text-white uppercase tracking-wider rounded-xl font-mono"
                      >
                        Settle Secure compliance Audit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {paystackStage !== "none" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-200">
            {/* Paystack Header */}
            <div className="bg-[#09A5DB] p-6 text-white flex items-center justify-between relative">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm1 14.5h-2v-4h2v4zm0-6.5h-2V8h2v2z"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">PAYSTACK SECURITY NODE</h3>
                  <p className="text-[10px] text-cyan-100 font-mono">Secured Live Transaction Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setPaystackStage("none")}
                className="text-white/80 hover:text-white text-lg font-bold font-sans p-1 hover:bg-white/10 rounded"
              >
                ✕
              </button>
            </div>

            {/* Paystack Body Container */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-mono">Paying To:</span>
                <span className="text-xs font-semibold text-slate-800">BYD Horizon Club Inc.</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-mono">Amount due:</span>
                <span className="text-sm font-bold text-slate-950">
                  ${paymentAmount.toFixed(2)} USD <span className="text-[10px] text-slate-400 font-normal">({(paymentAmount * 1500).toLocaleString()} NGN approx)</span>
                </span>
              </div>

              {paystackStage === "input" && (
                <form onSubmit={handlePaystackCardSubmit} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[10px] text-amber-800 font-mono leading-relaxed">
                    💡 <strong>TEST SUITE ACTIVE:</strong> You may input any valid mock credit card, e.g. <code>5061 0000 0000 0000</code>, CVV: <code>123</code>, Expiry: <code>12/28</code> to proceed immediately.
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Card Number</label>
                    <input 
                      required
                      type="text"
                      placeholder="5061 0000 0000 0000"
                      value={paystackCardNumber}
                      onChange={e => setPaystackCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-905 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Card Expiry</label>
                      <input 
                        required
                        type="text"
                        placeholder="12/28"
                        value={paystackExpiry}
                        onChange={e => setPaystackExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-905 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">CVV / Security Code</label>
                      <input 
                        required
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={paystackCvv}
                        onChange={e => setPaystackCvv(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-905 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs rounded-xl tracking-wider uppercase transition shadow-md font-mono"
                  >
                    Authorize Card Payment
                  </button>
                </form>
              )}

              {paystackStage === "otp" && (
                <form onSubmit={handlePaystackOtpSubmit} className="space-y-4">
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-[10px] text-sky-800 font-mono leading-relaxed">
                    🔒 A secure transactional One-Time PIN has been emitted to your registered mobile number / token. Please validate to secure escrow settlement.
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Enter OTP Authorization Code</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. 12345"
                      value={paystackOtp}
                      onChange={e => setPaystackOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-905 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-center font-mono font-bold tracking-widest"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs rounded-xl tracking-wider uppercase transition shadow-md font-mono"
                  >
                    Confirm Secure OTP Pin
                  </button>
                </form>
              )}

              {paystackStage === "loading" && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-cyan-500"></div>
                  <div className="text-center">
                    <h4 className="font-semibold text-sm text-slate-800">Verifying transaction integrity...</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Interfacing with local banking clearing nodes.</p>
                  </div>
                </div>
              )}

              {paystackStage === "success" && (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-200 animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">SETTLEMENT SUCCESSFULLY CLEARED!</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono leading-relaxed">Your co-ownership and membership is officially registered and active. Thank you for choosing BYD.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>🔒 256-bit bank level SSL</span>
              <span className="text-emerald-500 font-bold uppercase">paystack secure</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
