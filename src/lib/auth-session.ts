import { encode } from "@auth/core/jwt";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function useSecureSessionCookie() {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName() {
  return useSecureSessionCookie()
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  clientId: string | null;
  retailerId: string | null;
  supplierId: string | null;
};

export async function createSessionJwt(user: SessionUser) {
  const salt = sessionCookieName();
  return encode({
    token: {
      name: user.name,
      email: user.email,
      sub: user.id,
      id: user.id,
      role: user.role,
      clientId: user.clientId,
      retailerId: user.retailerId,
      supplierId: user.supplierId,
      accountVerified: true,
    },
    secret: process.env.AUTH_SECRET!,
    salt,
    maxAge: SESSION_MAX_AGE,
  });
}

export function applySessionCookie(res: NextResponse, jwt: string) {
  const secure = useSecureSessionCookie();
  res.cookies.set(sessionCookieName(), jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookies(res: NextResponse) {
  const opts = { path: "/", httpOnly: true, sameSite: "lax" as const, maxAge: 0 };
  for (const name of ["authjs.session-token", "__Secure-authjs.session-token"]) {
    const secure = name.startsWith("__Secure-");
    res.cookies.set(name, "", { ...opts, secure });
    for (let i = 0; i < 4; i++) {
      res.cookies.set(`${name}.${i}`, "", { ...opts, secure });
    }
  }
}
