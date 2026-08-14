"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Business } from "@/lib/business";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#A374F7;border:3px solid white;box-shadow:0 0 0 3px rgba(163,116,247,0.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function RecenterOnUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 11);
  }, [lat, lng, map]);
  return null;
}

// Ireland's rough center — sensible default view before a user location or
// any groomer pins are available.
const IRELAND_CENTER: [number, number] = [53.4129, -8.2439];

export function GroomersMap({
  businesses,
  userLocation,
}: {
  businesses: Business[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : businesses[0]
    ? [businesses[0].lat, businesses[0].lng]
    : IRELAND_CENTER;

  return (
    <div className="h-72 sm:h-96 w-full rounded-[20px] overflow-hidden border border-white/10">
      <MapContainer center={center} zoom={userLocation ? 11 : 7} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && <RecenterOnUser lat={userLocation.lat} lng={userLocation.lng} />}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {businesses.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={markerIcon}>
            <Popup>
              <strong>{b.businessName}</strong>
              <br />
              {b.town}, {b.county}
              <br />
              <Link href={`/g/${b.slug}`} className="text-violet-600 underline">
                View booking page
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
