-- Seed initial products
INSERT INTO products (id, name, category, price, unit, image_url, description, bestseller, seasonal, promo, stock) VALUES
  ('p1', 'Carrelage Grès Cérame 60x60', 'Carrelage', 89, 'm²', '/images/cat-tiles.jpg', 'Carrelage grès cérame émaillé, finition mate, adapté sols intérieurs et extérieurs. Résistant au gel et aux taches.', true, false, null, 120),
  ('p2', 'Marbre Blanc Carrera Poli', 'Marbre', 480, 'm²', '/images/cat-marble.jpg', 'Dalle de marbre blanc Carrara importé d''Italie, veinage gris naturel, poli miroir. Idéal plans de travail et revêtements.', true, true, null, 8),
  ('p3', 'Peinture Acrylique Intérieure 15L', 'Peinture', 320, 'seau', '/images/cat-paint.jpg', 'Peinture acrylique mate haute couvrance, sans odeur, séchage rapide. Disponible en 40 teintes.', false, false, 15, 0),
  ('p4', 'Ciment CPJ 45 - Sac 50kg', 'Ciment & Granulats', 68, 'sac', '/images/cat-cement.jpg', 'Ciment Portland composé, classe 45, conforme à la norme marocaine NM 10.1.004. Livraison en palettes.', true, false, null, 300),
  ('p5', 'Zellige Traditionnel Fès 10x10', 'Zellige', 650, 'm²', '/images/cat-zellige.jpg', 'Zellige émaillé fait main à Fès, motifs géométriques traditionnels, cuisson artisanale au four à bois.', true, true, null, 15),
  ('p6', 'Plâtre de Construction 25kg', 'Plâtre', 45, 'sac', '/images/cat-plaster.jpg', 'Plâtre standard pour enduit intérieur, prise rapide, finition lisse. Application manuelle ou mécanique.', false, false, null, 0),
  ('p7', 'Câble Électrique H07V-U 2.5mm² 100m', 'Électricité', 380, 'rouleau', '/images/cat-electrical.jpg', 'Câble rigide cuivre isolation PVC, conforme NF C 32-201, pour installations domestiques et tertiaires.', false, false, 10, 40),
  ('p8', 'Tuyau PVC Ø110 Évacuation 3m', 'Plomberie', 95, 'barre', '/images/cat-pipes.jpg', 'Tube PVC pression série évacuation eaux usées, norme NF, joint intégré. Résistant chimique.', false, false, null, 60),
  ('p9', 'Kit Visserie & Chevilles 500 pièces', 'Quincaillerie', 149, 'boîte', '/images/cat-hardware.jpg', 'Assortiment complet de vis, chevilles nylon et écrous en acier zingué. Coffret organisé par tailles.', true, false, null, 200),
  ('p10', 'Sable de Rivière 0/4 - Big Bag 1m³', 'Ciment & Granulats', 240, 'm³', '/images/cat-cement.jpg', 'Sable lavé calibré pour mortier et béton, granulométrie 0-4mm, livraison en big bag.', false, false, null, 25),
  ('p11', 'Peinture Façade Anti-Fissures 20L', 'Peinture', 890, 'seau', '/images/cat-paint.jpg', 'Peinture élastomère haute résistance intempéries, imperméabilité totale, garantie 10 ans.', false, true, 20, 0),
  ('p12', 'Marbre Noir Marquina Adouci', 'Marbre', 620, 'm²', '/images/cat-marble.jpg', 'Marbre noir intense avec veines blanches contrastées, finition adoucie non glissante.', false, false, null, 10)
ON CONFLICT (id) DO NOTHING;
