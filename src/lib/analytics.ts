/**
 * Google Analytics 4 — chargement conditionnel + consentement (vie privée).
 *
 * - Rien n'est chargé tant que `VITE_GA_MEASUREMENT_ID` est absent.
 * - Même avec un ID, AUCUNE requête vers Google ne part sans acceptation :
 *   le bandeau « Nous respectons votre vie privée » (ConsentBanner) demande
 *   le choix ; il est mémorisé dans localStorage ("sd-consent").
 * - Mode Consentement v2 : par défaut tout est refusé ; le mini-script
 *   d'amorçage (inline, sans cookie, sans requête) restaure l'autorisation
 *   uniquement si un accord préalable existe, puis charge gtag.
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID) || undefined;

export const CONSENT_KEY = "sd-consent";

export type ConsentChoice = "granted" | "denied" | null;

/** Choix mémorisé (null = bandeau à afficher). Toujours null côté serveur. */
export function getConsent(): ConsentChoice {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    return null;
  }
}

/** Mémorise le choix ; à "granted", charge GA aussitôt. */
export function setConsent(choice: "granted" | "denied") {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CONSENT_KEY, choice);
    }
  } catch {
    /* stockage indisponible : le bandeau reviendra, sans suivi */
  }
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    const w = window as unknown as Record<string, unknown>;
    if (choice === "denied") {
      w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    } else {
      w[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      ensureGaLoaded();
      if (typeof w.gtag === "function") {
        (w.gtag as (...a: unknown[]) => void)("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "granted",
        });
      }
    }
  }
}

/** Injecte gtag.js une seule fois (si accord). Sans effet sans ID ni accord. */
export function ensureGaLoaded() {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof document === "undefined")
    return;
  if (getConsent() !== "granted") return;
  const w = window as unknown as Record<string, unknown>;
  if (w.__sdGaLoaded) return;
  w.__sdGaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
  const gtag =
    (w.gtag as ((...a: unknown[]) => void) | undefined) ??
    ((...a: unknown[]) => {
      ((w.dataLayer as unknown[] | undefined) ?? (w.dataLayer = [] as unknown[])).push(a);
    });
  w.gtag = gtag;
  w.dataLayer = w.dataLayer ?? [];
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

/**
 * Mini-script inline injecté dans le <head> (aucune requête, aucun cookie).
 * Pose le refus par défaut (Consent Mode v2) puis, uniquement si un accord
 * préalable est mémorisé, charge gtag aussitôt (pas d'attente du bandeau).
 */
export function gaHeadScripts(): Array<{
  type: string;
  children?: string;
  async?: boolean;
  src?: string;
}> {
  if (!GA_MEASUREMENT_ID) return [];
  const id = GA_MEASUREMENT_ID;
  return [
    {
      type: "text/javascript",
      children: `(function(){try{var c=null;try{c=localStorage.getItem("${CONSENT_KEY}")}catch(e){}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=window.gtag||gtag;var ok=c==="granted";gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:ok?"granted":"denied"});if(ok){window["ga-disable-${id}"]=false;var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=${id}";document.head.appendChild(s);window.__sdGaLoaded=true;gtag("js",new Date());gtag("config","${id}",{send_page_view:false});}else{window["ga-disable-${id}"]=true;}}catch(e){}})();`,
    },
  ];
}

/** Suivi de pageview à chaque navigation (appelé par le routeur TanStack). */
export function trackPageview(path: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  if (getConsent() !== "granted") return;
  ensureGaLoaded();
  const w = window as unknown as Record<string, unknown>;
  if (typeof w.gtag !== "function") return;
  (w.gtag as (...a: unknown[]) => void)("config", GA_MEASUREMENT_ID, { page_path: path });
}
