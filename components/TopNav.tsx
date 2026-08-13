"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

// Desktop header with pill navigation. Mobile gets BottomNav instead —
// the memory file specs mobile-first with a bottom tab bar as primary.
export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0c0c14] rounded-[10px] flex items-center justify-center">
              <span className="font-bold text-lg text-indigo-400">G</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-semibold tracking-tight text-white block">
              Groom<span className="text-indigo-400">Zy</span>
            </span>
            <span className="text-[10px] text-white/40 tracking-wider font-medium block -mt-1">
              Dog Grooming, Booked Properly
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
