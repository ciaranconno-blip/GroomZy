import { cache } from "react";
import { adminDb } from "@/lib/firebase-admin";
import { Business } from "@/lib/business";
import { DEFAULT_SERVICES } from "@/lib/breeds";

// Server-only. Wrapped in React's cache() so the layout and any Server
// Component page under it that also needs the business (same request) share
// one Firestore read instead of two.
export const getBusinessBySlug = cache(async (slug: string): Promise<Business | null> => {
  const snap = await adminDb.collection("businesses").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  // Firestore Admin Timestamp is a class instance, not a plain object — passing
  // it straight from a Server Component to a Client Component (via BusinessProvider)
  // throws. Convert to an ISO string here so every consumer gets a plain value.
  return {
    id: doc.id,
    ...data,
    // Business docs created before the per-business pricing feature don't
    // have this field yet — fall back rather than crash every consumer.
    services: data.services?.length ? data.services : DEFAULT_SERVICES,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
  } as Business;
});
