import { PrismaClient, OrderStatus, OrderType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.activityLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();
  await prisma.supplier.deleteMany();

  const supplier = await prisma.supplier.create({
    data: {
      name: "MediCore Distributors",
      contact: "James Okonkwo",
      phone: "+1-555-0100",
      email: "orders@medicore.example",
      address: "120 Industrial Park Rd",
    },
  });

  const client = await prisma.client.create({
    data: {
      name: "Riverside General Hospital",
      type: "wholesale",
      phone: "+1-555-0200",
      email: "procurement@riverside.example",
      address: "45 Hospital Ave",
    },
  });

  const verified = new Date();

  await prisma.user.createMany({
    data: [
      {
        email: "admin@pharma.local",
        passwordHash,
        name: "System Admin",
        role: Role.ADMIN,
        emailVerifiedAt: verified,
      },
      {
        email: "staff@pharma.local",
        passwordHash,
        name: "Sarah Chen",
        role: Role.STAFF,
        emailVerifiedAt: verified,
      },
      {
        email: "clinic@hospital.local",
        passwordHash,
        name: "Riverside Procurement",
        role: Role.CLIENT,
        clientId: client.id,
        emailVerifiedAt: verified,
      },
      {
        email: "supplier@medicore.local",
        passwordHash,
        name: "MediCore Portal",
        role: Role.SUPPLIER,
        supplierId: supplier.id,
        emailVerifiedAt: verified,
      },
    ],
  });

  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: "admin@pharma.local" },
  });

  const medicines = [
    {
      name: "Amoxicillin 500mg",
      category: "Antibiotic",
      manufacturer: "PharmaLab",
      retailPrice: 12.5,
      wholesalePrice: 8.75,
      stockQuantity: 240,
      lowStockThreshold: 50,
      expiryDate: new Date("2027-06-15"),
    },
    {
      name: "Ibuprofen 200mg",
      category: "Analgesic",
      manufacturer: "HealthPlus",
      retailPrice: 6.0,
      wholesalePrice: 4.2,
      stockQuantity: 8,
      lowStockThreshold: 25,
      expiryDate: new Date("2026-11-30"),
    },
    {
      name: "Metformin 850mg",
      category: "Antidiabetic",
      manufacturer: "DiabeCare",
      retailPrice: 18.0,
      wholesalePrice: 13.5,
      stockQuantity: 120,
      lowStockThreshold: 30,
      expiryDate: new Date("2026-08-01"),
    },
    {
      name: "Lisinopril 10mg",
      category: "Cardiovascular",
      manufacturer: "CardioMed",
      retailPrice: 14.0,
      wholesalePrice: 10.0,
      stockQuantity: 65,
      lowStockThreshold: 20,
      expiryDate: new Date("2027-01-20"),
    },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({
      data: { ...med, supplierId: supplier.id },
    });
  }

  const amox = await prisma.medicine.findFirstOrThrow({
    where: { name: "Amoxicillin 500mg" },
  });

  await prisma.purchase.create({
    data: {
      supplierId: supplier.id,
      medicineId: amox.id,
      quantityReceived: 100,
      costPrice: 5.5,
      receivedById: admin.id,
    },
  });

  const ibu = await prisma.medicine.findFirstOrThrow({ where: { name: "Ibuprofen 200mg" } });
  const meta = await prisma.medicine.findFirstOrThrow({ where: { name: "Metformin 850mg" } });

  const staff = await prisma.user.findUniqueOrThrow({ where: { email: "staff@pharma.local" } });

  function daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  const sampleOrders = [
    { type: OrderType.RETAIL, status: OrderStatus.FULFILLED, days: 6, walkIn: "John Martinez", med: amox, qty: 5, price: 12.5 },
    { type: OrderType.WHOLESALE, status: OrderStatus.FULFILLED, days: 5, client: client.id, med: meta, qty: 20, price: 13.5 },
    { type: OrderType.RETAIL, status: OrderStatus.FULFILLED, days: 3, walkIn: "Ana Lopez", med: ibu, qty: 3, price: 6 },
    { type: OrderType.WHOLESALE, status: OrderStatus.FULFILLED, days: 1, client: client.id, med: amox, qty: 50, price: 8.75 },
    { type: OrderType.RETAIL, status: OrderStatus.PENDING, days: 0, walkIn: "Walk-in Customer", med: ibu, qty: 2, price: 6 },
    { type: OrderType.WHOLESALE, status: OrderStatus.CONFIRMED, days: 0, client: client.id, med: meta, qty: 10, price: 13.5 },
  ];

  for (let i = 0; i < sampleOrders.length; i++) {
    const s = sampleOrders[i];
    const subtotal = s.price * s.qty;
    await prisma.order.create({
      data: {
        orderNumber: `ORD-DEMO-${i + 1}`,
        orderType: s.type,
        status: s.status,
        clientId: "client" in s ? s.client : null,
        walkInName: "walkIn" in s ? s.walkIn : null,
        totalAmount: subtotal,
        createdById: staff.id,
        createdAt: daysAgo(s.days),
        items: {
          create: {
            medicineId: s.med.id,
            quantity: s.qty,
            unitPrice: s.price,
            subtotal,
          },
        },
      },
    });
  }

  await prisma.activityLog.createMany({
    data: [
      { action: "created", entity: "medicine", details: "Amoxicillin 500mg added", userName: admin.name, userId: admin.id },
      { action: "received", entity: "purchase", details: "Stock +100 from MediCore", userName: staff.name, userId: staff.id },
      { action: "created", entity: "order", details: "ORD-DEMO-1 retail sale", userName: staff.name, userId: staff.id },
      { action: "updated", entity: "order", details: "ORD-DEMO-4 → FULFILLED", userName: admin.name, userId: admin.id },
      { action: "created", entity: "order", details: "Wholesale order from Riverside", userName: "Riverside Procurement" },
    ],
  });

  console.log("Seed complete. Demo password: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
