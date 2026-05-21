import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, setVerificationToken } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ ok: true, message: "If an account exists, a verification email was sent." });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: false, message: "Email is already verified. You can sign in." });
  }

  const token = await setVerificationToken(user.id);
  const result = await sendVerificationEmail({ to: user.email, name: user.name, token });

  return NextResponse.json({
    ok: true,
    message: result.sent
      ? "Verification email sent. Check your inbox."
      : "Verification link generated (see server outbox in development).",
    verifyUrl: process.env.NODE_ENV === "development" ? result.verifyUrl : undefined,
  });
}
