import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  retailPrice: z.coerce.number().positive(),
  wholesalePrice: z.coerce.number().positive(),
  stockQuantity: z.coerce.number().int().min(0),
  expiryDate: z.string().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  supplierId: z.string().optional(),
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
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  loginEmail: z.string().email().optional(),
  loginPassword: z.string().min(8).optional(),
});

export const purchaseSchema = z.object({
  supplierId: z.string(),
  medicineId: z.string(),
  quantityReceived: z.coerce.number().int().positive(),
  costPrice: z.coerce.number().positive(),
});

export const clientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  loginEmail: z.string().email().optional(),
  loginPassword: z.string().min(8).optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  loginEmail: z.string().email().optional(),
  loginPassword: z.string().min(8).optional(),
});
