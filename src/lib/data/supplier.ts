import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSupplierStats = cache(async (supplierId: string) => {
  const supplier = await prisma.supplier.findUniqueOrThrow({
    where: { id: supplierId },
    select: { name: true },
  });

  const [productCount, purchases] = await Promise.all([
    prisma.medicine.count({ where: { supplierId } }),
    prisma.purchase.findMany({
      where: { supplierId },
      select: { quantityReceived: true, costPrice: true },
    }),
  ]);

  const totalValue = purchases.reduce((s, p) => s + p.quantityReceived * p.costPrice, 0);

  return {
    supplierName: supplier.name,
    productCount,
    deliveryCount: purchases.length,
    totalValue,
  };
});
