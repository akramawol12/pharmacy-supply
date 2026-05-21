"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Bell,
  LogOut,
  Pill,
  Boxes,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const staffNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/purchases", label: "Purchases", icon: Truck },
  { href: "/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

const adminNav = [{ href: "/clients", label: "Clients", icon: Users }];

const clientNav = [
  { href: "/catalog", label: "Catalog", icon: Pill },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/my-orders", label: "My Orders", icon: Package },
];

const supplierNav = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/deliveries", label: "Deliveries", icon: ClipboardList },
  { href: "/supplier/products", label: "My Products", icon: Boxes },
];

export function Sidebar({ role, userName }: { role: Role; userName: string }) {
  const pathname = usePathname();
  const links =
    role === "CLIENT"
      ? clientNav
      : role === "SUPPLIER"
        ? supplierNav
        : [...staffNav, ...(role === "ADMIN" ? adminNav : [])];

  const roleLabel =
    role === "SUPPLIER" ? "supplier" : role === "CLIENT" ? "wholesale client" : role.toLowerCase();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
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

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={true}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <p className="mb-2 truncate text-xs text-muted">{userName}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
