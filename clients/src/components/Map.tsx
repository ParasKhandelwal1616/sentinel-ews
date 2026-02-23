"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveMap({ incidents }: { incidents: any[] }) {
  return (
    <MapContainer center={[23.5678, 78.1234]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents.map((incident) => (
        <Marker key={incident._id} position={[incident.location.coordinates[1], incident.location.coordinates[0]]} icon={icon}>
          <Popup>
            <strong>{incident.topic}</strong> <br />
            Severity: {incident.severity} <br />
            {incident.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}