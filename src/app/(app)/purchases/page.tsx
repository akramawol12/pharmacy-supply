import { getPurchases } from "@/lib/data/purchases";
import { getMedicinesForRole } from "@/lib/data/medicines";
import { getSupplierOptions } from "@/lib/data/suppliers";
import { PurchasesPage } from "@/components/purchases/purchases-page";

export default async function PurchasesRoute() {
  const [purchases, suppliers, medicines] = await Promise.all([
    getPurchases(),
    getSupplierOptions(),
    getMedicinesForRole("ADMIN"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
      <p className="mt-1 text-muted">Record supplier deliveries — stock updates automatically</p>
      <div className="mt-8">
        <PurchasesPage
          initialPurchases={purchases}
          initialSuppliers={suppliers}
          initialMedicines={medicines.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>
    </div>
  );
}
