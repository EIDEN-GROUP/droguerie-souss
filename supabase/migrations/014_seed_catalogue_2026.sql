-- Catalogue SOUSS DROGUERIE 2026 — catégories, sous-catégories et produits céramique.
-- Source : CATALOGUE SSD 2026.pdf (65 pages).
--
-- Prérequis : 013_subcategories.sql doit avoir été appliqué (table subcategories).
-- Ce script est idempotent : il peut être rejoué sans créer de doublons.
-- Il est ADDITIF — il ne supprime rien. Voir la section 5 (commentée) pour retirer
-- les données de démonstration d'origine.

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. Format des carreaux (60x60, 30x90, ...) porté par le produit
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimension text;

CREATE INDEX IF NOT EXISTS idx_products_dimension ON products(dimension);

-- ─────────────────────────────────────────────────────────────
-- 2. Catégories (11) — les 11 catégories du catalogue
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description) VALUES
  ('Céramique', 'ceramique', 'Carrelages muraux, de sols et de piscines'),
  ('Ciment Colle & Mortiers', 'ciment-colle-mortiers', 'Produits de collage et de jointement haute performance'),
  ('Sanitaire, Robinetterie, Plomberie', 'sanitaire-robinetterie-plomberie', 'Équipements sanitaires, robinetterie et accessoires SDB & cuisine'),
  ('Étanchéité, Isolation, Bitume', 'etancheite-isolation-bitume', 'Panneaux isolants, rouleaux bitumés et solutions d''étanchéité'),
  ('Fer à Béton, Treillis Soudé', 'fer-a-beton-treillis-soude', 'Armatures pour béton armé'),
  ('Produits Préfabriqués', 'produits-prefabriques', 'Agglos, pavés, planchers, bordures et rev-sol'),
  ('Métallurgie', 'metallurgie', 'Fer, acier, tôles, tubes et profilés pour la construction métallique'),
  ('Énergie Solaire, Électricité', 'energie-solaire-electricite', 'Chauffe-eaux, kits solaires, onduleurs et batteries'),
  ('Peinture & Décoration', 'peinture-decoration', 'Peintures vinyliques, laquées, enduits et décoratives'),
  ('Béton Armé, Ciments, Agrégats', 'beton-arme-ciments-agregats', 'Matières premières du gros œuvre à la finition'),
  ('Plâtres, Mono & Bicouche', 'platres-mono-bicouche', 'Plâtres et enduits projetés intérieur, extérieur et façades')
ON CONFLICT (name) DO UPDATE SET
  slug        = EXCLUDED.slug,
  description = EXCLUDED.description;

-- ─────────────────────────────────────────────────────────────
-- 3. Sous-catégories (44)
-- ─────────────────────────────────────────────────────────────
INSERT INTO subcategories (category, name, slug, description) VALUES
  ('Céramique', 'Collections', 'collections', 'Collections mises en avant du catalogue 2026'),
  ('Céramique', 'Carreaux Locaux', 'carreaux-locaux', 'Super Cérame, MultiCérame, Dersa...'),
  ('Céramique', 'Carreaux d''Importation', 'carreaux-importation', 'Pamesa, Cerpa, Alaplana, AUE...'),
  ('Céramique', 'Carreaux Piscine', 'carreaux-piscine', 'Carrelages spécifiques pour bassins et plages de piscine'),
  ('Céramique', 'Parquet', 'parquet', 'Carreaux effet bois et parquet'),
  ('Ciment Colle & Mortiers', 'Ciment Colle', 'ciment-colle', 'Colles à carrelage'),
  ('Ciment Colle & Mortiers', 'Mortiers', 'mortiers', 'Mortiers de pose et de réparation'),
  ('Ciment Colle & Mortiers', 'Joints', 'joints', 'Produits de jointement'),
  ('Sanitaire, Robinetterie, Plomberie', 'Sanitaire SDB & Cuisine', 'sanitaire-sdb-cuisine', 'Équipements sanitaires salle de bain et cuisine'),
  ('Sanitaire, Robinetterie, Plomberie', 'Robinetterie & Mitigeurs', 'robinetterie-mitigeurs', 'Robinets, mitigeurs et douchettes'),
  ('Sanitaire, Robinetterie, Plomberie', 'Accessoires', 'accessoires-sanitaire', 'Accessoires SDB et cuisine'),
  ('Sanitaire, Robinetterie, Plomberie', 'Plomberie', 'plomberie', 'Tuyauterie, raccords et évacuation'),
  ('Étanchéité, Isolation, Bitume', 'Étanchéité', 'etancheite', 'Membranes et produits d''imperméabilité'),
  ('Étanchéité, Isolation, Bitume', 'Isolation', 'isolation', 'Panneaux de laine vitrifiée, isolation thermique et phonique'),
  ('Étanchéité, Isolation, Bitume', 'Bitume & Rouleaux Bitumés', 'bitume-rouleaux', 'Rouleaux bitumés et produits bitumineux'),
  ('Fer à Béton, Treillis Soudé', 'Fer à Béton', 'fer-a-beton', 'Barres d''armature pour béton armé'),
  ('Fer à Béton, Treillis Soudé', 'Treillis Soudé', 'treillis-soude', 'Panneaux de treillis soudé'),
  ('Produits Préfabriqués', 'Agglos', 'agglos', 'Blocs et agglomérés de construction'),
  ('Produits Préfabriqués', 'Pavés Autobloquants', 'paves-autobloquants', 'Pavés pour voiries et aménagements extérieurs'),
  ('Produits Préfabriqués', 'Planchers', 'planchers', 'Hourdis et poutrelles'),
  ('Produits Préfabriqués', 'Bordures', 'bordures', 'Bordures de trottoir et caniveaux'),
  ('Produits Préfabriqués', 'Rev-sol', 'rev-sol', 'Revêtements de sol préfabriqués'),
  ('Métallurgie', 'Fer & Acier', 'fer-acier', 'Fer et acier de construction'),
  ('Métallurgie', 'Tôles', 'toles', 'Tôles planes et nervurées'),
  ('Métallurgie', 'Tubes', 'tubes', 'Tubes ronds, carrés et rectangulaires'),
  ('Métallurgie', 'Profilés', 'profiles', 'Profilés métalliques'),
  ('Métallurgie', 'Annexes', 'annexes-metallurgie', 'Accessoires et annexes de métallurgie'),
  ('Énergie Solaire, Électricité', 'Chauffe-Eaux', 'chauffe-eaux', 'Chauffe-eaux solaires et électriques'),
  ('Énergie Solaire, Électricité', 'Kits Solaires', 'kits-solaires', 'Panneaux et kits photovoltaïques'),
  ('Énergie Solaire, Électricité', 'Onduleurs & Batteries', 'onduleurs-batteries', 'Onduleurs, régulateurs et batteries'),
  ('Énergie Solaire, Électricité', 'Supports & Annexes', 'supports-annexes', 'Supports de fixation et accessoires solaires'),
  ('Peinture & Décoration', 'Peintures Vinyliques', 'peinture-vinylique', 'Peintures vinyliques intérieures et extérieures'),
  ('Peinture & Décoration', 'Peintures Laquées', 'peinture-laquee', 'Laques et peintures glycéro'),
  ('Peinture & Décoration', 'Enduits', 'enduits-peinture', 'Enduits de lissage et de rebouchage'),
  ('Peinture & Décoration', 'Peintures Décoratives', 'peinture-decorative', 'Effets et finitions décoratives'),
  ('Peinture & Décoration', 'Peintures Aquatiques', 'peinture-aquatique', 'Peintures pour piscines et milieux humides'),
  ('Peinture & Décoration', 'Peintures Alimentaires', 'peinture-alimentaire', 'Peintures pour contact alimentaire'),
  ('Béton Armé, Ciments, Agrégats', 'Ciments', 'ciments', 'Ciments Lafarge Holcim, Ciments du Maroc...'),
  ('Béton Armé, Ciments, Agrégats', 'Agrégats', 'agregats', 'Sable, gravier et granulats'),
  ('Béton Armé, Ciments, Agrégats', 'Béton Armé', 'beton-arme', 'Produits et adjuvants pour béton armé'),
  ('Plâtres, Mono & Bicouche', 'Plâtres', 'platres', 'Plâtres de construction et de finition'),
  ('Plâtres, Mono & Bicouche', 'Monocouche', 'monocouche', 'Enduits projetés monocouche'),
  ('Plâtres, Mono & Bicouche', 'Bicouche', 'bicouche', 'Enduits projetés bicouche'),
  ('Plâtres, Mono & Bicouche', 'Enduits de Façade', 'enduits-facade', 'Enduits extérieurs et façades')
ON CONFLICT (category, name) DO UPDATE SET
  slug        = EXCLUDED.slug,
  description = EXCLUDED.description;

-- ─────────────────────────────────────────────────────────────
-- 4. Produits céramique (93)
--    price_mode = 'quote' : le catalogue ne publie aucun prix.
--    Renseignez prix, stock et images depuis l'espace admin.
-- ─────────────────────────────────────────────────────────────
INSERT INTO products (name, category, subcategory, dimension, price_mode, price, unit, description, stock)
SELECT v.name, 'Céramique', v.subcategory, v.dimension, 'quote', 0, 'm²', v.description, 0
FROM (VALUES
  ('Carraplus', 'Collections', '60x60', 'Carrelage céramique format 60×60 — Collections. Catalogue SSD 2026, page 8.'),
  ('Vail Gris', 'Collections', '60x60', 'Carrelage céramique format 60×60 — Collections. Catalogue SSD 2026, page 9.'),
  ('Vail Créma', 'Collections', '60x60', 'Carrelage céramique format 60×60 — Collections. Catalogue SSD 2026, page 9.'),
  ('Mirage', 'Collections', '60x60', 'Carrelage céramique format 60×60 — Collections. Catalogue SSD 2026, page 10.'),
  ('Nano Crema', 'Collections', '50x50', 'Carrelage céramique format 50×50 — Collections. Catalogue SSD 2026, page 12.'),
  ('Nano Beige', 'Collections', '50x50', 'Carrelage céramique format 50×50 — Collections. Catalogue SSD 2026, page 12.'),
  ('Nano Gris', 'Collections', '50x50', 'Carrelage céramique format 50×50 — Collections. Catalogue SSD 2026, page 13.'),
  ('Nano Perla', 'Collections', '50x50', 'Carrelage céramique format 50×50 — Collections. Catalogue SSD 2026, page 13.'),
  ('Genova', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 15.'),
  ('Genova Dama', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 15.'),
  ('Java Beige', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 16.'),
  ('Java Dama', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 16.'),
  ('Java Loft', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 16.'),
  ('Saragossa', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 17.'),
  ('Saragossa Dama', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 17.'),
  ('Carraplus', 'Collections', '30x60', 'Carrelage céramique format 30×60 — Collections. Catalogue SSD 2026, page 18.'),
  ('Light Beige', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 20.'),
  ('Light Beige Déco', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 20.'),
  ('Light Perla', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 21.'),
  ('Light Perla Déco', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 21.'),
  ('Light Gris', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 22.'),
  ('Light Verda', 'Collections', '25x50', 'Carrelage céramique format 25×50 — Collections. Catalogue SSD 2026, page 22.'),
  ('Park Nature', 'Parquet', '19x57', 'Carrelage céramique format 19×57 — Parquet. Catalogue SSD 2026, page 26.'),
  ('Park Marron', 'Parquet', '19x57', 'Carrelage céramique format 19×57 — Parquet. Catalogue SSD 2026, page 26.'),
  ('Park Galéon', 'Parquet', '19x57', 'Carrelage céramique format 19×57 — Parquet. Catalogue SSD 2026, page 26.'),
  ('Park Miel', 'Parquet', '19x57', 'Carrelage céramique format 19×57 — Parquet. Catalogue SSD 2026, page 26.'),
  ('Park Gris Foncé', 'Parquet', '19x57', 'Carrelage céramique format 19×57 — Parquet. Catalogue SSD 2026, page 26.'),
  ('62032', 'Parquet', '20x60', 'Carrelage céramique format 20×60 — Parquet. Catalogue SSD 2026, page 27.'),
  ('62037', 'Parquet', '20x60', 'Carrelage céramique format 20×60 — Parquet. Catalogue SSD 2026, page 27.'),
  ('62035', 'Parquet', '20x60', 'Carrelage céramique format 20×60 — Parquet. Catalogue SSD 2026, page 27.'),
  ('62055', 'Parquet', '20x60', 'Carrelage céramique format 20×60 — Parquet. Catalogue SSD 2026, page 27.'),
  ('Chelsea Clair', 'Carreaux Locaux', '25x75', 'Carrelage céramique format 25×75 — Carreaux Locaux. Catalogue SSD 2026, page 28.'),
  ('River Clair', 'Carreaux Locaux', '25x75', 'Carrelage céramique format 25×75 — Carreaux Locaux. Catalogue SSD 2026, page 28.'),
  ('Luna', 'Carreaux Locaux', '25x75', 'Carrelage céramique format 25×75 — Carreaux Locaux. Catalogue SSD 2026, page 28.'),
  ('Travertin Beige', 'Carreaux Locaux', '25x75', 'Carrelage céramique format 25×75 — Carreaux Locaux. Catalogue SSD 2026, page 28.'),
  ('Medina Déco', 'Carreaux Locaux', '30x60', 'Carrelage céramique format 30×60 — Carreaux Locaux. Catalogue SSD 2026, page 29.'),
  ('Teka Gris Foncé', 'Carreaux Locaux', '30x60', 'Carrelage céramique format 30×60 — Carreaux Locaux. Catalogue SSD 2026, page 29.'),
  ('Cosmos Gris', 'Carreaux Locaux', '30x60', 'Carrelage céramique format 30×60 — Carreaux Locaux. Catalogue SSD 2026, page 29.'),
  ('Lava Gris', 'Carreaux Locaux', '30x60', 'Carrelage céramique format 30×60 — Carreaux Locaux. Catalogue SSD 2026, page 29.'),
  ('82008', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('82111', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('Brica Sable', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('Crema Marfil', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('Verdas', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('Urano', 'Carreaux Locaux', '41x41', 'Carrelage céramique format 41×41 — Carreaux Locaux. Catalogue SSD 2026, page 30.'),
  ('45000', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('45021', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('45048', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('45009', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('45046', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('45020', 'Carreaux Locaux', '45x45', 'Carrelage céramique format 45×45 — Carreaux Locaux. Catalogue SSD 2026, page 31.'),
  ('107', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('Capio Beige', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('Belem Beige Foncé', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('Hawz', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('100', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('Alaska Gris Foncé', 'Carreaux Locaux', '50x50', 'Carrelage céramique format 50×50 — Carreaux Locaux. Catalogue SSD 2026, page 32.'),
  ('Antique', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Finix Crema Marfil', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Marbella', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Calara Gris', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Golden Beige', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Pike Gris', 'Carreaux Locaux', '60x60', 'Carrelage céramique format 60×60 — Carreaux Locaux. Catalogue SSD 2026, page 33.'),
  ('Calacata', 'Carreaux Locaux', '120x60', 'Carrelage céramique format 120×60 — Carreaux Locaux. Catalogue SSD 2026, page 35.'),
  ('Onyx Bleu', 'Carreaux Locaux', '120x60', 'Carrelage céramique format 120×60 — Carreaux Locaux. Catalogue SSD 2026, page 35.'),
  ('Caprice Noir', 'Carreaux Locaux', '120x60', 'Carrelage céramique format 120×60 — Carreaux Locaux. Catalogue SSD 2026, page 35.'),
  ('Terrazo Gris', 'Carreaux Locaux', '120x60', 'Carrelage céramique format 120×60 — Carreaux Locaux. Catalogue SSD 2026, page 35.'),
  ('Grown', 'Carreaux Locaux', '30x90', 'Carrelage céramique format 30×90 — Carreaux Locaux. Catalogue SSD 2026, page 36.'),
  ('Onyx Bleu', 'Carreaux Locaux', '30x90', 'Carrelage céramique format 30×90 — Carreaux Locaux. Catalogue SSD 2026, page 36.'),
  ('Jade', 'Carreaux Locaux', '30x90', 'Carrelage céramique format 30×90 — Carreaux Locaux. Catalogue SSD 2026, page 36.'),
  ('Glass', 'Carreaux Locaux', '30x90', 'Carrelage céramique format 30×90 — Carreaux Locaux. Catalogue SSD 2026, page 36.'),
  ('Nero', 'Carreaux d''Importation', '240x120', 'Carrelage céramique format 240×120 — Carreaux d''Importation. Catalogue SSD 2026, page 38.'),
  ('Green', 'Carreaux d''Importation', '240x120', 'Carrelage céramique format 240×120 — Carreaux d''Importation. Catalogue SSD 2026, page 38.'),
  ('Natural', 'Carreaux d''Importation', '240x120', 'Carrelage céramique format 240×120 — Carreaux d''Importation. Catalogue SSD 2026, page 38.'),
  ('Qala Pulido', 'Carreaux d''Importation', '240x120', 'Carrelage céramique format 240×120 — Carreaux d''Importation. Catalogue SSD 2026, page 38.'),
  ('Estatuario', 'Carreaux d''Importation', '120x60', 'Carrelage céramique format 120×60 — Carreaux d''Importation. Catalogue SSD 2026, page 39.'),
  ('Velhira', 'Carreaux d''Importation', '120x60', 'Carrelage céramique format 120×60 — Carreaux d''Importation. Catalogue SSD 2026, page 39.'),
  ('Opulus', 'Carreaux d''Importation', '120x60', 'Carrelage céramique format 120×60 — Carreaux d''Importation. Catalogue SSD 2026, page 39.'),
  ('Crown', 'Carreaux d''Importation', '120x60', 'Carrelage céramique format 120×60 — Carreaux d''Importation. Catalogue SSD 2026, page 39.'),
  ('Pure Light', 'Carreaux d''Importation', '60x60', 'Carrelage céramique format 60×60 — Carreaux d''Importation. Catalogue SSD 2026, page 40.'),
  ('Perlino Rosa', 'Carreaux d''Importation', '60x60', 'Carrelage céramique format 60×60 — Carreaux d''Importation. Catalogue SSD 2026, page 40.'),
  ('Apulia Gold', 'Carreaux d''Importation', '60x60', 'Carrelage céramique format 60×60 — Carreaux d''Importation. Catalogue SSD 2026, page 40.'),
  ('Calacata', 'Carreaux d''Importation', '60x60', 'Carrelage céramique format 60×60 — Carreaux d''Importation. Catalogue SSD 2026, page 40.'),
  ('Technico Beige/Gris', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Pâte Grise', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Masse Teintée', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Antidérapant', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Anti-acide', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Technique', 'Carreaux d''Importation', '20x20', 'Carrelage céramique format 20×20 — Carreaux d''Importation. Catalogue SSD 2026, page 41.'),
  ('Sienna Marengo', 'Carreaux d''Importation', '20x120', 'Carrelage céramique format 20×120 — Carreaux d''Importation. Catalogue SSD 2026, page 42.'),
  ('Boreal Taupe', 'Carreaux d''Importation', '20x120', 'Carrelage céramique format 20×120 — Carreaux d''Importation. Catalogue SSD 2026, page 42.'),
  ('Évoque Perla', 'Carreaux d''Importation', '20x120', 'Carrelage céramique format 20×120 — Carreaux d''Importation. Catalogue SSD 2026, page 42.'),
  ('Air Roble', 'Carreaux d''Importation', '20x120', 'Carrelage céramique format 20×120 — Carreaux d''Importation. Catalogue SSD 2026, page 42.')
) AS v(name, subcategory, dimension, description)
WHERE NOT EXISTS (
  SELECT 1 FROM products p
  WHERE p.name = v.name
    AND p.category = 'Céramique'
    AND p.dimension IS NOT DISTINCT FROM v.dimension
);

COMMIT;

-- ─────────────────────────────────────────────────────────────
-- 5. OPTIONNEL — retirer les données de démonstration d'origine
--    (9 catégories + 12 produits du seed initial).
--    Décommentez UNIQUEMENT si vous voulez repartir du seul catalogue 2026.
--    Supprimer une catégorie supprime aussi ses sous-catégories (ON DELETE CASCADE).
-- ─────────────────────────────────────────────────────────────
-- BEGIN;
--
-- DELETE FROM products WHERE category IN (
--   'Carrelage', 'Marbre', 'Peinture', 'Ciment & Granulats', 'Zellige',
--   'Plâtre', 'Électricité', 'Plomberie', 'Quincaillerie'
-- );
--
-- DELETE FROM categories WHERE name IN (
--   'Carrelage', 'Marbre', 'Peinture', 'Ciment & Granulats', 'Zellige',
--   'Plâtre', 'Électricité', 'Plomberie', 'Quincaillerie'
-- );
--
-- COMMIT;
