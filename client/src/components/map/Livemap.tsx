"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import LocationMarker from "./LocationMarker"; 
import { io } from "socket.io-client"; 

const socket = io("http://localhost:5000"); 

// 🎯 Forces the map to fly to new coordinates when location updates
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

// 🎨 Generates icon colors based on threat severity
const getSeverityIcon = (severity: number) => {
  let color = "blue"; 
  if (severity >= 4) color = "red";       
  else if (severity === 3) color = "orange";    
  else if (severity <= 2) color = "green";     

  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export default function LiveMap({ selectedPos, onSelectLocation }: any) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [operatorLocation, setOperatorLocation] = useState<[number, number]>([23.1815, 75.7849]);

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
      center={operatorLocation} 
      zoom={13} 
      className="h-full w-full relative z-0"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* 🎯 Forces the map to move when operatorLocation updates */}
      <MapRecenter center={operatorLocation} />

      {/* Target selection pin */}
      <LocationMarker position={selectedPos} onLocationSelected={onSelectLocation} />

      {/* Render all incidents with safety checks and dynamic colors */}
      {incidents.map((incident: any) => {
        // Safely extract coordinates using optional chaining
        const lat = incident?.location?.coordinates?.[1] || incident?.latitude;
        const lng = incident?.location?.coordinates?.[0] || incident?.longitude;

        // Strict check to skip broken database entries
        if (lat === undefined || lng === undefined || lat === null || lng === null) {
          return null; 
        }

        return (
          <Marker 
            key={incident._id} 
            position={[lat, lng]} 
            icon={getSeverityIcon(incident.severity)} 
          >
            <Popup>
              <div className="text-slate-900 min-w-[150px]">
                <h3 className="font-bold border-b mb-1 text-slate-800 uppercase tracking-wide">
                  {incident.topic}
                </h3>
                <p className="text-sm text-slate-700">{incident.description}</p>
                <div className="mt-2 bg-slate-100 p-1 text-center rounded border border-slate-200">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Severity: <span className={`text-lg ${incident.severity >= 4 ? 'text-red-600' : incident.severity === 3 ? 'text-orange-500' : 'text-green-600'}`}>
                      {incident.severity}
                    </span>/5
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}