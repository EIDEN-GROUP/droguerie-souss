import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "./db";
import { getEnv } from "./env";

/**
 * SITE-GATE — vérification serveur des identifiants d'accès au site.
 *
 * Le mot de passe n'apparaît JAMAIS côté client :
 * - il est stocké haché (bcrypt) dans la table Supabase `site_gate_users`
 *   (migration 018_site_gate.sql) ;
 * - la comparaison se fait ici, sur le serveur ;
 * - une fois validé, un cookie httpOnly signé (HMAC) est posé : impossible à
 *   forger sans la clé de service, relu par le serveur à chaque requête SSR.
 *
 * POUR RETIRER LE VERROU : voir l'en-tête de src/components/SiteGate.tsx.
 */

const GATE_COOKIE = "site_gate_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

/** Clé de signature : la clé de service Supabase, jamais exposée au navigateur. */
function signingSecret(): string {
  return getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("VITE_SUPABASE_ANON_KEY");
}

function sign(username: string): string {
  const sig = createHmac("sha256", signingSecret()).update(`site-gate:${username}`).digest("hex");
  return `${username}.${sig}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const username = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1), "hex");
  const expected = Buffer.from(
    createHmac("sha256", signingSecret()).update(`site-gate:${username}`).digest("hex"),
    "hex",
  );
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Anti brute-force minimaliste, en mémoire (par instance de serveur) :
// max 10 tentatives par fenêtre glissante de 5 minutes.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000;
let attempts: number[] = [];

/** Le site est-il déverrouillé pour ce visiteur ? (appelé côté serveur) */
export const getGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cookies = getCookies();
    return { unlocked: verifyToken(cookies[GATE_COOKIE]) };
  } catch {
    return { unlocked: false };
  }
});

/** Vérifie les identifiants contre Supabase et pose le cookie de session. */
export const verifyGateCredentials = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const now = Date.now();
    attempts = attempts.filter((t) => now - t < WINDOW_MS);
    if (attempts.length >= MAX_ATTEMPTS) {
      throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
    }
    attempts.push(now);

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from("site_gate_users")
      .select("password_hash")
      .eq("username", data.username)
      .maybeSingle();

    if (error) {
      // Table absente (migration non exécutée) ou accès indisponible.
      throw new Error("Accès indisponible : exécutez la migration 018_site_gate.sql.");
    }

    let valid = false;
    if (user) {
      valid = await bcrypt.compare(data.password, user.password_hash);
    }

    if (!valid) {
      throw new Error("Identifiants incorrects. Veuillez réessayer.");
    }

    setCookie(GATE_COOKIE, sign(data.username), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    });

    return { ok: true as const };
  });
