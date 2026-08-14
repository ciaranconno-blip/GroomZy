"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { publicNavItems } from "@/lib/nav";

// Desktop header with pill navigation. Mobile gets BottomNav instead —
// the memory file specs mobile-first with a bottom tab bar as primary.
export function TopNav() {
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/g\/([^/]+)/);
  const slug = slugMatch?.[1];
  const homeHref = slug ? `/g/${slug}` : "/";
  const navItems = slug ? publicNavItems(slug) : [];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href={homeHref} className="flex items-center gap-3 group">
          <Image
            src="/icons/icon-192.png"
            alt="GroomZy"
            width={40}
            height={40}
            className="rounded-xl shadow-lg shadow-[#7C3AED]/30 group-hover:scale-105 transition-transform"
            priority
          />
          <div>
            <span className="text-xl font-semibold tracking-tight text-white block">
              Groom<span className="text-[#A374F7]">Zy</span>
            </span>
            <span className="text-[10px] text-white/40 tracking-wider font-medium block -mt-1">
              Dog Grooming, Booked Properly
            </span>
          </div>
        </Link>

        {navItems.length > 0 && (
          <nav className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === homeHref ? pathname === homeHref : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {!slug && !pathname.startsWith("/admin") && (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
