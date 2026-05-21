import { NextResponse } from "next/server";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { getDashboardStats } from "@/lib/data/dashboard";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
