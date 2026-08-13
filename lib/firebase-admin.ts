import { getApps, initializeApp, applicationDefault, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server-only — never import this from a "use client" file.
//
// On Firebase App Hosting (Cloud Run), applicationDefault() picks up the
// service's own attached identity automatically — no key file needed at all,
// which is the whole reason this app is hosted there. Locally, it reads
// GOOGLE_APPLICATION_CREDENTIALS (a file path outside the project directory,
// see .env.local). FIREBASE_SERVICE_ACCOUNT_KEY is a last-resort fallback for
// any environment where neither of those apply.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  try {
    return initializeApp({ credential: applicationDefault() });
  } catch {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return initializeApp({ credential: cert(serviceAccount) });
    }
    throw new Error(
      "No Firebase Admin credentials found — set GOOGLE_APPLICATION_CREDENTIALS locally, or rely on Cloud Run's attached service account in production"
    );
  }
}

export const adminDb = getFirestore(getAdminApp());
