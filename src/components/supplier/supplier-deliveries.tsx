"use client";

import { formatCurrency, formatDate } from "@/lib/utils";

type Purchase = {
  id: string;
  quantityReceived: number;
  costPrice: number;
  purchaseDate: string;
  medicine: { name: string };
  receivedBy: { name: string } | null;
};

export function SupplierDeliveries({ initialPurchases }: { initialPurchases: Purchase[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-muted">
          <tr>
            <th className="p-4">Date</th>
            <th className="p-4">Medicine</th>
            <th className="p-4">Qty</th>
            <th className="p-4">Unit cost (ETB)</th>
            <th className="p-4">Received by</th>
          </tr>
        </thead>
        <tbody>
          {initialPurchases.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="p-4">{formatDate(p.purchaseDate)}</td>
              <td className="p-4 font-medium">{p.medicine.name}</td>
              <td className="p-4">{p.quantityReceived}</td>
              <td className="p-4">{formatCurrency(p.costPrice)}</td>
              <td className="p-4">{p.receivedBy?.name ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialPurchases.length === 0 && (
        <p className="p-8 text-center text-muted">No deliveries recorded yet.</p>
      )}
    </div>
  );
}
