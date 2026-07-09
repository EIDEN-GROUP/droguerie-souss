// Supabase Edge Function — transactional emails via SMTP
// Configure SMTP in Supabase Dashboard > Auth > SMTP Settings
// Set ADMIN_EMAIL as a secret: npx supabase secrets set ADMIN_EMAIL=your@email.com

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.16";

interface EmailPayload {
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { subject, html } = (await req.json()) as EmailPayload;
    if (!subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields: subject, html" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const to = Deno.env.get("ADMIN_EMAIL");
    if (!to) {
      return new Response(JSON.stringify({ error: "ADMIN_EMAIL secret not set" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOSTNAME")!,
      port: Number(Deno.env.get("SMTP_PORT") || "587"),
      secure: Deno.env.get("SMTP_PORT") === "465",
      auth: {
        user: Deno.env.get("SMTP_USERNAME")!,
        pass: Deno.env.get("SMTP_PASSWORD")!,
      },
    });

    const from = Deno.env.get("SMTP_FROM") || "Droguerie Souss <noreply@drogueriesouss.ma>";

    await transporter.sendMail({ from, to, subject, html });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
