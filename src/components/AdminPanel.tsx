import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  ShieldAlert, 
  Users, 
  RefreshCw, 
  Lock, 
  Search, 
  UserPlus, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Activity, 
  Coins, 
  BarChart, 
  MapPin, 
  ShieldCheck, 
  Download,
  AlertTriangle,
  X,
  Sparkles,
  Award,
  Settings,
  EyeOff,
  Sliders,
  Terminal,
  Send,
  Phone,
  MessageSquare,
  Mail,
  HelpCircle,
  Megaphone
} from "lucide-react";

interface AdminPanelProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [adminToken, setAdminToken] = useState("");
  
  // App State Data
  const [activeTab, setActiveTab] = useState<"users" | "interactions" | "phished" | "settings">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [allCredentials, setAllCredentials] = useState<any[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<any[]>([]);
  
  // Custom global Settings states
  const [appName, setAppName] = useState("");
  const [escrowWallet, setEscrowWallet] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [themeColor, setThemeColor] = useState("matte-charcoal");
  const [allowClaims, setAllowClaims] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // AI Command terminal states
  const [aiCommand, setAiCommand] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Edit User details cabinet states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editWallet, setEditWallet] = useState("");
  const [editKycStatus, setEditKycStatus] = useState("");
  const [editIsIncognito, setEditIsIncognito] = useState(false);
  const [editPoints, setEditPoints] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const [editResponseSuccess, setEditResponseSuccess] = useState("");
  const [editResponseError, setEditResponseError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editRouteIndex, setEditRouteIndex] = useState<number | "">("");
  
  // UI filter states
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [interactionSearch, setInteractionSearch] = useState("");
  const [interactionFilter, setInteractionFilter] = useState("");
  
  // Create User Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCity, setNewUserCity] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  const loadMetrics = async (token = adminToken) => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Load registered users with status and city
      const resU = await fetch("/api/admin/users", { headers });
      const listU = await resU.json();
      setUsers(Array.isArray(listU) ? listU : []);

      // Load phishing awareness simulator list
      const resCr = await fetch("/api/admin/stolen-credentials", { headers });
      const listCr = await resCr.json();
      setAllCredentials(Array.isArray(listCr) ? listCr : []);

      // Load live user activity logs
      const resI = await fetch("/api/admin/interactions", { headers });
      const listI = await resI.json();
      setInteractionLogs(Array.isArray(listI) ? listI : []);

      // Load app-wide customization settings
      const resS = await fetch("/api/public/settings");
      if (resS.ok) {
        const settings = await resS.json();
        setAppName(settings.app_name || "BYD Horizon Club");
        setEscrowWallet(settings.escrow_wallet || "");
        setSupportPhone(settings.support_phone || "+1 (888) 555-BYD0");
        setSupportTelegram(settings.support_telegram || "https://t.me/byd_horizon_support");
        setSupportEmail(settings.support_email || "vip-compliance@byd-horizon.club");
        setAnnouncement(settings.announcement || "");
        setThemeColor(settings.theme_color || "matte-charcoal");
        setAllowClaims(settings.allow_claims !== false);
      }
    } catch (err) {
      console.error("Failed to sync Admin Console telemetry data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminToken) {
      loadMetrics(adminToken);
    }
  }, [isAdmin, adminToken]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAdminToken(data.token);
        setIsAdmin(true);
      } else {
        setErrorLogin(data.error || "Access denied.");
      }
    } catch {
      setErrorLogin("Internal connection failure.");
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you absolutely sure you want to permanently erase this user account and all associate telemetry nodes? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadMetrics();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to remove user account.");
      }
    } catch {
      alert("Network exception deleting user");
    }
  };

  // Toggle user active / block status
  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "blocked" ? "active" : "blocked";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        loadMetrics();
      } else {
        alert("Failed to modify user operational status.");
      }
    } catch {
      alert("Network exception modifying user status");
    }
  };

  // Create User directly as operator
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");

    if (!newUserName || !newUserEmail || !newUserPhone || !newUserPassword || !newUserCity) {
      setCreateUserError("All input nodes require telemetry data config.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          password: newUserPassword,
          city: newUserCity
        })
      });

      const d = await res.json();
      if (res.ok) {
        setCreateUserSuccess(`Account for ${newUserName} successfully mapped and persisted in SQLite.`);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        setNewUserPassword("");
        setNewUserCity("");
        loadMetrics();
        setTimeout(() => {
          setShowCreateForm(false);
          setCreateUserSuccess("");
        }, 2200);
      } else {
        setCreateUserError(d.error || "Profile validation mapping exception.");
      }
    } catch {
      setCreateUserError("General network error binding profile to database.");
    }
  };

  // Modify user point matrix
  const handleModifyPoints = async (userId: number, currentPoints: number) => {
    const changeAmt = window.prompt("Enter target Horizon Points value to override directly (e.g. 500, 2500, 100000):", String(currentPoints));
    if (changeAmt === null) return;
    const targetPoints = parseInt(changeAmt);
    if (isNaN(targetPoints)) {
      alert("Points override amount must be a valid integer parameter.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/points`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ points: targetPoints })
      });
      if (res.ok) {
        loadMetrics();
      } else {
        alert("Failed to override client system points.");
      }
    } catch {
      alert("Network error processing points override request.");
    }
  };

  // Filters for displaying users
  const filteredUsers = users.filter((u: any) => {
    const query = userSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query) ||
      u.city?.toLowerCase().includes(query)
    );
  });

  // Filters for interactions logs
  const filteredInteractions = interactionLogs.filter((log: any) => {
    const qMatch = !interactionSearch ? true : (
      log.email?.toLowerCase().includes(interactionSearch.toLowerCase().trim()) ||
      log.description?.toLowerCase().includes(interactionSearch.toLowerCase().trim()) ||
      log.action_type?.toLowerCase().includes(interactionSearch.toLowerCase().trim())
    );
    const fMatch = !interactionFilter ? true : log.action_type === interactionFilter;
    return qMatch && fMatch;
  });

  // Unique interaction types for filter dropdown
  const interactionTypes = Array.from(new Set(interactionLogs.map((l) => l.action_type)));

  // Data Analysis Metrics for Big Data Report tab
  const getActionAnalysis = () => {
    const total = interactionLogs.length;
    if (total === 0) return [];
    
    const freqMap: Record<string, number> = {};
    interactionLogs.forEach((l) => {
      freqMap[l.action_type] = (freqMap[l.action_type] || 0) + 1;
    });

    return Object.entries(freqMap).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a,b) => b.count - a.count);
  };

  const getCityBreakdown = () => {
    const breakMap: Record<string, number> = {};
    users.forEach((u) => {
      const c = u.city || "Unknown";
      breakMap[c] = (breakMap[c] || 0) + 1;
    });
    return Object.entries(breakMap);
  };

  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in" id="admin-login-node">
        <div className="text-center space-y-3 mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h2 className="font-sans text-xl font-bold text-white tracking-tight">BYD Horizon Audit Clearance</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">Secured Operator Console</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#B4F8FF]/80 font-mono">Operator Token ID</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="System Username"
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#B4F8FF]/80 font-mono">Bypass Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Operator Password"
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>

          {errorLogin && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-mono flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorLogin}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:from-[#00E5FF]/90 hover:to-blue-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition shadow-lg cursor-pointer shadow-[#00E5FF]/10 hover:shadow-[#00E5FF]/20"
          >
            Authenticate clearance ➔
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
          <button 
            onClick={() => onNavigate("landing")}
            className="text-[10px] text-slate-400 font-mono hover:text-slate-200 transition cursor-pointer"
          >
            ← Return to public homepage
          </button>
        </div>
      </div>
    );
  }

  const analysisReport = getActionAnalysis();
  const cityStats = getCityBreakdown();

  return (
    <div className="w-full text-xs sm:text-sm text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="admin-dashboard-panel">
      {/* Admin header */}
      <header className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg mb-8 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#00E5FF] via-blue-500 to-indigo-600" />
        <div>
          <h2 className="font-mono text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
            <span>Horizon Administrator Lab Console</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Database status: SQLITE_ONLINE | Complete Credentials Access: AUTHORIZED</p>
        </div>

        <div className="flex flex-wrap gap-2.5 font-mono">
          <button 
            onClick={() => loadMetrics()}
            disabled={loading}
            className="p-2 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00E5FF] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Matrix Telemetry</span>
          </button>
          
          <a
            href="/api/admin/users/csv"
            className="p-2 px-3 bg-[#00E5FF] text-black hover:bg-[#00E5FF]/85 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Ledger</span>
          </a>

          <button 
            onClick={() => { setIsAdmin(false); setAdminToken(""); }}
            className="p-2 px-3 bg-red-950/20 border border-red-500/20 hover:bg-red-950/45 rounded-xl text-[10px] uppercase font-bold text-red-400 cursor-pointer transition"
          >
            Sign-out Access
          </button>
        </div>
      </header>

      {/* Admin Tab Controller Navigation bar */}
      <div className="flex border-b border-slate-850 mb-6 gap-2">
        {( [
          { id: "users", label: "User Database Ledger", icon: Users, color: "text-blue-400" },
          { id: "interactions", label: "User Interaction Tracker", icon: Activity, color: "text-[#00E5FF]" },
          { id: "phished", label: "Security awareness log", icon: Lock, color: "text-rose-400" },
          { id: "settings", label: "Brand Settings & Escrow", icon: Settings, color: "text-amber-400" }
        ] as const).map((tab) => {
          const tabIcon = React.createElement(tab.icon, { className: `w-4 h-4 shrink-0 ${tab.color}` });
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase border-b-2 tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#00E5FF] text-white bg-slate-900/40 rounded-t-xl"
                  : "border-transparent text-slate-450 hover:text-slate-200"
              }`}
            >
              {tabIcon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB SUB-VECTORS CONTENT */}
      <div className="mt-4">
        
        {/* =============== TAB 1: USERS LEDGER & ACTIVE MANAGEMENT MODULE =============== */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick stats on top */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Mapped Members</span>
                  <span className="text-lg font-black text-white font-mono">{users.length}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Verified Status</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {users.filter(u => u.kyc_status === 'verified').length} Profiled
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                  <Coins className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Collect XP Points</span>
                  <span className="text-lg font-black text-yellow-400 font-mono">
                    {users.reduce((acc, current) => acc + (current.horizon_points || 0), 0).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Suspended Nodes</span>
                  <span className="text-lg font-black text-rose-400 font-mono">
                    {users.filter(u => u.status === 'blocked').length} Hold
                  </span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search accounts catalog (name, email, phone, city)..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-[#00E5FF]/60"
                />
              </div>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {showCreateForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{showCreateForm ? "Close mapping profile" : "Create Member Profile"}</span>
              </button>
            </div>

            {/* DYNAMIC MEMBER ENVELOPE CREATION FORM */}
            {showCreateForm && (
              <form onSubmit={handleCreateUserSubmit} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in relative">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-[#00E5FF]" />
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="text-[#00E5FF] w-4 h-4" />
                    Operator Account Provision Matrix
                  </h4>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="text-slate-500 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">E-mail Node Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@domain.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">Contact Phone Network</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +234 812 000 0000"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">Profile Access Password</label>
                    <input
                      type="text"
                      required
                      placeholder="Custom Password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">Origin City / Station Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lagos, Abuja, Port Harcourt"
                      value={newUserCity}
                      onChange={(e) => setNewUserCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-[#00E5FF] text-black font-black uppercase tracking-wider text-xs rounded-xl hover:opacity-90 shadow-lg cursor-pointer flex justify-center items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Provision and Link Account Node</span>
                    </button>
                  </div>
                </div>

                {createUserError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-mono">
                    ⚠️ Error: {createUserError}
                  </div>
                )}

                {createUserSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-mono">
                    ✓ Success: {createUserSuccess}
                  </div>
                )}
              </form>
            )}

            {/* List Table wrapper of Users */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  MEMBER LEDGER CONTROLS ({filteredUsers.length} matches)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-3.5">Member Node</th>
                      <th className="p-3.5">E-mail Address</th>
                      <th className="p-3.5">City Origin</th>
                      <th className="p-3.5 text-emerald-400">Plain Key Access</th>
                      <th className="p-3.5 text-yellow-400">Points Block</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5 text-center">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No matching member modules found in local SQLite catalog records.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-950/30 transition-all">
                          <td className="p-3.5">
                            <span className="font-extrabold text-white text-xs block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Phone: {u.phone || "N/A"}</span>
                            
                            {!!u.is_incognito && (
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[8px] px-1.5 py-0.5 rounded border border-amber-500/20 font-bold mt-1 uppercase">
                                <EyeOff className="w-2.5 h-2.5" /> Incognito
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 select-all">
                            <span className="text-cyan-300 font-semibold truncate max-w-[170px] block">{u.email}</span>
                            <span className={`inline-block text-[9px] px-1.5 py-0.5 mt-1 rounded font-bold uppercase border ${
                              u.kyc_status === "verified"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : u.kyc_status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse"
                                : "bg-red-500/10 text-red-400 border-red-500/25"
                            }`}>
                              KYC: {u.kyc_status || "not_submitted"}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{u.city || "N/A"}</span>
                            </div>
                          </td>
                          <td className="p-3.5 select-all text-emerald-400 font-extrabold max-w-[150px] truncate">
                            {u.password_raw ? (
                              <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{u.password_raw}</span>
                            ) : (
                              <span className="text-slate-650 font-normal">HASHED ONLY</span>
                            )}
                          </td>
                          <td className="p-3.5 text-yellow-400 font-black">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditName(u.name || "");
                                setEditEmail(u.email || "");
                                setEditKycStatus(u.kyc_status || "not_submitted");
                                setEditIsIncognito(!!u.is_incognito);
                                setEditPoints(u.horizon_points || 0);
                                setEditStatus(u.status || "active");
                                setEditPhone(u.phone || "");
                                setEditCity(u.city || "");
                                setEditWallet(u.crypto_wallet_address || "");
                                setEditResponseSuccess("");
                                setEditResponseError("");
                                setEditRouteIndex(u.route_index !== undefined && u.route_index !== null ? u.route_index : "");
                              }}
                              className="hover:underline flex items-center gap-1 cursor-pointer"
                              title="Modify points balance"
                            >
                              <Coins className="w-3 h-3" />
                              <span>{(u.horizon_points || 0).toLocaleString()} XP</span>
                            </button>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              u.status === "blocked"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {u.status || "active"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Modal Button */}
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditName(u.name || "");
                                  setEditEmail(u.email || "");
                                  setEditKycStatus(u.kyc_status || "not_submitted");
                                  setEditIsIncognito(!!u.is_incognito);
                                  setEditPoints(u.horizon_points || 0);
                                  setEditStatus(u.status || "active");
                                  setEditPhone(u.phone || "");
                                  setEditCity(u.city || "");
                                  setEditWallet(u.crypto_wallet_address || "");
                                  setEditResponseSuccess("");
                                  setEditResponseError("");
                                  setEditRouteIndex(u.route_index !== undefined && u.route_index !== null ? u.route_index : "");
                                }}
                                className="p-1.5 bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition-all cursor-pointer"
                                title="Configure Member Settings"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  u.status === "blocked"
                                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40"
                                    : "bg-orange-950/20 border-orange-500/30 text-orange-400 hover:bg-orange-950/40"
                                }`}
                                title={u.status === "blocked" ? "Unlock Account" : "Lock / Suspend Account"}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                                title="Permanently Erase Admin Copy"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============== TAB 2: INTERACTIONS DATA ANALYSIS & AUDIT REPORT =============== */}
        {activeTab === "interactions" && (
          <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Top Analysis Reports Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Analytics report 1: Interactions breakdown */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-850/60">
                  <BarChart className="w-4 h-4 text-[#00E5FF]" />
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Interaction Density Analysis</h4>
                </div>
                
                {analysisReport.length === 0 ? (
                  <p className="text-slate-500 text-xs py-6 text-center">No platform telemetry nodes captured yet.</p>
                ) : (
                  <div className="space-y-3.5 font-mono text-[10px]">
                    {analysisReport.map((rep) => (
                      <div key={rep.type} className="space-y-1">
                        <div className="flex justify-between text-[9px]">
                          <span className="font-extrabold text-blue-400 uppercase tracking-widest">{rep.type}</span>
                          <span className="text-slate-400">{rep.count} action pings ({rep.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-gradient-to-r from-[#00E5FF] to-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${rep.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analytics report 2: Active stations */}
              <div className="bg-slate-900 border border-[#1e293b] p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b]">
                  <MapPin className="text-emerald-400 w-4 h-4" />
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Region Load Breakdown</h4>
                </div>

                {cityStats.length === 0 ? (
                  <p className="text-slate-500 text-xs py-6 text-center">No mapped regional nodes.</p>
                ) : (
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {cityStats.map(([city, count]) => {
                      const totalUsersCount = users.length || 1;
                      const percent = Math.round((count / totalUsersCount) * 100);
                      return (
                        <div key={city} className="flex justify-between items-center py-2 border-b border-slate-850/30">
                          <span className="text-slate-300 font-bold uppercase">{city}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-black">{count} active profiles</span>
                            <span className="text-slate-500 text-[9px]">({percent}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Analytics report 3: Platform instructions log info */}
              <div className="bg-slate-900 border border-slate-855 p-5 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                    <ShieldCheck className="text-indigo-400 w-4 h-4" />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Diagnostic Standard Report</h4>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] leading-relaxed text-slate-400">
                    <p>● Live capture records 100% of user-to-server interactions in our sandboxed SQL database.</p>
                    <p>● Active nodes monitor registration events, daily checkins, spin wheel runs, support requests and payments.</p>
                    <p>● Global compliance: Operator log records timestamps, email keys, and network signature logs securely.</p>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/20 p-3.5 rounded-xl flex items-center gap-2 mt-4">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <p className="text-[9px] font-mono text-indigo-300 leading-tight uppercase">
                    Continuous monitoring actively listening for new transactions under port 3000.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and query logs */}
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 justify-between items-center">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter logs by email or action details..."
                  value={interactionSearch}
                  onChange={(e) => setInteractionSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-[#00E5FF]/60"
                />
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-500 uppercase">Sort / Filter:</span>
                <select
                  value={interactionFilter}
                  onChange={(e) => setInteractionFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-white rounded-lg p-2 font-mono text-[10px] outline-none focus:border-[#00E5FF] cursor-pointer"
                >
                  <option value="">-- ALL ACTION ACTIONS --</option>
                  {interactionTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Audit Table */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10.5px] text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-3.5">Telemetry ID</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Action Key</th>
                      <th className="p-3.5">Operator / E-mail Address</th>
                      <th className="p-3.5">Full Transaction Narrative Report</th>
                      <th className="p-3.5">IP Node Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredInteractions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No logged user interactions found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      filteredInteractions.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-955/40 transition-all">
                          <td className="p-3.5 text-slate-550">#LOG-{String(log.id).padStart(4, "0")}</td>
                          <td className="p-3.5 text-slate-400">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${
                              log.action_type === "LOGIN" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                              log.action_type === "SIGNUP" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              log.action_type === "WHEEL_SPIN" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              log.action_type === "CHECKIN" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              log.action_type === "ACCOUNT_CREATION" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                              "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              {log.action_type}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-white select-all">{log.email || "System/Anonymous"}</td>
                          <td className="p-3.5 text-slate-350">{log.description}</td>
                          <td className="p-3.5 text-xs text-slate-500">{log.ip_address || "127.0.0.1"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============== TAB 3: PHISHED SECURITY AWARENESS LOG =============== */}
        {activeTab === "phished" && (
          <div className="space-y-6 animate-fade-in text-slate-100">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-slate-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Awareness Phishing Simulator Capture Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulated phished logins from company internal cyber awareness campaign tests. No actual data compromise active.
                  </p>
                </div>
                <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded px-2.5 py-1 text-[10px] font-mono font-bold uppercase shrink-0">
                  {allCredentials.length} simulated captures
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-3.5">Capture Date / Time</th>
                      <th className="p-3.5">Target E-mail Node address</th>
                      <th className="p-3.5 text-rose-400 font-bold">Simulated Decrypted Password</th>
                      <th className="p-3.5">IP Host address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {allCredentials.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-650">
                          Empty queue database records. Security training module is idle.
                        </td>
                      </tr>
                    ) : (
                      allCredentials.map((cr: any) => (
                        <tr key={cr.id} className="hover:bg-slate-950/40 animate-fade-in transition-all">
                          <td className="p-3.5 text-[10px] text-slate-450">
                            {cr.created_at ? new Date(cr.created_at).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-3.5 font-bold text-white select-all break-all max-w-[190px]">{cr.email}</td>
                          <td className="p-3.5 text-rose-400 font-black select-all tracking-wide break-all max-w-[190px]">
                            <span className="bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{cr.password}</span>
                          </td>
                          <td className="p-3.5 text-[10.5px] text-slate-500">{cr.ip_address || "127.0.0.1"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============== TAB 4: BRAND SETTINGS & ESCROW GLOBAL CUSTOMIZATION =============== */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in text-slate-100 text-left">
            
            {/* Presidential AI Override Terminal Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-[#18181c] to-[#121215] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="uppercase font-mono tracking-wide text-cyan-300">Executive AI Control Command Deck</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    Use your voice of authority. Tell the AI Commander exactly how to align support compliance info, announcements, tickers, colors, or look & feel.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-550/15 px-2 py-0.5 rounded border border-emerald-500/10">Neural Node Connected</span>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!aiCommand.trim() || aiLoading) return;
                  setAiLoading(true);
                  setAiSuccess("");
                  setAiError("");
                  try {
                    const resAI = await fetch("/api/admin/ai-command", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${adminToken}`
                      },
                      body: JSON.stringify({ command: aiCommand })
                    });
                    const jsonAI = await resAI.json();
                    if (resAI.ok) {
                      setAiSuccess(jsonAI.explanation || "System customized successfully!");
                      // Refresh metrics
                      const resS = await fetch("/api/public/settings");
                      if (resS.ok) {
                        const settings = await resS.json();
                        setAppName(settings.app_name || "BYD Horizon Club");
                        setEscrowWallet(settings.escrow_wallet || "");
                        setSupportPhone(settings.support_phone || "+1 (888) 555-BYD0");
                        setSupportTelegram(settings.support_telegram || "https://t.me/byd_horizon_support");
                        setSupportEmail(settings.support_email || "vip-compliance@byd-horizon.club");
                        setAnnouncement(settings.announcement || "");
                        setThemeColor(settings.theme_color || "matte-charcoal");
                        setAllowClaims(settings.allow_claims !== false);
                      }
                      setAiCommand("");
                    } else {
                      setAiError(jsonAI.error || "Execution matrices bounds faulted.");
                    }
                  } catch {
                    setAiError("Connection linkage lost with executive API server.");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                className="mt-4 space-y-3"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={aiLoading}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-xl py-3 px-4 text-xs font-mono text-white placeholder-slate-600 outline-none transition"
                    placeholder="e.g., 'Rebrand to Horizon Peak V8, set support phone to +44 77 1234 5678 and set theme to light mode'"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiCommand.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black px-5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {aiLoading ? "PROCESSING..." : "EXECUTE"}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {aiSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-[11px] font-mono leading-relaxed max-w-full">
                    🛸 <span className="font-bold text-emerald-400">AI Response:</span> {aiSuccess}
                  </div>
                )}
                {aiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-[11px] font-mono leading-relaxed max-w-full">
                    ⚠️ <span className="font-bold text-red-400">Exception:</span> {aiError}
                  </div>
                )}
              </form>
            </div>

            {/* Presidential Villa Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* BRANDING CARD (BENTO GRID 1) */}
              <div className="bg-[#121215] border border-slate-850 p-6 rounded-3xl space-y-5 shadow-lg lg:col-span-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#eaeaea]">System Identity & Look</h5>
                    <p className="text-[10px] text-slate-500">Live app branding presets.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">App Brand Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white uppercase outline-none focus:border-amber-500 transition font-sans font-semibold"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">Color Palette Theme</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                    >
                      <option value="matte-charcoal">Matte Ash Black/Titanium (Matured Dark)</option>
                      <option value="light">Premium Matte Ash White (Matured Light)</option>
                    </select>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Enable Horizon Claims</span>
                      <button
                        type="button"
                        onClick={() => setAllowClaims(!allowClaims)}
                        className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          allowClaims ? "bg-cyan-500" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            allowClaims ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans leading-normal">Allows members to declare daily rewards and referrals.</p>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CONTACT INFO OVERRIDES (BENTO GRID 2) */}
              <div className="bg-[#121215] border border-slate-850 p-6 rounded-3xl space-y-5 shadow-lg lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#eaeaea]">Dynamic Support Interventions</h5>
                      <p className="text-[10px] text-slate-500">Bypass manual agents. Configure direct help channels with precision.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">Support Hotline</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-550" />
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition"
                        placeholder="+1 (888) 555-BYD0"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">Compliance Telegram Link</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-550" />
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition"
                        placeholder="https://t.me/byd_horizon_support"
                        value={supportTelegram}
                        onChange={(e) => setSupportTelegram(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">Corporate Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-550" />
                      <input
                        type="email"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition"
                        placeholder="vip-compliance@byd-horizon.club"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block font-bold">Escrow Deposit Recipient Wallet (Global Override)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono outline-none focus:border-cyan-500 transition"
                      placeholder="TRX Address or ERC20 (Standard dynamic allocation if empty)"
                      value={escrowWallet}
                      onChange={(e) => setEscrowWallet(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ANNOUNCEMENTS BROADCAST MATRIX (BENTO GRID 3) */}
              <div className="bg-[#121215] border border-slate-850 p-6 rounded-3xl space-y-5 shadow-lg lg:col-span-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#eaeaea]">Global Broadcast Announcement Ticker</h5>
                    <p className="text-[10px] text-slate-500">Live banners pushed instantly to all client side dashboards.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition font-sans leading-relaxed"
                    placeholder="e.g., 'MEMBERS NOTICE: System maintenance undergoes weekly synchronized sync...' "
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                  />

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setSettingsSuccess("");
                        setSettingsError("");
                        try {
                          const resCommit = await fetch("/api/admin/settings", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${adminToken}`
                            },
                            body: JSON.stringify({
                              app_name: appName,
                              escrow_wallet: escrowWallet,
                              support_phone: supportPhone,
                              support_telegram: supportTelegram,
                              support_email: supportEmail,
                              announcement,
                              theme_color: themeColor,
                              allow_claims: allowClaims
                            })
                          });
                          const resJson = await resCommit.json();
                          if (resCommit.ok) {
                            setSettingsSuccess("🎉 Presidential Villa Parameter Override Commits successfully saved to database!");
                            // Refresh metrics
                            loadMetrics();
                          } else {
                            setSettingsError(resJson.error || "Failed override.");
                          }
                        } catch {
                          setSettingsError("Link breakdown exception.");
                        }
                      }}
                      className="px-6 py-3 bg-[#1d1d22] hover:bg-[#282830] text-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-850 cursor-pointer"
                    >
                      Commit Parameters Override
                    </button>
                  </div>

                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-sans mt-2">
                      {settingsSuccess}
                    </div>
                  )}
                  {settingsError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono mt-2">
                      ⚠️ Error: {settingsError}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =============== USER CABINET EDITOR MODAL WINDOW =============== */}
        {editingUser && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
            <div className="max-w-lg w-full bg-slate-900 border border-cyan-500/40 p-6 rounded-3xl shadow-2xl relative space-y-6">
              <button 
                onClick={() => setEditingUser(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Configure Operator: {editingUser.email}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal font-mono">
                  Modify registered core fields directly in local SQLite storage. Adjust point balances or override identities.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditResponseSuccess("");
                  setEditResponseError("");
                  setEditLoading(true);
                  try {
                    // Update main user parameters (like kyc_status, name, email, is_incognito)
                    const resEdit = await fetch(`/api/admin/users/${editingUser.id}/edit`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${adminToken}`
                      },
                      body: JSON.stringify({
                        name: editName,
                        email: editEmail,
                        phone: editPhone,
                        city: editCity,
                        crypto_wallet_address: editWallet,
                        kyc_status: editKycStatus,
                        is_incognito: editIsIncognito
                      })
                    });
                    const editRes = await resEdit.json();

                    if (!resEdit.ok) {
                      setEditResponseError(editRes.error || "Failed to update member variables.");
                      setEditLoading(false);
                      return;
                    }

                    // Update points balance
                    const resPts = await fetch(`/api/admin/users/${editingUser.id}/points`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${adminToken}`
                      },
                      body: JSON.stringify({ points: Number(editPoints) })
                    });

                    if (resPts.ok) {
                      // Update tracking progress if updated
                      if (editRouteIndex !== "") {
                        await fetch("/api/admin/tracking/progress", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${adminToken}`
                          },
                          body: JSON.stringify({
                            user_id: editingUser.id,
                            route_index: Number(editRouteIndex)
                          })
                        });
                      }

                      setEditResponseSuccess("🎉 Member customization variables commit succeeded perfectly!");
                      setTimeout(() => {
                        setEditingUser(null);
                        loadMetrics();
                      }, 1000);
                    } else {
                      const ptsRes = await resPts.json();
                      setEditResponseError(ptsRes.error || "Succeeded editing profile, but points override failed.");
                    }
                  } catch {
                    setEditResponseError("Matrix synchronization error.");
                  } finally {
                    setEditLoading(false);
                  }
                }}
                className="space-y-4 font-mono text-[11px]"
              >
                {editResponseSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl leading-normal">
                    {editResponseSuccess}
                  </div>
                )}
                {editResponseError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl leading-normal">
                    ⚠️ Error: {editResponseError}
                  </div>
                )}

                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Legal Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white uppercase outline-none focus:border-cyan-500 font-sans"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Account Email</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">KYC Compliance Status</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                      value={editKycStatus}
                      onChange={e => setEditKycStatus(e.target.value)}
                    >
                      <option value="not_submitted">Not Submitted / Rejected</option>
                      <option value="pending">Pending Document Verification</option>
                      <option value="verified">Verified Approved Client</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Accumulated points</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500"
                      value={editPoints}
                      onChange={e => setEditPoints(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Phone Number</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500"
                      placeholder="N/A"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Reg. City / Fleet Hub</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500"
                      placeholder="N/A"
                      value={editCity}
                      onChange={e => setEditCity(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">Crypto Address / Escrow Tag</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono outline-none focus:border-cyan-500"
                      placeholder="0x..."
                      value={editWallet}
                      onChange={e => setEditWallet(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-black">
                      Active Transit Stage / Delivery GPS Progress (0 to 100 %)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                        placeholder="e.g. 10 (Pre-shipped is 0, Shipped is typically 10 to 99, 100 matches Delivered)"
                        value={editRouteIndex}
                        onChange={e => setEditRouteIndex(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <div className="text-[10px] text-slate-400 bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl leading-none flex items-center shrink-0">
                        {editRouteIndex === "" || Number(editRouteIndex) === 0 ? "📍 Pre-shipped" : Number(editRouteIndex) >= 100 ? "🏁 Delivered" : `🚚 In-transit: ${editRouteIndex}%`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-white font-bold text-[11px] flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5 text-orange-400" />
                      <span>Incognito/Hidden Status</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">Enable to hide live GPS coordinates from other user maps.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditIsIncognito(!editIsIncognito)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editIsIncognito ? "bg-orange-500" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        editIsIncognito ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs rounded-xl transition shadow-lg shadow-cyan-500/10 cursor-pointer font-extrabold uppercase font-mono tracking-wider disabled:opacity-40"
                  >
                    {editLoading ? "Updating..." : "Save Member Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
