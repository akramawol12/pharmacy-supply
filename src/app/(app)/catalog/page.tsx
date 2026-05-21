import { getMedicinesCatalog } from "@/lib/data/medicines";
import { CatalogPage } from "@/components/client/catalog-page";

export default async function CatalogRoute() {
  const items = await getMedicinesCatalog();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Medicine catalog</h1>
      <p className="mt-1 text-muted">Wholesale pricing (ETB) for your account</p>
      <div className="mt-8">
        <CatalogPage initialItems={items} />
      </div>
    </div>
  );
}
