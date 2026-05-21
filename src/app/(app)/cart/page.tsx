import { CartPage } from "@/components/client/cart-page";

export default function CartRoute() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
      <p className="mt-1 text-muted">Review and submit your wholesale order</p>
      <div className="mt-8">
        <CartPage />
      </div>
    </div>
  );
}
