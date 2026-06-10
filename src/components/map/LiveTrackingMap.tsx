import React, { useEffect, useRef, useState } from "react";
import { 
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  BatteryCharging, 
  Clock, 
  Gauge, 
  ChevronRight, 
  X,
  Sparkles,
  Info
} from "lucide-react";

interface LiveTrackingMapProps {
  authToken?: string;
  routeIndex?: number;
  currentIdx?: number;
  totalStops?: number;
  destinationCity: string;
  onRefresh?: () => void;
}

interface DispatchEmail {
  id: string;
  subject: string;
  time: string;
  milestone: number;
  snippet: string;
  htmlContent: string;
  hasBeenSent: boolean;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  authToken,
  routeIndex,
  currentIdx,
  totalStops = 100,
  destinationCity,
  onRefresh,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const polylineInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // Dynamic state for real-time motion simulation
  const defaultStartIdx = currentIdx !== undefined ? currentIdx : (routeIndex !== undefined ? routeIndex : 25);
  const [simIndex, setSimIndex] = useState<number>(defaultStartIdx);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(2); // Multiplier: 1, 2, 5, 10
  const [showEmailCenter, setShowEmailCenter] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<DispatchEmail | null>(null);
  const [emailAlert, setEmailAlert] = useState<string | null>(null);

  // Synchronize with external index from DB when it mounts or updates
  useEffect(() => {
    if (defaultStartIdx !== undefined) {
      setSimIndex(defaultStartIdx);
    }
  }, [defaultStartIdx]);

  // Leaflet CDN Script loader
  useEffect(() => {
    if ("L" in window || (window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      setLoadingError(true);
    };
    document.head.appendChild(script);
  }, []);

  // Determine dynamic stats based on destination
  const getDestinationStats = () => {
    const uCity = (destinationCity || "").toLowerCase();
    let totalMiles = 2015; // default Chicago Hub
    let routesName = "I-80 East Transcontinental Express";

    if (uCity.includes("seattle")) {
      totalMiles = 1140;
      routesName = "I-15 N to I-84 W Pacific Carrier Corridor";
    } else if (uCity.includes("new york")) {
      totalMiles = 2795;
      routesName = "I-70 East Coast Freight Superhighway Route";
    } else if (uCity.includes("san francisco")) {
      totalMiles = 380;
      routesName = "US-101 North Pacific Coastway Route";
    } else if (uCity.includes("austin")) {
      totalMiles = 1400;
      routesName = "I-10 E to US-290 E Southern Transit Beltway";
    } else if (uCity.includes("dallas")) {
      totalMiles = 1435;
      routesName = "I-40 East to I-30 N High Speed Freight Channel";
    }

    return { totalMiles, routesName };
  };

  const { totalMiles, routesName } = getDestinationStats();

  // Coordinates
  const startLat = 33.7431;
  const startLng = -118.2673;

  const uCity = (destinationCity || "").toLowerCase();
  const endLat = uCity.includes("seattle") ? 47.6062 :
                uCity.includes("new york") ? 40.7128 :
                uCity.includes("san francisco") ? 37.7749 :
                uCity.includes("austin") ? 30.2672 : 32.7767;
  const endLng = uCity.includes("seattle") ? -122.3321 :
                uCity.includes("new york") ? -74.0060 :
                uCity.includes("san francisco") ? -122.4194 :
                uCity.includes("austin") ? -97.7431 : -96.7970;

  // Generate Route coordinates spline
  const routePoints: Array<[number, number]> = [];
  for (let i = 0; i <= totalStops; i++) {
    const ratio = i / totalStops;
    const wobbleLat = Math.sin(ratio * Math.PI) * 1.8;
    const wobbleLng = -Math.sin(ratio * Math.PI) * 1.2;
    routePoints.push([
      startLat + (endLat - startLat) * ratio + wobbleLat,
      startLng + (endLng - startLng) * ratio + wobbleLng
    ]);
  }

  const currentPos = routePoints[simIndex] || [startLat, startLng];

  // Dynamic speed & ETA calculation
  const remainingMiles = Math.max(0, Math.round(totalMiles * (1 - simIndex / 100)));
  const currentSpeed = simIndex === 100 ? 0 : Math.round(68 + Math.sin(simIndex) * 3);
  
  const calculateETA = () => {
    if (simIndex === 100) return { days: 0, hours: 0, minutes: 0, text: "ARRIVED & CHECKED IN" };
    if (currentSpeed === 0) return { days: 99, hours: 0, minutes: 0, text: "STANDBY" };
    const hoursTotal = remainingMiles / currentSpeed;
    const days = Math.floor(hoursTotal / 24);
    const hours = Math.floor(hoursTotal % 24);
    const minutes = Math.floor((hoursTotal % 1) * 60);

    let text = "";
    if (days > 0) text += `${days}d `;
    if (hours > 0 || days > 0) text += `${hours}h `;
    text += `${minutes}m remaining`;
    return { days, hours, minutes, text };
  };

  const eta = calculateETA();

  // Emails templates log list for stylez7065@gmail.com
  const [emails, setEmails] = useState<DispatchEmail[]>([
    {
      id: "EM-001",
      subject: "📦 BYD Downpayment Received: Order Scheduled for Dispatch",
      time: "Scheduled at 0% Progress",
      milestone: 0,
      snippet: "Settle and secured downpayment for your high-performance BYD model. Transit carriers have been provisioned...",
      hasBeenSent: true,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0f172a; padding: 24px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #00e5ff; padding-bottom: 16px;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">BYD GLOBAL TRANSIT NETWORK</h1>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">TRACKING ID: BYD-TRANSIT-958201</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 13px; line-height: 1.6;">Hello <strong>stylez7065@gmail.com</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">We have successfully received and cleared your downpayment transaction node on the secure escrow wallet. Your vehicle co-ownership installment carrier has been mapped for transport.</p>
            
            <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #10b981; margin: 0 0 8px 0; font-size: 12px; font-family: monospace;">STAGE: 0% INITIALIZED</h3>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Selected Model:</strong> High Dynamic Series</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Origin Point:</strong> Port of Los Angeles (Inbound Carrier Depot)</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Destination Hub:</strong> ${destinationCity}</p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">A professional transport crew led by Crew Captain Marcus Vance will oversee the high-voltage loading and Blade Battery maintenance protocol during trans-continental trucking route.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
            <p style="margin: 0;">Automated telemetry notification by BYD Freight Operations division.</p>
          </div>
        </div>
      `
    },
    {
      id: "EM-002",
      subject: "🚛 BYD Dispatch Confirmed: Carrier Departed Port of LA",
      time: "Sent at 15% Progress",
      milestone: 15,
      snippet: "Our transport carrier has cleared customs gates at the Port of Los Angeles. Speed currently locked at 65 mph...",
      hasBeenSent: false,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0f172a; padding: 24px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #00e5ff; padding-bottom: 16px;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">BYD GLOBAL TRANSIT NETWORK</h1>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">TRACKING ID: BYD-TRANSIT-958201</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 13px; line-height: 1.6;">Hello <strong>stylez7065@gmail.com</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">Active transport telemetry has been established. The freight carrier has dispatched safely past the outer barriers of the <strong>Port of Los Angeles</strong>.</p>
            
            <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #00e5ff;">
              <h3 style="color: #00e5ff; margin: 0 0 8px 0; font-size: 12px; font-family: monospace;">STAGE: 15% IN TRANSIT</h3>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Active Trail:</strong> ${routesName}</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Remaining Miles:</strong> ${totalMiles - Math.round(totalMiles * 0.15)} Miles</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Assigned Fleet:</strong> Aero Force heavy logistics haul</p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">Our active GPS beacon has registered continuous movement. You can monitor live progress on your AI Studio dashboard map, complete with speed trackers and dynamic digital path alignment.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
            <p style="margin: 0;">Automated telemetry notification by BYD Freight Operations division.</p>
          </div>
        </div>
      `
    },
    {
      id: "EM-003",
      subject: "📊 BYD Mid-Transit Update: Halfway to Final Destination State",
      time: "Sent at 50% Progress",
      milestone: 50,
      snippet: "Mid-transit report clears all battery and steering checkmarks. Approaching regional highway border checkpoints...",
      hasBeenSent: false,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0f172a; padding: 24px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #00e5ff; padding-bottom: 16px;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">BYD GLOBAL TRANSIT NETWORK</h1>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">TRACKING ID: BYD-TRANSIT-958201</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 13px; line-height: 1.6;">Hello <strong>stylez7065@gmail.com</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">Your vehicle co-ownership transport has successfully crossed the <strong>50% progress milestone</strong>.</p>
            
            <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #f59e0b; margin: 0 0 8px 0; font-size: 12px; font-family: monospace;">STAGE: 50% ROUTE COMPLETED</h3>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Weather Conditions:</strong> Optimal / Solar charging active</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Voltage Stability:</strong> 100% (Blade Battery in storage mode)</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Calculated Miles to Destination:</strong> ${totalMiles - Math.round(totalMiles * 0.5)} Miles</p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">The heavy truck container cabin pressure and active anchor clamps have been audited at our regional service checkpoint and cleared without issue. Estimated Time of Arrival remains on schedule.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
            <p style="margin: 0;">Automated telemetry notification by BYD Freight Operations division.</p>
          </div>
        </div>
      `
    },
    {
      id: "EM-004",
      subject: "🏁 BYD Arrival Alert: Unloaded & Checked at Destination Hub",
      time: "Sent at 100% Progress",
      milestone: 100,
      snippet: "Arrival protocol cleared. Your vehicle is ready for final key handoff and test inspection. Handover scheduled...",
      hasBeenSent: false,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0f172a; padding: 24px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px;">
            <h1 style="color: #10b981; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">DELIVERY CONFIRMED</h1>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">TRACKING ID: BYD-TRANSIT-958201</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 13px; line-height: 1.6;">Hello <strong>stylez7065@gmail.com</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">We are absolutely thrilled to report that your vehicle transporter has safely reached the <strong>${destinationCity} Terminal</strong>.</p>
            
            <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #10b981; margin: 0 0 8px 0; font-size: 12px; font-family: monospace;">STAGE: 100% ARRIVED</h3>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Unloading Status:</strong> Grounded & Inspected successfully</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Odometer:</strong> 2.2 Miles (Delivery check node limit)</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Keys Location:</strong> Regional office vault chamber</p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">Our team has completed the post-haul washing and detail protocol. You can now use the secure companion app key terminal to schedule a delivery pickup appointment at your chosen interval.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
            <p style="margin: 0;">Automated telemetry notification by BYD Freight Operations division.</p>
          </div>
        </div>
      `
    }
  ]);

  // Motion animation effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimIndex((prev) => {
        const next = Math.min(100, prev + 1);
        
        // Trigger automated emails when progress threshold is crossed
        setEmails((allEmails) => 
          allEmails.map((em) => {
            if (next >= em.milestone && !em.hasBeenSent) {
              // Trigger a beautiful alert
              setEmailAlert(`📧 Dispatch update sent to stylez7065@gmail.com: "${em.subject}"`);
              return { ...em, hasBeenSent: true };
            }
            return em;
          })
        );

        if (next >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, 1500 / simSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Handle email alert fade out
  useEffect(() => {
    if (emailAlert) {
      const timer = setTimeout(() => setEmailAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [emailAlert]);

  // Map instance creation
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Reset map instance if it is pre-existing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
      polylineInstanceRef.current = null;
    }

    // Initialize Map element
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(currentPos, 6);

    // Warm minimalist dark mode tiles matching the site aesthetic perfectly
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    // High quality glowing cobalt active transit path trail
    polylineInstanceRef.current = L.polyline(routePoints, {
      color: "#00E5FF",
      weight: 3.5,
      opacity: 0.85,
    }).addTo(mapInstanceRef.current);

    // Dynamic Customized glowing vehicle marker
    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-9 w-9 rounded-full bg-[#00E5FF] opacity-30 animate-pulse"></div>
          <div class="absolute h-5 w-5 rounded-full bg-[#00E5FF] opacity-50 animate-ping"></div>
          <div class="h-6 w-6 rounded-full bg-slate-950 border-2 border-[#00E5FF] flex items-center justify-center text-[8px] font-mono font-extrabold text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.6)]">
            BYD
          </div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    markerInstanceRef.current = L.marker(currentPos, { icon: customIcon })
      .addTo(mapInstanceRef.current);

    // Custom dark theme popup template list
    markerInstanceRef.current.bindPopup(`
      <div class="p-2 text-white font-mono text-[10px] bg-slate-950 border border-slate-800 rounded-lg min-w-[170px]" style="font-family: inherit;">
        <strong style="color: #00E5FF;" class="block text-xs uppercase tracking-wider mb-1">BYD TRANSPORTER ACTIVE</strong>
        <div style="flex-direction: column;" class="space-y-1 mt-1 text-slate-300">
          <div>🗺️ Route: <span class="text-white">${routesName}</span></div>
          <div>📍 Pos: <span class="text-white font-bold">${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}</span></div>
          <div>⚡ Transit: <span class="text-cyan-400 font-extrabold">${simIndex}% Comply</span></div>
          <div>🚛 Speed: <span class="text-[#00E5FF] font-bold">${currentSpeed} Mph</span></div>
        </div>
      </div>
    `).openPopup();

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, [leafletLoaded, simIndex, destinationCity]);

  // Pan to current pos smoothly
  useEffect(() => {
    if (mapInstanceRef.current && leafletLoaded) {
      mapInstanceRef.current.panTo(currentPos, { animate: true, duration: 0.5 });
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng(currentPos);
        markerInstanceRef.current.getPopup().setContent(`
          <div class="p-2 text-white font-mono text-[10px] bg-slate-950 border border-slate-800 rounded-lg min-w-[170px]" style="font-family: inherit;">
            <strong style="color: #00E5FF;" class="block text-xs uppercase tracking-wider mb-1">BYD TRANSPORTER ACTIVE</strong>
            <div style="flex-direction: column;" class="space-y-1 mt-1 text-slate-300">
              <div>🗺️ Route: <span class="text-white text-[9px]">${routesName}</span></div>
              <div>📍 Pos: <span class="text-white font-bold">${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}</span></div>
              <div>⚡ Transit: <span class="text-[#00E5FF] font-bold">${simIndex}% Completed</span></div>
              <div>🚛 Speed: <span class="text-[#00E5FF] font-bold">${currentSpeed} Mph</span></div>
            </div>
          </div>
        `);
      }
    }
  }, [simIndex]);

  const forcePushEmail = () => {
    // Manually push another email dispatch node
    setEmailAlert(`📧 Test GPS Delivery dispatch report forced to stylez7065@gmail.com!`);
    const demoMail: DispatchEmail = {
      id: `DEM-${Date.now()}`,
      subject: `🛡️ BYD Manual Tracking Alert: Transport Telepresence Checkpoint Clear`,
      time: "Forced Alert Dispatch",
      milestone: simIndex,
      snippet: `A manual telepresence audit was executed by stylez7065@gmail.com at coordinate nodes ${currentPos[0].toFixed(3)}, ${currentPos[1].toFixed(3)}...`,
      hasBeenSent: true,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0f172a; padding: 24px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #00e5ff; padding-bottom: 16px;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">BYD GLOBAL TRANSIT NETWORK</h1>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">TRACKING ID: BYD-TRANSIT-958201</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 13px; line-height: 1.6;">Hello <strong>stylez7065@gmail.com</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">A manual user tracking inquiry was cleared at coordinate telemetry stack.</p>
            
            <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #38bdf8;">
              <h3 style="color: #38bdf8; margin: 0 0 8px 0; font-size: 12px; font-family: monospace;">MANUAL AUDIT PROTOCOL: CLEARED</h3>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Live Tracking Coordinates:</strong> ${currentPos[0].toFixed(5)} Lat, ${currentPos[1].toFixed(5)} Lng</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Trans-Continental Route:</strong> ${routesName}</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Active Telemetry Index:</strong> ${simIndex}%</p>
              <p style="font-size: 12px; margin: 3px 0; color: #94a3b8;"><strong>Calculated Remaining Miles:</strong> ${remainingMiles} Mi</p>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">All critical hardware modules (Blade battery packs, active cooling lines, secure cargo locks) are operating within perfect thermal parameters.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
            <p style="margin: 0;">Manual Telepresence Alert requested by user stylez7065@gmail.com.</p>
          </div>
        </div>
      `
    };
    setEmails((prev) => [demoMail, ...prev]);
    setSelectedEmail(demoMail);
    setShowEmailCenter(true);
  };

  if (loadingError) {
    return (
      <div className="h-full w-full rounded-2xl bg-slate-950 border border-slate-850 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <div>
          <span className="font-mono text-xs text-slate-400 select-none block">Failed to load Leaflet Map streams</span>
          <span className="text-[10px] text-slate-600 font-mono">Verify database offline connectivity constraints.</span>
        </div>
      </div>
    );
  }

  if (!leafletLoaded) {
    return (
      <div className="h-full w-full rounded-2xl bg-slate-950 border border-slate-850 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <div>
          <span className="font-mono text-xs text-slate-400 select-none block">Synchronizing Live GPS Telemetry Nodes...</span>
          <span className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest text-cyan-400">Securing Leaflet.js map stream headers.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none" id="leaflet-active-map-container">
      {/* Real Leaflet Map */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] rounded-2xl outline-none overflow-hidden" />
      
      {/* Left Top Float telemetry badge */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-850/80 px-3 py-1.5 rounded-xl text-[9px] font-mono uppercase tracking-widest text-slate-300 flex items-center space-x-2 shadow-2xl">
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="font-bold text-white tracking-widest leading-none">GPS TELEMETRY ACTIVE</span>
      </div>

      {/* Email Alert Banner */}
      {emailAlert && (
        <div className="absolute top-16 left-4 right-4 z-[500] bg-cyan-950 border-2 border-cyan-400 text-cyan-200 px-3 py-2 rounded-xl text-[10px] font-mono tracking-wide flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold">{emailAlert}</span>
          </div>
          <button onClick={() => setEmailAlert(null)}>
            <X className="w-3.5 h-3.5 text-cyan-400 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Floating Speed, ETA & Distance Dashboard Overlay (Left Column Center) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2 max-w-[220px]">
        {/* Email Tracking Center Trigger Button */}
        <button
          onClick={() => setShowEmailCenter(!showEmailCenter)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-slate-200 shadow-2xl cursor-pointer transition-all"
        >
          <span className="flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>EMAIL DISPATCH HUB</span>
          </span>
          <span className="bg-cyan-500 text-black px-1.5 py-0.5 rounded font-extrabold text-[8px]">
            {emails.filter(e => e.hasBeenSent).length} SENT
          </span>
        </button>

        {/* Telemetry counters */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-2xl space-y-2 text-left font-mono">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">LIVE TELEMETRY</span>
            <Sparkles className="w-3 h-3 text-[#00E5FF]" />
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00E5FF]" /> Destination:
            </span>
            <span className="text-white font-extrabold">{destinationCity}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#00E5FF]" /> Remaining:
            </span>
            <span className="text-cyan-400 font-extrabold">{remainingMiles} Mi</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-[#00E5FF]" /> Carrier Speed:
            </span>
            <span className="text-white font-extrabold">{currentSpeed} Mph</span>
          </div>
          <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-1.5 mt-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Ground ETA:
            </span>
            <span className="text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider">{eta.text}</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Simulation Live Controls Dock */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-950/95 border border-slate-850 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        
        {/* Playback Controls button layout */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              isPlaying 
                ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-400" 
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
            title={isPlaying ? "Pause simulated transit movement" : "Play simulated trans-continental motion"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Speed trigger multipliers */}
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-850/80">
            <span className="text-[8px] text-slate-500 font-mono uppercase font-bold mr-1">Speed:</span>
            {[1, 2, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition cursor-pointer ${
                  simSpeed === spd 
                    ? "bg-[#00E5FF] text-black" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSimIndex(0);
              // Reset dynamic emails sent flag except at index 0
              setEmails((all) => all.map((m) => m.milestone === 0 ? m : { ...m, hasBeenSent: false }));
              setIsPlaying(true);
            }}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer transition"
            title="Wipe & Reset transit index telemetry"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* User manual tracking alert developer trigger */}
          <button
            onClick={forcePushEmail}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-400/35 text-slate-300 hover:text-cyan-400 font-mono text-[9px] font-bold flex items-center space-x-1.5 transition"
            title="Dispatch manual tracking email to stylez7065@gmail.com"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>FORCE DESPATCH</span>
          </button>
        </div>

        {/* Progress Slider Track Line */}
        <div className="flex-1 w-full mx-2 font-mono flex items-center space-x-2">
          <span className="text-[9px] text-slate-500">LA</span>
          <div className="flex-1 relative flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              value={simIndex}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSimIndex(val);
                // retroactively mark emails as sent based on new index scrub
                setEmails((all) => all.map((m) => ({ ...m, hasBeenSent: val >= m.milestone })));
              }}
              className="w-full h-1.5 rounded-lg bg-slate-800 accent-[#00E5FF] cursor-pointer"
            />
            {/* Pulsing indicator ratio dot */}
            <div 
              className="absolute pointer-events-none text-[8px] bg-[#00E5FF] text-black px-1.5 py-0.2 rounded font-extrabold shadow-[0_0_8px_rgba(0,229,255,0.7)]"
              style={{ left: `calc(${simIndex}% - 12px)`, bottom: '15px' }}
            >
              {simIndex}%
            </div>
          </div>
          <span className="text-[9px] text-[#00E5FF] font-bold">{(destinationCity || "").split(" ")[0].toUpperCase()}</span>
        </div>
      </div>

      {/* Interactive Email Slides-over Drawer panel */}
      {showEmailCenter && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[1000] rounded-2xl flex justify-end">
          <div className="w-full max-w-[340px] bg-slate-900 border-l border-slate-800 p-4 flex flex-col h-full animate-slide-left overflow-hidden">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-slate-200 font-display font-semibold text-xs leading-none">Dispatcher Mailroom</h4>
                  <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider block mt-1">stylez7065@gmail.com</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowEmailCenter(false);
                  setSelectedEmail(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email list or specific selected email preview */}
            {selectedEmail ? (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-[9px] font-mono font-bold text-cyan-400 hover:underline flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>&larr; Return to Inbox Feed</span>
                </button>
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/60 mb-2 font-mono text-[9px] text-slate-400 text-left">
                    <div><strong>TO:</strong> stylez7065@gmail.com</div>
                    <div><strong>SUBJECT:</strong> {selectedEmail.subject}</div>
                    <div><strong>STATUS:</strong> DELIVERED 🏁</div>
                  </div>
                  {/* Clean rendered layout container */}
                  <div 
                    className="text-left font-sans text-xs rounded-xl"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-3 block">
                  Carrier Emails Delivered ({emails.filter(e => e.hasBeenSent).length})
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {emails.map((em) => {
                    if (!em.hasBeenSent) {
                      return (
                        <div 
                          key={em.id}
                          className="p-2 py-3 rounded-xl border border-slate-850 bg-slate-950/20 opacity-35 font-mono text-[9px] text-left relative"
                        >
                          <div className="bg-slate-800 text-slate-500 px-1 py-0.5 rounded font-mono text-[8px] absolute top-2 right-2">
                            PRE-DISPATCH
                          </div>
                          <span className="block text-slate-400 font-bold truncate pr-16">{em.subject}</span>
                          <span className="block text-slate-600 text-[8px] mt-0.5">Triggers automatically at {em.milestone}% transit progress</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={em.id}
                        onClick={() => setSelectedEmail(em)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-950 hover:border-cyan-500/25 transition flex flex-col space-y-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                      >
                        <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400">
                          <span className="font-extrabold uppercase bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-850">DELIVERED</span>
                          <span className="text-slate-500">{em.time}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-200 text-[11px] hover:text-cyan-400 transition leading-snug line-clamp-2">
                            {em.subject}
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 mt-1">
                            {em.snippet}
                          </p>
                        </div>
                        <div className="flex items-center text-[10px] text-cyan-400 hover:text-white font-mono font-bold pt-1 border-t border-slate-850/50">
                          <span>Read Complete Email Log</span>
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
