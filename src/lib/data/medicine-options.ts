import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  MEDICINE_CATEGORIES,
  MEDICINE_MANUFACTURERS,
} from "@/config/medicine-options";

function mergeOptions(base: readonly string[], fromDb: (string | null)[]) {
  const set = new Set(base);
  for (const v of fromDb) {
    const t = v?.trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export const getMedicineOptionLists = cache(async () => {
  const rows = await prisma.medicine.findMany({
    select: { category: true, manufacturer: true },
  });

  return {
    categories: mergeOptions(
      MEDICINE_CATEGORIES,
      rows.map((r) => r.category)
    ),
    manufacturers: mergeOptions(
      MEDICINE_MANUFACTURERS,
      rows.map((r) => r.manufacturer)
    ),
  };
});
