import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ medicines: [], orders: [], pages: [] });
  }

  const medicineWhere = {
    ...(session.user.role === Role.SUPPLIER && session.user.supplierId
      ? { supplierId: session.user.supplierId }
      : {}),
    OR: [
      { name: { contains: q } },
      { category: { contains: q } },
      { manufacturer: { contains: q } },
    ],
  };

  const medicines = await prisma.medicine.findMany({
    where: medicineWhere,
    take: 8,
    select: { id: true, name: true, stockQuantity: true, category: true },
  });

  const pages =
    session.user.role === Role.CLIENT
      ? [
          { href: "/catalog", label: "Catalog" },
          { href: "/cart", label: "Cart" },
          { href: "/my-orders", label: "My Orders" },
        ]
      : session.user.role === Role.SUPPLIER
        ? [
            { href: "/supplier/dashboard", label: "Dashboard" },
            { href: "/supplier/deliveries", label: "Deliveries" },
            { href: "/supplier/products", label: "My Products" },
          ]
        : [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/inventory", label: "Inventory" },
            { href: "/orders", label: "Orders" },
            { href: "/purchases", label: "Purchases" },
            { href: "/suppliers", label: "Suppliers" },
            { href: "/alerts", label: "Alerts" },
            ...(session.user.role === Role.ADMIN ? [{ href: "/clients", label: "Clients" }] : []),
          ];

  const matchedPages = pages.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));

  if (session.user.role === Role.CLIENT || session.user.role === Role.SUPPLIER) {
    return NextResponse.json({ medicines, orders: [], pages: matchedPages });
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { contains: q } },
        { walkInName: { contains: q } },
        { client: { name: { contains: q } } },
      ],
    },
    take: 6,
    select: { id: true, orderNumber: true, status: true, totalAmount: true },
  });

  return NextResponse.json({ medicines, orders, pages: matchedPages });
}
