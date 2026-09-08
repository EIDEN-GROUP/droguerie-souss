-- Verrouillage RLS de toutes les tables métier (019).
--
-- Contexte : seules `contact_messages` (004) et `site_gate_users` (018)
-- avaient ROW LEVEL SECURITY. Sans RLS, la clé ANON (publique, livrée dans
-- le bundle JS via VITE_SUPABASE_ANON_KEY) permet lecture ET écriture
-- directes sur l'API REST Supabase, en contournant toute la logique serveur.
--
-- L'application n'accède aux données QUE via les server functions
-- (src/lib/api/*) avec SUPABASE_SERVICE_ROLE_KEY, et le rôle service_role
-- contourne RLS : activer RLS ne change donc rien au fonctionnement du site,
-- mais ferme l'accès direct anonyme/authentifié.
--
-- Tables déjà couvertes : contact_messages, site_gate_users.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_users',
    'categories',
    'customers',
    'dimensions',
    'order_items',
    'orders',
    'product_dimensions',
    'product_gifts',
    'products',
    'subcategories'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    -- Politique explicite (redondante pour service_role qui contourne RLS,
    -- mais documente l'intention, comme en 004) : seul le service_role gère.
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
        AND policyname = 'Service role can manage ' || t
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        'Service role can manage ' || t, t
      );
    END IF;
  END LOOP;
END
$$;
