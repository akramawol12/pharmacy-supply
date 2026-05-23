import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  retailPrice: z.coerce.number().positive(),
  wholesalePrice: z.coerce.number().positive(),
  stockQuantity: z.coerce.number().int().min(0),
  expiryDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional()
    .nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  supplierId: z.string().optional().nullable(),
});

export const orderItemSchema = z.object({
  medicineId: z.string(),
  quantity: z.coerce.number().int().positive(),
});

export const createOrderSchema = z.object({
  orderType: z.enum(["WHOLESALE", "RETAIL"]),
  clientId: z.string().optional(),
  retailerId: z.string().optional(),
  walkInName: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const retailerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  loginEmail: z.string().email().optional().or(z.literal("")).nullable(),
  loginPassword: z.string().min(8).optional().or(z.literal("")).nullable(),
});

export const purchaseSchema = z.object({
  supplierId: z.string(),
  medicineId: z.string(),
  quantityReceived: z.coerce.number().int().positive(),
  costPrice: z.coerce.number().positive(),
});

export const clientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  loginEmail: z.string().email().optional().or(z.literal("")).nullable(),
  loginPassword: z.string().min(8).optional().or(z.literal("")).nullable(),
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  loginEmail: z.string().email().optional().or(z.literal("")).nullable(),
  loginPassword: z.string().min(8).optional().or(z.literal("")).nullable(),
});
