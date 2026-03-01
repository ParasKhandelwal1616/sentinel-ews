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

// IMPORTANT: Leaflet MUST be dynamic to avoid "Window is not defined" error
const LiveMap = dynamic(() => import("@/src/components/map/Livemap"), {
  ssr: false,
  loading: () => <MapBootLoader />,
});

/* ─── Map loading skeleton ──────────────────────────────────────────────── */
function MapBootLoader() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020d1e]">
      <div
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{
          backgroundImage: "radial-gradient(rgba(0,212,255,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {[160, 260, 360].map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: s, height: s,
            border: "1px solid rgba(0,212,255,0.08)",
            top: "50%", left: "50%",
            animation: `radar-spin ${10 + i * 6}s linear ${i % 2 ? "reverse" : ""} infinite`,
          }}
        />
      ))}
      <div className="z-10 flex flex-col items-center gap-3">
        <div
          className="h-7 w-7 rounded-full border-2 border-transparent border-t-[#00d4ff]"
          style={{ animation: "spin-loader 0.7s linear infinite" }}
        />
        <span
          className="font-orbitron animate-pulse text-[10px] tracking-[3px] text-[#00d4ff]/50"
        >
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
      {/* Left severity bar */}
      <div
        className="absolute bottom-0 left-0 top-0 w-0.5 rounded-l-xl"
        style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}60` }}
      />
      <div className="ml-2.5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <span
            className="font-orbitron text-[10px] font-bold uppercase tracking-wider"
            style={{ color: sev.color }}
          >
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

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Exact same state as original ──────────────────────────────────────
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "", severity: 3 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeThreats, setActiveThreats] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // ── Extra UI state ────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "report">("feed");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Fetch live feed (same logic) ──────────────────────────────────────
  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const { data } = await api.get("/incidents");
      setActiveThreats(
        data.data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      console.error("Failed to load threat feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  // ── Google OAuth redirect (same logic) ───────────────────────────────
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

  // ── Form submit (same logic) ─────────────────────────────────────────
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPos) return alert("COMMAND ERROR: Please click on the map first to select a target location!");
    if (!formData.topic) return alert("COMMAND ERROR: Threat topic is required.");

    setIsSubmitting(true);
    try {
      await api.post("/incidents", {
        topic: formData.topic,
        description: formData.description,
        severity: formData.severity,
        latitude: selectedPos.lat,
        longitude: selectedPos.lng,
      });
      setSubmitSuccess(true);
      setFormData({ topic: "", description: "", severity: 3 });
      setSelectedPos(null);
      setTimeout(() => setSubmitSuccess(false), 3000);
      fetchFeed(); // refresh the live feed after new report
    } catch (err) {
      console.error("Report failed:", err);
      alert("❌ Report failed. Check server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const criticalCount = activeThreats.filter((t) => t.severity >= 4).length;
  const sev = getSev(formData.severity);

  return (
    <ProtectedRoute>
      <>
        {/* ── Scoped keyframes ─────────────────────────────────────── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Sora:wght@400;500;600;700&display=swap');

          @keyframes orb-drift {
            0%,100% { transform: translate(0,0) scale(1); }
            33%      { transform: translate(38px,-32px) scale(1.06); }
            66%      { transform: translate(-22px,26px) scale(0.93); }
          }
          @keyframes dot-grid-pulse {
            0%,100% { opacity: 0.50; }
            50%      { opacity: 0.12; }
          }
          @keyframes scanline {
            from { top: -1px; }
            to   { top: 100%; }
          }
          @keyframes dot-blink {
            0%,100% { opacity: 1; }
            50%      { opacity: 0.12; }
          }
          @keyframes spin-loader {
            to { transform: rotate(360deg); }
          }
          @keyframes radar-spin {
            to { transform: translate(-50%,-50%) rotate(360deg); }
          }
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-18px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes success-pop {
            0%  { transform: scale(0.88); opacity: 0; }
            60% { transform: scale(1.04); }
            100%{ transform: scale(1);   opacity: 1; }
          }
          @keyframes logo-glow {
            0%,100% { box-shadow: 0 0 16px rgba(0,212,255,0.45); }
            50%      { box-shadow: 0 0 36px rgba(0,212,255,0.75), 0 0 56px rgba(180,79,255,0.3); }
          }
          @keyframes grad-sweep {
            0%,100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
          }
          @keyframes border-alert {
            0%,100% { border-color: rgba(255,68,68,0.25); }
            50%      { border-color: rgba(255,68,68,0.65); box-shadow: 0 0 14px rgba(255,68,68,0.20); }
          }

          .font-orbitron { font-family: 'Orbitron', monospace; }
          .font-sora     { font-family: 'Sora', sans-serif; }

          /* Glass */
          .glass {
            background: rgba(255,255,255,0.038);
            border: 1px solid rgba(255,255,255,0.085);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
          }
          .glass-sidebar {
            background: rgba(0,5,15,0.65);
            border-right: 1px solid rgba(255,255,255,0.07);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
          }

          /* Input */
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
            transition: border-color .22s, box-shadow .22s, background .22s;
          }
          .s-input::placeholder { color: rgba(200,225,255,0.22); }
          .s-input:focus {
            border-color: #00d4ff;
            background: rgba(0,212,255,0.045);
            box-shadow: 0 0 0 3px rgba(0,212,255,0.10);
          }

          /* Broadcast btn */
          .btn-broadcast {
            background: linear-gradient(135deg,#ff4444,#b44fff);
            background-size: 200%;
            animation: grad-sweep 3s ease infinite;
            transition: transform .15s, box-shadow .15s;
            border: none;
          }
          .btn-broadcast:hover:not(:disabled) {
            transform: scale(1.02) translateY(-1px);
            box-shadow: 0 0 28px rgba(255,68,68,0.45), 0 8px 22px rgba(0,0,0,0.4);
          }
          .btn-broadcast:disabled { opacity:.55; cursor:not-allowed; transform:none !important; }

          /* Tab */
          .tab-on  { color: #00d4ff; border-bottom: 2px solid #00d4ff; }
          .tab-off { color: rgba(255,255,255,0.30); border-bottom: 2px solid transparent; }

          /* Scrollbar */
          .thin-scroll::-webkit-scrollbar { width: 3px; }
          .thin-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.07); border-radius: 4px;
          }
        `}</style>

        {/* ── Root ─────────────────────────────────────────────────── */}
        <div
          className="font-sora relative flex h-screen w-full overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 20% 40%, #020e20 0%, #00070f 52%, #010407 100%)" }}
        >
          {/* Orbs */}
          {[
            { w: 500, top: "-12%", left: "-10%", c: "rgba(0,212,255,0.07)", d: "0s" },
            { w: 400, bottom: "-10%", right: "-8%", c: "rgba(180,79,255,0.07)", d: "5s" },
          ].map((o, i) => (
            <div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: o.w, height: o.w,
                top: (o as any).top, left: (o as any).left,
                right: (o as any).right, bottom: (o as any).bottom,
                background: `radial-gradient(circle, ${o.c}, transparent 68%)`,
                filter: "blur(70px)",
                animation: `orb-drift 16s ease-in-out ${o.d} infinite`,
              }}
            />
          ))}

          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(0,212,255,0.09) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              animation: "dot-grid-pulse 5s ease-in-out infinite",
            }}
          />

          {/* Scanline */}
          <div
            className="pointer-events-none absolute left-0 right-0 opacity-[0.14]"
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.9) 50%, transparent)",
              animation: "scanline 8s linear infinite",
            }}
          />

          {/* ══════════════════════════════
              SIDEBAR
          ══════════════════════════════ */}
          <aside
            className="glass-sidebar relative z-20 flex flex-shrink-0 flex-col overflow-hidden transition-all duration-300"
            style={{ width: collapsed ? 56 : 288 }}
          >
            {/* Top accent */}
            <div
              className="absolute left-0 right-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #00d4ff 40%, #b44fff 60%, transparent)" }}
            />

            {/* ── Header ── */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-3.5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              {!collapsed && (
                <div className="flex items-center gap-2.5" style={{ animation: "slide-in 0.4s ease both" }}>
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#b44fff)", animation: "logo-glow 2.5s ease-in-out infinite" }}
                  >
                    🛡️
                  </div>
                  <div>
                    <div className="font-orbitron text-[12px] font-black tracking-[3px] text-white">SENTINEL</div>
                    <div className="text-[8px] uppercase tracking-[1.5px] text-white/22">Field Command</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setCollapsed((p) => !p)}
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/28 transition-all hover:bg-white/[0.07] hover:text-[#00d4ff] ${collapsed ? "mx-auto" : "ml-auto"}`}
              >
                <ChevronRight
                  size={13}
                  style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }}
                />
              </button>
            </div>

            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden px-3.5 py-3">

                {/* ── Operator card ── */}
                <div
                  className="mb-3 flex items-center gap-2.5 rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#b44fff)" }}
                  >
                    {user?.name?.[0]?.toUpperCase() ?? <User size={13} />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-semibold text-white/80">
                      {user?.name || "Unknown Agent"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#00ff88]">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-[#00ff88]"
                        style={{ animation: "dot-blink 1.3s ease-in-out infinite", boxShadow: "0 0 5px #00ff88" }}
                      />
                      Live Connection: Active
                    </div>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div
                  className="mb-3 flex flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {(["feed", "report"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`mr-4 pb-2 pt-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === t ? "tab-on" : "tab-off"}`}
                    >
                      {t === "feed" ? (
                        <span className="flex items-center gap-1.5">
                          <Radio size={9} /> Live Feed
                          {activeThreats.length > 0 && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[8px] font-black"
                              style={{ background: "rgba(255,68,68,0.14)", color: "#ff4444" }}
                            >
                              {activeThreats.length}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle size={9} /> Report
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Feed tab ── */}
                <div className="thin-scroll flex-1 overflow-y-auto">
                  {activeTab === "feed" && (
                    <div className="flex flex-col gap-2">
                      {isLoadingFeed ? (
                        [1, 2, 3].map((k) => (
                          <div
                            key={k}
                            className="animate-pulse rounded-xl p-3"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="mb-2 h-2 w-2/3 rounded bg-white/10" />
                            <div className="h-2 w-full rounded bg-white/[0.06]" />
                            <div className="mt-1 h-2 w-4/5 rounded bg-white/[0.04]" />
                          </div>
                        ))
                      ) : activeThreats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                          <Shield size={26} className="text-white/10" />
                          <span className="text-[10px] text-white/22">Area secure. No active threats.</span>
                        </div>
                      ) : (
                        activeThreats.map((threat, i) => (
                          <ThreatCard key={threat._id} threat={threat} delay={i * 0.05} />
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Report tab ── */}
                  {activeTab === "report" && (
                    <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 pb-2">

                      {/* Coordinate display */}
                      <div
                        className="flex items-center gap-2 rounded-xl p-2.5"
                        style={{
                          background: selectedPos ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selectedPos ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.07)"}`,
                        }}
                      >
                        <MapPin size={11} style={{ color: selectedPos ? "#00d4ff" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: selectedPos ? "#00d4ff" : "rgba(255,255,255,0.2)" }}
                        >
                          {selectedPos
                            ? `${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}`
                            : "Click map to pin location"}
                        </span>
                      </div>

                      {/* Topic */}
                      <div>
                        <label className="mb-1 block text-[9px] uppercase tracking-[1.5px] text-white/28">Threat Topic</label>
                        <input
                          type="text"
                          placeholder="e.g. Cobra, Flood, Fire..."
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="s-input"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="mb-1 block text-[9px] uppercase tracking-[1.5px] text-white/28">Description</label>
                        <textarea
                          placeholder="Describe the situation..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="s-input h-[72px]"
                        />
                      </div>

                      {/* Severity */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-[9px] uppercase tracking-[1.5px] text-white/28">Severity</label>
                          <span
                            className="rounded px-1.5 py-0.5 text-[8px] font-black tracking-widest"
                            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}28` }}
                          >
                            {sev.label} ({formData.severity})
                          </span>
                        </div>
                        <input
                          type="range" min={1} max={5}
                          value={formData.severity}
                          onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
                          className="w-full"
                          style={{ accentColor: sev.color }}
                        />
                        <div className="mt-0.5 flex justify-between text-[9px] text-white/18">
                          <span>Low</span><span>Critical</span>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedPos}
                        className="btn-broadcast flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] py-3 text-[12px] font-bold tracking-wide text-white"
                        style={{ fontFamily: "'Sora', sans-serif", opacity: !selectedPos ? 0.40 : 1 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-white/25 border-t-white"
                              style={{ animation: "spin-loader 0.6s linear infinite" }} />
                            TRANSMITTING...
                          </>
                        ) : (
                          <><Send size={12} /> BROADCAST ALERT</>
                        )}
                      </button>

                      {submitSuccess && (
                        <div
                          className="flex items-center gap-2 rounded-xl p-2.5 text-[11px] font-semibold text-[#00ff88]"
                          style={{
                            background: "rgba(0,255,136,0.07)",
                            border: "1px solid rgba(0,255,136,0.22)",
                            animation: "success-pop 0.4s cubic-bezier(0.2,1,0.4,1)",
                          }}
                        >
                          <Zap size={11} /> THREAT REPORTED SUCCESSFULLY
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ── Logout ── */}
            <div className="flex-shrink-0 px-3.5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={logout}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold text-white/30 transition-all hover:bg-[rgba(255,68,68,0.07)] hover:text-[#ff4444] ${collapsed ? "justify-center px-0" : "justify-start px-3"}`}
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <LogOut size={12} />
                {!collapsed && "Terminal Logout"}
              </button>
            </div>

            {/* Bottom accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(180,79,255,0.4), transparent)" }}
            />
          </aside>

          {/* ══════════════════════════════
              MAP AREA
          ══════════════════════════════ */}
          <main className="relative flex-1 overflow-hidden">

            {/* HUD bar */}
            <div className="glass absolute left-3 right-3 top-3 z-10 flex items-center justify-between rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-[#00d4ff]" />
                <span className="font-orbitron text-[10px] font-bold tracking-[2px] text-white">
                  GEOSPATIAL CONTROL CENTER
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <div
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-[#ff4444]"
                    style={{ background: "rgba(255,68,68,0.09)", border: "1px solid rgba(255,68,68,0.25)", animation: "border-alert 2s ease-in-out infinite" }}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff4444]" style={{ animation: "dot-blink 1s ease-in-out infinite" }} />
                    {criticalCount} CRITICAL
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-[#00ff88]"
                  style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.22)" }}
                >
                  <Wifi size={9} />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00ff88]" style={{ animation: "dot-blink 1.3s ease-in-out infinite" }} />
                  LIVE
                </div>
                <button
                  onClick={fetchFeed}
                  className="glass flex h-7 w-7 items-center justify-center rounded-xl text-white/28 transition-all hover:text-[#00d4ff]"
                >
                  <RefreshCw size={11} style={{ animation: isLoadingFeed ? "spin-loader 0.8s linear infinite" : undefined }} />
                </button>
              </div>
            </div>

            {/* LiveMap — full area, same props as original */}
            <div className="absolute inset-0 cursor-crosshair">
              <LiveMap
                selectedPos={selectedPos}
                onSelectLocation={setSelectedPos}
                onNewIncident={(newIncident: any) => {
                  setActiveThreats((prev) => [newIncident, ...prev]);
                }}
              />
            </div>

            {/* Legend */}
            <div className="glass absolute bottom-4 right-4 z-10 rounded-2xl px-4 py-3">
              {[
                { c: "#ff4444", label: "Critical (4-5)", g: true  },
                { c: "#ff8c42", label: "High (3)",       g: false },
                { c: "#00ff88", label: "Low (1-2)",      g: false },
                { c: "#00d4ff", label: "Your Pin",       g: true  },
              ].map((l) => (
                <div key={l.label} className="mb-1.5 flex items-center gap-2 last:mb-0">
                  <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: l.c, boxShadow: l.g ? `0 0 5px ${l.c}` : undefined }} />
                  <span className="text-[10px] text-white/40">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Pin indicator pill */}
            {selectedPos && (
              <div
                className="glass absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2"
                style={{ animation: "fade-up 0.3s cubic-bezier(0.2,1,0.4,1)" }}
              >
                <MapPin size={11} className="text-[#00d4ff]" />
                <span className="font-mono text-[11px] font-semibold text-[#00d4ff]">
                  {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
                </span>
                <button onClick={() => setSelectedPos(null)} className="ml-1 text-white/22 hover:text-white">
                  <X size={11} />
                </button>
              </div>
            )}
          </main>
        </div>
      </>
    </ProtectedRoute>
  );
}

