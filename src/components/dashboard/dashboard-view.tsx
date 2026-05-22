"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Bell,
  Pill,
} from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import type { DashboardStats } from "@/lib/data/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DashboardCharts = dynamic(
  () => import("./dashboard-charts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 lg:col-span-2 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    ),
  }
);

type StatCard = {
  title: string;
  value: string;
  desc: string;
  icon: typeof DollarSign;
  gradient: string;
  iconBg: string;
};

export function DashboardView({
  stats,
  userName,
}: {
  stats: DashboardStats;
  userName: string;
}) {
  const alertTotal =
    stats.alerts.lowStock + stats.alerts.expiring + stats.alerts.expired;

  const cards: StatCard[] = [
    {
      title: "Total revenue",
      value: formatCurrency(stats.revenue),
      desc: `${stats.totalSales} fulfilled orders · 7 days`,
      icon: DollarSign,
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    },
    {
      title: "Wholesale",
      value: formatCurrency(stats.wholesaleRevenue),
      desc: "B2B & hospital sales",
      icon: TrendingUp,
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Retail",
      value: formatCurrency(stats.retailRevenue),
      desc: "Walk-in & pharmacy shops",
      icon: ShoppingCart,
      gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
      iconBg: "bg-violet-500/20 text-violet-400",
    },
    {
      title: "Stock value",
      value: formatCurrency(stats.stockValue),
      desc: "Estimated inventory on hand",
      icon: Package,
      gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
      iconBg: "bg-teal-500/20 text-teal-400",
    },
    {
      title: "Pending orders",
      value: String(stats.pendingOrders),
      desc: "Need confirmation or fulfillment",
      icon: ShoppingCart,
      gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/20 text-amber-400",
    },
    {
      title: "Alerts",
      value: String(alertTotal),
      desc: `${stats.alerts.lowStock} low · ${stats.alerts.expiring} expiring`,
      icon: AlertTriangle,
      gradient: "from-red-500/20 via-red-500/5 to-transparent",
      iconBg: "bg-red-500/20 text-red-400",
    },
  ];

  const quickLinks = [
    { href: "/inventory", label: "Inventory", icon: Package, color: "hover:border-emerald-500/40" },
    { href: "/orders", label: "Orders", icon: ShoppingCart, color: "hover:border-blue-500/40" },
    { href: "/reports", label: "Reports", icon: BarChart3, color: "hover:border-violet-500/40" },
    { href: "/alerts", label: "Alerts", icon: Bell, color: "hover:border-amber-500/40" },
  ];

  return (
    <div className="space-y-8">
      <section className="dashboard-hero relative overflow-hidden rounded-2xl border border-border/80 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Pill className="h-3.5 w-3.5" />
              PharmaSupply · ETB
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Your pharmacy operations at a glance — revenue, stock health, and live activity.
            </p>
          </div>
          {alertTotal > 0 && (
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
            >
              <AlertTriangle className="h-4 w-4" />
              {alertTotal} alert{alertTotal !== 1 ? "s" : ""} need attention
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface/60 p-4 text-center transition-all",
              q.color
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-accent transition-transform group-hover:scale-105">
              <q.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">{q.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 transition-all duration-200 hover:border-slate-500/50 hover:shadow-lg hover:shadow-black/20",
              "bg-gradient-to-br",
              c.gradient
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  {c.title}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {c.value}
                </p>
                <p className="mt-2 text-xs text-muted leading-relaxed">{c.desc}</p>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  c.iconBg
                )}
              >
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
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
