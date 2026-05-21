import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSupplierStats } from "@/lib/data/supplier";
import { SupplierDashboard } from "@/components/supplier/supplier-dashboard";

export default async function SupplierDashboardPage() {
  const session = await auth();
  if (!session?.user.supplierId) redirect("/login");

  const stats = await getSupplierStats(session.user.supplierId);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Supplier dashboard</h1>
      <p className="mt-1 text-muted">Your deliveries and product catalog · ETB</p>
      <div className="mt-8">
        <SupplierDashboard stats={stats} />
      </div>
    </div>
  );
}
