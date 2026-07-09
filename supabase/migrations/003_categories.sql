CREATE TABLE IF NOT EXISTS categories (
  name text PRIMARY KEY,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Carrelage', 'carrelage', 'Carreaux céramiques et grès cérame', NULL),
  ('Marbre', 'marbre', 'Marbre et pierres naturelles', NULL),
  ('Peinture', 'peinture', 'Peintures intérieures et extérieures', NULL),
  ('Ciment & Granulats', 'ciment', 'Matériaux de gros œuvre', NULL),
  ('Zellige', 'zellige', 'Zellige marocain traditionnel', NULL),
  ('Plâtre', 'platre', 'Plâtre et enduits', NULL),
  ('Électricité', 'electrique', 'Câbles, fils et accessoires', NULL),
  ('Plomberie', 'plomberie', 'Plomberie et évacuation', NULL),
  ('Quincaillerie', 'quincaillerie', 'Outils et fournitures', NULL)
ON CONFLICT (name) DO NOTHING;
