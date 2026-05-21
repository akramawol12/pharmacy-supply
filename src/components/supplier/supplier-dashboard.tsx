"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Package, Truck, Pill } from "lucide-react";

type Stats = {
  productCount: number;
  deliveryCount: number;
  totalValue: number;
  supplierName: string;
};

export function SupplierDashboard({ stats }: { stats: Stats }) {
  const cards = [
    { title: "Products supplied", value: String(stats.productCount), icon: Pill, desc: "Medicines linked to you" },
    { title: "Deliveries recorded", value: String(stats.deliveryCount), icon: Truck, desc: "Inbound shipments" },
    { title: "Delivery value", value: formatCurrency(stats.totalValue), icon: Package, desc: "Total ETB received" },
  ];

  return (
    <div>
      <p className="text-muted mb-6">
        Welcome, <span className="text-foreground font-semibold">{stats.supplierName}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="glow-accent">
            <CardDescription>{c.title}</CardDescription>
            <CardTitle className="mt-2 text-2xl">{c.value}</CardTitle>
            <p className="mt-2 text-xs text-muted">{c.desc}</p>
            <c.icon className="mt-3 h-6 w-6 text-accent opacity-70" />
          </Card>
        ))}
      </div>
    </div>
  );
}
