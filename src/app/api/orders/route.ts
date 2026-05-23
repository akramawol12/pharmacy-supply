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

  let where: any = {};

  if (session.user.role === Role.CLIENT) {
    if (!session.user.clientId) {
      return NextResponse.json([]);
    }
    where = { clientId: session.user.clientId };
  } else if (session.user.role === Role.RETAILER) {
    if (!session.user.retailerId) {
      return NextResponse.json([]);
    }
    where = { retailerId: session.user.retailerId };
  } else if (hasRole(session.user.role, ADMIN_STAFF)) {
    if (status) {
      where = { status: status as OrderStatus };
    }
  } else {
    // Other roles (e.g. SUPPLIER) shouldn't be accessing this list unless specifically allowed
    return forbidden();
  }

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

  // Aggregate items by medicineId to handle duplicates and correctly check total requested quantity
  const aggregatedItems = items.reduce((acc, item) => {
    acc[item.medicineId] = (acc[item.medicineId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const medicineIds = Object.keys(aggregatedItems);
  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
  });

  const medMap = new Map(medicines.map((m) => [m.id, m]));
  let totalAmount = 0;
  const lineItems: {
    medicineId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[] = [];

  for (const [medicineId, quantity] of Object.entries(aggregatedItems)) {
    const med = medMap.get(medicineId);
    if (!med) {
      return NextResponse.json({ error: `Medicine ${medicineId} not found` }, { status: 400 });
    }
    if (med.expiryDate && med.expiryDate < new Date()) {
      return NextResponse.json(
        { error: `${med.name} is expired and cannot be sold` },
        { status: 400 }
      );
    }
    if (med.stockQuantity < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${med.name} (Requested: ${quantity}, Available: ${med.stockQuantity})` },
        { status: 400 }
      );
    }
    const unitPrice =
      orderType === OrderType.WHOLESALE ? med.wholesalePrice : med.retailPrice;
    const subtotal = unitPrice * quantity;
    totalAmount += subtotal;
    lineItems.push({
      medicineId,
      quantity,
      unitPrice,
      subtotal,
    });
  }

  const resolvedClientId =
    session.user.role === Role.CLIENT ? session.user.clientId : clientId ?? null;
  const resolvedRetailerId =
    session.user.role === Role.RETAILER ? session.user.retailerId : retailerId ?? null;

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Atomic stock update with sufficiency check
      for (const item of lineItems) {
        const updated = await tx.medicine.updateMany({
          where: {
            id: item.medicineId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          const med = await tx.medicine.findUnique({
            where: { id: item.medicineId },
            select: { name: true },
          });
          throw new Error(`Insufficient stock for ${med?.name || "unknown medicine"}`);
        }
      }

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Transaction failed" }, { status: 400 });
  }

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
