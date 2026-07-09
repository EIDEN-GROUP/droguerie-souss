export interface DbProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image_url: string | null;
  images_urls: string[];
  description: string;
  bestseller: boolean;
  seasonal: boolean;
  promo: number | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_city: string;
  customer_address: string;
  payment_method: "cod" | "bank" | "rep";
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  qty: number;
}

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  unit: string;
  image_url?: string;
  images_urls?: string[];
  description?: string;
  bestseller?: boolean;
  seasonal?: boolean;
  promo?: number | null;
  stock?: number;
}

export interface OrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_city: string;
  customer_address: string;
  payment_method: "cod" | "bank" | "rep";
  items: {
    product_id: string;
    product_name: string;
    product_image?: string;
    price: number;
    qty: number;
  }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  message: string;
  created_at: string;
}
