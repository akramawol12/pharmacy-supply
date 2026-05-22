import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getActivityLogs = cache(async (limit = 100) => {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));
});
