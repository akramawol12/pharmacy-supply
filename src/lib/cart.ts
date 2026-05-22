export type CartItem = {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
};

export const CART_KEY_WHOLESALE = "pharma-cart-wholesale";
export const CART_KEY_RETAIL = "pharma-cart-retail";

export function getCart(cartKey = CART_KEY_WHOLESALE): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(cartKey) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[], cartKey = CART_KEY_WHOLESALE) {
  localStorage.setItem(cartKey, JSON.stringify(items));
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  qty = 1,
  cartKey = CART_KEY_WHOLESALE
) {
  const cart = getCart(cartKey);
  const existing = cart.find((c) => c.medicineId === item.medicineId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, item.maxStock);
  } else {
    cart.push({ ...item, quantity: Math.min(qty, item.maxStock) });
  }
  saveCart(cart, cartKey);
  return cart;
}

export function clearCart(cartKey = CART_KEY_WHOLESALE) {
  localStorage.removeItem(cartKey);
}
