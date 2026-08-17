"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { LogIn, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendMagicLink, completeMagicLinkSignIn } from "@/lib/magicLink";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Popup-based Google sign-in gets blocked by a lot of real browsers
  // (Safari ITP, popup blockers, mobile in-app browsers) — redirect is the
  // reliable path, so this picks the result back up after Google sends the
  // user back here. Also checks for a magic-link return in the same pass,
  // since both land back on this page.
  useEffect(() => {
    async function checkReturns() {
      try {
        const viaMagicLink = await completeMagicLinkSignIn();
        if (viaMagicLink) {
          router.push("/admin");
          return;
        }
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) router.push("/admin");
      } catch (err) {
        setError(readableAuthError(err));
      } finally {
        setCheckingRedirect(false);
      }
    }
    checkReturns();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
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
      await sendMagicLink(email, `${window.location.origin}/login`);
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
        <h1 className="text-xl font-bold text-white">Groomer Sign In</h1>
        <p className="text-xs text-white/50">Admin access only — clients never need an account.</p>
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
            placeholder="Password"
            className="w-full glass-input text-sm px-3 py-2.5"
          />

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-violet-500/25"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Sign In
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
            Don&apos;t want to use a password? Email me a sign-in link
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] text-white/40">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || checkingRedirect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold disabled:opacity-50"
        >
          {checkingRedirect && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue with Google
        </button>
      </div>

      <p className="text-center text-xs text-white/40">
        New groomer?{" "}
        <a href="/signup" className="text-violet-300 underline underline-offset-2">
          Set up your business
        </a>
      </p>
    </div>
  );
}

function readableAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
  if (code.includes("user-not-found")) return "No account with that email.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email address.";
  return "Something went wrong — please try again.";
}
