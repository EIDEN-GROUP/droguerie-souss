export interface DbProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  price_mode: "fixed" | "quote";
  price: number;
  unit: string;
  image_url: string | null;
  images_urls: string[];
  description: string;
  bestseller: boolean;
  seasonal: boolean;
  promo: number | null;
  stock: number;
  dimension: string | null;
  variants: { dimension: string; stock: number }[];
  created_at: string;
  updated_at: string;
}

/** Preset global de dimension (liste gérée dans les formulaires produit). */
export interface DbDimension {
  id: string;
  value: string;
  created_at: string;
}

/** Variante (dimension + stock) rattachée à un produit. */
export interface DbProductVariant {
  id: string;
  product_id: string;
  dimension: string;
  stock: number;
  created_at: string;
}

export interface DbProductGift {
  id: string;
  product_id: string;
  gift_product_id: string;
  min_qty: number;
  gift_qty: number;
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
  type: "order" | "quote";
  note: string | null;
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
  product_dimension: string | null;
}

export interface ProductInput {
  name: string;
  category: string;
  subcategory?: string;
  price_mode?: "fixed" | "quote";
  price: number;
  unit: string;
  image_url?: string;
  images_urls?: string[];
  description?: string;
  bestseller?: boolean;
  seasonal?: boolean;
  promo?: number | null;
  stock?: number;
  dimension?: string;
}

export interface OrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_city: string;
  customer_address: string;
  payment_method: "cod" | "bank" | "rep";
  type?: "order" | "quote";
  note?: string;
  items: {
    product_id: string;
    product_name: string;
    product_image?: string;
    product_dimension?: string;
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
