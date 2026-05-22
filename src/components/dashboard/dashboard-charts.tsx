"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatChartCurrency } from "@/lib/utils";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

type Props = {
  revenueByDay: { day: string; wholesale: number; retail: number }[];
  statusBreakdown: { pending: number; confirmed: number; fulfilled: number; cancelled: number };
  stockByCategory: { name: string; value: number }[];
};

export function DashboardCharts({ revenueByDay, statusBreakdown, stockByCategory }: Props) {
  const orderPie = [
    { name: "Pending", value: statusBreakdown.pending },
    { name: "Confirmed", value: statusBreakdown.confirmed },
    { name: "Fulfilled", value: statusBreakdown.fulfilled },
    { name: "Cancelled", value: statusBreakdown.cancelled },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2 border-border/80 bg-surface/80 backdrop-blur-sm">
        <CardTitle>Revenue trend (7 days)</CardTitle>
        <CardDescription>Wholesale vs retail fulfilled orders</CardDescription>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="wholesale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="retail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => formatChartCurrency(v)} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                formatter={(v: number) => [formatChartCurrency(v), ""]}
              />
              <Legend />
              <Area type="monotone" dataKey="wholesale" stroke="#10b981" fill="url(#wholesale)" name="Wholesale" />
              <Area type="monotone" dataKey="retail" stroke="#3b82f6" fill="url(#retail)" name="Retail" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border/80 bg-surface/80 backdrop-blur-sm">
        <CardTitle>Order status</CardTitle>
        <CardDescription>Pipeline breakdown</CardDescription>
        <div className="mt-4 h-56 flex items-center justify-center">
          {orderPie.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {orderPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">No orders yet</p>
          )}
        </div>
      </Card>

      <Card className="border-border/80 bg-surface/80 backdrop-blur-sm">
        <CardTitle>Stock by category</CardTitle>
        <CardDescription>Units on hand</CardDescription>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
