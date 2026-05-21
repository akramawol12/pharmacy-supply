import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { purchaseSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const isInternal = hasRole(session.user.role, ADMIN_STAFF);
  const isSupplier = session.user.role === "SUPPLIER" && session.user.supplierId;

  if (!isInternal && !isSupplier) return forbidden();

  const purchases = await prisma.purchase.findMany({
    where: isSupplier ? { supplierId: session.user.supplierId! } : undefined,
    include: {
      supplier: true,
      medicine: true,
      receivedBy: { select: { name: true } },
    },
    orderBy: { purchaseDate: "desc" },
  });

  return NextResponse.json(purchases);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const body = await req.json();
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { supplierId, medicineId, quantityReceived, costPrice } = parsed.data;

  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        supplierId,
        medicineId,
        quantityReceived,
        costPrice,
        receivedById: session.user.id,
      },
      include: { supplier: true, medicine: true },
    });

    await tx.medicine.update({
      where: { id: medicineId },
      data: { stockQuantity: { increment: quantityReceived } },
    });

    return created;
  });

  await logActivity({
    action: "received",
    entity: "purchase",
    entityId: purchase.id,
    details: `${purchase.medicine.name} +${quantityReceived} from ${purchase.supplier.name}`,
    userId: session.user.id,
    userName: session.user.name ?? undefined,
  });

  return NextResponse.json(purchase, { status: 201 });
}
