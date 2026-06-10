import React, { useState } from "react";
import { MailWarning, ShieldCheck, Mail, Send, CheckCircle2 } from "lucide-react";

interface HelpPageProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

export default function HelpPage({ onNavigate }: HelpPageProps) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "Logistics Carriage Status Enquiry", message: "" });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [supportPhone, setSupportPhone] = useState("+1 (888) 555-BYD0");
  const [supportTelegram, setSupportTelegram] = useState("https://t.me/byd_horizon_support");
  const [supportEmail, setSupportEmail] = useState("vip-compliance@byd-horizon.club");

  React.useEffect(() => {
    fetch("/api/public/settings")
      .then(r => r.json())
      .then(settings => {
        if (settings) {
          if (settings.support_phone) setSupportPhone(settings.support_phone);
          if (settings.support_telegram) setSupportTelegram(settings.support_telegram);
          if (settings.support_email) setSupportEmail(settings.support_email);
        }
      })
      .catch(err => console.error("Could not sync dynamic support info onto FAQ system", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("All fields are required to submit support audit tickets.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Ticket #${1234 + data.ticketId} successfully recorded inside dispatch columns. We'll respond soon.`);
        setFormData({ name: "", email: "", subject: "Logistics Carriage Status Enquiry", message: "" });
      } else {
        alert(data.error || "Execution error.");
      }
    } catch {
      alert("Connection to support channels lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 text-left" id="help-dead-end-page">
      <div className="space-y-3">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">Horizon Club Operational Answers & Help Center FAQ</h1>
        <p className="text-xs text-slate-400 font-mono">Centralized customer logistics and risk disclosure index.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* core alert answers section */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base text-white flex items-center space-x-2">
              <MailWarning className="w-5 h-5 text-amber-500" />
              <span>Dues Transit Carriage & Carrier Delay details</span>
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your vehicle is in transit. Due to unprecedented demand, deliveries are taking 90–180 days. You can track live on your dashboard.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl space-y-3 border border-slate-850">
              <div className="flex items-start space-x-2.5 text-xs text-slate-400">
                <span className="font-bold text-amber-500 font-mono">Q: How can I resolve customs delay holds?</span>
                <p className="leading-relaxed">A: Settle the expedited logistics hold clearing dues of $49 USDT inside your tracking maps dashboard.</p>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-400">
                <span className="font-bold text-amber-500 font-mono">Q: Who processes custom holding holds?</span>
                <p className="leading-relaxed">A: Local maritime port brokers in combination with centralized BYD logistics coordinators handle filings.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Refund Guidelines & Disputes department</span>
            </h3>
            
            <div className="text-xs sm:text-sm text-slate-300 space-y-2">
              <p>For escalation, refunds, or compliance holds, please reach out directly through the verified systems overridden by the Executive Board:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl">
                  <span className="text-slate-500 uppercase block text-[8px] font-bold">compliance Email</span>
                  <a href={`mailto:${supportEmail}`} className="text-cyan-400 hover:underline">{supportEmail}</a>
                </div>
                
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl">
                  <span className="text-slate-500 uppercase block text-[8px] font-bold">hotline</span>
                  <a href={`tel:${supportPhone}`} className="text-amber-400 hover:underline">{supportPhone}</a>
                </div>

                <div className="col-span-1 sm:col-span-2 p-2 bg-slate-950 border border-slate-850 rounded-xl">
                  <span className="text-slate-500 uppercase block text-[8px] font-bold">Direct Telegram Help Desk</span>
                  <a href={supportTelegram} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline break-all">
                    {supportTelegram}
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-red-500/20 bg-red-950/20 p-4 rounded-xl leading-relaxed text-xs text-red-300 font-mono">
              ★ NO REFUNDS ON CRYPTOCURRENCY PAYMENTS. Due to the immutable and decentralized nature of decentralized ledger networks, assets settles instantly on confirmations.
            </div>
          </div>
        </div>

        {/* submit a ticket form */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="text-left space-y-1">
            <h3 className="font-display font-semibold text-sm text-white">Settle Helpdesk Ticket</h3>
            <p className="text-[11px] text-slate-400 leading-normal">File formal tickets of inquiry. Support queues process chronologically.</p>
          </div>

          {successMsg ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="leading-relaxed">{successMsg}</p>
              <button 
                onClick={() => setSuccessMsg(null)}
                className="mt-2 w-full py-1 bg-slate-900 text-[10px] font-mono text-slate-400 rounded hover:text-white"
              >
                Submit another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-slate-300">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Your Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Liam Porter"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Your Email</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="liam@domain.com"
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Inquiry Theme</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white"
                >
                  <option value="Logistics Status Enquiry">Logistics Status Enquiry</option>
                  <option value="Refund Request Audit">Refund Request Audit</option>
                  <option value="Horizon Points allocation">Horizon Points allocation</option>
                  <option value="Decentralized wallet check">Decentralized wallet check</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Message Detail</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Please specify carriage shipment holds questions..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white"
                />
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 font-bold font-sans text-xs text-white rounded-xl transition"
              >
                {loading ? "Submitting secure protocols..." : "Transmit Support Ticket"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-900">
        <button 
          onClick={() => onNavigate("landing")}
          className="text-xs text-slate-400 font-mono hover:underline"
        >
          ← Return to club homepage
        </button>
      </div>
    </div>
  );
}
