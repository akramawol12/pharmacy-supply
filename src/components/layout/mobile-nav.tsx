"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { getNavForRole, isNavActive } from "@/config/nav";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";

export function MobileNav({ role }: { role: Role }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const links = getNavForRole(role);
  const allHrefs = links.map((l) => l.href);

  const primary = links.slice(0, 4);
  const more = links.slice(4);
  const moreActive = more.some((m) => isNavActive(pathname, m.href, allHrefs));

  return (
    <>
      {moreOpen && more.length > 0 && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      )}

      {moreOpen && more.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-3 rounded-xl border border-border bg-surface p-2 shadow-xl md:hidden"
          dir="ltr"
        >
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-muted">More</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-muted hover:bg-surface-hover touch-manipulation"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {more.map((item) => (
              <div key={item.href} onClick={() => setMoreOpen(false)}>
                <NavLink {...item} allHrefs={allHrefs} compact />
              </div>
            ))}
          </nav>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-border bg-surface/95 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        dir="ltr"
        aria-label="Main navigation"
      >
        {primary.map((item) => (
          <NavLink key={item.href} {...item} allHrefs={allHrefs} tab />
        ))}
        {more.length > 0 ? (
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-medium touch-manipulation",
              moreOpen || moreActive ? "text-accent" : "text-muted"
            )}
            aria-label="More pages"
            aria-expanded={moreOpen}
          >
            <Menu className="h-5 w-5" />
            More
          </button>
        ) : null}
      </nav>
    </>
  );
}
