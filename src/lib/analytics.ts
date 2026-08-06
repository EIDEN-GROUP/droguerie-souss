/**
 * Google Analytics 4 — chargement conditionnel.
 *
 * La balise <script> et le suivi de pageview ne sont actifs que si
 * `VITE_GA_MEASUREMENT_ID` est défini (voir .env.example). Rien n'est injecté
 * tant que l'ID n'est pas renseigné : le site reste fonctionnel sans GA4.
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID) || undefined;

/** Balises <script> à injecter dans le <head> (vide si pas d'ID configuré). */
export function gaHeadScripts(): Array<{
  type: string;
  children?: string;
  async?: boolean;
  src?: string;
}> {
  if (!GA_MEASUREMENT_ID) return [];
  return [
    {
      type: "text/javascript",
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
    },
    {
      type: "text/javascript",
      children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{send_page_view:false});`,
    },
  ];
}

/** Suivi de pageview à chaque navigation (appelé par le routeur TanStack). */
export function trackPageview(path: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.gtag !== "function") return;
  w.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
}
