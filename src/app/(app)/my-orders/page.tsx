import { auth } from "@/auth";
import { getOrders } from "@/lib/data/orders";
import { MyOrdersPage } from "@/components/client/my-orders-page";

export default async function MyOrdersRoute() {
  const session = await auth();
  const orders = await getOrders(session?.user.clientId);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My orders</h1>
      <p className="mt-1 text-muted">Track your wholesale order status</p>
      <MyOrdersPage initialOrders={orders} />
    </div>
  );
}
