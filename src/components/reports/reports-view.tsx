"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Package, AlertCircle, TrendingUp } from "lucide-react";

type ReportsData = {
  periodDays: number;
  revenue: number;
  paidRevenue: number;
  orderCount: number;
  unpaidOrders: number;
  purchaseSpend: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  byType: { wholesale: number; retail: number };
};

export function ReportsView({ data }: { data: ReportsData }) {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardDescription>Revenue ({data.periodDays}d)</CardDescription>
          <CardTitle className="mt-2 text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-accent" />
            {formatCurrency(data.revenue)}
          </CardTitle>
          <p className="text-xs text-muted mt-2">{data.orderCount} fulfilled orders</p>
        </Card>
        <Card>
          <CardDescription>Collected (paid)</CardDescription>
          <CardTitle className="mt-2 text-2xl">{formatCurrency(data.paidRevenue)}</CardTitle>
          <p className="text-xs text-muted mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {data.unpaidOrders} orders awaiting payment
          </p>
        </Card>
        <Card>
          <CardDescription>Wholesale vs retail</CardDescription>
          <CardTitle className="mt-2 text-lg">
            <span className="text-primary">{formatCurrency(data.byType.wholesale)}</span>
            <span className="text-muted mx-2">/</span>
            <span className="text-accent">{formatCurrency(data.byType.retail)}</span>
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Purchase spend ({data.periodDays}d)</CardDescription>
          <CardTitle className="mt-2 text-2xl flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {formatCurrency(data.purchaseSpend)}
          </CardTitle>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <CardTitle>Top products</CardTitle>
        </div>
        <CardDescription>By revenue (last {data.periodDays} days)</CardDescription>
        <ul className="mt-4 space-y-2">
          {data.topProducts.map((p, i) => (
            <li
              key={i}
              className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0"
            >
              <span>
                <span className="text-muted mr-2">#{i + 1}</span>
                {p.name}
              </span>
              <span className="text-muted">
                {p.quantity} sold · {formatCurrency(p.revenue)}
              </span>
            </li>
          ))}
          {data.topProducts.length === 0 && (
            <p className="text-sm text-muted">No sales data yet</p>
          )}
        </ul>
      </Card>
    </div>
  );
}
