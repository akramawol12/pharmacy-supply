import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getClients = cache(async () => {
  const clients = await prisma.client.findMany({
    include: {
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((c) => ({
    ...c,
    user: c.user
      ? {
          email: c.user.email,
          emailVerifiedAt: c.user.emailVerifiedAt?.toISOString() ?? null,
        }
      : null,
  }));
});
