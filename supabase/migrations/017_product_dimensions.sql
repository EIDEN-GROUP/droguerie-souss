-- Plusieurs formats pour une meme reference, et fusion des doublons de format.
--
-- Contexte : trois produits existaient en double, une ligne par format. La colonne
-- `dimension` n'en accepte qu'un seul, d'ou la liste `dimensions`. Le selecteur de la
-- fiche produit lit `dimensions` et retombe sur `dimension` tant que ce script n'a pas
-- ete joue : l'ordre entre le deploiement du code et cette migration est donc libre.
--
-- Idempotent : rejouable sans effet de bord.

-- ─────────────────────────────────────────────────────────────
-- 1. La colonne liste, alimentee depuis la colonne simple
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions text[] NOT NULL DEFAULT '{}';

UPDATE products
SET    dimensions = ARRAY[dimension]
WHERE  dimension IS NOT NULL
  AND  dimension <> ''
  AND  cardinality(dimensions) = 0;

-- ─────────────────────────────────────────────────────────────
-- 2. Fusion des trois doublons
--
-- La ligne conservee recupere les deux formats et la photo de celle qui disparait,
-- versee dans sa galerie. Le titre repasse a la reference nue : le produit couvre
-- desormais deux visuels, un titre decrivant une seule photo serait faux.
--
-- `order_items` ne reference pas `products` par cle etrangere et recopie nom, photo et
-- prix a la commande : l'historique des commandes n'est pas touche par ces suppressions.
-- ─────────────────────────────────────────────────────────────

-- Calacata : 60x60 (conservee) + 120x60
UPDATE products p
SET    name        = 'Calacata',
       dimensions  = ARRAY['60x60', '120x60'],
       images_urls = (
         SELECT jsonb_agg(DISTINCT u)
         FROM (
           SELECT jsonb_array_elements_text(COALESCE(p.images_urls, '[]'::jsonb)) AS u
           UNION
           SELECT d.image_url FROM products d WHERE d.id = '05a90d39-11ad-4b92-bda3-8f7183384a98'
           UNION
           SELECT jsonb_array_elements_text(COALESCE(d.images_urls, '[]'::jsonb))
           FROM products d WHERE d.id = '05a90d39-11ad-4b92-bda3-8f7183384a98'
         ) s
       )
WHERE  p.id = '044d56e9-e798-4f47-8d05-9975154f8ccd';

DELETE FROM products WHERE id = '05a90d39-11ad-4b92-bda3-8f7183384a98';

-- Carraplus : 30x60 (conservee) + 60x60
UPDATE products p
SET    name        = 'Carraplus',
       dimensions  = ARRAY['30x60', '60x60'],
       images_urls = (
         SELECT jsonb_agg(DISTINCT u)
         FROM (
           SELECT jsonb_array_elements_text(COALESCE(p.images_urls, '[]'::jsonb)) AS u
           UNION
           SELECT d.image_url FROM products d WHERE d.id = 'ad1d9fb9-c62d-4975-b94b-c5bfebeade52'
           UNION
           SELECT jsonb_array_elements_text(COALESCE(d.images_urls, '[]'::jsonb))
           FROM products d WHERE d.id = 'ad1d9fb9-c62d-4975-b94b-c5bfebeade52'
         ) s
       )
WHERE  p.id = '03321dab-edab-4f24-86c8-b87f4ab49ce9';

DELETE FROM products WHERE id = 'ad1d9fb9-c62d-4975-b94b-c5bfebeade52';

-- Onyx Bleu : 30x90 (conservee) + 120x60
UPDATE products p
SET    name        = 'Onyx Bleu',
       dimensions  = ARRAY['30x90', '120x60'],
       images_urls = (
         SELECT jsonb_agg(DISTINCT u)
         FROM (
           SELECT jsonb_array_elements_text(COALESCE(p.images_urls, '[]'::jsonb)) AS u
           UNION
           SELECT d.image_url FROM products d WHERE d.id = '437f0196-327b-4436-98fa-66f5d956fd87'
           UNION
           SELECT jsonb_array_elements_text(COALESCE(d.images_urls, '[]'::jsonb))
           FROM products d WHERE d.id = '437f0196-327b-4436-98fa-66f5d956fd87'
         ) s
       )
WHERE  p.id = '9e620cc3-b20b-48fc-a726-abea4c7c529f';

DELETE FROM products WHERE id = '437f0196-327b-4436-98fa-66f5d956fd87';

-- ─────────────────────────────────────────────────────────────
-- 3. Verification
-- ─────────────────────────────────────────────────────────────
-- Attendu : 195 produits, aucun titre en double, 3 produits a deux formats.
--   SELECT count(*) FROM products;
--   SELECT name, count(*) FROM products GROUP BY name HAVING count(*) > 1;
--   SELECT name, dimensions FROM products WHERE cardinality(dimensions) > 1 ORDER BY name;
