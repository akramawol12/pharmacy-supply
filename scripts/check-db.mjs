import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  const count = await prisma.user.count();
  const admin = await prisma.user.findUnique({
    where: { email: "admin@pharma.local" },
    select: { email: true, emailVerifiedAt: true, role: true },
  });
  console.log(JSON.stringify({ ok: true, userCount: count, admin }, null, 2));
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
