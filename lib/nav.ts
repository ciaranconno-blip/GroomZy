import { Home, Sparkles, CalendarPlus, Image as ImageIcon, MapPin, LogIn } from "lucide-react";

// Public, per-business nav (inside app/g/[slug]/*). No "Admin" item here — a
// customer browsing a groomer's public page seeing a generic Admin link
// makes no sense, and risks reading as if it's their own account.
export function publicNavItems(slug: string) {
  return [
    { href: `/g/${slug}`, label: "Home", icon: Home },
    { href: `/g/${slug}/services`, label: "Services", icon: Sparkles },
    { href: `/g/${slug}/book`, label: "Book", icon: CalendarPlus },
    { href: `/g/${slug}/gallery`, label: "Gallery", icon: ImageIcon },
  ] as const;
}

// The generic groomzy.ie marketing/directory pages — not a specific business.
export function marketingNavItems() {
  return [
    { href: "/", label: "Home", icon: Home },
    { href: "/groomers", label: "Find a Groomer", icon: MapPin },
    { href: "/login", label: "Sign In", icon: LogIn },
  ] as const;
}
