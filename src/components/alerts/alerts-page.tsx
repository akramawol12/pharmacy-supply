"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type AlertsData = {
  counts: { lowStock: number; expiring: number; expired: number };
  lowStock: { id: string; name: string; stockQuantity: number; lowStockThreshold: number }[];
  expiring: { id: string; name: string; expiryDate: string | null; stockQuantity: number }[];
};

export function AlertsPage({ data }: { data: AlertsData }) {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardTitle className="text-danger">{data.counts.lowStock}</CardTitle><p className="text-sm text-muted">Low stock items</p></Card>
        <Card><CardTitle className="text-warning">{data.counts.expiring}</CardTitle><p className="text-sm text-muted">Expiring within 90 days</p></Card>
        <Card><CardTitle className="text-danger">{data.counts.expired}</CardTitle><p className="text-sm text-muted">Expired</p></Card>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Low stock</h2>
        <div className="space-y-2">
          {data.lowStock.map((m) => (
            <Card key={m.id} className="flex items-center justify-between py-3">
              <span className="font-medium">{m.name}</span>
              <Badge status="low">{m.stockQuantity} / {m.lowStockThreshold}</Badge>
            </Card>
          ))}
          {data.lowStock.length === 0 && <p className="text-muted">No low stock alerts</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Expiry warnings</h2>
        <div className="space-y-2">
          {data.expiring.map((m) => (
            <Card key={m.id} className="flex items-center justify-between py-3">
              <span className="font-medium">{m.name}</span>
              <Badge status="warning">{formatDate(m.expiryDate)} · {m.stockQuantity} in stock</Badge>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
