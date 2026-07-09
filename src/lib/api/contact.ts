import { createServerFn } from "@tanstack/react-start";
import { createAdminClient, sendAdminEmail } from "./db";
import { contactNotificationEmail } from "@/lib/email-templates";

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

    sendAdminEmail(
      "Nouveau message de contact — Droguerie Souss",
      contactNotificationEmail({
        name: ctx.data.name,
        phone: ctx.data.phone,
        email: ctx.data.email,
        city: ctx.data.city,
        message: ctx.data.message,
      }),
    );

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
