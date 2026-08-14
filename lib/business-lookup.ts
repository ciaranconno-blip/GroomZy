import { cache } from "react";
import { adminDb } from "@/lib/firebase-admin";
import { Business } from "@/lib/business";

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
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
  } as Business;
});
