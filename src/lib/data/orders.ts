import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getOrders = cache(
  async (opts?: { clientId?: string | null; retailerId?: string | null }) => {
  const where = opts?.clientId
    ? { clientId: opts.clientId }
    : opts?.retailerId
      ? { retailerId: opts.retailerId }
      : undefined;

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: { select: { name: true } },
      retailer: { select: { name: true } },
      items: {
        include: { medicine: { select: { name: true } } },
      },
      createdBy: { select: { name: true } },
      statusEvents: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt?.toISOString() ?? null,
    statusEvents: o.statusEvents.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    items: o.items.map((it) => ({
      ...it,
      medicine: it.medicine,
    })),
  }));
  }
);

export const getOrdersList = cache(
  async (opts?: { clientId?: string | null; retailerId?: string | null }) => {
  return getOrders(opts);
  }
);
