"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, ChevronLeft, PhoneCall, CalendarCheck, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  BREEDS,
  SERVICES,
  UNSURE_DOUBLE_COAT,
  OTHER_MIXED_BREED,
  findBreed,
  routeBreed,
  BookingPath,
} from "@/lib/breeds";
import { GROOMER } from "@/lib/groomer";
import { generateSlots } from "@/lib/slots";
import { db } from "@/lib/firebase";

const LAST_GROOMED_OPTIONS = [
  "Within the last month",
  "2–3 months ago",
  "4–6 months ago",
  "6–12 months ago",
  "Over a year ago",
  "First groom",
];

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Breed & Service",
  2: "Date & Time",
  3: "Your Details",
};

export default function BookPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [breedId, setBreedId] = useState<string>("");
  const [unsureAnswer, setUnsureAnswer] = useState<"single" | "double" | "not_sure" | undefined>();
  const [serviceId, setServiceId] = useState<string>(SERVICES[0].id);

  // Step 2 state (direct path only)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Step 3 state
  const [dogName, setDogName] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogWeight, setDogWeight] = useState("");
  const [lastGroomed, setLastGroomed] = useState(LAST_GROOMED_OPTIONS[0]);
  const [dogNotes, setDogNotes] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const breed = breedId ? findBreed(breedId) : undefined;
  const path: BookingPath | null = breedId ? routeBreed(breedId, unsureAnswer) : null;
  const needsUnsurePrompt = breedId === OTHER_MIXED_BREED && !unsureAnswer;

  const durationMin = breed?.baseDurationMin ?? 60;
  const slotDays = useMemo(() => generateSlots(GROOMER, durationMin), [durationMin]);

  const canAdvanceStep1 = Boolean(breedId) && !needsUnsurePrompt;
  const canAdvanceStep2 = path === "enquiry" || (Boolean(selectedDate) && Boolean(selectedTime));

  async function handleSubmit() {
    if (!breed || !path) return;
    setSubmitting(true);
    setSubmitError(null);

    const service = SERVICES.find((s) => s.id === serviceId);
    const basePayload = {
      breedId: breed.breedId,
      breedName: breed.displayName,
      coatType: breed.coatType,
      serviceId: service?.id ?? null,
      serviceName: service?.name ?? null,
      dog: { name: dogName, age: dogAge, weight: dogWeight, lastGroomed, notes: dogNotes },
      owner: { name: ownerName, phone: ownerPhone, email: ownerEmail },
      createdAt: serverTimestamp(),
      status: "pending" as const,
    };

    try {
      if (path === "direct") {
        await addDoc(collection(db, "bookings"), {
          ...basePayload,
          date: selectedDate,
          time: selectedTime,
          durationMin,
        });

        // Best-effort — a groomer without Calendar connected, or a transient
        // API error, should never block the client from getting their booking.
        fetch("/api/bookings/sync-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groomerId: GROOMER.groomerId,
            dogName,
            breedName: breed.displayName,
            serviceName: service?.name,
            ownerName,
            ownerPhone,
            date: selectedDate,
            time: selectedTime,
            durationMin,
          }),
        }).catch((err) => console.warn("Calendar sync request failed:", err));
      } else {
        await addDoc(collection(db, "enquiries"), basePayload);
      }
      setSubmitted(true);
    } catch (err) {
      // Most likely cause during setup: NEXT_PUBLIC_FIREBASE_* env vars missing/wrong,
      // or the dev server needs a restart to pick up a freshly-written .env.local.
      setSubmitError(
        "Couldn't save that — check the Firebase config is set up correctly and try again."
      );
      console.error("Firestore write failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return path === "direct" ? <DirectConfirmation /> : <EnquirySent />;
  }

  return (
    <div className="space-y-6">
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="space-y-6">
          <Header title="What are we grooming today?" />

          <div className="glass-card p-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Breed</label>
            <select
              value={breedId}
              onChange={(e) => {
                setBreedId(e.target.value);
                setUnsureAnswer(undefined);
              }}
              className="w-full glass-input text-sm px-3 py-3"
            >
              <option value="" disabled>
                Select your dog&apos;s breed
              </option>
              <optgroup label="Small / Single-Coat">
                {BREEDS.filter((b) => b.defaultPath === "direct" && b.sizeTier !== "medium").map((b) => (
                  <option key={b.breedId} value={b.breedId}>
                    {b.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Medium">
                {BREEDS.filter((b) => b.defaultPath === "direct" && b.sizeTier === "medium").map((b) => (
                  <option key={b.breedId} value={b.breedId}>
                    {b.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Large / Double-Coat">
                {BREEDS.filter((b) => b.defaultPath === "enquiry").map((b) => (
                  <option key={b.breedId} value={b.breedId}>
                    {b.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Not sure?">
                <option value={UNSURE_DOUBLE_COAT}>My dog might be double-coated</option>
                <option value={OTHER_MIXED_BREED}>Other / Mixed breed</option>
              </optgroup>
            </select>

            {needsUnsurePrompt && (
              <div className="pt-2 space-y-2 border-t border-white/10">
                <p className="text-xs text-white/70">Is your dog single or double-coated? Not sure?</p>
                <div className="flex flex-wrap gap-2">
                  {(["single", "double", "not_sure"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUnsureAnswer(opt)}
                      className="pill"
                    >
                      {opt === "single" ? "Single coat" : opt === "double" ? "Double coat" : "Not sure"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {path && (
              <div
                className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
                  path === "direct"
                    ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-300"
                    : "bg-amber-500/15 border-amber-400/30 text-amber-300"
                }`}
              >
                {path === "direct"
                  ? "✓ Instant booking available for this breed"
                  : "This breed needs a quick consultation before booking — no price or slot shown until we've chatted"}
              </div>
            )}
          </div>

          <div className="glass-card p-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Service</label>
            <div className="grid grid-cols-1 gap-2">
              {SERVICES.filter((s) => s.priceFrom !== null).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    serviceId === s.id
                      ? "bg-indigo-500/18 border-indigo-400/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{s.name}</div>
                    <div className="text-[11px] text-white/50">{s.durationLabel}</div>
                  </div>
                  <div className="text-sm font-bold text-white">from €{s.priceFrom}</div>
                </button>
              ))}
            </div>
          </div>

          <NavFooter
            onNext={() => setStep(2)}
            nextDisabled={!canAdvanceStep1}
            showBack={false}
          />
        </div>
      )}

      {step === 2 && path === "direct" && (
        <div className="space-y-6">
          <Header title="Pick a Date & Time" />
          <div className="glass-card p-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slotDays.map((d) => (
                <button
                  key={d.dateISO}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d.dateISO);
                    setSelectedTime("");
                  }}
                  className={`pill flex-shrink-0 ${selectedDate === d.dateISO ? "active" : ""}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {selectedDate && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slotDays
                  .find((d) => d.dateISO === selectedDate)
                  ?.times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`pill justify-center ${selectedTime === t ? "active" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
              </div>
            )}
            <p className="text-[11px] text-white/40">
              Each slot includes a 10-minute buffer after your appointment — real
              grooms need clean-up time between dogs.
            </p>
          </div>
          <NavFooter onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!canAdvanceStep2} />
        </div>
      )}

      {step === 2 && path === "enquiry" && (
        <div className="space-y-6">
          <Header title="Tell Us About Your Dog" />
          <div className="glass-card p-4 text-xs text-white/70 leading-relaxed">
            This breed requires a consultation before booking. {GROOMER.businessName} will
            contact you to confirm timing and pricing — no slot is held until then.
          </div>
          <NavFooter onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={false} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Header title={path === "direct" ? "Dog & Owner Details" : "Enquiry Details"} />

          <div className="glass-card p-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">About the Dog</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={dogName} onChange={(e) => setDogName(e.target.value)} placeholder="Dog's name" className="glass-input text-sm px-3 py-2.5 col-span-2" />
              <input value={dogAge} onChange={(e) => setDogAge(e.target.value)} placeholder="Age" className="glass-input text-sm px-3 py-2.5" />
              <input value={dogWeight} onChange={(e) => setDogWeight(e.target.value)} placeholder="Weight (kg)" className="glass-input text-sm px-3 py-2.5" />
            </div>
            <select value={lastGroomed} onChange={(e) => setLastGroomed(e.target.value)} className="w-full glass-input text-sm px-3 py-2.5">
              {LAST_GROOMED_OPTIONS.map((o) => (
                <option key={o} value={o}>Last groomed: {o}</option>
              ))}
            </select>
            <textarea
              value={dogNotes}
              onChange={(e) => setDogNotes(e.target.value)}
              placeholder="Notes — allergies, anxieties, behaviour"
              rows={3}
              className="w-full glass-input text-sm px-3 py-2.5 resize-none"
            />
          </div>

          <div className="glass-card p-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Your Details</label>
            <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Your name" className="w-full glass-input text-sm px-3 py-2.5" />
            <input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="Phone" className="w-full glass-input text-sm px-3 py-2.5" />
            <input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email" className="w-full glass-input text-sm px-3 py-2.5" />
            <p className="text-[11px] text-white/40">No account needed — we&apos;ll match you by phone or email next time.</p>
          </div>

          <div className="glass-card p-3 text-[11px] text-white/50">
            Cancellation policy: please give at least 48 hours&apos; notice.
          </div>

          {submitError && (
            <div className="glass-card p-3 text-xs text-red-300 border-red-400/30 bg-red-500/5">
              {submitError}
            </div>
          )}

          <NavFooter
            onBack={() => setStep(2)}
            onNext={handleSubmit}
            nextLabel={
              submitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </span>
              ) : path === "direct" ? (
                "Confirm Booking"
              ) : (
                "Send Enquiry"
              )
            }
            nextDisabled={!ownerName || !ownerPhone || !dogName || submitting}
          />
        </div>
      )}
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="text-center max-w-xl mx-auto space-y-1">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = [1, 2, 3];
  return (
    <div className="w-full glass-card py-4 px-4 relative">
      <div className="max-w-sm mx-auto flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-indigo-400 -translate-y-1/2 z-0 transition-all duration-300 shadow-[0_0_10px_#818cf8]"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step
                  ? "bg-indigo-500 text-white"
                  : s === step
                  ? "bg-white text-[#0c0c14] ring-4 ring-indigo-400/30 scale-105"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className="mt-1.5 text-[10px] text-white/50 whitespace-nowrap">{STEP_LABELS[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavFooter({
  onBack,
  onNext,
  nextDisabled,
  showBack = true,
  nextLabel = "Continue",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  showBack?: boolean;
  nextLabel?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25"
      >
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function DirectConfirmation() {
  return (
    <div className="glass-card p-8 text-center max-w-md mx-auto space-y-3">
      <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mx-auto">
        <CalendarCheck className="w-7 h-7 text-indigo-300" />
      </div>
      <h2 className="text-lg font-bold text-white">Booking Confirmed</h2>
      <p className="text-xs text-white/60">
        We&apos;ve sent a confirmation to your email. A reminder will follow 48 hours before your appointment.
      </p>
    </div>
  );
}

function EnquirySent() {
  return (
    <div className="glass-card p-8 text-center max-w-md mx-auto space-y-3">
      <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto">
        <PhoneCall className="w-7 h-7 text-amber-300" />
      </div>
      <h2 className="text-lg font-bold text-white">Enquiry Sent</h2>
      <p className="text-xs text-white/60">
        {GROOMER.businessName} will call you to confirm timing and pricing —
        no slot is booked yet.
      </p>
    </div>
  );
}
