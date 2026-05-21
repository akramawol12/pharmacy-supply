import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export const ADMIN_STAFF: Role[] = [Role.ADMIN, Role.STAFF];
export const ADMIN_ONLY: Role[] = [Role.ADMIN];
export const INTERNAL_ROLES: Role[] = [Role.ADMIN, Role.STAFF];
export const SUPPLIER_ROLE: Role[] = [Role.SUPPLIER];
