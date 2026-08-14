"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Building2, CalendarCheck2, PhoneCall } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { PLATFORM_OWNER_UID } from "@/lib/platform";

interface PlatformBusiness {
  id: string;
  businessName: string;
  slug: string;
  town: string;
  county: string;
  subscriptionStatus: string;
  createdAt: string | null;
}

interface PlatformStats {
  businesses: PlatformBusiness[];
  totals: {
    totalBusinesses: number;
    byStatus: Record<string, number>;
    totalBookings: number;
    totalEnquiries: number;
  };
}

export default function PlatformAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.uid !== PLATFORM_OWNER_UID)) {
      router.push("/admin");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || user.uid !== PLATFORM_OWNER_UID) return;
    user
      .getIdToken()
      .then((idToken) => fetch("/api/platform/stats", { headers: { Authorization: `Bearer ${idToken}` } }))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setStats)
      .catch(() => setError("Couldn't load platform stats — try refreshing."));
  }, [user]);

  if (authLoading || !user || user.uid !== PLATFORM_OWNER_UID) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Platform Analytics</h1>
          <p className="text-xs text-white/50">Every business running on GroomZy.</p>
        </div>
      </div>

      {error && <div className="glass-card p-3 text-xs text-red-300 border-red-400/30 bg-red-500/5">{error}</div>}

      {!stats ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card px-4 py-4 text-center">
              <Building2 className="w-4 h-4 text-violet-300 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.totals.totalBusinesses}</div>
              <div className="text-[11px] text-white/50 mt-1">Businesses</div>
            </div>
            <div className="glass-card px-4 py-4 text-center">
              <CalendarCheck2 className="w-4 h-4 text-violet-300 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.totals.totalBookings}</div>
              <div className="text-[11px] text-white/50 mt-1">Bookings (all)</div>
            </div>
            <div className="glass-card px-4 py-4 text-center">
              <PhoneCall className="w-4 h-4 text-amber-300 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.totals.totalEnquiries}</div>
              <div className="text-[11px] text-white/50 mt-1">Enquiries (all)</div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">By Subscription Status</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.totals.byStatus).map(([status, count]) => (
                <span
                  key={status}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70"
                >
                  {status}: <span className="font-bold text-white">{count}</span>
                </span>
              ))}
            </div>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">All Businesses</h2>
            {stats.businesses.map((b) => (
              <Link
                key={b.id}
                href={`/g/${b.slug}`}
                className="glass-card p-4 flex items-center justify-between gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{b.businessName}</div>
                  <p className="text-[11px] text-white/50">
                    {b.town}, {b.county} · signed up{" "}
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IE") : "—"}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${
                    b.subscriptionStatus === "active"
                      ? "bg-violet-500/20 text-violet-300"
                      : b.subscriptionStatus === "trialing"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {b.subscriptionStatus}
                </span>
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
