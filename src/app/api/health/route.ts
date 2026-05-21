import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.user.count({ take: 1 });
    return NextResponse.json({ ok: true, service: "pharmacy-supply" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
