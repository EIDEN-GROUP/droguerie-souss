import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

interface CartItem {
  product: Product;
  qty: number;
}

interface AppState {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  favOpen: boolean;
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  setCartOpen: (v: boolean) => void;
  setFavOpen: (v: boolean) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      favorites: [],
      cartOpen: false,
      favOpen: false,
      addToCart: (p, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((i) => i.product.id === p.id);
          if (existing) {
            return {
              cart: s.cart.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + qty } : i)),
              cartOpen: true,
            };
          }
          return { cart: [...s.cart, { product: p, qty }], cartOpen: true };
        }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: s.cart.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clearCart: () => set({ cart: [] }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      setCartOpen: (v) => set({ cartOpen: v }),
      setFavOpen: (v) => set({ favOpen: v }),
    }),
    { name: "droguerie-souss" },
  ),
);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => {
    const pct = i.product.promo ?? 0;
    const price = pct > 0 ? i.product.price * (1 - pct / 100) : i.product.price;
    return sum + price * i.qty;
  }, 0);
