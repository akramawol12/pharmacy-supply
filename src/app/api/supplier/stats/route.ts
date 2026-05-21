import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.SUPPLIER || !session.user.supplierId) return forbidden();

  const supplierId = session.user.supplierId;
  const supplier = await prisma.supplier.findUniqueOrThrow({ where: { id: supplierId } });

  const [productCount, purchases] = await Promise.all([
    prisma.medicine.count({ where: { supplierId } }),
    prisma.purchase.findMany({
      where: { supplierId },
      select: { quantityReceived: true, costPrice: true },
    }),
  ]);

  const totalValue = purchases.reduce((s, p) => s + p.quantityReceived * p.costPrice, 0);

  return NextResponse.json({
    supplierName: supplier.name,
    productCount,
    deliveryCount: purchases.length,
    totalValue,
  });
}
