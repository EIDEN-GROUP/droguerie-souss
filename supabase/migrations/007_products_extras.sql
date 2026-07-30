ALTER TABLE categories
  ADD COLUMN gift_with_purchase uuid REFERENCES products(id);

CREATE OR REPLACE FUNCTION get_products_csv()
RETURNS TABLE (name text, category text, price text, unit text, description text, image_url text, bestseller text, promo text, stock text, price_mode text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    p.category,
    p.price::text,
    p.unit,
    p.description,
    COALESCE(p.image_url, ''),
    CASE WHEN p.bestseller THEN 'true' ELSE 'false' END,
    COALESCE(p.promo::text, ''),
    p.stock::text,
    p.price_mode
  FROM products p
  ORDER BY p.name;
END;
$$;

CREATE OR REPLACE FUNCTION get_categories_csv()
RETURNS TABLE (name text, slug text, description text, image_url text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.name, c.slug, c.description, COALESCE(c.image_url, '')
  FROM categories c
  ORDER BY c.name;
END;
$$;

CREATE OR REPLACE FUNCTION get_orders_csv()
RETURNS TABLE (
  id text, type text, created_at text, customer_name text, customer_phone text,
  customer_email text, customer_city text, customer_address text,
  payment_method text, total text, status text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id::text,
    o.type,
    o.created_at::text,
    o.customer_name,
    o.customer_phone,
    COALESCE(o.customer_email, ''),
    o.customer_city,
    o.customer_address,
    o.payment_method,
    o.total::text,
    o.status
  FROM orders o
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_contacts_csv()
RETURNS TABLE (id text, name text, phone text, email text, city text, message text, created_at text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id::text,
    cm.name,
    cm.phone,
    COALESCE(cm.email, ''),
    COALESCE(cm.city, ''),
    cm.message,
    cm.created_at::text
  FROM contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$$;
