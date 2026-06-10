import React, { useState } from "react";
import { ShieldAlert, CreditCard, RefreshCw, X, ShieldCheck, Copy, Check } from "lucide-react";

interface DelayBannerProps {
  authToken: string;
  delaysEncountered: number;
  expeditePaid: number | boolean;
  walletAddress: string;
  onRefresh?: () => void;
}

export const DelayBanner: React.FC<DelayBannerProps> = ({
  authToken,
  delaysEncountered,
  expeditePaid,
  walletAddress,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (delaysEncountered === 0 || expeditePaid) {
    if (expeditePaid) {
      return (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-start space-x-3.5 shadow-xl animate-fade-in" id="expedite-success-banner">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-emerald-300 font-mono">EXPRESS OVERRIDE ACTIVE</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Your container holds have been successfully audited by our expedited clearing smart contracts. Port authority priority queue active.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress || "0xAbC123ByDHorizonClubUSDTMerchant");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpediteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      alert("Please enter a simulated blockchain transaction hash to authorize validation checks.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tracking/expedite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ transactionHash: txHash }),
      });

      const responseJson = await res.json();
      if (res.ok) {
        setSuccessMsg("Transaction spotted on-chain! Cargo override broadcasted to clearing house.");
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg(null);
          setTxHash("");
          if (onRefresh) onRefresh();
        }, 3000);
      } else {
        alert(responseJson.error || "Expedite transaction validation rejected.");
      }
    } catch {
      alert("Failed to communicate with crypto checkout contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border border-amber-500/30 bg-amber-950/15 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xl" id="delay-warning-box">
        <div className="flex gap-3.5 items-start">
          <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-400 font-mono tracking-tight uppercase">
              WARNING: customs clearance holds registered
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
              Logistics coordinators have triggered an executive audit hold. The vehicle carrier is halted at checkout checkpoints ({delaysEncountered} stops affected). Settle an expedited smart contract clearance fee ($49.00 equivalent in crypto USDT) to instantly bypass customs.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-orange-900/20"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay $49 USDT To Clear Holds</span>
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-slate-850 rounded-2xl p-6 relative shadow-2xl text-left space-y-5">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block">
                Crypto Clearance Override
              </span>
              <h3 className="font-display font-semibold text-base text-white">
                USDT Settlement Contract invoice
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto font-mono">
                Send exactly 49.00 USDT (TRC-20 / ERC-20) to clear port customs lines.
              </p>
            </div>

            {successMsg ? (
              <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center space-y-2 animate-bounce">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-300 font-mono">{successMsg}</p>
                <p className="text-[10px] text-slate-500 font-mono leading-none">Status: CONFIRMED</p>
              </div>
            ) : (
              <form onSubmit={handleExpediteSubmit} className="space-y-4 font-mono">
                {/* Simulated Address Box */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">
                    BYD MERCHANT WALLET ADDRESS
                  </span>
                  <div className="flex justify-between items-center bg-slate-950 px-2.5 py-1.5 rounded border border-slate-900 text-[10px] text-zinc-300">
                    <span className="truncate pr-4">{walletAddress || "0xAbC123ByDHorizonClubUSDTMerchant"}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-cyan-400 hover:text-cyan-300 flex-shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Amount Box */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-semibold leading-none mb-1">
                      INVOICE TOTAL
                    </span>
                    <span className="font-bold text-white text-sm">49.00 USDT</span>
                  </div>
                  <span className="text-[7px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    DEPOSIT MATCHED
                  </span>
                </div>

                {/* Verification Box */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-slate-500 tracking-wider font-semibold block">
                    BLOCKCHAIN TXID HASH REFERENCE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="bx0x217d84a7e94bc123..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-600 leading-normal">
                    Enter any simulated hex string to simulate verification check routing.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-150 flex items-center justify-center space-x-2 w-full cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Confirm Smart Contract Clearing</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
