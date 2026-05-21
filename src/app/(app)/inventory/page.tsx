import { auth } from "@/auth";
import { InventoryPage } from "@/components/inventory/inventory-page";
import { getMedicinesForRole } from "@/lib/data/medicines";
import { getSupplierOptions } from "@/lib/data/suppliers";

export default async function InventoryRoute() {
  const session = await auth();
  const [medicines, suppliers] = await Promise.all([
    getMedicinesForRole(session!.user.role, session!.user.supplierId),
    getSupplierOptions(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
      <p className="mt-1 text-muted">Medicine catalog and stock levels</p>
      <div className="mt-8">
        <InventoryPage
          initialMedicines={medicines}
          initialSuppliers={suppliers}
          isAdmin={session?.user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
