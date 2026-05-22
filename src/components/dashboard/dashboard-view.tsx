"use client";

import dynamic from "next/dynamic";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import type { DashboardStats } from "@/lib/data/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardCharts = dynamic(
  () => import("./dashboard-charts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    ),
  }
);

export function DashboardView({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total revenue",
      value: formatCurrency(stats.revenue),
      desc: `${stats.totalSales} fulfilled orders (7d)`,
      icon: DollarSign,
      accent: "text-accent",
    },
    {
      title: "Wholesale revenue",
      value: formatCurrency(stats.wholesaleRevenue),
      desc: "B2B sales",
      icon: TrendingUp,
      accent: "text-primary",
    },
    {
      title: "Retail revenue",
      value: formatCurrency(stats.retailRevenue),
      desc: "Walk-in & in-store",
      icon: ShoppingCart,
      accent: "text-primary",
    },
    {
      title: "Stock value",
      value: formatCurrency(stats.stockValue),
      desc: "Estimated inventory value",
      icon: Package,
      accent: "text-accent",
    },
    {
      title: "Pending orders",
      value: String(stats.pendingOrders),
      desc: "Awaiting fulfillment",
      icon: ShoppingCart,
      accent: "text-warning",
    },
    {
      title: "Alerts",
      value: String(stats.alerts.lowStock + stats.alerts.expiring + stats.alerts.expired),
      desc: `${stats.alerts.lowStock} low · ${stats.alerts.expiring} expiring · ${stats.alerts.expired} expired`,
      icon: AlertTriangle,
      accent: "text-danger",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="glow-accent">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>{c.title}</CardDescription>
                <CardTitle className="mt-2 text-2xl">{c.value}</CardTitle>
                <p className="mt-2 text-xs text-muted">{c.desc}</p>
              </div>
              <c.icon className={`h-8 w-8 ${c.accent} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      <DashboardCharts
        revenueByDay={stats.revenueByDay}
        statusBreakdown={stats.statusBreakdown}
        stockByCategory={stats.stockByCategory}
      />

      <ActivityFeed items={stats.recentActivity} />
    </div>
  );
}
