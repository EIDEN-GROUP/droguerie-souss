/**
 * Descriptions produit en texte enrichi (gras, italique, souligné, listes).
 *
 * Stockage : HTML minimal dans la colonne `description` existante (aucune
 * migration). Anciennes descriptions en texte brut : affichage inchangé.
 *
 * Sécurité : `sanitizeDescriptionHtml()` n'autorise que 7 balises SANS
 * attribut — aucun attribut (href, src, on*, style…) ne survit, donc aucune
 * injection XSS n'est possible, côté serveur comme navigateur (fonction
 * pure, sortie déterministe : pas de décalage d'hydratation SSR).
 */

const RICH_TAGS = ["strong", "em", "u", "ul", "ol", "li", "p"] as const;

/** Vrai si le texte contient une balise riche (au-delà des <br> isolés). */
export function hasRichFormatting(html: string): boolean {
  return new RegExp(`<(?:${RICH_TAGS.join("|")})[\\s>]`, "i").test(html);
}

/** Version texte brut (meta descriptions, JSON-LD, catalogue, recherche). */
export function stripTags(html: string): string {
  return String(html ?? "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|h\d|tr)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(lt|gt|amp|quot|#39);/g, (m) =>
      m === "&lt;" ? "<" : m === "&gt;" ? ">" : m === "&amp;" ? "&" : m === "&quot;" ? '"' : "'",
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * HTML assaini pour affichage : supprime scripts/styles/commentaires,
 * échappe tout, puis restaure uniquement les 7 balises autorisées
 * (sans attributs). Tout le reste devient du texte visible inoffensif.
 */
export function sanitizeDescriptionHtml(html: string): string {
  const tags = [...RICH_TAGS, "br"].join("|");
  const out = String(html ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, "")
    // Balises hors liste : supprimées, texte intérieur conservé.
    .replace(new RegExp(`<\\/(?!${tags}\\b)[a-zA-Z][^<>]*>`, "gi"), "")
    .replace(new RegExp(`<(?!\\/?(?:${tags})\\b)[a-zA-Z][^<>]*\\/?>`, "gi"), "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Le texte échappé ne contient plus aucun < > littéral : on peut donc
    // capturer jusqu'au premier &gt; — les attributs éventuels sont jetés.
    .replace(new RegExp(`&lt;(${tags})\\b.*?&gt;`, "gis"), "<$1>")
    .replace(new RegExp(`&lt;\\/(${tags})\\b.*?&gt;`, "gis"), "</$1>");
  return out;
}

/** HTML initial de l'éditeur : le texte brut devient des lignes <br>. */
export function toEditorHtml(value: string): string {
  const raw = String(value ?? "");
  if (!raw.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeDescriptionHtml(raw);
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}
