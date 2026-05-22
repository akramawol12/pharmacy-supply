# Troubleshooting

## App not loading / login fails

### 1. Use the correct URL

Always use **http://localhost:3000** (not 3001). If port 3000 is busy, stop other terminals running `npm run dev`.

### 2. Start the server correctly

```powershell
cd C:\Users\new\Projects\pharmacy-supply
npm run dev
```

Do **not** need `dev:supabase` if `.env` has your Supabase `DATABASE_URL` (already configured).

### 3. Clear stale login cookies

If you see errors like `JWTSessionError` or `no matching decryption secret`:

1. Open DevTools (F12) → Application → Cookies → `http://localhost:3000`
2. Delete all cookies (especially `authjs.*` / `next-auth.*`)
3. Hard refresh (Ctrl+Shift+R) and sign in again

### 4. Demo login

| Tab | Email | Password |
|-----|-------|----------|
| Internal | `admin@pharma.local` | `password123` |
| Wholesale | `clinic@hospital.local` | `password123` |
| Retailer | `retail@pharmacy.local` | `password123` |
| Supplier | `supplier@medicore.local` | `password123` |

### 5. Test database connection

```powershell
node scripts/test-connection.mjs
```

Should print `OK — connected` and `Users: 4`.

### 6. Re-sync database (if tables missing)

```powershell
npm run db:supabase
```
