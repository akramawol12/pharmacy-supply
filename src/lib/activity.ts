import { prisma } from "./prisma";

export async function logActivity(opts: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  userId?: string;
  userName?: string;
}) {
  try {
    await prisma.activityLog.create({ data: opts });
  } catch {
    // non-blocking audit trail
  }
}
