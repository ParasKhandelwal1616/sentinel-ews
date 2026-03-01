"use client";
import { useMapEvents, Marker } from "react-leaflet";
import L from "leaflet";

const targetIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function LocationMarker({ position, onLocationSelected }: any) {
  useMapEvents({
    click(e) {
      if (onLocationSelected) {
        onLocationSelected(e.latlng);
      }
    },
  });

  // 🔴 FIXED: Changed 'position === null' to '!position' to catch undefined
  return !position ? null : (
    <Marker position={position} icon={targetIcon} />
  );
}