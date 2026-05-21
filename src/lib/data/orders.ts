import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getOrders = cache(async (clientId?: string | null) => {
  const orders = await prisma.order.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: { select: { name: true } },
      items: {
        include: { medicine: { select: { name: true } } },
      },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it) => ({
      ...it,
      medicine: it.medicine,
    })),
  }));
});

export const getOrdersList = cache(async (clientId?: string | null) => {
  const orders = await getOrders(clientId);
  return orders;
});
