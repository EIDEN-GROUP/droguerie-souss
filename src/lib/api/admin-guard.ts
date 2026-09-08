import { createMiddleware } from "@tanstack/react-start";
import { createSessionClient } from "./auth";
import { createAdminClient } from "./db";

/**
 * Garde d'autorisation des server functions d'administration.
 *
 * Principe : le navigateur stocke la session Supabase Auth dans des cookies
 * (createBrowserClient de @supabase/ssr). Ici, côté serveur, on relit ces
 * cookies, on valide le JWT auprès de Supabase Auth (`getUser`, pas un simple
 * décodage local), puis on vérifie que l'e-mail figure dans `admin_users`
 * (migration 008) avec le rôle requis.
 *
 * Trois niveaux :
 * - `requireAuth`      : session valide (utilisé par getAdminRole, pré-rôle).
 * - `requireAdminUser` : session + ligne admin_users (admin OU sales).
 * - `requireFullAdmin` : session + role = 'admin' (miroir de l'UI : sales est
 *   exclu de /admin/products, /admin/categories, /admin/subcategories).
 *
 * Les lectures publiques du storefront (produits, catégories, commande,
 * contact, auth) restent SANS garde — seules les mutations et les lectures
 * sensibles (commandes, messages, exports, uploads) sont verrouillées.
 */

export type AdminRole = "admin" | "sales";

async function resolveAdminUser(): Promise<{ email: string; role: AdminRole }> {
  const supabase = createSessionClient();
  // getUser() revalide le token auprès du serveur Auth : un JWT forgé ou
  // expiré est rejeté ici.
  const { data, error } = await supabase.auth.getUser();
  const email = !error ? data.user?.email : undefined;
  if (!email) {
    throw new Error("Non autorisé : connexion requise.");
  }
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("admin_users")
    .select("role")
    .eq("email", email)
    .maybeSingle();
  if (!row) {
    throw new Error("Accès refusé : compte non administrateur.");
  }
  return { email, role: row.role as AdminRole };
}

/** Session Supabase valide, sans exigence de rôle. */
export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const supabase = createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Non autorisé : connexion requise.");
  }
  return next({
    context: { authUserId: data.user.id, authEmail: data.user.email ?? null },
  });
});

/** Session + présence dans admin_users (rôles admin et sales). */
export const requireAdminUser = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const admin = await resolveAdminUser();
  return next({
    context: { adminEmail: admin.email, adminRole: admin.role },
  });
});

/** Session + rôle 'admin' strict (catalogue : produits, catégories, uploads). */
export const requireFullAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const admin = await resolveAdminUser();
  if (admin.role !== "admin") {
    throw new Error("Accès refusé : rôle admin requis.");
  }
  return next({
    context: { adminEmail: admin.email, adminRole: admin.role },
  });
});
