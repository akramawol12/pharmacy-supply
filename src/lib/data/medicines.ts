import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const getMedicinesForRole = cache(async (role: Role, supplierId?: string | null) => {
  const where =
    role === "SUPPLIER" && supplierId ? { supplierId } : undefined;

  const medicines = await prisma.medicine.findMany({
    where,
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return medicines.map((m) => ({
    ...m,
    expiryDate: m.expiryDate?.toISOString() ?? null,
  }));
});

export const getMedicinesRetailCatalog = cache(async () => {
  const medicines = await prisma.medicine.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      manufacturer: true,
      retailPrice: true,
      stockQuantity: true,
      expiryDate: true,
    },
  });
  return medicines.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    manufacturer: m.manufacturer,
    price: m.retailPrice,
    stockQuantity: m.stockQuantity,
    expiryDate: m.expiryDate?.toISOString() ?? null,
  }));
});

export const getMedicinesCatalog = cache(async () => {
  const medicines = await prisma.medicine.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      manufacturer: true,
      wholesalePrice: true,
      stockQuantity: true,
      expiryDate: true,
    },
  });
  return medicines.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    manufacturer: m.manufacturer,
    price: m.wholesalePrice,
    stockQuantity: m.stockQuantity,
    expiryDate: m.expiryDate?.toISOString() ?? null,
  }));
});
