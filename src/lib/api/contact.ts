import { createServerFn } from "@tanstack/react-start";
import { requireAdminUser } from "./admin-guard";
import { createAdminClient, sendEmail } from "./db";
import { contactCustomerConfirmation, contactNotificationEmail } from "@/lib/email-templates";

/** Garde-fous anti-spam/abus (aucun changement visuel côté formulaire) :
 *  validation stricte + plafond de taille + rate limit en mémoire. */
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;
let submissions: number[] = [];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()./-]{3,38}$/;

/** Caractères de contrôle à retirer des champs libres (source 100 % ASCII). */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(CONTROL_CHARS_RE, "")
    .trim()
    .slice(0, max);
}

export const submitContact = createServerFn({ method: "POST" })
  .validator(
    (data: { name: string; phone: string; email?: string; city?: string; message: string }) => data,
  )
  .handler(async (ctx) => {
    const now = Date.now();
    submissions = submissions.filter((t) => now - t < WINDOW_MS);
    if (submissions.length >= MAX_PER_WINDOW) {
      throw new Error("Trop de messages envoyés. Réessayez dans quelques minutes.");
    }

    const name = clean(ctx.data.name, 120);
    const phone = clean(ctx.data.phone, 40);
    const emailRaw = clean(ctx.data.email, 254);
    const city = clean(ctx.data.city, 120);
    const message = clean(ctx.data.message, 5000);

    if (name.length < 2) throw new Error("Veuillez indiquer votre nom.");
    if (!PHONE_RE.test(phone)) throw new Error("Numéro de téléphone invalide.");
    if (message.length < 10)
      throw new Error("Votre message est trop court (10 caractères minimum).");
    const email = emailRaw || undefined;
    if (email && !EMAIL_RE.test(email)) throw new Error("Adresse e-mail invalide.");

    submissions.push(now);
    const supabase = createAdminClient();

    const { data: record, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        phone,
        email: email || null,
        city: city || null,
        message,
      })
      .select()
      .single();

    if (error) throw new Error("Erreur lors de l'envoi du message.");

    sendEmail({
      adminSubject: "Nouveau message de contact   Souss Droguerie",
      adminHtml: contactNotificationEmail({
        name,
        phone,
        email,
        city: city || undefined,
        message,
      }),
      customerTo: email,
      customerSubject: "Nous avons bien reçu votre message   Souss Droguerie",
      customerHtml: email ? contactCustomerConfirmation({ name }) : undefined,
    }).catch((err) => console.error("sendEmail (contact) failed:", err));

    return { success: true, id: record.id };
  });

export const getContactMessages = createServerFn({ method: "GET" })
  .middleware([requireAdminUser])
  .handler(async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireAdminUser])
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });
