import { CartPage } from "@/components/client/cart-page";
import { CART_KEY_RETAIL } from "@/lib/cart";

export default function RetailerCartRoute() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
      <p className="mt-1 text-muted">Review and submit your retail order</p>
      <div className="mt-8">
        <CartPage
          cartKey={CART_KEY_RETAIL}
          orderType="RETAIL"
          ordersHref="/retailer/my-orders"
          submitLabel="Place retail order"
        />
      </div>
    </div>
  );
}
