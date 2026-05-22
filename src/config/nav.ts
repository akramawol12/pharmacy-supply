import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Bell,
  Pill,
  Boxes,
  ClipboardList,
  Store,
} from "lucide-react";
import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const staffNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/purchases", label: "Purchases", icon: Truck },
  { href: "/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

const adminNav: NavItem[] = [
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/retailers", label: "Retailers", icon: Store },
];

const clientNav: NavItem[] = [
  { href: "/catalog", label: "Catalog", icon: Pill },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/my-orders", label: "My Orders", icon: Package },
];

const retailerNav: NavItem[] = [
  { href: "/retailer/catalog", label: "Catalog", icon: Pill },
  { href: "/retailer/cart", label: "Cart", icon: ShoppingCart },
  { href: "/retailer/my-orders", label: "My Orders", icon: Package },
];

const supplierNav: NavItem[] = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/deliveries", label: "Deliveries", icon: ClipboardList },
  { href: "/supplier/products", label: "My Products", icon: Boxes },
];

export function getNavForRole(role: Role): NavItem[] {
  if (role === "CLIENT") return clientNav;
  if (role === "RETAILER") return retailerNav;
  if (role === "SUPPLIER") return supplierNav;
  return role === "ADMIN" ? [...staffNav, ...adminNav] : staffNav;
}

/** Longest-prefix match so /retailer/catalog does not match /retailers */
export function isNavActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + "/")) return false;
  const longerMatch = allHrefs.some(
    (other) => other !== href && other.length > href.length && pathname.startsWith(other)
  );
  return !longerMatch;
}
