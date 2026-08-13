"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GroomerProfile } from "@/lib/groomer";

// react-leaflet's default marker icon resolves relative to the page, not the
// package — the classic broken-icon bug. Point it at unpkg's copies instead
// of bundling more assets for a single icon.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function GroomerMap({ groomer }: { groomer: GroomerProfile }) {
  useEffect(() => {
    // Leaflet reads container size on mount; if it mounted while hidden
    // (e.g. behind a step in the booking wizard) tiles can render blank
    // until a resize. Not needed on the Home page, cheap enough to keep here.
  }, []);

  return (
    <div className="h-64 sm:h-80 w-full rounded-[20px] overflow-hidden border border-white/10">
      <MapContainer
        center={[groomer.lat, groomer.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[groomer.lat, groomer.lng]} icon={markerIcon}>
          <Popup>
            <strong>{groomer.businessName}</strong>
            <br />
            {groomer.address}, {groomer.town}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
