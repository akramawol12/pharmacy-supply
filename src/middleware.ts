import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  CLIENT_ROUTES,
  PUBLIC_PATHS,
  RETAILER_ROUTES,
  ROLE_HOME,
  STAFF_ROUTES,
  SUPPLIER_ROUTES,
} from "@/config/app";
import type { Role } from "@prisma/client";

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

function homeForRole(role: string | undefined) {
  if (!role) return "/login";
  return ROLE_HOME[role as Role] ?? "/dashboard";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie:
      process.env.NODE_ENV === "production" || req.nextUrl.protocol === "https:",
  });

  const isLoggedIn = !!token;
  const role = token?.role as Role | undefined;

  if (!isLoggedIn && !isPublic(pathname)) {
    const login = new URL("/login", req.nextUrl.origin);
    if (pathname !== "/") {
      login.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(login);
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl.origin));
  }

  if (isLoggedIn && role) {
    if (role === "CLIENT" && matchesAny(pathname, [...STAFF_ROUTES, ...RETAILER_ROUTES, ...SUPPLIER_ROUTES])) {
      return NextResponse.redirect(new URL("/catalog", req.nextUrl.origin));
    }

    if (role === "RETAILER" && matchesAny(pathname, [...STAFF_ROUTES, ...CLIENT_ROUTES, ...SUPPLIER_ROUTES])) {
      return NextResponse.redirect(new URL("/retailer/catalog", req.nextUrl.origin));
    }

    if (role === "SUPPLIER" && matchesAny(pathname, [...STAFF_ROUTES, ...CLIENT_ROUTES, ...RETAILER_ROUTES])) {
      return NextResponse.redirect(new URL("/supplier/dashboard", req.nextUrl.origin));
    }

    if (role === "STAFF" && (pathname.startsWith("/clients") || pathname.startsWith("/retailers"))) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    if (
      (role === "ADMIN" || role === "STAFF") &&
      matchesAny(pathname, [...CLIENT_ROUTES, ...RETAILER_ROUTES, ...SUPPLIER_ROUTES])
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    if (role === "CLIENT" && matchesAny(pathname, [...SUPPLIER_ROUTES, ...RETAILER_ROUTES])) {
      return NextResponse.redirect(new URL("/catalog", req.nextUrl.origin));
    }

    if (role === "RETAILER" && matchesAny(pathname, [...CLIENT_ROUTES, ...SUPPLIER_ROUTES])) {
      return NextResponse.redirect(new URL("/retailer/catalog", req.nextUrl.origin));
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
