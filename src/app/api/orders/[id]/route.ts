import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { recordOrderStatusEvent } from "@/lib/order-events";
import { sendOrderStatusEmail } from "@/lib/email/order-notify";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]).optional(),
  internalNotes: z.string().max(500).optional(),
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
    include: {
      items: true,
      client: { select: { email: true, name: true } },
      retailer: { select: { email: true, name: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const newStatus = parsed.data.status as OrderStatus | undefined;
  const newPayment = parsed.data.paymentStatus as PaymentStatus | undefined;

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
      data: {
        ...(newStatus ? { status: newStatus } : {}),
        ...(newPayment
          ? {
              paymentStatus: newPayment,
              paidAt: newPayment === PaymentStatus.PAID ? new Date() : null,
            }
          : {}),
        ...(parsed.data.internalNotes !== undefined
          ? { internalNotes: parsed.data.internalNotes }
          : {}),
      },
      include: {
        items: { include: { medicine: true } },
        client: true,
        retailer: true,
        statusEvents: { orderBy: { createdAt: "asc" } },
      },
    });
  });

  if (newStatus && newStatus !== existing.status) {
    await recordOrderStatusEvent({
      orderId: order.id,
      status: newStatus,
      userId: session.user.id,
      userName: session.user.name ?? undefined,
    });

    await logActivity({
      action: "status_changed",
      entity: "order",
      entityId: order.id,
      details: `${order.orderNumber} → ${newStatus}`,
      userId: session.user.id,
      userName: session.user.name ?? undefined,
    });

    const notifyEmail = existing.client?.email ?? existing.retailer?.email;
    if (notifyEmail) {
      await sendOrderStatusEmail({
        to: notifyEmail,
        orderNumber: order.orderNumber,
        status: newStatus,
        totalAmount: formatCurrency(order.totalAmount),
      });
    }
  }

  if (newPayment && newPayment !== existing.paymentStatus) {
    await logActivity({
      action: "payment_updated",
      entity: "order",
      entityId: order.id,
      details: `${order.orderNumber} → ${newPayment}`,
      userId: session.user.id,
      userName: session.user.name ?? undefined,
    });
  }

  return NextResponse.json(order);
}
