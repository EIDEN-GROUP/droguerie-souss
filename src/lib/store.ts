import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

interface CartItem {
  product: Product;
  qty: number;
  dimension?: string;
}

/** Clé stable d'une ligne : un même produit peut apparaître avec des dimensions différentes. */
export const cartLineKey = (productId: string, dimension?: string) => `${productId}|${dimension ?? ""}`;

interface AppState {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  favOpen: boolean;
  addToCart: (p: Product, qty?: number, dimension?: string) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
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
      addToCart: (p, qty = 1, dimension) =>
        set((s) => {
          const existing = s.cart.find((i) => cartLineKey(i.product.id, i.dimension) === cartLineKey(p.id, dimension));
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                cartLineKey(i.product.id, i.dimension) === cartLineKey(p.id, dimension)
                  ? { ...i, qty: i.qty + qty }
                  : i,
              ),
              cartOpen: true,
            };
          }
          return { cart: [...s.cart, { product: p, qty, dimension }], cartOpen: true };
        }),
      removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((i) => cartLineKey(i.product.id, i.dimension) !== key) })),
      updateQty: (key, qty) =>
        set((s) => ({
          cart: s.cart.map((i) =>
            cartLineKey(i.product.id, i.dimension) === key ? { ...i, qty: Math.max(1, qty) } : i,
          ),
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
