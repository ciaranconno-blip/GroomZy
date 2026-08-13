import { getApps, initializeApp, applicationDefault, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server-only — never import this from a "use client" file. Reads
// GOOGLE_APPLICATION_CREDENTIALS (a file path outside the project directory,
// see .env.local) or falls back to Application Default Credentials.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault() });
  }

  // Fallback for deploy environments where the key is injected as JSON
  // directly (e.g. a Vercel env var) rather than a file path.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  throw new Error(
    "No Firebase Admin credentials found — set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY"
  );
}

export const adminDb = getFirestore(getAdminApp());
