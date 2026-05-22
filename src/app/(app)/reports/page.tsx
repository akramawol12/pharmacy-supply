import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getReportsData } from "@/lib/data/reports";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "STAFF") {
    redirect("/dashboard");
  }

  const data = await getReportsData();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <p className="mt-1 text-muted">Sales, payments, and top products · ETB</p>
      <ReportsView data={data} />
    </div>
  );
}
