import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { createAdminClient } from "./db";

export const signupCustomer = createServerFn({ method: "POST" })
  .validator((data: { email: string; fullName: string; password: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { email, fullName, password } = ctx.data;

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      throw new Error("Un compte existe déjà avec cet email");
    }

    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("customers")
      .insert({ email, full_name: fullName, password_hash: passwordHash })
      .select("id, email, full_name")
      .single();

    if (error) throw new Error("Erreur lors de la création du compte");
    return { id: data.id, email: data.email, fullName: data.full_name };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { email, password } = ctx.data;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, email, full_name, password_hash")
      .eq("email", email)
      .single();

    if (error || !customer) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      throw new Error("Email ou mot de passe incorrect");
    }

    return { id: customer.id, email: customer.email, fullName: customer.full_name };
  });

export const getCustomerByEmail = createServerFn({ method: "GET" })
  .validator((data: { email: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("customers")
      .select("id, email, full_name")
      .eq("email", ctx.data.email)
      .single();
    if (error) return null;
    return { id: data.id, email: data.email, fullName: data.full_name };
  });
