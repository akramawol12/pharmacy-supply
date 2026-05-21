import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMedicinesForRole } from "@/lib/data/medicines";
import { SupplierProducts } from "@/components/supplier/supplier-products";

export default async function SupplierProductsPage() {
  const session = await auth();
  if (!session?.user.supplierId) redirect("/login");

  const items = await getMedicinesForRole("SUPPLIER", session.user.supplierId);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My products</h1>
      <p className="mt-1 text-muted">Medicines you supply to this pharmacy</p>
      <div className="mt-8">
        <SupplierProducts initialItems={items} />
      </div>
    </div>
  );
}
