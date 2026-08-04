-- Dimensions : presets globaux + variantes par produit (chaque variante a son stock).

-- Presets globaux : la valeur est libre ("60x60", "80x80"...) et unique. Elle sert de
-- libellé partout (formulaire produit, page produit, commandes).
CREATE TABLE IF NOT EXISTS dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Variantes par produit : une ligne par dimension vendue, chacune avec son propre
-- stock. `dimension` stocke une copie de la valeur du preset (comme products.subcategory)
-- pour rester stable même si le preset est renommé.
CREATE TABLE IF NOT EXISTS product_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (product_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_product_dimensions_product ON product_dimensions(product_id);

-- Rétro-remplissage : un preset par dimension libre déjà posée sur les produits.
INSERT INTO dimensions (value)
SELECT DISTINCT trim(dimension) FROM products
WHERE dimension IS NOT NULL AND trim(dimension) <> ''
ON CONFLICT (value) DO NOTHING;

-- Une variante par produit qui porte déjà une dimension, fournie avec son stock actuel.
INSERT INTO product_dimensions (product_id, dimension, stock)
SELECT p.id, trim(p.dimension), p.stock FROM products p
WHERE p.dimension IS NOT NULL AND trim(p.dimension) <> ''
ON CONFLICT (product_id, dimension) DO NOTHING;

-- La dimension choisie est figée sur la ligne de commande (historique).
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_dimension text;

-- Décrémente atomiquement le stock d'une variante lors de la création d'une commande.
CREATE OR REPLACE FUNCTION decrement_dimension_stock(p_product_id uuid, p_dimension text, p_qty integer)
RETURNS void AS $$
BEGIN
  UPDATE product_dimensions
  SET stock = GREATEST(0, stock - p_qty)
  WHERE product_id = p_product_id AND dimension = p_dimension;
END;
$$ LANGUAGE plpgsql;