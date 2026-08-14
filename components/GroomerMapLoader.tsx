"use client";

import dynamic from "next/dynamic";
import { Business } from "@/lib/business";

// Leaflet touches `window` at module load — must never render during SSR.
const GroomerMap = dynamic(
  () => import("@/components/GroomerMap").then((m) => m.GroomerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-80 w-full rounded-[20px] border border-white/10 bg-white/5 animate-pulse flex items-center justify-center text-white/40 text-xs">
        Loading map…
      </div>
    ),
  }
);

export function GroomerMapLoader({ groomer }: { groomer: Business }) {
  return <GroomerMap groomer={groomer} />;
}
