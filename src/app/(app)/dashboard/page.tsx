import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardStats } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user.role === "CLIENT") redirect("/catalog");
  if (session?.user.role === "RETAILER") redirect("/retailer/catalog");
  if (session?.user.role === "SUPPLIER") redirect("/supplier/dashboard");

  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted">Overview of sales, stock, and alerts · ETB</p>
      <DashboardView stats={stats} />
    </div>
  );
}
