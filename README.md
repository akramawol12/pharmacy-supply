# PharmaSupply Pro

Professional wholesale + retail pharmacy supply platform with analytics, command palette, audit trail, and more — **100% free, no paid APIs**.

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full system: inventory, pricing, orders, suppliers, purchases, clients, reports, users |
| **Staff** | Stock, manual orders, fulfill online orders, supplier purchases |
| **Client** | Wholesale catalog, cart, place orders |
| **Supplier** | View deliveries, linked products, supplier dashboard |

All portal accounts require **email verification** before sign-in.

## Pro features (free)

| Feature | Description |
|---------|-------------|
| **Command palette** | `Ctrl+K` — global search medicines/orders + quick navigation |
| **Analytics dashboard** | 7-day revenue charts, order pipeline pie, stock-by-category bar |
| **Activity audit log** | Every order, purchase, and inventory change tracked |
| **Toast notifications** | Instant feedback on all actions (Sonner) |
| **Alert center** | Bell icon with low-stock & expiry counts |
| **Printable invoices** | One-click print from any order |
| **CSV export** | Download full inventory from top bar |
| **PWA** | Install as desktop/mobile app (manifest + icon) |

## Core flows

1. **Add medicine** — Admin sets retail/wholesale price, stock, expiry, supplier → catalog
2. **Manual sale** — Staff searches catalog → order (wholesale/retail pricing) → invoice
3. **Online wholesale order** — Client browses → cart → order → staff confirms/fulfills
4. **Supplier purchase** — Staff records receipt → stock auto-updates
5. **Alerts** — Low stock + expiry warnings
6. **Dashboard** — Sales, revenue split, stock value, pending orders, alert counts

## Stack

- **Next.js 15** (App Router)
- **Prisma** + SQLite (swap to PostgreSQL for production)
- **NextAuth v5** — credentials + JWT sessions
- **Tailwind CSS** — dark pharma theme

## Quick start

```bash
cd pharmacy-supply
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (password: `password123`)

| Email | Role |
|-------|------|
| admin@pharma.local | Admin |
| staff@pharma.local | Staff |
| clinic@hospital.local | Client (wholesale) |
| supplier@medicore.local | Supplier |

## Project structure

```
src/
  app/           # Routes (dashboard, inventory, orders, …)
  components/    # UI + layout
  lib/           # Auth, prisma, utils, validations
prisma/
  schema.prisma  # Data model
  seed.ts        # Demo data
```
