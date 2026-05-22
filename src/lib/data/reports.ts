import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export const getReportsData = cache(async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [fulfilledOrders, topMedicines, unpaidOrders, purchaseRows] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: OrderStatus.FULFILLED,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        totalAmount: true,
        orderType: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["medicineId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 10,
    }),
    prisma.order.count({
      where: {
        status: { in: [OrderStatus.FULFILLED, OrderStatus.CONFIRMED] },
        paymentStatus: { not: "PAID" },
      },
    }),
    prisma.purchase.findMany({
      where: { purchaseDate: { gte: thirtyDaysAgo } },
      select: { quantityReceived: true, costPrice: true },
    }),
  ]);

  const medicineIds = topMedicines.map((t) => t.medicineId);
  const medicineNames = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(medicineNames.map((m) => [m.id, m.name]));

  const purchaseSpend = purchaseRows.reduce(
    (s, p) => s + p.quantityReceived * p.costPrice,
    0
  );

  const revenue = fulfilledOrders.reduce((s, o) => s + o.totalAmount, 0);
  const paidRevenue = fulfilledOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + o.totalAmount, 0);

  return {
    periodDays: 30,
    revenue,
    paidRevenue,
    orderCount: fulfilledOrders.length,
    unpaidOrders,
    purchaseSpend,
    topProducts: topMedicines.map((t) => ({
      name: nameMap[t.medicineId] ?? "Unknown",
      quantity: t._sum.quantity ?? 0,
      revenue: t._sum.subtotal ?? 0,
    })),
    byType: {
      wholesale: fulfilledOrders
        .filter((o) => o.orderType === "WHOLESALE")
        .reduce((s, o) => s + o.totalAmount, 0),
      retail: fulfilledOrders
        .filter((o) => o.orderType === "RETAIL")
        .reduce((s, o) => s + o.totalAmount, 0),
    },
  };
});
