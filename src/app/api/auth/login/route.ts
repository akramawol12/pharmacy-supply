import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/verification";
import { ROLE_HOME } from "@/config/app";
import {
  applySessionCookie,
  createSessionJwt,
  type SessionUser,
} from "@/lib/auth-session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Server auth is not configured." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid email or password" }, { status: 400 });
  }

  try {
    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "Invalid email or password" });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({
        ok: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before signing in.",
        email: user.email,
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId ?? null,
      retailerId: user.retailerId ?? null,
      supplierId: user.supplierId ?? null,
    };

    const jwt = await createSessionJwt(sessionUser);
    const redirectTo = ROLE_HOME[user.role];
    const res = NextResponse.json({ ok: true, role: user.role, redirectTo });
    applySessionCookie(res, jwt);
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
