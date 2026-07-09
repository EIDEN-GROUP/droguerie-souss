import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";

interface EmailPayload {
  adminSubject: string;
  adminHtml: string;
  customerTo?: string;
  customerSubject?: string;
  customerHtml?: string;
}

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = Deno.env.get("SMTP_PORT") || "587";
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Droguerie Souss <noreply@drogueriesouss.ma>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "";

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

  if (!ADMIN_EMAIL) {
    console.error("[send-email] ADMIN_EMAIL not configured");
    return new Response(JSON.stringify({ ok: false, error: "ADMIN_EMAIL not configured" }), {
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

  if (!payload.adminSubject || !payload.adminHtml) {
    return new Response(JSON.stringify({ ok: false, error: "Missing adminSubject or adminHtml" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.customerTo && (!payload.customerSubject || !payload.customerHtml)) {
    return new Response(JSON.stringify({ ok: false, error: "Missing customerSubject or customerHtml" }), {
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

  const errors: string[] = [];

  const send = async (to: string, subject: string, html: string) => {
    try {
      await transport.sendMail({ from: FROM_EMAIL, to, subject, html });
    } catch (err) {
      errors.push(`Failed to send to ${to}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  await Promise.all([
    send(ADMIN_EMAIL, payload.adminSubject, payload.adminHtml),
    payload.customerTo ? send(payload.customerTo, payload.customerSubject!, payload.customerHtml!) : Promise.resolve(),
  ]);

  await transport.close();

  if (errors.length > 0) {
    console.error("[send-email]", errors.join("; "));
    return new Response(JSON.stringify({ ok: false, errors }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
