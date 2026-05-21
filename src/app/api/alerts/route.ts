import { NextResponse } from "next/server";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { getLowStockMedicines, getExpiryWarnings, getAlertCounts } from "@/lib/alerts";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const [counts, lowStock, expiring] = await Promise.all([
    getAlertCounts(),
    getLowStockMedicines(),
    getExpiryWarnings(),
  ]);

  return NextResponse.json({ counts, lowStock, expiring });
}
