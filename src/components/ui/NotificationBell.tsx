import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash, AlertTriangle, Info, Clock, CheckCircle } from "lucide-react";

interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}

interface NotificationBellProps {
  authToken: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ authToken }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = async () => {
    if (!authToken || typeof authToken !== "string" || authToken === "undefined" || authToken === "null" || authToken.trim() === "" || authToken.startsWith("[object")) {
      return;
    }
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setNotifications(list);
        }
      } else {
        console.warn(`Failed to fetch notifications: Status ${res.status}`);
      }
    } catch (err) {
      console.warn("Could not retrieve notifications from service:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll notifications every 15s
    return () => clearInterval(interval);
  }, [authToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => n.is_read === 0).map((n) => n.id);
    for (const id of unreadIds) {
      await handleMarkAsRead(id);
    }
  };

  const getIcon = (msg: string) => {
    const safeMsg = (msg || "").toLowerCase();
    if (safeMsg.includes("delay") || safeMsg.includes("hold") || safeMsg.includes("alert")) {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    if (safeMsg.includes("welcome") || safeMsg.includes("approved") || safeMsg.includes("complete")) {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="notification-bell-container">
      <button
        id="btn-bell-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-slate-400 hover:text-white"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            id="unread-badge-count"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-white font-mono animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute right-4 sm:right-0 mt-2 top-20 sm:top-auto w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-md rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl z-[9999] text-left animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
            <span className="font-display text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">
              Notifications ({unreadCount} New)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Dismiss All
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2.5 max-h-[20rem] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border transition duration-150 flex items-start gap-2.5 relative ${
                    n.is_read === 0
                      ? "bg-slate-900/60 border-slate-800"
                      : "bg-slate-950/20 border-transparent opacity-60"
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.message)}</div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs text-slate-200 leading-normal font-sans tracking-tight">
                      {n.message}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  {n.is_read === 0 && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-blue-400 transition"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
