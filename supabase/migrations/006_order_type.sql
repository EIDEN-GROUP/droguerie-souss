ALTER TABLE orders
  ADD COLUMN type text NOT NULL DEFAULT 'order'
    CHECK (type IN ('order', 'quote'));
