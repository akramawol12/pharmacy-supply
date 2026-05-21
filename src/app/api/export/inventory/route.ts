import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const medicines = await prisma.medicine.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  const headers = [
    "Name",
    "Category",
    "Manufacturer",
    "Retail Price",
    "Wholesale Price",
    "Stock",
    "Low Stock Threshold",
    "Expiry Date",
    "Supplier",
  ];

  const rows = medicines.map((m) =>
    [
      m.name,
      m.category ?? "",
      m.manufacturer ?? "",
      m.retailPrice,
      m.wholesalePrice,
      m.stockQuantity,
      m.lowStockThreshold,
      m.expiryDate?.toISOString().slice(0, 10) ?? "",
      m.supplier?.name ?? "",
    ]
      .map((v) => {
        const s = String(v);
        return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
