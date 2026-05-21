import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/verification";
import { ROLE_HOME } from "@/config/app";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid email or password" }, { status: 400 });
  }

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

  return NextResponse.json({
    ok: true,
    role: user.role,
    redirectTo: ROLE_HOME[user.role],
  });
}
