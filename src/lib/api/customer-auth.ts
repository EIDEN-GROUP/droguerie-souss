import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { createAdminClient } from "./db";
import { setCustomerSession, requireCustomerEmail } from "./customer-session";

/** Anti-bruteforce / anti-spam (en mémoire, par instance — même motif qu'ailleurs). */
const MAX_AUTH_PER_WINDOW = 8;
const AUTH_WINDOW_MS = 10 * 60 * 1000;
let authAttempts: number[] = [];

function checkAuthRateLimit() {
  const now = Date.now();
  authAttempts = authAttempts.filter((t) => now - t < AUTH_WINDOW_MS);
  if (authAttempts.length >= MAX_AUTH_PER_WINDOW) {
    throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
  }
  authAttempts.push(now);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const signupCustomer = createServerFn({ method: "POST" })
  .validator((data: { email: string; fullName: string; password: string }) => data)
  .handler(async (ctx) => {
    checkAuthRateLimit();
    const supabase = createAdminClient();
    const email = String(ctx.data.email || "")
      .toLowerCase()
      .trim();
    const fullName = String(ctx.data.fullName || "")
      .trim()
      .slice(0, 120);
    const password = String(ctx.data.password || "");
    if (!EMAIL_RE.test(email)) throw new Error("Adresse e-mail invalide.");
    if (fullName.length < 2) throw new Error("Veuillez indiquer votre nom.");

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
    // Connecte aussitôt : pose le cookie de session vérifiable.
    setCustomerSession(data.id, data.email);
    return { id: data.id, email: data.email, fullName: data.full_name };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async (ctx) => {
    checkAuthRateLimit();
    const supabase = createAdminClient();
    const email = String(ctx.data.email || "")
      .toLowerCase()
      .trim();
    const password = String(ctx.data.password || "");
    if (!EMAIL_RE.test(email) || !password) {
      throw new Error("Email ou mot de passe incorrect");
    }

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

    setCustomerSession(customer.id, customer.email);
    return { id: customer.id, email: customer.email, fullName: customer.full_name };
  });

export const getCustomerByEmail = createServerFn({ method: "GET" })
  .validator((data: { email: string }) => data)
  .handler(async (ctx) => {
    // Lecture réservée au compte lui-même (anti-énumération).
    requireCustomerEmail(ctx.data.email);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("customers")
      .select("id, email, full_name")
      .eq("email", ctx.data.email)
      .single();
    if (error) return null;
    return { id: data.id, email: data.email, fullName: data.full_name };
  });
