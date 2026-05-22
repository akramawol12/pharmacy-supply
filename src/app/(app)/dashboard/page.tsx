import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getSetupProgress } from "@/lib/data/setup";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user.role === "CLIENT") redirect("/catalog");
  if (session?.user.role === "RETAILER") redirect("/retailer/catalog");
  if (session?.user.role === "SUPPLIER") redirect("/supplier/dashboard");

  const [stats, setup] = await Promise.all([getDashboardStats(), getSetupProgress()]);

  const userName = session?.user.name ?? "";

  return (
    <div>
      <div className="mb-6">
        <OnboardingChecklist
          steps={setup.steps}
          completed={setup.completed}
          total={setup.total}
        />
      </div>
      <DashboardView stats={stats} userName={userName} />
    </div>
  );
}
