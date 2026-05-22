import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeEmail, setVerificationToken } from "./verification";
import { sendVerificationEmail } from "./email";

export async function createPortalUser(opts: {
  email: string;
  password: string;
  name: string;
  role: Role;
  clientId?: string;
  retailerId?: string;
  supplierId?: string;
  skipVerification?: boolean;
}) {
  const email = normalizeEmail(opts.email);
  const passwordHash = await bcrypt.hash(opts.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: opts.name,
      role: opts.role,
      clientId: opts.clientId ?? null,
      retailerId: opts.retailerId ?? null,
      supplierId: opts.supplierId ?? null,
      emailVerifiedAt: opts.skipVerification ? new Date() : null,
    },
  });

  if (!opts.skipVerification) {
    const token = await setVerificationToken(user.id);
    await sendVerificationEmail({ to: email, name: opts.name, token });
  }

  return user;
}
