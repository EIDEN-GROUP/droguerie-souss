-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  unit text NOT NULL,
  image_url text,
  images_urls jsonb DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  bestseller boolean DEFAULT false,
  seasonal boolean DEFAULT false,
  promo integer CHECK (promo >= 0 AND promo <= 100),
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_city text NOT NULL,
  customer_address text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cod', 'bank', 'rep')),
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_image text,
  price numeric(10,2) NOT NULL,
  qty integer NOT NULL CHECK (qty > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(bestseller);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for product images (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- RPC to decrement stock for order items
CREATE OR REPLACE FUNCTION decrement_stock(p_items jsonb)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - (item->>'q')::int)
  FROM jsonb_array_elements(p_items) AS item
  WHERE products.id = (item->>'pid')::text;
END;
$$ LANGUAGE plpgsql;
