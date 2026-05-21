"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Search,
  Pill,
  Bell,
  Truck,
  Users,
  Building2,
} from "lucide-react";
import type { Role } from "@prisma/client";

const staffPages = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, kbd: "G D" },
  { href: "/inventory", label: "Inventory", icon: Package, kbd: "G I" },
  { href: "/orders", label: "Orders", icon: ShoppingCart, kbd: "G O" },
  { href: "/purchases", label: "Purchases", icon: Truck, kbd: "G P" },
  { href: "/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/alerts", label: "Alerts", icon: Bell, kbd: "G A" },
];

const clientPages = [
  { href: "/catalog", label: "Catalog", icon: Pill },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/my-orders", label: "My Orders", icon: Package },
];

type SearchResult = {
  medicines: { id: string; name: string; stockQuantity: number; category: string | null }[];
  orders: { id: string; orderNumber: string; status: string; totalAmount: number }[];
  pages: { href: string; label: string }[];
};

export function CommandPalette({ role }: { role: Role }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);

  const supplierPages = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/supplier/deliveries", label: "Deliveries", icon: Truck },
    { href: "/supplier/products", label: "My Products", icon: Package },
  ];

  const pages =
    role === "CLIENT"
      ? clientPages
      : role === "SUPPLIER"
        ? supplierPages
        : [...staffPages, ...(role === "ADMIN" ? [{ href: "/clients", label: "Clients", icon: Users }] : [])];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pharma:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pharma:open-palette", onOpen);
    };
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl glow-primary animate-in"
        onClick={(e) => e.stopPropagation()}
        shouldFilter={false}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search medicines, orders, or jump to a page…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted"
            autoFocus
          />
          <kbd className="hidden sm:inline rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted">
            No results found.
          </Command.Empty>

          {query.length < 2 && (
            <Command.Group heading="Quick navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted">
              {pages.map((p) => (
                <Command.Item
                  key={p.href}
                  value={p.label}
                  onSelect={() => go(p.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/15 aria-selected:text-accent"
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results && results.medicines.length > 0 && (
            <Command.Group heading="Medicines" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted">
              {results.medicines.map((m) => (
                <Command.Item
                  key={m.id}
                  value={m.name}
                  onSelect={() =>
                    go(
                      role === "CLIENT"
                        ? "/catalog"
                        : role === "SUPPLIER"
                          ? "/supplier/products"
                          : "/inventory"
                    )
                  }
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/15"
                >
                  <span>{m.name}</span>
                  <span className="text-xs text-muted">{m.stockQuantity} in stock</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results && results.orders.length > 0 && (
            <Command.Group heading="Orders" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted">
              {results.orders.map((o) => (
                <Command.Item
                  key={o.id}
                  value={o.orderNumber}
                  onSelect={() => go("/orders")}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/15"
                >
                  <span>{o.orderNumber}</span>
                  <span className="text-xs text-muted capitalize">{o.status.toLowerCase()}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results && results.pages.length > 0 && (
            <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted">
              {results.pages.map((p) => (
                <Command.Item
                  key={p.href}
                  value={p.label}
                  onSelect={() => go(p.href)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/15"
                >
                  {p.label}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-border px-4 py-2 text-[10px] text-muted flex gap-4">
          <span>
            <kbd className="rounded border border-border px-1">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-border px-1">↵</kbd> select
          </span>
          <span>
            <kbd className="rounded border border-border px-1">Ctrl</kbd>+
            <kbd className="rounded border border-border px-1">K</kbd> toggle
          </span>
        </div>
      </Command>
    </div>
  );
}
