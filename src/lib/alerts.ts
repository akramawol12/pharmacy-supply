import { prisma } from "./prisma";

const EXPIRY_WARNING_DAYS = 90;

export async function getAlertCounts() {
  const medicines = await prisma.medicine.findMany({
    select: {
      stockQuantity: true,
      lowStockThreshold: true,
      expiryDate: true,
    },
  });

  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);

  let lowStock = 0;
  let expiring = 0;
  let expired = 0;

  for (const m of medicines) {
    if (m.stockQuantity <= m.lowStockThreshold) lowStock++;
    if (m.expiryDate) {
      const exp = new Date(m.expiryDate);
      if (exp < now) expired++;
      else if (exp <= warningDate) expiring++;
    }
  }

  return { lowStock, expiring, expired, total: lowStock + expiring + expired };
}

export async function getLowStockMedicines() {
  const all = await prisma.medicine.findMany({
    include: { supplier: true },
    orderBy: { stockQuantity: "asc" },
  });
  return all.filter((m) => m.stockQuantity <= m.lowStockThreshold);
}

export async function getExpiryWarnings() {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);

  const medicines = await prisma.medicine.findMany({
    where: { expiryDate: { not: null } },
    include: { supplier: true },
    orderBy: { expiryDate: "asc" },
  });

  const now = new Date();
  return medicines.filter((m) => m.expiryDate && new Date(m.expiryDate) <= warningDate);
}
