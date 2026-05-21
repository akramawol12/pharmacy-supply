import { auth } from "@/auth";
import { getSuppliers } from "@/lib/data/suppliers";
import { SuppliersPage } from "@/components/suppliers/suppliers-page";

export default async function SuppliersRoute() {
  const session = await auth();
  const suppliers = await getSuppliers();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
      <p className="mt-1 text-muted">Vendor directory for purchasing</p>
      <div className="mt-8">
        <SuppliersPage isAdmin={session?.user.role === "ADMIN"} initialSuppliers={suppliers} />
      </div>
    </div>
  );
}
