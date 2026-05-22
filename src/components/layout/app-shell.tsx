import { getAppSession } from "@/lib/session";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { TopBar } from "./top-bar";
import { AppProviders } from "@/components/providers/app-providers";
import { getAlertCounts } from "@/lib/alerts";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  if (!session?.user) return null;

  const isInternal = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const alertCounts = isInternal ? await getAlertCounts() : null;

  return (
    <AppProviders role={session.user.role}>
      <div className="flex min-h-screen">
        <Sidebar role={session.user.role} userName={session.user.name ?? ""} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar role={session.user.role} alertCounts={alertCounts} />
          <main className="flex-1 overflow-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-0">
            {children}
          </main>
        </div>
        <MobileNav role={session.user.role} />
      </div>
    </AppProviders>
  );
}
