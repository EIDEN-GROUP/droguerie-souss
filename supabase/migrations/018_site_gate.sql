-- Verrou d'accès au site (SITE-GATE).
-- Les identifiants vivent en base ; le mot de passe est haché avec bcrypt.
-- Aucune policy RLS n'est créée : la table n'est donc lisible QUE par le
-- serveur via SUPABASE_SERVICE_ROLE_KEY (jamais depuis le navigateur).

CREATE TABLE IF NOT EXISTS site_gate_users (
  username text PRIMARY KEY,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_gate_users ENABLE ROW LEVEL SECURITY;

-- Compte initial EIDEN (mot de passe : voir migration 020, rotation effectuée
-- car l'ancien figurait en clair dans l'historique — ne JAMAIS écrire un mot
-- de passe en clair dans une migration).
-- Pour changer le mot de passe : générer un hash hors base, par ex. via
-- node -e "require('bcryptjs').hash('NOUVEAU_MDP',10,(e,h)=>console.log(h))"
INSERT INTO site_gate_users (username, password_hash)
VALUES ('EIDEN', '$2b$10$bPoSjVdZ783dwO/oYhrXdecD0PzSyh3jYw/AuuCamivw94MBzVaKq')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;