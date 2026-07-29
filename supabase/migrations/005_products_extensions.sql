-- Extend products: pricing mode, optional price, gifts

-- 1. Pricing mode
ALTER TABLE products
  ADD COLUMN price_mode text NOT NULL DEFAULT 'fixed'
    CHECK (price_mode IN ('fixed', 'quote'));

-- 2. Gifts table (one-to-many: product → gifts)
CREATE TABLE IF NOT EXISTS product_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  gift_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty integer NOT NULL CHECK (min_qty > 0),
  gift_qty integer NOT NULL CHECK (gift_qty > 0),
  UNIQUE (product_id, gift_product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_gifts_product_id ON product_gifts(product_id);
