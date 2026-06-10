import React, { useState } from "react";
import { MessageSquare, Phone, ShieldAlert, X, Send, HelpCircle } from "lucide-react";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "call" | "escalate" | null>(null);
  
  // State for support forms
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    { sender: "bot", text: "BYD Horizon Club Virtual Assistant online. All our licensed representatives are currently serving other luxury members. How can I assist you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState("");
  
  const [escalateForm, setEscalateForm] = useState({ name: "", email: "", subject: "URGENT: Logistics Expedite Request", message: "" });
  const [escalateStatus, setEscalateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg, time }]);
    setChatInput("");

    // Simulate canned delays
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: "bot",
        text: "Please hold on... Connection congestion is high. All human managers are currently occupied reviewing vehicle custom clearings. We suggest leaving a support ticket or escalating directly using the Manager contact form.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleSendEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateForm.name || !escalateForm.email || !escalateForm.message) {
      alert("Please fill out all fields in the Escalation request.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(escalateForm)
      });
      const data = await res.json();
      if (res.ok) {
        setEscalateStatus(`Ticket #${1540 + data.ticketId} successfully issued to the Executive Board. Automatic secure SMTP servers sent a copy to ${escalateForm.email}. Average manager audit time is currently 72 hours.`);
        setEscalateForm({ name: "", email: "", subject: "URGENT: Logistics Expedite Request", message: "" });
      } else {
        alert(data.error || "Form transmission failed.");
      }
    } catch {
      alert("Error contacting escalation dispatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="support-widget">
      {/* Expanded Support Menu */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-display font-semibold text-sm leading-none text-white">Horizon Club Helpdesk</h3>
                <span className="text-[10px] text-cyan-100 font-mono">24/7 Security Operations Room</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-mono">
            <button 
              onClick={() => { setActiveTab("chat"); setEscalateStatus(null); }}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${activeTab === "chat" ? "text-cyan-400 border-cyan-400 font-bold bg-slate-900" : "text-slate-400 border-transparent hover:text-slate-200"}`}
            >
              Live Assistant
            </button>
            <button 
              onClick={() => { setActiveTab("escalate"); setEscalateStatus(null); }}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${activeTab === "escalate" ? "text-cyan-400 border-cyan-400 font-bold bg-slate-900" : "text-slate-400 border-transparent hover:text-slate-200"}`}
            >
              Escalate
            </button>
            <button 
              onClick={() => { setActiveTab("call"); setEscalateStatus(null); }}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${activeTab === "call" ? "text-cyan-400 border-cyan-400 font-bold bg-slate-900" : "text-slate-400 border-transparent hover:text-slate-200"}`}
            >
              Call Support
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50">
            {activeTab === null && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <HelpCircle className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h4 className="font-display font-medium text-sm mb-1 text-slate-300">How would you like to proceed?</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Our operations offices are ready to investigate shipping statuses, payment blockages, or rewards orders.
                </p>
                <div className="w-full space-y-2">
                  <button onClick={() => setActiveTab("chat")} className="w-full py-2 bg-slate-800 text-xs rounded-lg hover:bg-slate-700 transition flex items-center justify-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>Open Live Chat Widget</span>
                  </button>
                  <button onClick={() => setActiveTab("escalate")} className="w-full py-2 bg-slate-800 text-xs rounded-lg hover:bg-slate-700 transition flex items-center justify-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>Escalate To Executive Office</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full justify-between -m-4">
                <div className="p-4 space-y-3 overflow-y-auto flex-1 h-[330px]">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${msg.sender === "user" ? "bg-cyan-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none"}`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChat} className="border-t border-slate-800 p-2 flex bg-slate-900 space-x-2 items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Enter chat query..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-white placeholder-slate-500"
                  />
                  <button type="submit" className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "escalate" && (
              <div>
                {escalateStatus ? (
                  <div className="bg-slate-900/60 border border-cyan-500/30 p-4 rounded-xl text-xs space-y-2 text-slate-300">
                    <h5 className="font-semibold text-cyan-400 flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Logistics Escalation Active</span>
                    </h5>
                    <p className="leading-relaxed">{escalateStatus}</p>
                    <button 
                      onClick={() => setEscalateStatus(null)}
                      className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] rounded font-mono"
                    >
                      File Another Escalation
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendEscalate} className="space-y-3 p-1">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                      If your EV shipment map marker is delayed at customs or charging holds, please escalate directly to executive auditors here.
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">Your Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={escalateForm.name}
                        onChange={e => setEscalateForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">Registered Email</label>
                      <input 
                        required
                        type="email" 
                        value={escalateForm.email}
                        onChange={e => setEscalateForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">Subject Theme</label>
                      <select 
                        value={escalateForm.subject}
                        onChange={e => setEscalateForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                      >
                        <option value="URGENT: Logistics Expedite Request">URGENT: Logistics Expedite Request</option>
                        <option value="PAYMENT: Double billing check">PAYMENT: Double billing check</option>
                        <option value="DISPUTE: Immediate refund audit">DISPUTE: Immediate refund audit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">Detailed Request</label>
                      <textarea 
                        required
                        rows={3}
                        value={escalateForm.message}
                        onChange={e => setEscalateForm(p => ({ ...p, message: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-600"
                        placeholder="Please supply shipment delays justification..."
                      />
                    </div>
                    <button 
                      disabled={loading}
                      type="submit" 
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-md"
                    >
                      {loading ? "Transmitting Secures..." : "Submit Bureau Escalation File"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "call" && (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-full animate-bounce">
                  <Phone className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-display font-medium text-sm text-slate-200">Simulated Telephone Voicemail</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    All our telecommunication hotlines are currently congested due to international order queues.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg w-full">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-mono">BYD Club Dispatch Line</span>
                  <a href="tel:+1234567890" className="text-cyan-400 font-mono text-lg font-bold hover:underline">+1 (234) 567-890</a>
                  <span className="text-[9px] text-amber-500 block mt-1 font-mono">⚠️ Connects directly to server-answering tape systems</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Trigger Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) setActiveTab(null); }}
        className="h-14 w-14 bg-gradient-to-r from-cyan-500 to-blue-600 outline-none border-none hover:from-cyan-400 hover:to-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all group"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <HelpCircle className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}
