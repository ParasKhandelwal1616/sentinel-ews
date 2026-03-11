"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { LocationMarker } from "./LocationMarker";
import { io } from "socket.io-client";

// Connect to WebSocket server
const socket = io("http://localhost:5000");

interface Incident {
  _id: string;
  topic: string;
  description: string;
  severity: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

/* ─── inject dark popup styles once ────────────────────────────────────── */
const POPUP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@600;700&family=Sora:wght@400;500;600&display=swap');

  /* Kill default white leaflet popup shell */
  .leaflet-popup-content-wrapper,
  .leaflet-popup-tip {
    background: rgba(0, 8, 20, 0.92) !important;
    border: 1px solid rgba(255,255,255,0.10) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) !important;
    border-radius: 16px !important;
    padding: 0 !important;
  }
  .leaflet-popup-tip-container { display: none !important; }
  .leaflet-popup-content { margin: 0 !important; width: auto !important; }
  .leaflet-popup-close-button {
    color: rgba(255,255,255,0.25) !important;
    font-size: 18px !important;
    top: 8px !important;
    right: 10px !important;
    transition: color .15s !important;
  }
  .leaflet-popup-close-button:hover { color: #ff3b3b !important; }

  /* Zoom Control Styling */
  .leaflet-control-zoom {
    border: 1px solid rgba(255,255,255,0.1) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
    border-radius: 8px !important;
    overflow: hidden;
  }
  .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    background: rgba(15, 23, 42, 0.9) !important;
    color: #00d4ff !important;
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  }
  .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
    background: #00d4ff !important;
    color: #000 !important;
  }

  /* Pulse animation for critical markers */
  @keyframes marker-pulse {
    0%,100% { opacity: 1; transform: scale(1);   }
    50%      { opacity: 0.6; transform: scale(1.2); }
  }
`;

/* ─── 🔴 NEW: The White Operator Beacon ───────────────────────────────── */
const operatorIcon = L.divIcon({
  className: "clear-background",
  html: `<div style="
    width: 14px; 
    height: 14px; 
    background-color: #ffffff; 
    border-radius: 50%; 
    border: 3px solid #00d4ff;
    box-shadow: 0 0 20px 6px rgba(0, 212, 255, 0.6);
    animation: marker-pulse 2s infinite;
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/* ─── 🎯 MapRecenter ─────────────────────────────────── */
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

/* ─── severity config ───────────────────────────────────────────────────── */
function getSevConfig(severity: number) {
  if (severity >= 4) return { color: "red",    hex: "#ff3b3b", label: "CRITICAL", dim: "rgba(255,59,59,0.12)"  };
  if (severity === 3) return { color: "orange", hex: "#ff8c42", label: "HIGH",     dim: "rgba(255,140,66,0.12)" };
  return                     { color: "green",  hex: "#00e676", label: "LOW",      dim: "rgba(0,230,118,0.10)"  };
}

/* ─── 🎨 getSeverityIcon ─────────────── */
const getSeverityIcon = (severity: number) => {
  const { color } = getSevConfig(severity);
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

/* ─── Styled popup content ───────────────────────────────────────────────── */
function IncidentPopup({ incident }: { incident: Incident }) {
  const sev = getSevConfig(incident.severity);

  return (
    <div
      style={{
        fontFamily: "'Sora', sans-serif",
        minWidth: 200,
        maxWidth: 240,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${sev.hex}, transparent)` }} />
      <div style={{ padding: "10px 14px 8px", background: `${sev.dim}`, borderBottom: `1px solid ${sev.hex}20`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "2px", color: sev.hex, textTransform: "uppercase" }}>
          {incident.topic}
        </span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", color: sev.hex, background: `${sev.dim}`, border: `1px solid ${sev.hex}30`, borderRadius: 5, padding: "2px 6px" }}>
          {sev.label}
        </span>
      </div>
      <div style={{ padding: "10px 14px 12px" }}>
        {/* 🔴 RESTORED: Standard img tag works best inside Leaflet DOM */}
        {incident.imageUrl && (
          <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={incident.imageUrl} 
              alt="Threat Evidence" 
              style={{ width: '100%', maxHeight: '130px', objectFit: 'cover', display: 'block' }} 
            />
          </div>
        )}
        
        {incident.description && (
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "rgba(200,225,255,0.60)", lineHeight: 1.55, marginBottom: 10 }}>
            {incident.description}
          </p>
        )}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>Threat Level</span>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, fontWeight: 700, color: sev.hex }}>{incident.severity}/5</span>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ flex: 1, height: 4, borderRadius: 3, background: n <= incident.severity ? sev.hex : "rgba(255,255,255,0.07)", boxShadow: n <= incident.severity ? `0 0 6px ${sev.hex}60` : "none", transition: "all .2s" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LIVEMAP
══════════════════════════════════════════════════════════════════════════ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LiveMap({ selectedPos, onSelectLocation, onNewIncident, operatorLoc }: any)  {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    // Inject popup styles once
    if (!document.getElementById("sentinel-popup-styles")) {
      const style = document.createElement("style");
      style.id = "sentinel-popup-styles";
      style.textContent = POPUP_STYLES;
      document.head.appendChild(style);
    }

    // FETCH THREATS
    const fetchIncidents = async () => {
      try {
        const { data } = await api.get("/incidents");
        setIncidents(data.data);
      } catch (err) {
        console.error("Failed to load incidents", err);
      }
    };
    fetchIncidents();

    // LISTEN FOR LIVE BROADCASTS
    socket.on("new-incident", (newIncident: Incident) => {
      // Update the map's pins
      setIncidents((prev) => [...prev, newIncident]);
      if (onNewIncident) onNewIncident(newIncident);
    });

    return () => {
      socket.off("new-incident");
    };
  }, [onNewIncident]);

  // Determine the center of the map. If operator has a GPS lock, center on them. 
  // Otherwise, default to Gwalior [26.2183, 78.1828]. (Note: Leaflet uses [lat, lng])
  const mapCenter: [number, number] = operatorLoc 
    ? [operatorLoc[1], operatorLoc[0]] 
    : [26.2183, 78.1828];

  return (
    <MapContainer
      center={mapCenter}
      zoom={14}
      zoomControl={false}
      className="h-full w-full relative z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
      />

      {/* Manual Zoom Control in the bottom-right corner */}
      <ZoomControl position="bottomright" />

      {/* 🎯 Forces the map to move when operatorLoc updates */}
      <MapRecenter center={mapCenter} />

      <LocationMarker position={selectedPos} onLocationSelected={onSelectLocation} />

      {/* 🔴 RESTORED: The White Operator Beacon */}
      {operatorLoc && (
        <Marker position={[operatorLoc[1], operatorLoc[0]]} icon={operatorIcon}>
          <Popup className="sentinel-popup">
            <div style={{ fontFamily: "'Rajdhani', sans-serif", padding: "10px", color: "#00d4ff", fontSize: "14px", fontWeight: "bold", textAlign: "center", letterSpacing: "1px" }}>
              📍 FIELD AGENT (YOU)
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render all incidents with safety checks and dynamic colors */}
      {incidents.map((incident: Incident) => {
        // Safely extract coordinates using optional chaining
        const lat = incident?.location?.coordinates?.[1] || incident?.latitude;
        const lng = incident?.location?.coordinates?.[0] || incident?.longitude;

        if (lat === undefined || lng === undefined || lat === null || lng === null) return null;

        return (
          <Marker
            key={incident._id}
            position={[lat, lng]}
            icon={getSeverityIcon(incident.severity)}
          >
            <Popup className="sentinel-popup">
              <IncidentPopup incident={incident} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}