import Link from "next/link";
import { Star, MapPin, Phone, Clock, ArrowRight, Sparkles } from "lucide-react";
import { getBusinessBySlug } from "@/lib/business-lookup";
import { GroomerMapLoader } from "@/components/GroomerMapLoader";

export default async function BusinessHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = (await getBusinessBySlug(slug))!; // layout.tsx already 404s if missing

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center max-w-xl mx-auto space-y-4 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-widest bg-violet-500/15 px-3 py-1 rounded-full border border-violet-400/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          {business.town}, {business.county}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
          {business.businessName}
        </h1>
        <p className="text-sm text-white/60">{business.tagline}</p>
        {business.reviewCount > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <Star className="w-4 h-4 fill-violet-400 text-violet-400" />
            <span className="font-semibold text-white">{business.rating}</span>
            <span className="text-white/50">({business.reviewCount} reviews)</span>
          </div>
        )}
        <Link
          href={`/g/${slug}/book`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all border border-violet-400/30"
        >
          <span>Book an Appointment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Rating — only real, business-supplied data, no fabricated stats */}
      {business.reviewCount > 0 && (
        <section className="grid grid-cols-1 gap-3">
          <div className="glass-card px-4 py-4 text-center">
            <div className="text-xl font-bold text-white">{business.rating}★</div>
            <div className="text-[11px] text-white/50 mt-1">Rating</div>
          </div>
        </section>
      )}

      {/* Location + map */}
      <section className="glass-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-300" />
              Find Us
            </h2>
            <p className="text-xs text-white/60 mt-1">
              {business.address}, {business.town}, {business.county} · {business.eircode}
            </p>
          </div>
          <a
            href={`tel:${business.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-violet-300" />
            Call
          </a>
        </div>
        <GroomerMapLoader groomer={business} />
      </section>

      {/* Opening hours */}
      <section className="glass-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-violet-300" />
          Opening Hours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
          {business.hours.map((h) => (
            <div key={h.day} className="flex justify-between border-b border-white/5 py-1.5">
              <span className="text-white/70 font-medium">{h.day}</span>
              <span className={h.closed ? "text-white/40" : "text-white/90"}>
                {h.closed ? "Closed" : `${h.open} – ${h.close}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing notice — the differentiator, surfaced early */}
      <section className="glass-card p-5 border-violet-400/20">
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-semibold text-violet-300">About our pricing — </span>
          All prices are a starting guide. A final price is confirmed on the day
          based on coat condition, matting, and time since last groom.{" "}
          <Link href={`/g/${slug}/services`} className="text-violet-300 underline underline-offset-2">
            See services &amp; pricing
          </Link>
        </p>
      </section>
    </div>
  );
}
