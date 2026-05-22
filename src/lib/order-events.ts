import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export async function recordOrderStatusEvent(opts: {
  orderId: string;
  status: OrderStatus;
  note?: string;
  userId?: string;
  userName?: string;
}) {
  try {
    await prisma.orderStatusEvent.create({
      data: {
        orderId: opts.orderId,
        status: opts.status,
        note: opts.note,
        userId: opts.userId,
        userName: opts.userName,
      },
    });
  } catch {
    // non-blocking
  }
}
