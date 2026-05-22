# Deploy PharmaSupply Online (100% Free Tier)

This app uses **no paid APIs**. Everything runs on free hosting and a free database.

## What you need (all free)

| Service | Free tier | Purpose |
|---------|-----------|---------|
| [Vercel](https://vercel.com) | Hobby plan | Host Next.js app |
| [Supabase](https://supabase.com) | Free PostgreSQL | Production database |
| Email verification | `.data/outbox` logs + manual verify | No paid email API required |

> **Do not use SQLite on Vercel** — the filesystem is temporary. Use PostgreSQL for production.

---

## Step 1 — Create free database (Supabase)

1. Sign up at [supabase.com](https://supabase.com) (free).
2. Create a new project.
3. Go to **Project Settings → Database**.
4. Copy the **Connection string** (URI mode), e.g.  
   `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

---

## Step 2 — Prepare the app for PostgreSQL

On your computer, in the project folder:

1. Set your Supabase URLs in `.env` (or temporarily in PowerShell). The build script **`scripts/sync-db-provider.mjs`** switches Prisma to PostgreSQL automatically when `DATABASE_URL` starts with `postgresql://` — you do not need to edit `schema.prisma` by hand.

2. Push schema and seed:

```powershell
# 1. Copy template and set your DB password (Settings → Database → password)
Copy-Item .env.supabase.example .env.local
# Edit .env.local — replace YOUR_DB_PASSWORD

# 2. Push schema + seed (reads .env.local via dotenv / Prisma)
npm run db:push
npm run db:seed
```

**This project (`fynwqohlhfdidfrwxqmi`):**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `postgresql://postgres.fynwqohlhfdidfrwxqmi:PASSWORD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:PASSWORD@db.fynwqohlhfdidfrwxqmi.supabase.co:5432/postgres` |

> Use the **direct** host (`db.*.supabase.co`) for `DIRECT_URL`, not the pooler hostname on port 5432.

You do **not** need `@supabase/supabase-js` or `NEXT_PUBLIC_SUPABASE_*` for this app — auth and data go through Prisma + NextAuth.

3. Confirm the app works locally:

```bash
npm run build
npm run start
```

---

## Step 3 — Deploy to Vercel (free)

1. Push the project to **GitHub** (create a repo, push code).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Set **Environment variables**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Supabase **pooler** connection string (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **direct** connection (port 5432) — recommended for `db push` / migrations |
| `AUTH_SECRET` | Random 32+ char string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `APP_URL` | Same as `NEXTAUTH_URL` |

4. **Build command:** `prisma generate && next build`  
   Or add to `package.json` (already recommended):

```json
"build": "prisma generate && next build"
```

5. Click **Deploy**.

6. After first deploy, run seed **once** from your PC against production DB:

```bash
$env:DATABASE_URL="your-supabase-url"
npm run db:seed
```

---

## Step 4 — Email verification in production

Without a paid email service:

- New users get a verification link written to server logs / `.data/outbox` (not persistent on Vercel).
- **Recommended:** After creating a client/supplier login as Admin, open Supabase → `User` table → set `emailVerifiedAt` to current timestamp for that user.
- Or use **Resend.com free tier** (3,000 emails/month) — optional, still free.

---

## Step 5 — Go live checklist

- [ ] Change default demo passwords in production
- [ ] Set strong `AUTH_SECRET`
- [ ] `NEXTAUTH_URL` matches your live domain exactly
- [ ] Database is PostgreSQL (not SQLite)
- [ ] Run `npm run db:seed` once or create your real admin user
- [ ] Test login for Admin, Staff, Client, Supplier tabs
- [ ] Visit `/api/health` — should return `{"ok":true}`

---

## Performance (already built in)

- Server-side data loading (fast first paint)
- Database indexes on orders, medicines, purchases
- Lazy-loaded charts and command palette
- Loading skeletons while pages stream in

---

## Custom domain (optional, free on Vercel)

Vercel → Project → **Settings → Domains** → add your domain and follow DNS instructions.

---

## Total cost

**$0/month** on free tiers (Vercel Hobby + Supabase free), with no paid third-party APIs required.
