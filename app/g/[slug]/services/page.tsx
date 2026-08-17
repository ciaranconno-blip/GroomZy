import Link from "next/link";
import { Info, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { BREEDS } from "@/lib/breeds";
import { getBusinessBySlug } from "@/lib/business-lookup";

export default async function ServicesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = (await getBusinessBySlug(slug))!; // layout.tsx already 404s if missing
  const directBreeds = BREEDS.filter((b) => b.defaultPath === "direct");
  const enquiryBreeds = BREEDS.filter((b) => b.defaultPath === "enquiry");

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Services &amp; Pricing</h1>
      </div>

      {/* Site-wide pricing notice */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-violet-300 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-semibold text-violet-300">About our pricing — </span>
          All prices are a starting guide. A final price is confirmed on the day
          based on coat condition, matting, and time since last groom.
        </p>
      </div>

      {/* Core services */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {business.services.map((s) => (
            <div key={s.id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/50 mt-1">
                  <Clock className="w-3 h-3" />
                  {s.durationLabel}
                </div>
                {s.note && <div className="text-[11px] text-violet-300 mt-1">{s.note}</div>}
              </div>
              <div className="text-lg font-bold text-white whitespace-nowrap">
                {s.priceFrom !== null ? `from €${s.priceFrom}` : "—"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct-booking breeds */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">
          Book Instantly — Straightforward Coats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {directBreeds.map((b) => (
            <div key={b.breedId} className="glass-card px-3 py-3">
              <div className="text-xs font-semibold text-white">{b.displayName}</div>
              <div className="text-[11px] text-white/50 mt-0.5">~{b.baseDurationMin} min</div>
              {b.groomingNotes && (
                <div className="text-[10px] text-amber-300/80 mt-1">{b.groomingNotes}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry-only card */}
      <section className="glass-card p-5 border-amber-400/20 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-white">
              Large &amp; Double-Coated Breeds — Consultation First
            </h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              This breed requires a consultation before booking. Groom time and
              price vary too much on coat condition and matting to promise a
              slot upfront — we&apos;ll call you to confirm timing and pricing
              instead of guessing and running your whole day late.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-8">
          {enquiryBreeds.slice(0, 12).map((b) => (
            <span
              key={b.breedId}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
            >
              {b.displayName}
            </span>
          ))}
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
            +more
          </span>
        </div>
        <Link
          href={`/g/${slug}/book`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 pl-8"
        >
          Send an enquiry <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}
