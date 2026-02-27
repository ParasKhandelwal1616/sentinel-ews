"use client";
import { useMapEvents, Marker } from "react-leaflet";
import L from "leaflet";

// Red icon for the "New Report" pin
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export function LocationMarker({ onLocationSelected, position }: any) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={redIcon} />
  );
}