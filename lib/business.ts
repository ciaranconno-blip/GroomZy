// Multi-tenant business profile — the Firestore-backed successor to the
// single hardcoded GROOMER const in lib/groomer.ts. Field names deliberately
// match GroomerProfile so lib/slots.ts's generateSlots() and
// GroomerMapLoader need no changes; they already take a profile object as
// a parameter, not a global import.

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface Business {
  id: string; // Firestore doc ID — NOT the slug, so slugs stay renamable later
  ownerId: string; // Firebase Auth uid — one owner per business for now
  slug: string; // unique, URL-safe — "fairy-dog-mother"
  businessName: string;
  tagline: string;
  address: string;
  town: string;
  county: string;
  eircode: string;
  lat: number;
  lng: number;
  phone: string;
  hours: { day: string; open: string; close: string; closed?: boolean }[];
  rating: number;
  reviewCount: number;
  socials: { instagram?: string; facebook?: string; googleReviews?: string };
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: unknown; // Firestore Timestamp — typed loosely here to avoid importing firestore in a file shared by client and scripts
}

// Fields a groomer actually fills in during signup — everything else
// (id, ownerId, subscriptionStatus, createdAt) is set by the app, not the form.
export type BusinessDraft = Pick<
  Business,
  | "businessName"
  | "tagline"
  | "address"
  | "town"
  | "county"
  | "eircode"
  | "lat"
  | "lng"
  | "phone"
  | "hours"
  | "slug"
>;

export const DEFAULT_HOURS: Business["hours"] = [
  { day: "Mon", open: "09:00", close: "17:00" },
  { day: "Tue", open: "09:00", close: "17:00" },
  { day: "Wed", open: "09:00", close: "17:00" },
  { day: "Thu", open: "09:00", close: "17:00" },
  { day: "Fri", open: "09:00", close: "17:00" },
  { day: "Sat", open: "09:00", close: "13:00" },
  { day: "Sun", open: "", close: "", closed: true },
];

export function slugify(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
