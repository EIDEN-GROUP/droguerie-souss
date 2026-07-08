export type PaymentMethod = "cod" | "bank" | "rep";
export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string; // ISO date
  customer: OrderCustomer;
  payment: PaymentMethod;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export function orderTotal(items: OrderItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function revenueByMonth(orders: Order[], months = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      total: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.total += o.total;
  }
  return buckets;
}

export function topProducts(orders: Order[], limit = 10) {
  const totals = new Map<string, { name: string; qty: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const item of o.items) {
      const existing = totals.get(item.productId);
      if (existing) existing.qty += item.qty;
      else totals.set(item.productId, { name: item.name, qty: item.qty });
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function uniqueCustomers(orders: Order[]) {
  const keys = new Set(orders.map((o) => o.customer.phone.trim()));
  return keys.size;
}

export function soldUnits(orders: Order[]) {
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
}
