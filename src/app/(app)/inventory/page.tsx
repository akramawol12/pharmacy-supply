import { auth } from "@/auth";
import { InventoryPage } from "@/components/inventory/inventory-page";
import { getMedicinesForRole } from "@/lib/data/medicines";
import { getMedicineOptionLists } from "@/lib/data/medicine-options";
import { getSupplierOptions } from "@/lib/data/suppliers";

export default async function InventoryRoute() {
  const session = await auth();
  const [medicines, suppliers, optionLists] = await Promise.all([
    getMedicinesForRole(session!.user.role, session!.user.supplierId),
    getSupplierOptions(),
    getMedicineOptionLists(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
      <p className="mt-1 text-muted">Medicine catalog and stock levels</p>
      <div className="mt-8">
        <InventoryPage
          initialMedicines={medicines}
          initialSuppliers={suppliers}
          categoryOptions={optionLists.categories}
          manufacturerOptions={optionLists.manufacturers}
          isAdmin={session?.user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
