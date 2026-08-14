import Link from "next/link";
import { ArrowRight, CalendarCheck2, Scissors, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck2,
    title: "Two-path booking",
    body: "Simple coats book an instant slot. Double-coated and large breeds route to a quick consultation first — no more guessing a groom time and running the whole day late.",
  },
  {
    icon: Scissors,
    title: "Built for groomers, not spreadsheets",
    body: "A daily brief, a live waitlist, and Google Calendar sync — everything a one-person or small grooming business actually needs, nothing it doesn't.",
  },
  {
    icon: ShieldCheck,
    title: "Your own page, your own data",
    body: "Every business gets its own booking page and fully isolated data. No shared logins, no mixed-up calendars.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center max-w-xl mx-auto space-y-5 pt-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-widest bg-violet-500/15 px-3 py-1 rounded-full border border-violet-400/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          Dog Grooming, Booked Properly
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
          Booking software built for dog groomers
        </h1>
        <p className="text-sm text-white/60">
          Give clients a real booking page — instant slots for simple coats,
          consultations for the breeds that actually need one — and get a
          daily brief that keeps your whole week straight.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all border border-violet-400/30"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-sm border border-white/10 transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass-card p-5 space-y-2">
            <f.icon className="w-5 h-5 text-violet-300" />
            <h2 className="text-sm font-bold text-white">{f.title}</h2>
            <p className="text-xs text-white/60 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="glass-card p-5 text-center space-y-2">
        <p className="text-xs text-white/60">
          Looking for Fairy Dog Mother?{" "}
          <Link href="/g/fairy-dog-mother" className="text-violet-300 underline underline-offset-2">
            Go to their booking page →
          </Link>
        </p>
      </section>
    </div>
  );
}
