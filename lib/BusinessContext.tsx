"use client";

import { createContext, useContext } from "react";
import { Business } from "@/lib/business";

const BusinessContext = createContext<Business | null>(null);

export function BusinessProvider({ business, children }: { business: Business; children: React.ReactNode }) {
  return <BusinessContext.Provider value={business}>{children}</BusinessContext.Provider>;
}

// Only for Client Components under app/g/[slug]/* — Server Component pages
// should call getBusinessBySlug() directly (cache()'d, no extra read).
export function useBusiness(): Business {
  const business = useContext(BusinessContext);
  if (!business) throw new Error("useBusiness() called outside a BusinessProvider — check app/g/[slug]/layout.tsx wraps this route.");
  return business;
}
