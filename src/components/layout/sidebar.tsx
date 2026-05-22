"use client";

import { Pill, LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { getNavForRole } from "@/config/nav";
import { NavLink } from "./nav-link";

export function Sidebar({ role, userName }: { role: Role; userName: string }) {
  const links = getNavForRole(role);
  const allHrefs = links.map((l) => l.href);

  const roleLabel =
    role === "SUPPLIER"
      ? "supplier"
      : role === "CLIENT"
        ? "wholesale client"
        : role === "RETAILER"
          ? "retailer"
          : role.toLowerCase();

  return (
    <aside
      dir="ltr"
      className="relative z-50 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface md:flex"
    >
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">PharmaSupply</p>
            <p className="text-xs text-muted capitalize">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain p-3"
        aria-label="Sidebar navigation"
      >
        {links.map((item) => (
          <NavLink key={item.href} {...item} allHrefs={allHrefs} />
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <p className="mb-2 truncate text-xs text-muted">{userName}</p>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex min-h-[48px] w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors touch-manipulation"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
