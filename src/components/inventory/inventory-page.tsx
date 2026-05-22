"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MedicineOptionField,
  resolveMedicineOption,
} from "./medicine-option-field";

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
  categoryOptions,
  manufacturerOptions,
  isAdmin,
}: {
  initialMedicines: Medicine[];
  initialSuppliers: Supplier[];
  categoryOptions: string[];
  manufacturerOptions: string[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [manufacturerOther, setManufacturerOther] = useState("");

  function resetMetaFields() {
    setCategory("");
    setCategoryOther("");
    setManufacturer("");
    setManufacturerOther("");
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd) as Record<string, string>;
    payload.category = resolveMedicineOption(category, categoryOther) ?? "";
    payload.manufacturer = resolveMedicineOption(manufacturer, manufacturerOther) ?? "";
    delete payload.categoryOther;
    delete payload.manufacturerOther;

    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Medicine added to inventory");
      setShowForm(false);
      resetMetaFields();
      e.currentTarget.reset();
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to add medicine");
    }
  }

  const q = search.toLowerCase();
  const filtered = initialMedicines.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      (m.category?.toLowerCase().includes(q) ?? false) ||
      (m.manufacturer?.toLowerCase().includes(q) ?? false)
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
          <Button
            onClick={() => {
              if (showForm) resetMetaFields();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "Add medicine"}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card className="mt-6 glow-primary">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <Input name="name" required placeholder="e.g. Paracetamol 500mg" />
            </div>
            <MedicineOptionField
              label="Category"
              name="category"
              options={categoryOptions}
              value={category}
              otherValue={categoryOther}
              onValueChange={setCategory}
              onOtherChange={setCategoryOther}
              placeholder="e.g. Specialty compound"
            />
            <MedicineOptionField
              label="Manufacturer"
              name="manufacturer"
              options={manufacturerOptions}
              value={manufacturer}
              otherValue={manufacturerOther}
              onValueChange={setManufacturer}
              onOtherChange={setManufacturerOther}
              placeholder="e.g. Local distributor name"
            />
            <div>
              <Label>Supplier</Label>
              <Select name="supplierId">
                <option value="">—</option>
                {initialSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Retail price (ETB)</Label>
              <Input name="retailPrice" type="number" step="0.01" required />
            </div>
            <div>
              <Label>Wholesale price (ETB)</Label>
              <Input name="wholesalePrice" type="number" step="0.01" required />
            </div>
            <div>
              <Label>Stock quantity</Label>
              <Input name="stockQuantity" type="number" required defaultValue={0} />
            </div>
            <div>
              <Label>Low stock threshold</Label>
              <Input name="lowStockThreshold" type="number" defaultValue={10} />
            </div>
            <div>
              <Label>Expiry date</Label>
              <Input name="expiryDate" type="date" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save medicine</Button>
            </div>
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
              const exp =
                m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 90 * 86400000);
              return (
                <tr
                  key={m.id}
                  className="border-t border-border hover:bg-surface/50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted">
                      {m.category ?? "—"} · {m.manufacturer ?? "—"}
                    </p>
                  </td>
                  <td className="p-4">{m.stockQuantity}</td>
                  <td className="p-4">{formatCurrency(m.retailPrice)}</td>
                  <td className="p-4">{formatCurrency(m.wholesalePrice)}</td>
                  <td className="p-4">{formatDate(m.expiryDate)}</td>
                  <td className="p-4">
                    {low ? (
                      <Badge status="low">Low stock</Badge>
                    ) : exp ? (
                      <Badge status="warning">Expiring</Badge>
                    ) : (
                      <Badge status="ok">OK</Badge>
                    )}
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
