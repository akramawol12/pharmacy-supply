import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env") });
if (existsSync(resolve(root, ".env.local"))) {
  config({ path: resolve(root, ".env.local"), override: true });
}

const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  const admin = await prisma.user.findUnique({
    where: { email: "admin@pharma.local" },
    select: { email: true, emailVerifiedAt: true, role: true },
  });
  console.log("OK — connected to database");
  console.log("Users:", count);
  console.log("Admin:", admin);
} catch (e) {
  console.error("FAIL —", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
