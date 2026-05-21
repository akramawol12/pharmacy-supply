import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPurchases = cache(async (supplierId?: string) => {
  const purchases = await prisma.purchase.findMany({
    where: supplierId ? { supplierId } : undefined,
    include: {
      supplier: { select: { name: true } },
      medicine: { select: { name: true } },
      receivedBy: { select: { name: true } },
    },
    orderBy: { purchaseDate: "desc" },
    take: 200,
  });

  return purchases.map((p) => ({
    ...p,
    purchaseDate: p.purchaseDate.toISOString(),
  }));
});
