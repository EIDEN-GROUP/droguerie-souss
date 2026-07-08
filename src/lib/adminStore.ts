import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as seedProducts, type Product } from "./products";
import type { Order, OrderItem, OrderStatus } from "./orders";
import { orderTotal } from "./orders";

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

interface AdminState {
  products: Product[];
  orders: Order[];
  addProduct: (p: Omit<Product, "id">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "total" | "status">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  decrementStock: (items: OrderItem[]) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      orders: [],

      addProduct: (p) => {
        const product: Product = { ...p, id: nextId("p") };
        set((s) => ({ products: [product, ...s.products] }));
        return product;
      },

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addOrder: (order) => {
        const full: Order = {
          ...order,
          id: nextId("ORD"),
          createdAt: new Date().toISOString(),
          total: orderTotal(order.items),
          status: "pending",
        };
        set((s) => ({ orders: [full, ...s.orders] }));
        get().decrementStock(order.items);
        return full;
      },

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      decrementStock: (items) =>
        set((s) => ({
          products: s.products.map((p) => {
            const item = items.find((i) => i.productId === p.id);
            if (!item) return p;
            return { ...p, stock: Math.max(0, p.stock - item.qty) };
          }),
        })),
    }),
    { name: "droguerie-admin" },
  ),
);
