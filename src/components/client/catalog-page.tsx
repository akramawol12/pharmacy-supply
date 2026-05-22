"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { addToCart, CART_KEY_WHOLESALE } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";

export type CatalogPageConfig = {
  priceLabel?: string;
  cartKey?: string;
  cartHref?: string;
};

type CatalogItem = {
  id: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  price: number;
  stockQuantity: number;
  expiryDate: string | null;
};

export function CatalogPage({
  initialItems,
  priceLabel = "Wholesale",
  cartKey = CART_KEY_WHOLESALE,
  cartHref = "/cart",
}: { initialItems: CatalogItem[] } & CatalogPageConfig) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = initialItems.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Input
        placeholder="Search catalog…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="glow-accent">
            <CardTitle className="text-base">{m.name}</CardTitle>
            <CardDescription>{m.category} · {m.manufacturer}</CardDescription>
            <p className="mt-3 text-2xl font-bold text-accent">{formatCurrency(m.price)}</p>
            <p className="text-xs text-muted mt-1">{priceLabel} · Exp: {formatDate(m.expiryDate)}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge status={m.stockQuantity > 0 ? "ok" : "low"}>
                {m.stockQuantity > 0 ? `${m.stockQuantity} in stock` : "Out of stock"}
              </Badge>
              <Button
                disabled={m.stockQuantity < 1}
                onClick={() => {
                  addToCart(
                    {
                      medicineId: m.id,
                      name: m.name,
                      price: m.price,
                      maxStock: m.stockQuantity,
                    },
                    1,
                    cartKey
                  );
                  router.push(cartHref);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
