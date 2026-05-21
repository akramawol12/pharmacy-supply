"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type Order = {
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { quantity: number; medicine: { name: string }; unitPrice: number }[];
};

export function MyOrdersPage({ initialOrders }: { initialOrders: Order[] }) {
  const statusMap: Record<string, "pending" | "confirmed" | "fulfilled" | "cancelled"> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    FULFILLED: "fulfilled",
    CANCELLED: "cancelled",
  };

  return (
    <div className="mt-6 space-y-4">
      {initialOrders.map((o) => (
        <Card key={o.orderNumber}>
          <div className="flex justify-between">
            <div>
              <p className="font-bold">{o.orderNumber}</p>
              <p className="text-sm text-muted">{formatDate(o.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-accent">{formatCurrency(o.totalAmount)}</p>
              <Badge status={statusMap[o.status] ?? "pending"}>{o.status.toLowerCase()}</Badge>
            </div>
          </div>
          <ul className="mt-3 text-sm text-muted">
            {o.items.map((it, i) => (
              <li key={i}>{it.medicine.name} × {it.quantity}</li>
            ))}
          </ul>
        </Card>
      ))}
      {initialOrders.length === 0 && <p className="text-muted">No orders yet.</p>}
    </div>
  );
}
