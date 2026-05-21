import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getAlertCounts } from "@/lib/alerts";
import { OrderStatus, OrderType } from "@prisma/client";

function last7Days() {
  const days: { label: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    days.push({
      label: d.toLocaleDateString("en-ET", { weekday: "short" }),
      start: d,
      end,
    });
  }
  return days;
}

export const getDashboardStats = cache(async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [fulfilled, pendingOrders, medicines, recentActivity, statusGroups, alerts] =
    await Promise.all([
      prisma.order.findMany({
        where: { status: OrderStatus.FULFILLED, createdAt: { gte: sevenDaysAgo } },
        select: { totalAmount: true, orderType: true, createdAt: true },
      }),
      prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] } },
      }),
      prisma.medicine.findMany({
        select: { stockQuantity: true, retailPrice: true, wholesalePrice: true, category: true },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          action: true,
          entity: true,
          details: true,
          userName: true,
          createdAt: true,
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      getAlertCounts(),
    ]);

  const stockValue = medicines.reduce(
    (sum, m) => sum + m.stockQuantity * ((m.retailPrice + m.wholesalePrice) / 2),
    0
  );

  const revenue = fulfilled.reduce((s, o) => s + o.totalAmount, 0);
  const wholesaleRevenue = fulfilled
    .filter((o) => o.orderType === OrderType.WHOLESALE)
    .reduce((s, o) => s + o.totalAmount, 0);
  const retailRevenue = fulfilled
    .filter((o) => o.orderType === OrderType.RETAIL)
    .reduce((s, o) => s + o.totalAmount, 0);

  const revenueByDay = last7Days().map((day) => {
    const dayOrders = fulfilled.filter((o) => {
      const t = new Date(o.createdAt);
      return t >= day.start && t <= day.end;
    });
    return {
      day: day.label,
      wholesale: dayOrders
        .filter((o) => o.orderType === OrderType.WHOLESALE)
        .reduce((s, o) => s + o.totalAmount, 0),
      retail: dayOrders
        .filter((o) => o.orderType === OrderType.RETAIL)
        .reduce((s, o) => s + o.totalAmount, 0),
    };
  });

  const statusMap = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all])
  ) as Record<string, number>;

  const categoryMap = new Map<string, number>();
  for (const m of medicines) {
    const cat = m.category ?? "Other";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + m.stockQuantity);
  }

  return {
    totalSales: fulfilled.length,
    revenue,
    wholesaleRevenue,
    retailRevenue,
    stockValue,
    pendingOrders,
    alerts,
    revenueByDay,
    statusBreakdown: {
      pending: statusMap[OrderStatus.PENDING] ?? 0,
      confirmed: statusMap[OrderStatus.CONFIRMED] ?? 0,
      fulfilled: statusMap[OrderStatus.FULFILLED] ?? 0,
      cancelled: statusMap[OrderStatus.CANCELLED] ?? 0,
    },
    stockByCategory: Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    recentActivity: recentActivity.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  };
});

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
