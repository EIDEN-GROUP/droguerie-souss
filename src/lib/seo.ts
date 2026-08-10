/**
 * Helpers SEO partagés par toutes les routes : URL canonique, image absolue
 * (og:image / Product.image), description tronquée et constructeur de `head()`.
 *
 * Chaque route appelle `seo({ ... })` dans son `head` pour obtenir un bloc
 * cohérent : title, description, canonical, Open Graph, Twitter Card, et
 * éventuellement du JSON-LD via `scripts`.
 */

/** Domaine canonique de production : tous les canoniques, og:url et URLs du
 *  sitemap doivent pointer ici — même quand la build tourne sur une
 *  prévisualisation. Sinon Google indexe l'URL de preview à la place du domaine
 *  réel, ce qui se traduit par un résultat « domaine nu », sans titre ni
 *  description (exactement le symptôme rencontré : VITE_SITE_URL pointait vers
 *  droguerie-souss.vercel.app). À mettre à jour si le domaine change. */
const CANONICAL_HOST = "https://www.soussdroguerie.com";

function resolveSiteUrl(): string {
  const envUrl =
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_SITE_URL : undefined;
  // Une URL d'environnement de type preview (Vercel, localhost) ne doit jamais
  // devenir le canonique : on retombe sur le domaine de production.
  if (typeof envUrl === "string" && envUrl.trim()) {
    const host = envUrl.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
    if (
      !host.includes("vercel.app") &&
      !host.startsWith("localhost") &&
      !host.startsWith("127.0.0.1")
    ) {
      return envUrl;
    }
  }
  return CANONICAL_HOST;
}

export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");

export const SITE_NAME = "Souss Droguerie";

/** Orthographe alternative du nom (Google associe les deux à la même entreprise
 *  via `alternateName` dans le schéma, et le titre page par page couvre la
 *  recherche « droguerie souss » comme « souss droguerie »). */
export const ALTERNATE_NAME = "Droguerie Souss";

/** Image par défaut des partages sociaux : recadrée en 1200×630 (ratio 1.91:1,
 *  recommandé pour Facebook/LinkedIn/WhatsApp). L'ancienne image (logo 2337×1102)
 *  dépassait le ratio max et se faisait recadrer par les plateformes. */
export const DEFAULT_OG_IMAGE = "/og-image.png";

/** Transforme un chemin de route (ou absolu `/x`) en URL absolue du site. */
export function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Rend une image absolue : les URLs déjà complètes passent telles quelles,
 *  les chemins relatifs (public/, storage) sont préfixés par le site. */
export function absoluteUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

/** Réduit un texte libre à une meta description lisible (~155 caractères). La coupe
 *  tombe sur un espace : on ne coupe jamais un mot en deux (« …depuis » → « …dep »). */
export function descriptionFrom(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  // Garde-fou : si le dernier espace est trop loin (phrase sans espaces), on coupe sec.
  const end = lastSpace > max * 0.6 ? lastSpace : max;
  return `${cut.slice(0, end).trim()}…`;
}

/** Sérialise une structure pour une balise <script type="application/ld+json">.
 *  `<` est échappé pour qu'un éventuel `</script>` dans les données (descriptions
 *  saisies côté admin) ne casse jamais le balisage. */
export function jsonLd(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export type SeoOptions = {
  /** Titre de page, sans le nom de marque (ajouté automatiquement). */
  title: string;
  description: string;
  /** Chemin de route : sert de canonical et d'og:url (ex. `/contact`). */
  path: string;
  /** Image absolue ou relative ; par défaut le logo. */
  image?: string | null;
  /** Ajoute `noindex, nofollow` (pages privées, recherche, admin). */
  noindex?: boolean;
  ogType?: string;
  scripts?: ReturnType<typeof jsonLd>[];
  /** Liens <link> additionnels fusionnés avec le canonical (ex. preload LCP). */
  links?: Array<{ rel: string; as?: string; href: string }>;
};

export function seo({
  title,
  description,
  path,
  image,
  noindex = false,
  ogType = "website",
  scripts = [],
  links = [],
}: SeoOptions) {
  // Si le titre contient déjà la marque (ex. « Souss Droguerie | … »), on ne la
  // ré-ajoute pas ; sinon on la suffixe. Idempotent pour toutes les pages.
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE) as string;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:url", content: canonical(path) },
      { property: "og:image", content: ogImage },
      { name: "twitter:url", content: canonical(path) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: canonical(path) }, ...links],
    scripts,
  };
}
