import Link from "next/link";
import { Star, MapPin, Phone, Clock, ArrowRight, Sparkles } from "lucide-react";
import { GROOMER } from "@/lib/groomer";
import { GroomerMapLoader } from "@/components/GroomerMapLoader";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center max-w-xl mx-auto space-y-4 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-widest bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-400/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          {GROOMER.town}, {GROOMER.county}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
          {GROOMER.businessName}
        </h1>
        <p className="text-sm text-white/60">{GROOMER.tagline}</p>
        <div className="flex items-center justify-center gap-1.5 text-sm">
          <Star className="w-4 h-4 fill-indigo-400 text-indigo-400" />
          <span className="font-semibold text-white">{GROOMER.rating}</span>
          <span className="text-white/50">({GROOMER.reviewCount} reviews)</span>
        </div>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all border border-indigo-400/30"
        >
          <span>Book an Appointment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Happy Dogs", value: "1,200+" },
          { label: "Years Experience", value: "10+" },
          { label: "Rating", value: `${GROOMER.rating}★` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card px-4 py-4 text-center"
          >
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-[11px] text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Location + map */}
      <section className="glass-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-300" />
              Find Us
            </h2>
            <p className="text-xs text-white/60 mt-1">
              {GROOMER.address}, {GROOMER.town}, {GROOMER.county} · {GROOMER.eircode}
            </p>
          </div>
          <a
            href={`tel:${GROOMER.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-indigo-300" />
            Call
          </a>
        </div>
        <GroomerMapLoader groomer={GROOMER} />
      </section>

      {/* Opening hours */}
      <section className="glass-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-indigo-300" />
          Opening Hours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
          {GROOMER.hours.map((h) => (
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
      <section className="glass-card p-5 border-indigo-400/20">
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-semibold text-indigo-300">About our pricing — </span>
          All prices are a starting guide. A final price is confirmed on the day
          based on coat condition, matting, and time since last groom.{" "}
          <Link href="/services" className="text-indigo-300 underline underline-offset-2">
            See services &amp; pricing
          </Link>
        </p>
      </section>
    </div>
  );
}
