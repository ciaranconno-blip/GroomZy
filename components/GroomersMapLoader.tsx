"use client";

import dynamic from "next/dynamic";
import { Business } from "@/lib/business";

// Leaflet touches `window` at module load — must never render during SSR.
const GroomersMap = dynamic(() => import("@/components/GroomersMap").then((m) => m.GroomersMap), {
  ssr: false,
  loading: () => (
    <div className="h-72 sm:h-96 w-full rounded-[20px] border border-white/10 bg-white/5 animate-pulse flex items-center justify-center text-white/40 text-xs">
      Loading map…
    </div>
  ),
});

export function GroomersMapLoader({
  businesses,
  userLocation,
}: {
  businesses: Business[];
  userLocation: { lat: number; lng: number } | null;
}) {
  return <GroomersMap businesses={businesses} userLocation={userLocation} />;
}
