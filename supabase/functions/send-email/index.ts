import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = Deno.env.get("SMTP_PORT") || "587";
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Droguerie Souss <noreply@drogueriesouss.ma>";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("[send-email] SMTP not configured");
    return new Response(JSON.stringify({ ok: false, error: "SMTP not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!payload.to || !payload.subject || !payload.html) {
    return new Response(JSON.stringify({ ok: false, error: "Missing to, subject, or html" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_PORT === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  } catch (err) {
    console.error("[send-email] Failed:", err);
    await transport.close();
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await transport.close();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
