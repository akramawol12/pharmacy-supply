"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

type Purchase = {
  id: string;
  quantityReceived: number;
  costPrice: number;
  purchaseDate: string;
  supplier: { name: string };
  medicine: { name: string };
  receivedBy: { name: string } | null;
};

export function PurchasesPage({
  initialPurchases,
  initialSuppliers,
  initialMedicines,
}: {
  initialPurchases: Purchase[];
  initialSuppliers: { id: string; name: string }[];
  initialMedicines: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) {
      toast.success("Purchase recorded — stock updated");
      setShowForm(false);
      e.currentTarget.reset();
      router.refresh();
    } else {
      toast.error("Failed to record purchase");
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Record purchase"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Supplier</Label>
              <Select name="supplierId" required>
                <option value="">Select</option>
                {initialSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Medicine</Label>
              <Select name="medicineId" required>
                <option value="">Select</option>
                {initialMedicines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </div>
            <div><Label>Quantity received</Label><Input name="quantityReceived" type="number" min={1} required /></div>
            <div><Label>Cost price ETB (unit)</Label><Input name="costPrice" type="number" step="0.01" required /></div>
            <div className="sm:col-span-2"><Button type="submit">Save & update stock</Button></div>
          </form>
        </Card>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Medicine</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Received by</th>
            </tr>
          </thead>
          <tbody>
            {initialPurchases.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-4">{formatDate(p.purchaseDate)}</td>
                <td className="p-4">{p.supplier.name}</td>
                <td className="p-4">{p.medicine.name}</td>
                <td className="p-4">{p.quantityReceived}</td>
                <td className="p-4">{formatCurrency(p.costPrice)}</td>
                <td className="p-4">{p.receivedBy?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
