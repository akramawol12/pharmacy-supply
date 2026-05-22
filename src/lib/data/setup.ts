import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSetupProgress = cache(async () => {
  const [medicines, suppliers, clients, retailers, orders] = await Promise.all([
    prisma.medicine.count(),
    prisma.supplier.count(),
    prisma.client.count(),
    prisma.retailer.count(),
    prisma.order.count(),
  ]);

  const steps = [
    { id: "supplier", label: "Add a supplier", done: suppliers > 0, href: "/suppliers" },
    { id: "medicine", label: "Add medicines to inventory", done: medicines > 0, href: "/inventory" },
    { id: "client", label: "Register a wholesale client", done: clients > 0, href: "/clients" },
    { id: "retailer", label: "Register a retailer", done: retailers > 0, href: "/retailers" },
    { id: "order", label: "Record your first order", done: orders > 0, href: "/orders" },
  ];

  const completed = steps.filter((s) => s.done).length;

  return { steps, completed, total: steps.length, allDone: completed === steps.length };
});
