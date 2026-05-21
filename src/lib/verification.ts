import crypto from "crypto";
import { prisma } from "./prisma";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 48;

export function generateVerificationToken() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const expires = new Date();
  expires.setHours(expires.getHours() + EXPIRY_HOURS);
  return { token, expires };
}

export async function setVerificationToken(userId: string) {
  const { token, expires } = generateVerificationToken();
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationTokenExpires: expires,
      emailVerifiedAt: null,
    },
  });
  return token;
}

export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: { gt: new Date() },
    },
  });

  if (!user) return { ok: false as const, error: "Invalid or expired verification link" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return { ok: true as const, email: user.email, role: user.role };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
