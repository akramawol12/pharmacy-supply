import { AlertsPage } from "@/components/alerts/alerts-page";
import { getAlertsPageData } from "@/lib/data/alerts";

export default async function AlertsRoute() {
  const data = await getAlertsPageData();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
      <p className="mt-1 text-muted">Low stock and expiry warnings</p>
      <AlertsPage data={data} />
    </div>
  );
}
