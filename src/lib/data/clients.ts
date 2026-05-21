import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getClients = cache(async () => {
  return prisma.client.findMany({
    include: {
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });
});
