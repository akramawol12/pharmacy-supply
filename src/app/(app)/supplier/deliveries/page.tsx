import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPurchases } from "@/lib/data/purchases";
import { SupplierDeliveries } from "@/components/supplier/supplier-deliveries";

export default async function SupplierDeliveriesPage() {
  const session = await auth();
  if (!session?.user.supplierId) redirect("/login");

  const purchases = await getPurchases(session.user.supplierId);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
      <p className="mt-1 text-muted">Stock received by the pharmacy from your company</p>
      <div className="mt-8">
        <SupplierDeliveries initialPurchases={purchases} />
      </div>
    </div>
  );
}
