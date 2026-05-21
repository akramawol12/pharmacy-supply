"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getCart, saveCart, clearCart, type CartItem } from "@/lib/cart";
import { useRouter } from "next/navigation";

export function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderType: "WHOLESALE",
        items: cart.map((c) => ({ medicineId: c.medicineId, quantity: c.quantity })),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      const order = await res.json();
      toast.success("Order placed", { description: order.orderNumber });
      clearCart();
      router.push("/my-orders");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Order failed");
    }
  }

  return (
    <div>
      {cart.length === 0 ? (
        <p className="text-muted">Your cart is empty. Browse the catalog to add items.</p>
      ) : (
        <>
          <div className="space-y-3">
            {cart.map((item) => (
              <Card key={item.medicineId} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={item.maxStock}
                    value={item.quantity}
                    className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10);
                      const next = cart.map((c) =>
                        c.medicineId === item.medicineId
                          ? { ...c, quantity: Math.min(Math.max(1, qty), c.maxStock) }
                          : c
                      );
                      setCart(next);
                      saveCart(next);
                    }}
                  />
                  <p className="font-bold text-accent w-20 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-6 flex items-center justify-between glow-accent">
            <p className="text-lg font-bold">Total</p>
            <p className="text-2xl font-bold text-accent">{formatCurrency(total)}</p>
          </Card>
          <Button className="mt-4" onClick={placeOrder} disabled={submitting}>
            {submitting ? "Placing order…" : "Place wholesale order"}
          </Button>
        </>
      )}
    </div>
  );
}
