import { getAppSession } from "@/lib/session";
import { BottomNav } from "./bottom-nav";
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
      <div className="flex min-h-screen flex-col">
        <TopBar
          role={session.user.role}
          userName={session.user.name ?? ""}
          alertCounts={alertCounts}
        />
        <main className="mx-auto w-full max-w-4xl flex-1 overflow-auto px-4 pb-28 pt-4">
          {children}
        </main>
        <BottomNav role={session.user.role} />
      </div>
    </AppProviders>
  );
}
