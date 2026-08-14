"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Locate, Loader2, MapPin, ArrowRight, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { Business } from "@/lib/business";
import { distanceKm } from "@/lib/geo";
import { GroomersMapLoader } from "@/components/GroomersMapLoader";

type Coords = { lat: number; lng: number };

export default function FindGroomerPage() {
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    // Only paying/trialing tenants show up here — a canceled subscription
    // shouldn't keep sending new customers to a business that isn't active.
    const q = query(collection(db, "businesses"), where("subscriptionStatus", "in", ["trialing", "active"]));
    getDocs(q).then((snap) => {
      setBusinesses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Business));
    });
  }, []);

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocateError("Couldn't get your location — check your browser's permission settings.");
        setLocating(false);
      }
    );
  }

  const sorted = businesses
    ? userLocation
      ? [...businesses].sort(
          (a, b) =>
            distanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
            distanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
        )
      : [...businesses].sort((a, b) => a.businessName.localeCompare(b.businessName))
    : [];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Find a Groomer Near Me</h1>
        <p className="text-xs text-white/50">
          Every business here runs on GroomZy — pick one and book straight from their page.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-violet-500/25"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
          {userLocation ? "Update my location" : "Use my location"}
        </button>
      </div>
      {locateError && <p className="text-center text-xs text-red-300">{locateError}</p>}

      {businesses === null ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      ) : businesses.length === 0 ? (
        <p className="text-center text-xs text-white/40 glass-card p-6">No groomers listed yet — check back soon.</p>
      ) : (
        <>
          <GroomersMapLoader businesses={businesses} userLocation={userLocation} />

          <div className="space-y-2.5">
            {sorted.map((b) => (
              <Link
                key={b.id}
                href={`/g/${b.slug}`}
                className="glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{b.businessName}</span>
                    {b.reviewCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[11px] text-white/50">
                        <Star className="w-3 h-3 fill-violet-400 text-violet-400" />
                        {b.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {b.town}, {b.county}
                    {userLocation && (
                      <span className="text-violet-300">
                        {" "}
                        · {distanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng).toFixed(1)} km away
                      </span>
                    )}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
