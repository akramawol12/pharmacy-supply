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
  const medicine = await prisma.medicine.update({
    where: { id },
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
    include: { supplier: true },
  });

  return NextResponse.json(medicine);
}
