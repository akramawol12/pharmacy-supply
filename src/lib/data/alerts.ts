import { cache } from "react";
import { getAlertCounts, getLowStockMedicines, getExpiryWarnings } from "@/lib/alerts";

export const getAlertsPageData = cache(async () => {
  const [counts, lowStock, expiring] = await Promise.all([
    getAlertCounts(),
    getLowStockMedicines(),
    getExpiryWarnings(),
  ]);

  return {
    counts,
    lowStock: lowStock.map((m) => ({
      id: m.id,
      name: m.name,
      stockQuantity: m.stockQuantity,
      lowStockThreshold: m.lowStockThreshold,
    })),
    expiring: expiring.map((m) => ({
      id: m.id,
      name: m.name,
      expiryDate: m.expiryDate?.toISOString() ?? null,
      stockQuantity: m.stockQuantity,
    })),
  };
});
