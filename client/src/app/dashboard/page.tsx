'use client'

import ProtectedRoute from "@/src/components/protectedroutes";
import { useAuth } from "@/src/context/Auth";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import {
  Shield, LogOut, MapPin, AlertTriangle, Radio,
  Send, RefreshCw, Wifi, User, ChevronRight,
  Zap, Activity, X,
} from "lucide-react";

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
function ThreatCard({ threat, delay = 0 }: { threat: any; delay?: number }) {
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
        <p className="line-clamp-2 text-[10px] leading-relaxed text-white/38">
          {threat.description || "No description provided."}
        </p>
        <span
          className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[8px] font-black tracking-widest"
          style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}25` }}
        >
          {sev.label}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "", severity: 3 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeThreats, setActiveThreats] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // show radar animation once on mount
  const [showRadar, setShowRadar] = useState(true);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "report">("feed");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const { data } = await api.get("/incidents");
      setActiveThreats(
        data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error("Failed to load threat feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  // hide radar overlay after its animation completes
  useEffect(() => {
    const timer = setTimeout(() => setShowRadar(false), 2500); // 1s delay + 1.5s animation ≈2.5s
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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPos) return alert("COMMAND ERROR: Click map to target.");
    if (!formData.topic) return alert("COMMAND ERROR: Topic required.");

    setIsSubmitting(true);
    try {
      await api.post("/incidents", {
        topic: formData.topic,
        description: formData.description,
        severity: formData.severity,
        location: {
          type: "Point",
          coordinates: [selectedPos.lng, selectedPos.lat] 
        }
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000); 
      setFormData({ topic: "", description: "", severity: 3 });
      setSelectedPos(null);
    } catch (err) {
      console.error("Report failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const criticalCount = activeThreats.filter((t) => t.severity >= 4).length;
  const sev = getSev(formData.severity);

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
          
          {/* Background Orbs */}
          {[
            { w: 500, top: "-12%", left: "-10%", c: "rgba(0,212,255,0.07)", d: "0s" },
            { w: 400, bottom: "-10%", right: "-8%", c: "rgba(180,79,255,0.07)", d: "5s" },
          ].map((o, i) => (
            <div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: o.w, height: o.w,
                top: (o as any).top, left: (o as any).left, right: (o as any).right, bottom: (o as any).bottom,
                background: `radial-gradient(circle, ${o.c}, transparent 68%)`,
                filter: "blur(70px)",
                animation: `orb-drift 16s ease-in-out ${o.d} infinite`,
              }}
            />
          ))}

          {/* SIDEBAR */}
         <aside className={`flex-shrink-0 bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-30 transition-all duration-300 ${collapsed ? "w-16 p-2" : "w-80 p-6"} overflow-y-auto custom-scrollbar`}>
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between px-1 py-4 border-b border-white/10">
              {!collapsed && (
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

            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden px-1 py-3">
                {/* Operator Card */}
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

                {/* Tabs */}
                <div className="mb-3 flex border-b border-white/10">
                  <button onClick={() => setActiveTab("feed")} className={`mr-4 pb-2 pt-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === "feed" ? "tab-on" : "tab-off"}`}>
                    <span className="flex items-center gap-1.5"><Radio size={9} /> Live Feed</span>
                  </button>
                  <button onClick={() => setActiveTab("report")} className={`pb-2 pt-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === "report" ? "tab-on" : "tab-off"}`}>
                    <span className="flex items-center gap-1.5"><AlertTriangle size={9} /> Report</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="thin-scroll flex-1 overflow-y-auto">
                  {activeTab === "feed" && (
                    <div className="flex flex-col gap-2">
                      {isLoadingFeed ? <span className="text-xs text-white/30 text-center mt-4">Scanning...</span> : 
                       activeThreats.length === 0 ? <span className="text-xs text-white/30 text-center mt-4">Area secure.</span> :
                       activeThreats.map((t, i) => <ThreatCard key={t._id} threat={t} delay={i * 0.05} />)}
                    </div>
                  )}

                  {activeTab === "report" && (
                    <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 pb-2">
                      <div className="flex items-center gap-2 rounded-xl p-2.5 border border-white/10 bg-white/5">
                        <MapPin size={11} className={selectedPos ? "text-[#00d4ff]" : "text-white/20"} />
                        <span className={`font-mono text-[10px] ${selectedPos ? "text-[#00d4ff]" : "text-white/20"}`}>
                          {selectedPos ? `${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}` : "Click map to pin location"}
                        </span>
                      </div>
                      <input type="text" placeholder="Threat Topic (e.g. Flood)" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="s-input" />
                      <textarea placeholder="Situation description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="s-input h-[72px]" />
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
                <LogOut size={12} /> {!collapsed && "Logout"}
              </button>
            </div>
          </aside>

          {/* MAIN MAP AREA */}
          <main className="relative flex-1 bg-black overflow-hidden h-full w-full">
            
            {/* HUD Bar */}
            <div className="glass absolute left-3 right-3 top-3 z-20 flex items-center justify-between rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-[#00d4ff]" />
                <span className="font-orbitron text-[10px] font-bold tracking-[2px] text-white">GEO-TRACKING ACTIVE</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/30">
                  <Wifi size={9} /> LIVE
                </div>
              </div>
            </div>

            {/* 🔴 FAST RADAR OVERLAY (shown once at startup) */}
            {showRadar && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '1px',
                  background: '#00d4ff',
                  boxShadow: '0 0 18px 3px rgba(0,212,255,0.8)',
                  animation: 'fast-scan 1.5s linear infinite', // Extremely fast CSS sweep
                }}
              />
            )}

            {/* 📍 THE MAP CONTAINER (Forced Height) */}
            <div className="absolute inset-0 z-0 h-full w-full cursor-crosshair">
              <LiveMap 
                 selectedPos={selectedPos} 
                 onSelectLocation={setSelectedPos} 
                 onNewIncident={(newIncident: any) => { setActiveThreats((prev) => [newIncident, ...prev]); }}
              />
            </div>

          </main>
        </div>
      </>
    </ProtectedRoute>
  );
}