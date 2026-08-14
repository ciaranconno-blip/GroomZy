"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavItems, marketingNavItems } from "@/lib/nav";

// Fixed bottom tab bar — the primary nav on mobile, per the memory file spec.
// Shown within a business's own public pages, and on the generic marketing
// pages (home, find-a-groomer). Admin/login/signup have their own dedicated
// flows and don't need a generic tab bar competing for the bottom of the screen.
export function BottomNav() {
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/g\/([^/]+)/);
  const slug = slugMatch?.[1];
  const isMarketingPage = pathname === "/" || pathname === "/groomers";

  if (!slug && !isMarketingPage) return null;

  const navItems = slug ? publicNavItems(slug) : marketingNavItems();
  const homeHref = slug ? `/g/${slug}` : "/";

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
