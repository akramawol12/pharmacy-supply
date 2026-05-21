"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  category: string | null;
  stockQuantity: number;
  wholesalePrice: number;
  expiryDate: string | null;
};

export function SupplierProducts({ initialItems }: { initialItems: Item[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {initialItems.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-surface p-4">
          <p className="font-bold">{m.name}</p>
          <p className="text-sm text-muted">{m.category ?? "—"}</p>
          <p className="mt-2 text-accent font-semibold">{formatCurrency(m.wholesalePrice)} wholesale</p>
          <p className="text-xs text-muted mt-1">Stock: {m.stockQuantity} · Exp: {formatDate(m.expiryDate)}</p>
          <Badge status={m.stockQuantity > 10 ? "ok" : "low"} className="mt-2">
            {m.stockQuantity > 10 ? "In stock" : "Low at pharmacy"}
          </Badge>
        </div>
      ))}
      {initialItems.length === 0 && (
        <p className="text-muted">No products linked to your supplier account.</p>
      )}
    </div>
  );
}
