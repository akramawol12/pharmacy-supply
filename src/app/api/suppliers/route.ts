import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hasRole, ADMIN_STAFF } from "@/lib/auth-helpers";
import { supplierSchema } from "@/lib/validations";
import { Role } from "@prisma/client";
import { createPortalUser } from "@/lib/users";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasRole(session.user.role, ADMIN_STAFF)) return forbidden();

  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { medicines: true } },
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json();
  const parsed = supplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, contact, address, phone, email, loginEmail, loginPassword } = parsed.data;

  try {
    const supplier = await prisma.$transaction(async (tx) => {
      const s = await tx.supplier.create({
        data: {
          name,
          contact,
          address,
          phone,
          email: email || null,
        },
      });

      if (loginEmail && loginPassword) {
        await createPortalUser({
          email: loginEmail,
          password: loginPassword,
          name: `${name} Portal`,
          role: Role.SUPPLIER,
          supplierId: s.id,
        }, tx);
      }
      return s;
    });

    await logActivity({
      action: "created",
      entity: "supplier",
      entityId: supplier.id,
      details: name,
      userId: session.user.id,
      userName: session.user.name ?? undefined,
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (err: any) {
    console.error("Supplier creation error:", err);
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email or login email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create supplier" }, { status: 500 });
  }

}
