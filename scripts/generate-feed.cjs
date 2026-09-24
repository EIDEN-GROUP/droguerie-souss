/**
 * Génère `public/feeds/google.xml` : flux produits Google Merchant Center
 * (annonces Shopping + visibilité surfaces IA qui lisent les flux).
 *
 *   node scripts/generate-feed.cjs
 *
 * Seuls les produits à prix fixe et > 0 sont inclus (Merchant Center exige
 * un prix). Pas de GTIN dans le catalogue → `g:identifier_exists` = false.
 * Descriptions : HTML retiré (le XML n'en accepte pas).
 */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "feeds", "google.xml");

const CANONICAL_HOST = "https://www.soussdroguerie.com";
const SITE_URL = (process.env.VITE_SITE_URL || CANONICAL_HOST).replace(/\/+$/, "");

function loadEnv() {
  const env = {};
  for (const k of Object.keys(process.env)) env[k] = process.env[k];
  const envFile = path.join(ROOT, ".env");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
      if (!line.includes("=") || line.trim().startsWith("#")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i).trim();
      if (!(key in env)) env[key] = line.slice(i + 1).trim();
    }
  }
  return env;
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const stripHtml = (s) =>
  String(s ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000);

function abs(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return SITE_URL + src;
  return null;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !key) {
    console.warn("[feed] identifiants absents : flux non généré (build non bloqué).");
    return;
  }
  const { createClient } = createRequire(path.join(ROOT, "package.json"))("@supabase/supabase-js");
  const sb = createClient(supabaseUrl, key, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("products")
    .select(
      "id, name, description, category, price, promo, price_mode, image_url, images_urls, updated_at",
    )
    .order("name");
  if (error) throw new Error(error.message);

  const items = (data || []).filter((p) => p.price_mode === "fixed" && Number(p.price) > 0);
  const entries = items
    .map((p) => {
      const pct = Number(p.promo) || 0;
      const price = Math.round(Number(p.price) * (1 - pct / 100) * 100) / 100;
      const imgs = [p.image_url, ...((Array.isArray(p.images_urls) && p.images_urls) || [])]
        .map(abs)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      if (imgs.length === 0) return null;
      const extra = imgs
        .slice(1)
        .map((u) => `      <g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("\n");
      return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(String(p.name).slice(0, 150))}</g:title>
      <g:description>${esc(stripHtml(p.description))}</g:description>
      <g:link>${esc(`${SITE_URL}/product/${p.id}`)}</g:link>
      <g:image_link>${esc(imgs[0])}</g:image_link>
${extra ? extra + "\n" : ""}      <g:price>${price.toFixed(2)} MAD</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Souss Droguerie</g:brand>
      <g:product_type>${esc(p.category || "")}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
    })
    .filter(Boolean);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>Souss Droguerie — Catalogue produits</title>\n` +
    `    <link>${esc(SITE_URL)}/</link>\n` +
    `    <description>Matériaux de construction à Agadir depuis 1992.</description>\n` +
    entries.join("\n") +
    `\n  </channel>\n</rss>\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, xml, "utf8");
  console.log(`[feed] ${OUT} — ${entries.length} produits (${(data || []).length} au catalogue).`);
}

main().catch((e) => {
  console.error("[feed] FAILED:", e.message);
  process.exit(1);
});
