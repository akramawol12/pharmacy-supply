import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const newStatus = parsed.data.status as OrderStatus;

  const order = await prisma.$transaction(async (tx) => {
    if (newStatus === OrderStatus.CANCELLED && existing.status !== OrderStatus.CANCELLED) {
      for (const item of existing.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: { include: { medicine: true } },
        client: true,
        createdBy: { select: { name: true } },
      },
    });
  });

  await logActivity({
    action: "updated",
    entity: "order",
    entityId: order.id,
    details: `${order.orderNumber} → ${newStatus}`,
    userId: session.user.id,
    userName: session.user.name ?? undefined,
  });

  return NextResponse.json(order);
}
