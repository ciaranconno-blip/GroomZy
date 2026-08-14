"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavItems } from "@/lib/nav";

// Fixed bottom tab bar — the primary nav on mobile, per the memory file spec,
// but only within a business's own public pages. Admin/login/signup/marketing
// have their own layouts and don't need a generic public tab bar competing
// for the bottom of the screen.
export function BottomNav() {
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/g\/([^/]+)/);
  const slug = slugMatch?.[1];

  if (!slug) return null;

  const navItems = publicNavItems(slug);
  const homeHref = `/g/${slug}`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] bg-white/5 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === homeHref ? pathname === homeHref : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-violet-300" : "text-white/50"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
