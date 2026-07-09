import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

export function createAdminClient() {
  const url = getEnv("VITE_SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export async function sendEmail(params: {
  adminSubject: string;
  adminHtml: string;
  customerTo?: string;
  customerSubject?: string;
  customerHtml?: string;
}) {
  if (import.meta.env.DEV) {
    console.log("--- EMAIL NOTIFICATION (dev mode) ---");
    console.log("Admin:", params.adminSubject);
    if (params.customerTo) console.log("Customer:", params.customerTo, "-", params.customerSubject);
    console.log("--- END EMAIL ---");
    return;
  }

  const supabaseUrl = getEnv("VITE_SUPABASE_URL");
  const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");

  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error("send-email edge function failed:", err);
    return;
  }

  console.log("Email sent (admin + customer)");
}
