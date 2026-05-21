import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/verification";
import { ROLE_HOME } from "@/config/app";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing verification token" }, { status: 400 });
  }

  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email: result.email,
    redirectTo: ROLE_HOME[result.role],
  });
}
