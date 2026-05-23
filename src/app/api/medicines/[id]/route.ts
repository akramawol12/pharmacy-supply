import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden } from "@/lib/auth-helpers";
import { medicineSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF) {
    return forbidden();
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = medicineSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Pick only allowed fields for update to prevent mass assignment
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
  if (data.retailPrice !== undefined) updateData.retailPrice = data.retailPrice;
  if (data.wholesalePrice !== undefined) updateData.wholesalePrice = data.wholesalePrice;
  if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
  if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = data.lowStockThreshold;
  if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;

  if (data.expiryDate !== undefined) {
    updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }

  const medicine = await prisma.medicine.update({
    where: { id },
    data: updateData,
    include: { supplier: true },
  });

  return NextResponse.json(medicine);
}
