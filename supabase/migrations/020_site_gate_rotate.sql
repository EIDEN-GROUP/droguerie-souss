-- Rotation du mot de passe du verrou d'accès (SITE-GATE).
--
-- L'ancien mot de passe figurait en clair dans la migration 018 : il est
-- considéré comme compromis. Ce hash le remplace pour l'utilisateur EIDEN.
-- Ne JAMAIS inscrire un mot de passe en clair dans une migration.

UPDATE site_gate_users
SET password_hash = '$2b$10$z3oygeir0glyWYZoMeX2WuElacVUAkLu2QTfBu.LgxLC69SYcLX0G'
WHERE username = 'EIDEN';
