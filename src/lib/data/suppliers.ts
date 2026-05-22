import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSuppliers = cache(async () => {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { medicines: true } },
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return suppliers.map((s) => ({
    ...s,
    user: s.user
      ? {
          email: s.user.email,
          emailVerifiedAt: s.user.emailVerifiedAt?.toISOString() ?? null,
        }
      : null,
  }));
});

export const getSupplierOptions = cache(async () => {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});
