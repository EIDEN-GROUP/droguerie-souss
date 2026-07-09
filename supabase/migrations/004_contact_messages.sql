CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Only the service role can read/write contact_messages
CREATE POLICY "Service role can manage contact_messages"
  ON contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
