"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import {LocationMarker} from "./LocationMarker"; // Import the new click listener

// Fix for default Leaflet icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveMap({ selectedPos, onSelectLocation }: any) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // 1. GET OPERATOR LOCATION
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Operator Locked:", position.coords.latitude, position.coords.longitude);
          setOperatorLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation failed:", error.message);
        }
      );
    }

    // 2. FETCH THREATS
    const fetchIncidents = async () => {
      try {
        const { data } = await api.get("/incidents");
        setIncidents(data.data);
      } catch (err) {
        console.error("Failed to load incidents", err);
      }
    };
    fetchIncidents();

    // 3. LISTEN FOR LIVE BROADCASTS
    socket.on("new-incident", (newIncident) => {
      setIncidents((prev) => [...prev, newIncident]);
    });

    return () => {
      socket.off("new-incident");
    };
  }, []);

  // 🔴 THIS RETURN STATEMENT WAS MISSING IN YOUR CODE!
  return (
    <MapContainer 
      center={[23.1815, 75.7849]} // Your village coordinates
      zoom={13} 
      className="h-full w-full relative z-0"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* 🔴 NEW: This handles the user clicking to report a threat */}
      <LocationMarker position={selectedPos} onLocationSelected={onSelectLocation} />

      {/* 🔵 EXISTING: This shows the saved threats from MongoDB */}
      {incidents.map((incident: any) => (
        <Marker 
          key={incident._id} 
          position={[incident.location.coordinates[1], incident.location.coordinates[0]]} 
          icon={icon}
        >
          <Popup>
            <div className="text-slate-900">
              <h3 className="font-bold border-b mb-1">{incident.topic}</h3>
              <p className="text-xs">{incident.description}</p>
              <p className="text-xs mt-2 font-bold text-red-600 uppercase">Severity: {incident.severity}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}