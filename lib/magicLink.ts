import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";

// The email itself never travels in the link (Firebase uses a one-time
// code) — stored locally so the same browser/device can complete the
// sign-in without re-typing it after clicking the emailed link.
const STORAGE_KEY = "groomzy-magic-link-email";

export async function sendMagicLink(email: string, redirectUrl: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, { url: redirectUrl, handleCodeInApp: true });
  window.localStorage.setItem(STORAGE_KEY, email);
}

// Call on mount wherever a magic link might land. Returns true if a
// sign-in was just completed from the current URL.
export async function completeMagicLinkSignIn(): Promise<boolean> {
  if (!isSignInWithEmailLink(auth, window.location.href)) return false;

  let email = window.localStorage.getItem(STORAGE_KEY);
  if (!email) {
    // Link opened on a different browser/device than it was requested
    // from — the only place the email could otherwise come from.
    email = window.prompt("Confirm your email to finish signing in:");
  }
  if (!email) return false;

  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(STORAGE_KEY);
  return true;
}
