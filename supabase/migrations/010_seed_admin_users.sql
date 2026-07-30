INSERT INTO admin_users (email, role) VALUES
  ('admin@soussdroguerie.com', 'admin'),
  ('sales@soussdroguerie.com', 'sales')
ON CONFLICT (email) DO NOTHING;
