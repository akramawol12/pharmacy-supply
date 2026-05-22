import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActivityLogs } from "@/lib/data/activity";
import { ActivityPageView } from "@/components/activity/activity-page";

export default async function ActivityRoute() {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "STAFF") {
    redirect("/dashboard");
  }

  const items = await getActivityLogs(100);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Activity log</h1>
      <p className="mt-1 text-muted">Who did what — orders, stock, payments, and more</p>
      <ActivityPageView items={items} />
    </div>
  );
}
