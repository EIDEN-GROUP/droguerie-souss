import { createServerFn } from "@tanstack/react-start";
import { createAdminClient, sendEmail } from "./db";
import { contactCustomerConfirmation, contactNotificationEmail } from "@/lib/email-templates";

export const submitContact = createServerFn({ method: "POST" })
  .validator((data: { name: string; phone: string; email?: string; city?: string; message: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();

    const { data: record, error } = await supabase
      .from("contact_messages")
      .insert({
        name: ctx.data.name,
        phone: ctx.data.phone,
        email: ctx.data.email || null,
        city: ctx.data.city || null,
        message: ctx.data.message,
      })
      .select()
      .single();

    if (error) throw new Error("Erreur lors de l'envoi du message.");

    sendEmail({
      adminSubject: "Nouveau message de contact — Droguerie Souss",
      adminHtml: contactNotificationEmail({
        name: ctx.data.name,
        phone: ctx.data.phone,
        email: ctx.data.email,
        city: ctx.data.city,
        message: ctx.data.message,
      }),
      customerTo: ctx.data.email || undefined,
      customerSubject: "Nous avons bien reçu votre message — Droguerie Souss",
      customerHtml: ctx.data.email ? contactCustomerConfirmation({ name: ctx.data.name }) : undefined,
    }).catch((err) => console.error("sendEmail (contact) failed:", err));

    return { success: true, id: record.id };
  });

export const getContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
});

export const deleteContactMessage = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });
