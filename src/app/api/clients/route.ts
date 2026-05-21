import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden } from "@/lib/auth-helpers";
import { clientSchema } from "@/lib/validations";
import { Role } from "@prisma/client";
import { createPortalUser } from "@/lib/users";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const clients = await prisma.client.findMany({
    include: {
      user: { select: { email: true, emailVerifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, address, loginEmail, loginPassword } = parsed.data;

  const client = await prisma.client.create({
    data: { name, phone, email: email || null, address, type: "wholesale" },
  });

  if (loginEmail && loginPassword) {
    await createPortalUser({
      email: loginEmail,
      password: loginPassword,
      name: `${name} Portal`,
      role: Role.CLIENT,
      clientId: client.id,
    });
  }

  await logActivity({
    action: "created",
    entity: "client",
    entityId: client.id,
    details: name,
    userId: session.user.id,
    userName: session.user.name ?? undefined,
  });

  return NextResponse.json(client, { status: 201 });
}
