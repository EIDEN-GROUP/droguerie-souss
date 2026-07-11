// Static order history   each logged-in customer's orders are recorded in
// localStorage at checkout time, keyed by their email.

export interface LocalOrderItem {
  product_name: string;
  product_image: string | null;
  price: number;
  qty: number;
}

export interface LocalOrder {
  id: string;
  created_at: string;
  total: number;
  status: "pending";
  items: LocalOrderItem[];
}

const key = (email: string) => `ds-orders-${email}`;

export function getLocalOrders(email: string): LocalOrder[] {
  try {
    return JSON.parse(localStorage.getItem(key(email)) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalOrder(email: string, order: LocalOrder) {
  const orders = [order, ...getLocalOrders(email)];
  localStorage.setItem(key(email), JSON.stringify(orders));
}
