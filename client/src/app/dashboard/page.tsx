"use client";
import ProtectedRoute from "@/src/components/protectedroutes"; // Cleaned alias
import { useAuth } from "@/src/context/Auth";
import dynamic from "next/dynamic";

// IMPORTANT: Leaflet MUST be dynamic to avoid "Window is not defined" error in Next.js
const LiveMap = dynamic(() => import("@/src/components/map/Livemap"), { 
  ssr: false, 
});

export default function DashboardPage() {
  const { logout, user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-slate-950 text-white overflow-hidden">
        
        {/* SIDEBAR - Fixed Width */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl z-20">
          <div className="mb-10">
            <h1 className="text-2xl font-black text-red-600 tracking-tighter italic">SENTINEL EWS</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold underline decoration-red-600/50">Field Command Center</p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 group hover:border-red-600/50 transition-colors">
              <p className="text-xs text-slate-500 uppercase font-bold">Operator ID</p>
              <p className="text-lg font-bold text-white tracking-tight">{user?.name || "Unknown Agent"}</p>
            </div>

            <div className="mt-8">
               <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">System Status</h3>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    Live Connection: Active
                  </div>
                  <div className="text-xs text-slate-400 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    Click map to report new threats.
                  </div>
               </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="mt-auto w-full py-3 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 font-bold rounded-xl transition-all duration-300 border border-slate-700 shadow-lg"
          >
            Terminal Logout
          </button>
        </aside>

        {/* MAIN RADAR AREA - Takes up remaining space */}
        <main className="flex-1 relative bg-slate-900">
           {/* Z-0 ensures the map stays behind any future modals/sidebars */}
           <div className="absolute inset-0 z-0">
              <LiveMap />
           </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}