"use client";
import ProtectedRoute from "@/src/components/protectedroutes";
import { useAuth } from "@/src/context/Auth";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/src/lib/api"; // Import your API to send the report

// IMPORTANT: Leaflet MUST be dynamic to avoid "Window is not defined" error in Next.js
const LiveMap = dynamic(() => import("@/src/components/map/Livemap"), { 
  ssr: false, 
  loading: () => <div className="flex h-full items-center justify-center text-slate-500 font-bold animate-pulse">BOOTING RADAR...</div>
});

export default function DashboardPage() {
  const { user, logout } = useAuth(); // FIXED: Removed the duplicate declaration
  const searchParams = useSearchParams();
  const router = useRouter();

  // STATE: For tracking the clicked map location and form data
  const [selectedPos, setSelectedPos] = useState<{lat: number, lng: number} | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "", severity: 3 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HANDLE GOOGLE OAUTH REDIRECT
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

  // HANDLE FORM SUBMISSION
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
        longitude: selectedPos.lng
      });
      
      alert("✅ THREAT REPORTED SUCCESSFULLY!");
      
      // Clear form and map pin after success
      setFormData({ topic: "", description: "", severity: 3 });
      setSelectedPos(null);
      // Note: We will add real-time auto-refresh with Socket.io in the next step!
    } catch (err) {
      console.error("Report failed:", err);
      alert("❌ Report failed. Check server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-slate-950 text-white overflow-hidden">
        
        {/* SIDEBAR - Fixed Width */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl z-20 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-red-600 tracking-tighter italic">SENTINEL EWS</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold underline decoration-red-600/50">Field Command Center</p>
          </div>

          <div className="flex-1 space-y-4">
            {/* OPERATOR INFO */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 group hover:border-red-600/50 transition-colors">
              <p className="text-xs text-slate-500 uppercase font-bold">Operator ID</p>
              <p className="text-lg font-bold text-white tracking-tight">{user?.name || "Unknown Agent"}</p>
            </div>

            {/* SYSTEM STATUS */}
            <div className="flex items-center gap-2 text-xs text-green-500 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              Live Connection: Active
            </div>

            {/* INCIDENT REPORT FORM */}
            <div className="mt-6 border-t border-slate-800 pt-6">
               <h3 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                 <span>⚠️</span> Report New Threat
               </h3>
               
               <form onSubmit={handleReportSubmit} className="space-y-3">
                  {/* Coordinates Display */}
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                    LAT: {selectedPos ? selectedPos.lat.toFixed(5) : "---"} <br/>
                    LNG: {selectedPos ? selectedPos.lng.toFixed(5) : "---"}
                  </div>

                  <input 
                    type="text" 
                    placeholder="Topic (e.g. Cobra, Flood)" 
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white focus:border-red-500 outline-none transition-colors"
                  />
                  
                  <textarea 
                    placeholder="Description of situation..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white focus:border-red-500 outline-none transition-colors h-20 resize-none"
                  />

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <label>Severity (1-5):</label>
                    <input 
                      type="number" min="1" max="5" 
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: Number(e.target.value)})}
                      className="w-16 bg-slate-950 border border-slate-700 p-1 text-center rounded text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 font-bold text-sm rounded transition-all ${
                      selectedPos ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "TRANSMITTING..." : "BROADCAST ALERT"}
                  </button>
               </form>
            </div>
          </div>

          <button 
            onClick={logout}
            className="mt-8 w-full py-3 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-400 font-bold rounded-xl transition-all duration-300 border border-slate-700"
          >
            Terminal Logout
          </button>
        </aside>

        {/* MAIN RADAR AREA */}
        <main className="flex-1 relative bg-slate-900">
           <div className="absolute inset-0 z-0 cursor-crosshair">
              {/* WE PASS THE STATE HERE SO THE MAP CAN UPDATE IT */}
              <LiveMap 
                 selectedPos={selectedPos} 
                 onSelectLocation={setSelectedPos} 
              />
           </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}