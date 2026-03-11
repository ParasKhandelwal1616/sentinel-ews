'use client'

import ProtectedRoute from "@/src/components/protectedroutes";
import { useAuth } from "@/src/context/Auth";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { saveReportOffline, getOfflineReports, deleteOfflineReport } from "@/src/lib/offlineStore";
import api from "@/src/lib/api";
import {
  LogOut, MapPin, AlertTriangle, Radio,
  Send, Wifi, User, ChevronRight, Camera,
  Activity, CheckCircle
} from "lucide-react";

// Types
interface Incident {
  _id: string;
  topic: string;
  description: string;
  severity: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: string;
  imageUrl?: string;
}

interface Orb {
  w: number;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  c: string;
  d: string;
}
// 🛠️ HELPER: Convert File to Base64 for safe offline storage
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// IMPORTANT: Leaflet MUST be dynamic
const LiveMap = dynamic(() => import("@/src/components/map/Livemap"), {
  ssr: false,
  loading: () => <MapBootLoader />,
});

/* ─── Map loading skeleton ──────────────────────────────────────────────── */
function MapBootLoader() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020d1e]">
      <div className="z-10 flex flex-col items-center gap-3">
        <div
          className="h-7 w-7 rounded-full border-2 border-transparent border-t-[#00d4ff]"
          style={{ animation: "spin-loader 0.7s linear infinite" }}
        />
        <span className="font-orbitron animate-pulse text-[10px] tracking-[3px] text-[#00d4ff]/50">
          BOOTING RADAR...
        </span>
      </div>
    </div>
  );
}

/* ─── Severity helper ───────────────────────────────────────────────────── */
function getSev(severity: number) {
  if (severity >= 4) return { color: "#ff4444", label: "CRITICAL", bg: "rgba(255,68,68,0.10)" };
  if (severity === 3) return { color: "#ff8c42", label: "HIGH",     bg: "rgba(255,140,66,0.10)" };
  return                     { color: "#00ff88", label: "LOW",      bg: "rgba(0,255,136,0.08)"  };
}

/* ─── Threat card ───────────────────────────────────────────────────────── */
function ThreatCard({ threat, delay = 0, onResolve }: { threat: Incident; delay?: number; onResolve: (id: string) => void }) {
  const sev = getSev(threat.severity);
  return (
    <div
      className="group relative overflow-hidden rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        animation: `fade-up 0.5s cubic-bezier(0.2,1,0.4,1) ${delay}s both`,
      }}
    >
      <div
        className="absolute bottom-0 left-0 top-0 w-0.5 rounded-l-xl"
        style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}60` }}
      />
      <div className="ml-2.5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="font-orbitron text-[10px] font-bold uppercase tracking-wider" style={{ color: sev.color }}>
            {threat.topic}
          </span>
          <span className="flex-shrink-0 text-[9px] text-white/25">
            {new Date(threat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="line-clamp-2 text-[10px] leading-relaxed text-white/38 mb-2">
          {threat.description || "No description provided."}
        </p>

        {/* Mini indicator if the threat has a photo attached */}
        {threat.imageUrl && (
          <div className="flex items-center gap-1 text-[#00d4ff] text-[8px] font-orbitron mb-2 opacity-80">
            <Camera size={9} /> VISUAL EVIDENCE ATTACHED
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[8px] font-black tracking-widest"
            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}25` }}
          >
            {sev.label}
          </span>
          
          <button 
            onClick={() => onResolve(threat._id)}
            className="flex items-center gap-1 text-[9px] font-bold text-white/30 hover:text-[#00ff88] transition-colors px-2 py-1 rounded bg-white/5 hover:bg-[#00ff88]/10 border border-transparent hover:border-[#00ff88]/30"
          >
            <CheckCircle size={10} /> RESOLVE
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "", severity: 3 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeThreats, setActiveThreats] = useState<Incident[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // 🎙️ Voice State
  const [isListening, setIsListening] = useState(false);

  const [showRadar, setShowRadar] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "report">("feed");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [operatorLoc, setOperatorLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setCollapsed(false);
      else setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Hardware Error: Geolocation not supported by this device.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setOperatorLoc([longitude, latitude]);
      },
      (error) => {
        console.error("GPS Lock Failed:", error.message);
        console.log("⚙️ Injecting fallback coordinates (Gwalior)...");
        setOperatorLoc([78.1828, 26.2183]); 
        navigator.geolocation.clearWatch(watchId);
      },
      { enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      let endpoint = "/incidents";
      
      if (isNearbyMode) {
        if (!operatorLoc) {
          alert("COMMAND ERROR: Awaiting GPS lock. Cannot calculate proximity.");
          setIsNearbyMode(false);
          setIsLoadingFeed(false);
          return;
        }
        endpoint = `/incidents/nearby?lng=${operatorLoc[0]}&lat=${operatorLoc[1]}&dist=5000`;
      }

      const res = await api.get(endpoint);
      setActiveThreats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [isNearbyMode, operatorLoc]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const timer = setTimeout(() => setShowRadar(false), 2500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");
    if (token && userData) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", userData);
      router.replace("/dashboard");
      window.location.reload();
    }
  }, [searchParams, router]);

  // 🔴 NEW: THE AUTO-SYNC ENGINE
  useEffect(() => {
    const syncOfflineReports = async () => {
      const pendingReports = await getOfflineReports();
      if (pendingReports.length === 0) return;

      console.log(`📡 SIGNAL RESTORED: Syncing ${pendingReports.length} offline reports...`);

      for (const report of pendingReports) {
        try {
          const uploadData = new FormData();
          uploadData.append("topic", report.topic);
          uploadData.append("description", report.description);
          uploadData.append("severity", report.severity.toString());
          uploadData.append("location", JSON.stringify(report.location));

          // If we saved an image as Base64, convert it back to a Blob for Multer
          if (report.image) {
            const res = await fetch(report.image);
            const blob = await res.blob();
            uploadData.append("image", blob, "offline_evidence.jpg");
          }

          await api.post("/incidents", uploadData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // Delete from local vault once successful
          await deleteOfflineReport(report.id);
          console.log(`✅ Offline report ${report.id} synced successfully!`);
        } catch (error) {
          console.error(`❌ Failed to sync report ${report.id}:`, error);
        }
      }
      
      // Refresh the feed once everything is synced
      fetchFeed();
    };

    // Listen for the browser telling us the internet is back
    window.addEventListener('online', syncOfflineReports);
    
    // Also check on initial boot just in case we came back online while the app was closed
    if (navigator.onLine) syncOfflineReports();

    return () => window.removeEventListener('online', syncOfflineReports);
  }, [fetchFeed]);

  const handleResolveThreat = async (id: string) => {
    try {
      setActiveThreats((prev) => prev.filter((t) => t._id !== id));
      await api.delete(`/incidents/${id}`);
    } catch (err) {
      console.error("Failed to resolve threat:", err);
      fetchFeed(); 
    }
  };

  // 🎙️ THE VOICE UPLINK ENGINE
  const startVoiceCommand = (e: React.MouseEvent) => {
    e.preventDefault(); 

    // @ts-expect-error SpeechRecognition is not standard DOM type yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return alert("⚠️ COMMAND ERROR: Your browser does not support Voice Uplink.");
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    recognition.lang = "en-US"; 

    recognition.onstart = () => setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎙️ Voice Captured:", transcript);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({
        ...prev,
        description: prev.description ? prev.description + " " + transcript : transcript,
      }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Mic error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPos) return alert("COMMAND ERROR: Click map to target.");
    if (!formData.topic) return alert("COMMAND ERROR: Topic required.");

    setIsSubmitting(true);

    // 🔴 NEW: THE OFFLINE INTERCEPTOR
    if (!navigator.onLine) {
      console.warn("⚠️ NO SIGNAL DETECTED. Intercepting payload for local storage...");
      
      let base64Image = null;
      if (imageFile) {
        base64Image = await convertToBase64(imageFile);
      }

      const offlinePayload = {
        topic: formData.topic,
        description: formData.description,
        severity: formData.severity,
        location: {
          type: "Point",
          coordinates: [selectedPos.lng, selectedPos.lat] 
        },
        image: base64Image // Stored safely as a string
      };

      await saveReportOffline(offlinePayload);
      
      alert("📡 ZERO-SIGNAL MODE: You are offline. Threat report cached securely to device. It will automatically broadcast when your signal is restored.");
      
      setFormData({ topic: "", description: "", severity: 3 });
      setSelectedPos(null);
      setImageFile(null);
      setIsSubmitting(false);
      return; // Stop the function here so it doesn't try to hit the API
    }

    // 🟢 ONLINE MODE: Proceed with normal upload
    try {
      const uploadData = new FormData();
      uploadData.append("topic", formData.topic);
      uploadData.append("description", formData.description);
      uploadData.append("severity", formData.severity.toString());
      uploadData.append("location", JSON.stringify({
        type: "Point",
        coordinates: [selectedPos.lng, selectedPos.lat] 
      }));
      
      if (imageFile) uploadData.append("image", imageFile);

      await api.post("/incidents", uploadData, {
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      setFormData({ topic: "", description: "", severity: 3 });
      setSelectedPos(null);
      setImageFile(null); 
      fetchFeed(); // Refresh the map
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error("Report failed:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert("⚠️ COMMAND REJECTED: " + err.response.data.message);
      } else {
        alert("⚠️ Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const criticalCount = activeThreats.filter((t) => t.severity >= 4).length;
  const sev = getSev(formData.severity);

  const orbs: Orb[] = [
    { w: 500, top: "-12%", left: "-10%", c: "rgba(0,212,255,0.07)", d: "0s" },
    { w: 400, bottom: "-10%", right: "-8%", c: "rgba(180,79,255,0.07)", d: "5s" },
  ];

  if (!mounted) return <div className="h-screen w-full bg-[#020e20]" />;

  return (
    <ProtectedRoute>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Sora:wght@400;500;600;700&display=swap');

          @keyframes fast-scan {
            0%   { transform: translateY(-10px); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes orb-drift {
            0%,100% { transform: translate(0,0) scale(1); }
            33%      { transform: translate(38px,-32px) scale(1.06); }
            66%      { transform: translate(-22px,26px) scale(0.93); }
          }
          @keyframes spin-loader { to { transform: rotate(360deg); } }
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .font-orbitron { font-family: 'Orbitron', monospace; }
          .font-sora     { font-family: 'Sora', sans-serif; }

          .glass {
            background: rgba(255,255,255,0.038);
            border: 1px solid rgba(255,255,255,0.085);
            backdrop-filter: blur(22px);
          }
          .s-input {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px;
            padding: 10px 14px;
            font-size: 12px;
            font-family: 'Sora', sans-serif;
            color: #e8f4ff;
            outline: none;
            resize: none;
            transition: all .22s;
          }
          .s-input:focus { border-color: #00d4ff; box-shadow: 0 0 0 3px rgba(0,212,255,0.10); }
          .btn-broadcast { background: linear-gradient(135deg,#ff4444,#b44fff); border: none; }
          .btn-broadcast:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 28px rgba(255,68,68,0.45); }
          .btn-broadcast:disabled { opacity:.55; cursor:not-allowed; }
          .tab-on  { color: #00d4ff; border-bottom: 2px solid #00d4ff; }
          .tab-off { color: rgba(255,255,255,0.30); border-bottom: 2px solid transparent; }
          .thin-scroll::-webkit-scrollbar { width: 3px; }
          .thin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
        `}</style>

        <div className="font-sora relative flex h-screen w-full overflow-hidden bg-[#020e20]">
          
          {orbs.map((o, i) => (
            <div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: o.w, height: o.w,
                top: o.top, left: o.left, right: o.right, bottom: o.bottom,
                background: `radial-gradient(circle, ${o.c}, transparent 68%)`,
                filter: "blur(70px)",
                animation: `orb-drift 16s ease-in-out ${o.d} infinite`,
              }}
            />
          ))}

          {collapsed && (
            <button 
              onClick={() => setCollapsed(false)} 
              className="fixed left-0 top-1/2 -translate-y-1/2 z-50 md:hidden bg-slate-900/80 backdrop-blur-lg border border-l-0 border-slate-700 p-3 rounded-r-2xl text-[#00d4ff] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          )}

         <aside className={`fixed md:relative inset-y-0 left-0 bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 transition-all duration-300 
           ${collapsed 
             ? "-translate-x-full md:translate-x-0 md:w-16 md:p-2" 
             : "translate-x-0 w-[85vw] md:w-80 p-6"} 
           overflow-y-auto thin-scroll md:flex-shrink-0`}>
            
            <div className="flex flex-shrink-0 items-center justify-between px-1 py-4 border-b border-white/10">
              {(!collapsed || isMobile) && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xl bg-gradient-to-br from-[#00d4ff] to-[#b44fff]">🛡️</div>
                  <div>
                    <div className="font-orbitron text-[12px] font-black tracking-[3px] text-white">SENTINEL</div>
                    <div className="text-[8px] uppercase tracking-[1.5px] text-white/30">Field Command</div>
                  </div>
                </div>
              )}
              <button onClick={() => setCollapsed(!collapsed)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-[#00d4ff] ${collapsed ? "mx-auto" : "ml-auto"}`}>
                <ChevronRight size={13} style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }} />
              </button>
            </div>

            {(!collapsed || isMobile) && (
              <div className="flex flex-1 flex-col overflow-hidden px-1 py-3">
                <div className="mb-3 flex items-center gap-2.5 rounded-2xl p-3 bg-white/5 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white bg-gradient-to-br from-[#00d4ff] to-[#b44fff]">
                    {user?.name?.[0]?.toUpperCase() ?? <User size={13} />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-semibold text-white/80">{user?.name || "Unknown Agent"}</div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#00ff88]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" /> Live Connection
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex border-b border-white/10">
                  <button onClick={() => setActiveTab("feed")} className={`mr-4 pb-2 pt-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === "feed" ? "tab-on" : "tab-off"}`}>
                    <span className="flex items-center gap-1.5"><Radio size={9} /> Live Feed</span>
                  </button>
                  <button onClick={() => setActiveTab("report")} className={`pb-2 pt-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === "report" ? "tab-on" : "tab-off"}`}>
                    <span className="flex items-center gap-1.5"><AlertTriangle size={9} /> Report</span>
                  </button>
                </div>

                <div className="thin-scroll flex-1 overflow-y-auto">
                  {/* LIVE FEED SECTION */}
                  {activeTab === "feed" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                        <span className="text-[10px] font-orbitron font-bold tracking-widest text-white/50 uppercase">
                          Proximity
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsNearbyMode(!isNearbyMode)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                            isNearbyMode 
                              ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]" 
                              : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10"
                          }`}
                        >
                          <MapPin size={12} />
                          {isNearbyMode ? "5KM" : "GLOBAL"}
                        </button>
                      </div>

                      {isLoadingFeed ? (
                        <span className="text-xs text-white/30 text-center mt-4 block">Scanning...</span>
                      ) : activeThreats.length === 0 ? (
                        <span className="text-xs text-white/30 text-center mt-4 block px-2">Area secure. NO THREATS DETECTED.</span>
                      ) : (
                        activeThreats.map((t, i) => (
                          <ThreatCard 
                            key={t._id} 
                            threat={t} 
                            delay={i * 0.05} 
                            onResolve={handleResolveThreat} 
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* REPORT THREAT SECTION */}
                  {activeTab === "report" && (
                    <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 pb-2">
                      <div className="flex items-center gap-2 rounded-xl p-2.5 border border-white/10 bg-white/5">
                        <MapPin size={11} className={selectedPos ? "text-[#00d4ff]" : "text-white/20"} />
                        <span className={`font-mono text-[10px] ${selectedPos ? "text-[#00d4ff]" : "text-white/20"}`}>
                          {selectedPos ? `${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}` : "Click map to pin"}
                        </span>
                      </div>
                      
                      <input 
                        type="text" 
                        placeholder="Topic (e.g. Flood)" 
                        value={formData.topic} 
                        onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                        className="s-input" 
                      />
                      
                      {/* 🔴 RESTORED & FIXED: Voice Uplink Container */}
                      <div className="flex gap-2">
                        <textarea 
                          placeholder="Situation description..." 
                          value={formData.description} 
                          onChange={(e) => setFormData({...formData, description: e.target.value})} 
                          className="s-input h-[72px] flex-1" 
                        />
                        <button
                          type="button"
                          onClick={startVoiceCommand}
                          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 transition-all ${
                            isListening
                              ? "bg-[#ff4444]/20 border border-[#ff4444] text-[#ff4444] shadow-[0_0_15px_rgba(255,68,68,0.4)]"
                              : "bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20"
                          }`}
                        >
                          <span className="text-lg">{isListening ? "🔴" : "🎙️"}</span>
                          <span className="font-orbitron text-[8px] tracking-widest font-bold">
                            {isListening ? "REC" : "VOICE"}
                          </span>
                        </button>
                      </div>

                      <label className="flex flex-col items-center justify-center w-full py-4 border border-white/10 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
                        <Camera size={16} className={imageFile ? "text-[#00ff88] mb-1.5" : "text-white/30 mb-1.5"} />
                        <span className="text-[9px] font-orbitron tracking-widest text-white/50 px-2 line-clamp-1">
                          {imageFile ? imageFile.name.toUpperCase() : "ATTACH VISUAL EVIDENCE (OPTIONAL)"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                            }
                          }} 
                        />
                      </label>
                      <div>
                        <div className="mb-1.5 flex justify-between text-[9px] uppercase text-white/30"><label>Severity</label><span>{formData.severity}/5</span></div>
                        <input type="range" min={1} max={5} value={formData.severity} onChange={(e) => setFormData({...formData, severity: Number(e.target.value)})} className="w-full" style={{ accentColor: sev.color }} />
                      </div>
                      <button type="submit" disabled={isSubmitting || !selectedPos} className="btn-broadcast flex w-full justify-center gap-2 rounded-[12px] py-3 text-[12px] font-bold text-white">
                        <Send size={12} /> BROADCAST ALERT
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-3 border-t border-white/10">
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold text-white/30 hover:text-[#ff4444] border border-white/10">
                <LogOut size={12} /> {(!collapsed || isMobile) && "Logout"}
              </button>
            </div>
          </aside>

          {/* MAIN MAP AREA */}
          <main className="relative flex-1 bg-black overflow-hidden h-full w-full">
            
            <div className={`glass absolute left-3 right-3 top-3 z-20 flex items-center justify-between rounded-2xl px-3 py-2 md:px-4 md:py-2.5 transition-all duration-300`}>
              <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden mr-2">
                <Activity size={12} className={operatorLoc ? "text-[#00d4ff] flex-shrink-0" : "text-[#ff8c42] flex-shrink-0 animate-pulse"} />
                
                <span className="font-orbitron text-[8px] md:text-[10px] font-bold tracking-[1px] md:tracking-[2px] text-white truncate uppercase hidden sm:inline">
                  {operatorLoc ? "GEO-TRACKING ACTIVE" : "SEARCHING SATELLITES"}
                </span>

                {operatorLoc ? (
                  <span className="font-mono text-[8px] md:text-[9px] text-[#00ff88]/70 sm:ml-2 sm:border-l sm:border-white/10 sm:pl-2">
                    [{operatorLoc[0].toFixed(4)}, {operatorLoc[1].toFixed(4)}]
                  </span>
                ) : (
                  <span className="font-mono text-[8px] md:text-[9px] text-[#ff8c42]/70 sm:ml-2 sm:border-l sm:border-white/10 sm:pl-2 animate-pulse">
                    ACQUIRING SIGNAL...
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 md:gap-1.5 rounded-full px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-bold text-[#ff4444] bg-[#ff4444]/10 border border-[#ff4444]/30">
                  <span className="hidden sm:inline">CRITICAL:</span> {criticalCount}
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 rounded-full px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/30">
                  <Wifi size={9} className="flex-shrink-0" /> 
                  <span className="hidden xs:inline">LIVE</span>
                </div>
              </div>
            </div>

            {showRadar && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '1px',
                  background: '#00d4ff',
                  boxShadow: '0 0 18px 3px rgba(0,212,255,0.8)',
                  animation: 'fast-scan 1.5s linear infinite', 
                }}
              />
            )}

            <div className="absolute inset-0 z-0 h-full w-full cursor-crosshair">
              <LiveMap 
                 selectedPos={selectedPos} 
                 onSelectLocation={setSelectedPos} 
                 onNewIncident={(newIncident: Incident) => { setActiveThreats((prev) => [newIncident, ...prev]); }}
                 onThreatResolved={(resolvedId: string) => { setActiveThreats((prev) => prev.filter((t) => t._id !== resolvedId)); }}
                 operatorLoc={operatorLoc} 
              />
            </div>
          </main>
        </div>
      </>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#020e20] flex items-center justify-center text-white/50 font-orbitron tracking-widest">INITIALIZING SECURE LINK...</div>}>
      <DashboardContent />
    </Suspense>
  );
}