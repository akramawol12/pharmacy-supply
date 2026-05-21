export type CartItem = {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
};

const CART_KEY = "pharma-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const existing = cart.find((c) => c.medicineId === item.medicineId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, item.maxStock);
  } else {
    cart.push({ ...item, quantity: Math.min(qty, item.maxStock) });
  }
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
