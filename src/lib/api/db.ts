import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

export function createAdminClient() {
  const url = getEnv("VITE_SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export async function sendAdminEmail(subject: string, html: string) {
  if (import.meta.env.DEV) {
    console.log("--- EMAIL NOTIFICATION (dev mode) ---");
    console.log("Subject:", subject);
    console.log("Body:", html.replace(/<[^>]*>/g, "").slice(0, 500));
    console.log("--- END EMAIL ---");
    return;
  }

  const supabaseUrl = getEnv("VITE_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const url = `${supabaseUrl}/functions/v1/send-email`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    console.error(`Email send failed (${res.status}): ${body}`);
  }
}
