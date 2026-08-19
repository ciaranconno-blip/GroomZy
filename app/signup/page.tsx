"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { collection, query, where, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, MapPin, CheckCircle2, XCircle, Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_HOURS, slugify, type Business } from "@/lib/business";
import { DEFAULT_SERVICES } from "@/lib/breeds";
import { sendMagicLink, completeMagicLinkSignIn } from "@/lib/magicLink";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  const [businessCheck, setBusinessCheck] = useState<"pending" | "none" | "has-business">("pending");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return; // nothing to check for a signed-out visitor
    let cancelled = false;
    // Already signed in (either just created an account, or arrived via
    // /signup?step=2 from Admin's "no business found" redirect) — check
    // they don't already have a business before showing the profile form,
    // so a stray revisit to /signup can't create a duplicate.
    const q = query(collection(db, "businesses"), where("ownerId", "==", user.uid), limit(1));
    getDocs(q).then((snap) => {
      if (!cancelled) setBusinessCheck(snap.empty ? "none" : "has-business");
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (businessCheck === "has-business") router.push("/admin");
  }, [businessCheck, router]);

  if (user === undefined || (user && businessCheck !== "none")) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  return user ? <BusinessProfileStep /> : <AccountStep hasStepParam={searchParams.get("step") === "2"} />;
}

function AccountStep({ hasStepParam }: { hasStepParam: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Surfaces an error from a signInWithRedirect or magic-link that just
  // returned here — on success, onAuthStateChanged in the parent already
  // swaps to step 2 (a magic link creates the account automatically if the
  // email is new, same as an existing user signing back in).
  useEffect(() => {
    completeMagicLinkSignIn().catch(() => {});
    getRedirectResult(auth).catch((err) => setError(readableAuthError(err)));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in the parent picks this up and swaps to step 2.
    } catch (err) {
      setError(readableAuthError(err));
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    // Popup-based sign-in gets blocked by a lot of real browsers (Safari
    // ITP, popup blockers, mobile in-app browsers) — redirect is reliable.
    await signInWithRedirect(auth, new GoogleAuthProvider());
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setMagicLinkLoading(true);
    setError(null);
    try {
      await sendMagicLink(email, `${window.location.origin}/signup`);
      setMagicLinkSent(true);
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setMagicLinkLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-10 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">
          {hasStepParam ? "Finish setting up your account" : "Get Started with GroomZy"}
        </h1>
        <p className="text-xs text-white/50">
          {hasStepParam
            ? "Sign in to pick up where you left off."
            : "Create your account — you'll add your business details next."}
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            className="w-full glass-input text-sm px-3 py-2.5"
          />

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-violet-500/25"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        {magicLinkSent ? (
          <div className="flex items-center gap-2 text-xs text-violet-300 bg-violet-500/10 border border-violet-400/30 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Check your email — we sent a sign-in link to {email}.</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={magicLinkLoading}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white/80 disabled:opacity-50"
          >
            {magicLinkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            Don&apos;t want to set a password? Email me a sign-in link
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] text-white/40">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>

      <p className="text-center text-xs text-white/40">
        Already have an account?{" "}
        <a href="/login" className="text-violet-300 underline underline-offset-2">
          Sign in
        </a>
      </p>
    </div>
  );
}

type SlugStatus = "idle" | "checking" | "available" | "taken";

function BusinessProfileStep() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [eircode, setEircode] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState(DEFAULT_HOURS);

  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugCheck, setSlugCheck] = useState<{ slug: string; status: "available" | "taken" } | null>(null);

  const [locatedCoords, setLocatedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locatedFor, setLocatedFor] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const autoSlug = useMemo(() => slugify(businessName), [businessName]);
  const effectiveSlug = slugTouched ? slug : autoSlug;

  // Debounced slug-uniqueness check. slugCheck only updates from inside the
  // timeout callback (never synchronously in the effect body), and is
  // considered stale — meaning "still checking" — whenever it doesn't match
  // the slug currently being typed.
  useEffect(() => {
    if (!effectiveSlug) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      const q = query(collection(db, "businesses"), where("slug", "==", effectiveSlug), limit(1));
      const snap = await getDocs(q);
      if (!cancelled) setSlugCheck({ slug: effectiveSlug, status: snap.empty ? "available" : "taken" });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [effectiveSlug]);

  const slugStatus: SlugStatus = !effectiveSlug
    ? "idle"
    : slugCheck?.slug === effectiveSlug
    ? slugCheck.status
    : "checking";

  // The located pin is only valid for the address it was found for — an old
  // lat/lng silently surviving a since-edited address would mislocate the
  // business, so treat it as stale (not stored/reset) once anything changes.
  // Eircode is deliberately excluded: it's a precision add-on to an address
  // that's already been geocoded, not something that should discard a
  // perfectly good location — editing it after the fact (a very natural
  // "oh, let me add that" order) used to silently re-disable Complete Setup
  // with no clear explanation.
  const addressKey = `${address}|${town}|${county}`;
  const coords = locatedFor === addressKey ? locatedCoords : null;

  function updateHour(day: string, field: "open" | "close" | "closed", value: string | boolean) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  }

  async function handleLocate() {
    setLocating(true);
    setLocateError(null);
    try {
      const fullAddress = [address, town, county, eircode].filter(Boolean).join(", ");
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocatedCoords({ lat: data.lat, lng: data.lng });
      setLocatedFor(addressKey);
    } catch {
      setLocateError("Couldn't find that address — check the details and try again.");
    } finally {
      setLocating(false);
    }
  }

  const canSubmit =
    businessName && address && town && county && phone && coords && slugStatus === "available" && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !coords) return;
    setSubmitting(true);
    setSubmitError(null);

    const user = auth.currentUser;
    if (!user) {
      setSubmitError("Your session expired — please sign in again.");
      setSubmitting(false);
      return;
    }

    try {
      const business: Omit<Business, "id"> = {
        ownerId: user.uid,
        slug: effectiveSlug,
        businessName,
        tagline,
        address,
        town,
        county,
        eircode,
        lat: coords.lat,
        lng: coords.lng,
        phone,
        hours,
        services: DEFAULT_SERVICES.map((s) => ({ ...s })),
        rating: 0,
        reviewCount: 0,
        socials: {},
        subscriptionStatus: "trialing",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "businesses"), business);

      // Best-effort — a missing email API key should never block signup.
      fetch("/api/notify/new-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, slug: effectiveSlug, town, county }),
      }).catch((err) => console.warn("Signup notification request failed:", err));

      router.push("/admin");
    } catch (err) {
      console.error("Business creation failed:", err);
      setSubmitError("Couldn't save your business — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto pt-6 space-y-6 pb-10">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">Tell us about your business</h1>
        <p className="text-xs text-white/50">This becomes your public booking page.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-card p-4 space-y-3">
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business name"
            required
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Tagline (e.g. Gentle, unhurried grooming)"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/50 pl-1">Your booking page URL</label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/40 whitespace-nowrap">groomzy.ie/g/</span>
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="your-business-name"
                required
                className="flex-1 glass-input text-sm px-3 py-2"
              />
              {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />}
              {slugStatus === "available" && <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />}
              {slugStatus === "taken" && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            </div>
            {slugStatus === "taken" && <p className="text-[11px] text-red-300 pl-1">That URL is already taken.</p>}
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            required
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="Town"
              required
              className="glass-input text-sm px-3 py-2.5"
            />
            <input
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              placeholder="County"
              required
              className="glass-input text-sm px-3 py-2.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={eircode}
              onChange={(e) => setEircode(e.target.value)}
              placeholder="Eircode (optional)"
              className="glass-input text-sm px-3 py-2.5"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              required
              className="glass-input text-sm px-3 py-2.5"
            />
          </div>

          <button
            type="button"
            onClick={handleLocate}
            disabled={locating || !address || !town || !county}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-40 text-white text-xs font-semibold"
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            {coords ? "Located — click to re-check" : "Locate my business on the map"}
          </button>
          {coords && (
            <p className="text-[11px] text-violet-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Found it — customers will see you on the map.
            </p>
          )}
          {locateError && <p className="text-[11px] text-red-300">{locateError}</p>}
        </div>

        <div className="glass-card p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Opening Hours</label>
          {hours.map((h) => (
            <div key={h.day} className="flex items-center gap-2">
              <span className="text-xs text-white/70 w-9 flex-shrink-0">{h.day}</span>
              <input
                type="time"
                value={h.open}
                disabled={h.closed}
                onChange={(e) => updateHour(h.day, "open", e.target.value)}
                className="glass-input text-xs px-2 py-1.5 flex-1 disabled:opacity-30"
              />
              <span className="text-white/30 text-xs">–</span>
              <input
                type="time"
                value={h.close}
                disabled={h.closed}
                onChange={(e) => updateHour(h.day, "close", e.target.value)}
                className="glass-input text-xs px-2 py-1.5 flex-1 disabled:opacity-30"
              />
              <label className="flex items-center gap-1 text-[11px] text-white/50 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={h.closed ?? false}
                  onChange={(e) => updateHour(h.day, "closed", e.target.checked)}
                />
                Closed
              </label>
            </div>
          ))}
        </div>

        {!coords && businessName && address && town && county && phone && (
          <div className="glass-card p-3 text-xs text-amber-300 border-amber-400/30 bg-amber-500/5">
            Click &quot;Locate my business on the map&quot; above before continuing — the pin needs to match your current address.
          </div>
        )}

        {submitError && (
          <div className="glass-card p-3 text-xs text-red-300 border-red-400/30 bg-red-500/5">{submitError}</div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-30 text-white text-sm font-bold shadow-lg shadow-violet-500/25"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Complete Setup
        </button>
      </form>
    </div>
  );
}

function readableAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("email-already-in-use")) return "An account with that email already exists — try signing in instead.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email address.";
  return "Something went wrong — please try again.";
}
