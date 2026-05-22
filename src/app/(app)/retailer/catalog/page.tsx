import { getMedicinesRetailCatalog } from "@/lib/data/medicines";
import { CatalogPage } from "@/components/client/catalog-page";
import { CART_KEY_RETAIL } from "@/lib/cart";

export default async function RetailerCatalogRoute() {
  const items = await getMedicinesRetailCatalog();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Retail catalog</h1>
      <p className="mt-1 text-muted">Retail pricing (ETB) for your store</p>
      <div className="mt-8">
        <CatalogPage
          initialItems={items}
          priceLabel="Retail"
          cartKey={CART_KEY_RETAIL}
          cartHref="/retailer/cart"
        />
      </div>
    </div>
  );
}
