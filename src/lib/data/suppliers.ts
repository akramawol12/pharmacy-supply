import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSuppliers = cache(async () => {
  return prisma.supplier.findMany({
    include: {
      _count: { select: { medicines: true } },
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });
});

export const getSupplierOptions = cache(async () => {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});
