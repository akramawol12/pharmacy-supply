import { auth } from "@/auth";
import { getMedicinesForRole } from "@/lib/data/medicines";
import { getOrdersList } from "@/lib/data/orders";
import { OrdersPage } from "@/components/orders/orders-page";

export default async function OrdersRoute() {
  const session = await auth();
  const [orders, medicines] = await Promise.all([
    getOrdersList(),
    getMedicinesForRole(session!.user.role, session!.user.supplierId),
  ]);

  const medicineOptions = medicines.map((m) => ({
    id: m.id,
    name: m.name,
    retailPrice: m.retailPrice,
    wholesalePrice: m.wholesalePrice,
    stockQuantity: m.stockQuantity,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      <p className="mt-1 text-muted">Process manual sales and fulfill online orders</p>
      <div className="mt-8">
        <OrdersPage initialOrders={orders} initialMedicines={medicineOptions} />
      </div>
    </div>
  );
}
