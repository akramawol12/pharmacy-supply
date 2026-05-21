import { getClients } from "@/lib/data/clients";
import { ClientsPage } from "@/components/clients/clients-page";

export default async function ClientsRoute() {
  const clients = await getClients();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
      <p className="mt-1 text-muted">Manage wholesale buyers and portal access</p>
      <div className="mt-8">
        <ClientsPage initialClients={clients} />
      </div>
    </div>
  );
}
