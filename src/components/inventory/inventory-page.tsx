"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

type Medicine = {
  id: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  retailPrice: number;
  wholesalePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  expiryDate: string | null;
  supplier: { id: string; name: string } | null;
};

type Supplier = { id: string; name: string };

export function InventoryPage({
  initialMedicines,
  initialSuppliers,
  isAdmin,
}: {
  initialMedicines: Medicine[];
  initialSuppliers: Supplier[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    if (res.ok) {
      toast.success("Medicine added to inventory");
      setShowForm(false);
      e.currentTarget.reset();
      router.refresh();
    } else {
      toast.error("Failed to add medicine");
    }
  }

  const filtered = initialMedicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search medicines…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add medicine"}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card className="mt-6 glow-primary">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Category</Label><Input name="category" /></div>
            <div><Label>Manufacturer</Label><Input name="manufacturer" /></div>
            <div>
              <Label>Supplier</Label>
              <Select name="supplierId">
                <option value="">—</option>
                {initialSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div><Label>Retail price (ETB)</Label><Input name="retailPrice" type="number" step="0.01" required /></div>
            <div><Label>Wholesale price (ETB)</Label><Input name="wholesalePrice" type="number" step="0.01" required /></div>
            <div><Label>Stock quantity</Label><Input name="stockQuantity" type="number" required defaultValue={0} /></div>
            <div><Label>Low stock threshold</Label><Input name="lowStockThreshold" type="number" defaultValue={10} /></div>
            <div><Label>Expiry date</Label><Input name="expiryDate" type="date" /></div>
            <div className="sm:col-span-2"><Button type="submit">Save medicine</Button></div>
          </form>
        </Card>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-4">Medicine</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Retail</th>
              <th className="p-4">Wholesale</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const low = m.stockQuantity <= m.lowStockThreshold;
              const exp = m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 90 * 86400000);
              return (
                <tr key={m.id} className="border-t border-border hover:bg-surface/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted">{m.category} · {m.manufacturer}</p>
                  </td>
                  <td className="p-4">{m.stockQuantity}</td>
                  <td className="p-4">{formatCurrency(m.retailPrice)}</td>
                  <td className="p-4">{formatCurrency(m.wholesalePrice)}</td>
                  <td className="p-4">{formatDate(m.expiryDate)}</td>
                  <td className="p-4">
                    {low ? <Badge status="low">Low stock</Badge> : exp ? <Badge status="warning">Expiring</Badge> : <Badge status="ok">OK</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
