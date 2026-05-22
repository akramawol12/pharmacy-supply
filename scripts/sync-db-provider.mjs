import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(root, "prisma", "schema.prisma");

config({ path: resolve(root, ".env") });
if (existsSync(resolve(root, ".env.local"))) {
  config({ path: resolve(root, ".env.local"), override: true });
}

const url = process.env.DATABASE_URL ?? "";
const usePostgres = url.startsWith("postgresql://") || url.startsWith("postgres://");

const directUrl = process.env.DIRECT_URL?.trim();
const datasource = usePostgres
  ? directUrl
    ? `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    : `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  : `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;

let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(/datasource db \{[\s\S]*?\}/m, datasource);
writeFileSync(schemaPath, schema);

console.log(`Prisma datasource: ${usePostgres ? "postgresql (Supabase/production)" : "sqlite (local)"}`);
