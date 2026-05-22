import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getRetailers = cache(async () => {
  const retailers = await prisma.retailer.findMany({
    include: {
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return retailers.map((r) => ({
    ...r,
    user: r.user
      ? {
          email: r.user.email,
          emailVerifiedAt: r.user.emailVerifiedAt?.toISOString() ?? null,
        }
      : null,
  }));
});
