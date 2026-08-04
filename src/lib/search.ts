export interface SearchableProduct {
  name: string;
  description?: string | null;
  subcategory?: string | null;
}

/** Lowercase and strip accents so "electricite" matches "électricité". */
export function normalizeSearch(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Weighted relevance for a single product: exact name > name prefix > name contains >
 *  subcategory contains > description contains. Returns 0 when nothing matches. */
export function scoreProduct<T extends SearchableProduct>(p: T, query: string): number {
  const q = normalizeSearch(query.trim());
  if (!q) return 0;

  const name = normalizeSearch(p.name);
  const desc = normalizeSearch(p.description || "");
  const sub = normalizeSearch(p.subcategory || "");
  const words = q.split(/\s+/).filter(Boolean);

  let score = 0;
  if (name === q) score += 100;
  if (name.startsWith(q)) score += 60;
  if (name.includes(q)) score += 40;
  for (const w of words) {
    if (name.includes(w)) score += 20;
  }
  if (desc.includes(q)) score += 15;
  for (const w of words) {
    if (desc.includes(w)) score += 8;
  }
  if (sub.includes(q)) score += 10;
  for (const w of words) {
    if (sub.includes(w)) score += 5;
  }
  return score;
}

/** Search and rank. Returns [] only while the query is empty, so every keystroke
 *  yields the closest matches immediately. */
export function searchProducts<T extends SearchableProduct>(
  products: T[],
  query: string,
): { product: T; score: number }[] {
  const q = normalizeSearch(query.trim());
  if (!q) return [];
  return products
    .map((product) => ({ product, score: scoreProduct(product, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}