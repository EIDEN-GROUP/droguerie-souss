-- Managed subcategories, each attached to a category from the categories table.
-- Names only need to be unique inside their own category ("Accessoires" can exist
-- under both Plomberie and Électricité), so the primary key is a uuid.
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (category, name)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category);

-- Backfill from the free-text subcategory already set on products.
INSERT INTO subcategories (name, slug, category)
SELECT DISTINCT
  trim(p.subcategory),
  trim(both '-' from regexp_replace(lower(trim(p.subcategory)), '[^a-z0-9]+', '-', 'g')),
  p.category
FROM products p
WHERE p.subcategory IS NOT NULL
  AND trim(p.subcategory) <> ''
  AND EXISTS (SELECT 1 FROM categories c WHERE c.name = p.category)
ON CONFLICT (category, name) DO NOTHING;
