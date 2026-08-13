"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

// Fixed bottom tab bar — the primary nav on mobile, per the memory file spec.
// Hidden on desktop in favour of TopNav's pill navigation.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] bg-white/5 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-indigo-300" : "text-white/50"
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
