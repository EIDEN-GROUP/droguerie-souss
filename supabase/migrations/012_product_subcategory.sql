-- Optional free-text subcategory, set per product in the admin form.
-- Drives the subcategory chips on /rubriques once a category is selected.
ALTER TABLE products
  ADD COLUMN subcategory text;

CREATE INDEX IF NOT EXISTS idx_products_category_subcategory
  ON products(category, subcategory);
