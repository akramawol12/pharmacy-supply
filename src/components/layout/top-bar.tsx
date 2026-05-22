"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Command, Download, LogOut, Pill } from "lucide-react";
import type { Role } from "@prisma/client";

type AlertCounts = { lowStock: number; expiring: number; expired: number };

export function TopBar({
  role,
  userName,
  alertCounts,
}: {
  role: Role;
  userName: string;
  alertCounts: AlertCounts | null;
}) {
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const isInternal = role === "ADMIN" || role === "STAFF";
  const alerts = alertCounts;
  const total = alerts ? alerts.lowStock + alerts.expiring + alerts.expired : 0;

  const roleLabel =
    role === "SUPPLIER"
      ? "supplier"
      : role === "CLIENT"
        ? "wholesale"
        : role === "RETAILER"
          ? "retailer"
          : role.toLowerCase();

  useEffect(() => {
    if (!showAlerts) return;
    function onMouseDown(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showAlerts]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Pill className="h-5 w-5" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold text-foreground">PharmaSupply</p>
            <p className="truncate text-[10px] text-muted capitalize">{roleLabel}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("pharma:open-palette"))}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-muted transition-all hover:border-accent/40 hover:bg-surface sm:gap-3 sm:px-4"
          >
            <Command className="h-4 w-4 shrink-0" />
            <span className="truncate">Search…</span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] md:inline">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isInternal && (
            <>
              <a
                href="/api/export/inventory"
                className="hidden lg:flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </a>

              <div className="relative" ref={alertsRef}>
                <button
                  type="button"
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative rounded-lg border border-border p-2.5 text-muted hover:bg-surface hover:text-foreground transition-all touch-manipulation"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                      {total}
                    </span>
                  )}
                </button>

                {showAlerts && alerts && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-4 shadow-xl glow-accent">
                    <p className="text-sm font-bold mb-3">Alerts</p>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex justify-between">
                        <span>Low stock</span>
                        <span className="text-danger font-semibold">{alerts.lowStock}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Expiring soon</span>
                        <span className="text-warning font-semibold">{alerts.expiring}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Expired</span>
                        <span className="text-danger font-semibold">{alerts.expired}</span>
                      </li>
                    </ul>
                    <Link
                      href="/alerts"
                      onClick={() => setShowAlerts(false)}
                      className="mt-3 block text-center text-xs text-accent hover:underline"
                    >
                      View all alerts →
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="rounded-lg border border-border p-2.5 text-muted hover:bg-surface hover:text-foreground transition-all touch-manipulation"
            aria-label={`Sign out (${userName})`}
            title={userName}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
