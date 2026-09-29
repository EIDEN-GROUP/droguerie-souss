/**
 * Coordonnées canoniques de Souss Droguerie — SOURCE UNIQUE.
 *
 * Toute adresse, téléphone, lien Maps, délai ou zone affichés (site, e-mails,
 * catalogue, schémas, llms.txt) DOIT importer d'ici. C'est ce qui garantit
 * que Google et les assistants IA voient toujours les mêmes informations.
 */

export const BUSINESS = {
  name: "Souss Droguerie SARL",
  shortName: "Souss Droguerie",
  alternateName: "Droguerie Souss",
  /** Affichage humain, avec espaces. */
  phoneDisplay: "+212 528 838 992",
  /** Lien tel: (chiffres uniquement). */
  phoneHref: "tel:+212528838992",
  /** WhatsApp : ligne mobile officielle (confirmée annuaire + catalogue). */
  whatsappNumber: "212661847759",
  email: "contact@soussdroguerie.com",
  address: "Bd Mohamed V, Q.I. Tassila III, N°29, Dcheira, Agadir 80360, Maroc",
  mapsUrl: "https://maps.app.goo.gl/q54qmxeEv752bJMTA",
  /** Coordonnées GPS du dépôt (celles du lien Maps ci-dessus et du balisage schema.org). */
  geo: { latitude: 30.3830705, longitude: -9.5184337 },
  /** Délai de réponse/devis officiel, partout le même. */
  quoteSla: "48h ouvrées",
  quoteSlaShort: "48h",
  sinceYear: 1993,
} as const;

/** Zones desservies (10, partout les mêmes). */
export const AREA_SERVED = [
  "Agadir",
  "Inezgane",
  "Aït Melloul",
  "Dcheira",
  "Taroudant",
  "Tiznit",
  "Biougra",
  "Oulad Teima",
  "Chtouka-Aït Baha",
  "Souss-Massa",
] as const;

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
