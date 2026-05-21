import { auth } from "@/auth";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { AppProviders } from "@/components/providers/app-providers";
import { getAlertCounts } from "@/lib/alerts";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null;

  const isInternal = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const alertCounts = isInternal ? await getAlertCounts() : null;

  return (
    <AppProviders role={session.user.role}>
      <div className="flex min-h-screen">
        <Sidebar role={session.user.role} userName={session.user.name ?? ""} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar role={session.user.role} alertCounts={alertCounts} />
          <main className="flex-1 overflow-auto px-8 pb-8">{children}</main>
        </div>
      </div>
    </AppProviders>
  );
}
