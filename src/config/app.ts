import type { Role } from "@prisma/client";

export const APP_NAME = "PharmaSupply";
export const CURRENCY = "ETB";
export const LOCALE = "en-ET";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard",
  STAFF: "/dashboard",
  CLIENT: "/catalog",
  SUPPLIER: "/supplier/dashboard",
};

export const DEMO_ACCOUNTS = {
  internal: { email: "admin@pharma.local", password: "password123", label: "Admin" },
  staff: { email: "staff@pharma.local", password: "password123", label: "Staff" },
  client: { email: "clinic@hospital.local", password: "password123", label: "Wholesale client" },
  supplier: { email: "supplier@medicore.local", password: "password123", label: "Supplier" },
} as const;

export const STAFF_ROUTES = [
  "/dashboard",
  "/inventory",
  "/orders",
  "/purchases",
  "/clients",
  "/suppliers",
  "/alerts",
];

export const CLIENT_ROUTES = ["/catalog", "/cart", "/my-orders"];

export const SUPPLIER_ROUTES = ["/supplier"];

export const PUBLIC_PATHS = [
  "/login",
  "/verify-email",
  "/api/auth",
];
