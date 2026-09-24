import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { getEnv } from "./env";

/**
 * Session client vérifiable côté serveur (cookie signé, httpOnly).
 *
 * Le store zustand (localStorage) se falsifie en deux clics : toute lecture
 * de données personnelles exige donc ce cookie, posé à la connexion
 * (loginCustomer/signupCustomer) et comparé à l'e-mail demandé.
 */

const COOKIE = "customer_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function secret(): string {
  return getEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

function sign(id: string, email: string): string {
  return createHmac("sha256", secret())
    .update(`customer:${id}:${email.toLowerCase()}`)
    .digest("hex");
}

/** Pose le cookie de session après login/signup réussi. */
export function setCustomerSession(id: string, email: string) {
  const normalized = email.toLowerCase().trim();
  const token = `${id}.${b64url(normalized)}.${sign(id, normalized)}`;
  const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  setCookie(COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: MAX_AGE,
  });
}

/** Supprime le cookie (déconnexion). */
export function clearCustomerSession() {
  setCookie(COOKIE, "", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
}

/** Lit et vérifie le cookie. null = visiteur anonyme ou cookie forgé. */
export function getCustomerSession(): { id: string; email: string } | null {
  try {
    const token = getCookies()[COOKIE];
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [id, emailB64, sig] = parts;
    if (!id || !emailB64 || !sig) return null;
    const email = unb64url(emailB64);
    const expected = Buffer.from(sign(id, email), "hex");
    const given = Buffer.from(sig, "hex");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    return { id, email };
  } catch {
    return null;
  }
}

/**
 * Exige une session client dont l'e-mail correspond à celui demandé
 * (comparaison insensible à la casse). À appeler EN PREMIER dans le handler.
 */
export function requireCustomerEmail(requestedEmail: unknown): { id: string; email: string } {
  const session = getCustomerSession();
  const wanted = String(requestedEmail ?? "")
    .toLowerCase()
    .trim();
  if (!session || !wanted || session.email.toLowerCase() !== wanted) {
    throw new Error("Non autorisé : connectez-vous pour voir vos commandes.");
  }
  return session;
}

/** Détruit la session serveur (appelé par la déconnexion client). */
export const clearCustomerSessionFn = createServerFn({ method: "POST" }).handler(async () => {
  clearCustomerSession();
  return { success: true };
});
