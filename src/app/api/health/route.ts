import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "pharmacy-supply" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "database_unavailable";
    return NextResponse.json(
      { ok: false, service: "pharmacy-supply", error: message },
      { status: 503 }
    );
  }
}
