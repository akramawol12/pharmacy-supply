import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/verification";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    clientId?: string | null;
    retailerId?: string | null;
    supplierId?: string | null;
    accountVerified: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      clientId?: string | null;
      retailerId?: string | null;
      supplierId?: string | null;
      accountVerified: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    clientId?: string | null;
    retailerId?: string | null;
    supplierId?: string | null;
    accountVerified: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail((credentials?.email as string) ?? "");
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerifiedAt) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId ?? null,
          retailerId: user.retailerId ?? null,
          supplierId: user.supplierId ?? null,
          accountVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.clientId = user.clientId;
        token.retailerId = user.retailerId;
        token.supplierId = user.supplierId;
        token.accountVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.clientId = token.clientId as string | null | undefined;
        session.user.retailerId = token.retailerId as string | null | undefined;
        session.user.supplierId = token.supplierId as string | null | undefined;
        session.user.accountVerified = Boolean(token.accountVerified);
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
