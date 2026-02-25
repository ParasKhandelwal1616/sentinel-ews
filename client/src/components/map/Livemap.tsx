"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";

// Fix for default Leaflet icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveMap() {
  const [incidents, setIncidents] = useState([]);

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data } = await api.get("/incidents");
        setIncidents(data.data);
      } catch (err) {
        console.error("Failed to load incidents", err);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <MapContainer 
      center={[23.1815, 75.7849]} // You can adjust this to your village coordinates
      zoom={13} 
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
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