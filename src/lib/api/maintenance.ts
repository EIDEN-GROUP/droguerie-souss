import { createServerFn } from "@tanstack/react-start";

/**
 * MODE MAINTENANCE - interrupteur ENV, même convention que le SITE-GATE.
 *
 * Le bandeau est actif si `VITE_MAINTENANCE_MODE=true` (figé au build, lu
 * aussi côté client) OU `MAINTENANCE_MODE=true` côté serveur (runtime :
 * modifiable sur Vercel via Environment Variables, appliqué à chaque
 * requête SSR sans rebuild tant que `VITE_MAINTENANCE_MODE` n'est pas `true`).
 * Toute autre valeur - ou variable absente - = site OUVERT.
 *
 * Mettez `=true` pour afficher la page « Site en maintenance » sur TOUTES
 * les pages (via <Maintenance> dans __root.tsx), `=false` ou supprimez la
 * variable pour rouvrir le site.
 */

function readEnv(key: string): string | undefined {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.[key] != null) {
      return String(import.meta.env[key]);
    }
  } catch {
    /* import.meta indisponible côté pur Node */
  }
  if (typeof process !== "undefined" && process.env?.[key] != null) {
    return String(process.env[key]);
  }
  return undefined;
}

/** Interrupteur d'activation - défaut : DÉSACTIVÉ (site ouvert). */
export function isMaintenanceEnabled(): boolean {
  const raw = readEnv("VITE_MAINTENANCE_MODE") ?? readEnv("MAINTENANCE_MODE");
  return raw?.trim().toLowerCase() === "true";
}

/** Le mode maintenance est-il actif ? (appelé côté serveur) */
export const getMaintenanceStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { active: isMaintenanceEnabled() };
});
