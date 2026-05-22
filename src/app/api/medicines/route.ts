import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden } from "@/lib/auth-helpers";
import { medicineSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const where =
    session.user.role === Role.SUPPLIER && session.user.supplierId
      ? { supplierId: session.user.supplierId }
      : undefined;

  const medicines = await prisma.medicine.findMany({
    where,
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  if (session.user.role === Role.CLIENT) {
    return NextResponse.json(
      medicines.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        manufacturer: m.manufacturer,
        price: m.wholesalePrice,
        stockQuantity: m.stockQuantity,
        expiryDate: m.expiryDate,
      }))
    );
  }

  if (session.user.role === Role.RETAILER) {
    return NextResponse.json(
      medicines.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        manufacturer: m.manufacturer,
        price: m.retailPrice,
        stockQuantity: m.stockQuantity,
        expiryDate: m.expiryDate,
      }))
    );
  }

  if (session.user.role === Role.SUPPLIER) {
    return NextResponse.json(
      medicines.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        stockQuantity: m.stockQuantity,
        wholesalePrice: m.wholesalePrice,
        expiryDate: m.expiryDate,
      }))
    );
  }

  return NextResponse.json(medicines);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json();
  const parsed = medicineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const medicine = await prisma.medicine.create({
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      supplierId: data.supplierId || null,
    },
    include: { supplier: true },
  });

  await logActivity({
    action: "created",
    entity: "medicine",
    entityId: medicine.id,
    details: medicine.name,
    userId: session.user.id,
    userName: session.user.name ?? undefined,
  });

  return NextResponse.json(medicine, { status: 201 });
}
