-- Passe tous les produits en « En stock » dans le tableau de bord.
--
-- Le badge admin lit uniquement products.stock :
--   0        → « Épuisé »       (rouge)
--   1 à 10   → « Stock faible »
--   > 10     → « En stock »     (vert)
--
-- Le seed du catalogue 2026 crée les produits à 0, d'où le badge rouge partout.
-- 1000 est une quantité de départ volontairement large ; ajustez ensuite
-- produit par produit depuis l'espace admin.
--
-- Le filtre `stock <= 10` cible exactement les produits qui n'affichent pas
-- encore « En stock », et préserve les quantités déjà saisies à la main.
--
-- Appliqué le 2026-08-03 : 91 lignes mises à jour, 17 conservées.

UPDATE products
SET stock = 1000
WHERE stock <= 10;
