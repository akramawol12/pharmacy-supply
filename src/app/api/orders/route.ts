import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { createOrderSchema } from "@/lib/validations";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { OrderStatus, OrderType, Role } from "@prisma/client";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    session.user.role === Role.CLIENT
      ? { clientId: session.user.clientId ?? undefined }
      : session.user.role === Role.RETAILER
        ? { retailerId: session.user.retailerId ?? undefined }
        : status
          ? { status: status as OrderStatus }
          : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: true,
      retailer: true,
      items: { include: { medicine: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderType, clientId, retailerId, walkInName, items } = parsed.data;

  if (session.user.role === Role.CLIENT) {
    if (orderType !== OrderType.WHOLESALE) return forbidden();
  } else if (session.user.role === Role.RETAILER) {
    if (orderType !== OrderType.RETAIL) return forbidden();
  } else if (!hasRole(session.user.role, ADMIN_STAFF)) {
    return forbidden();
  }

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: items.map((i) => i.medicineId) } },
  });

  const medMap = new Map(medicines.map((m) => [m.id, m]));
  let totalAmount = 0;
  const lineItems: {
    medicineId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[] = [];

  for (const item of items) {
    const med = medMap.get(item.medicineId);
    if (!med) {
      return NextResponse.json({ error: `Medicine ${item.medicineId} not found` }, { status: 400 });
    }
    if (med.expiryDate && med.expiryDate < new Date()) {
      return NextResponse.json(
        { error: `${med.name} is expired and cannot be sold` },
        { status: 400 }
      );
    }
    if (med.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${med.name}` },
        { status: 400 }
      );
    }
    const unitPrice =
      orderType === OrderType.WHOLESALE ? med.wholesalePrice : med.retailPrice;
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;
    lineItems.push({
      medicineId: item.medicineId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    });
  }

  const resolvedClientId =
    session.user.role === Role.CLIENT ? session.user.clientId : clientId ?? null;
  const resolvedRetailerId =
    session.user.role === Role.RETAILER ? session.user.retailerId : retailerId ?? null;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType,
        clientId: resolvedClientId,
        retailerId: resolvedRetailerId,
        walkInName: walkInName ?? null,
        totalAmount,
        status: OrderStatus.PENDING,
        createdById:
          session.user.role === Role.CLIENT || session.user.role === Role.RETAILER
            ? null
            : session.user.id,
        items: { create: lineItems },
      },
      include: {
        items: { include: { medicine: true } },
        client: true,
        retailer: true,
      },
    });

    for (const item of lineItems) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.orderStatusEvent.create({
      data: {
        orderId: created.id,
        status: OrderStatus.PENDING,
        note: "Order placed",
        userId: session.user.id,
        userName: session.user.name ?? undefined,
      },
    });

    return created;
  });

  await logActivity({
    action: "created",
    entity: "order",
    entityId: order.id,
    details: `${order.orderNumber} · ${orderType} · ${formatCurrency(order.totalAmount)}`,
    userId: session.user.id,
    userName: session.user.name ?? undefined,
  });

  return NextResponse.json(order, { status: 201 });
}
