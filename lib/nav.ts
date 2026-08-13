import { Home, Sparkles, CalendarPlus, Image as ImageIcon, LayoutDashboard } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/book", label: "Book", icon: CalendarPlus },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
] as const;
