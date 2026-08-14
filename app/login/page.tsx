"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { LogIn, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

// Sign-up removed deliberately — the one groomer account already exists.
// This is an admin login only; open registration on a live URL would let
// anyone who finds it create an account with access to customer bookings.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/admin");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] text-white/40">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function readableAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
  if (code.includes("user-not-found")) return "No account with that email.";
  return "Something went wrong — please try again.";
}
