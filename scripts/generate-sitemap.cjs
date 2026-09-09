/**
 * Génère `public/sitemap.xml` à partir des produits Supabase + pages principales.
 *
 *   node scripts/generate-sitemap.cjs
 *
 * Exécuté au début du build (`npm run build`). Lit les variables depuis
 * l'environnement (Vercel) puis, à défaut, depuis `.env` — même logique que
 * `apply-product-images.cjs`. Sans identifiants valides, le script écrit quand
 * même un sitemap limité aux pages principales et prévient, pour ne jamais
 * casser un build.
 */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "sitemap.xml");

// Domaine canonique de production : le sitemap doit toujours pointer vers lui,
// jamais vers une preview Vercel (sinon Google indexe la preview).
const CANONICAL_HOST = "https://www.soussdroguerie.com";
function resolveSiteUrl() {
  const envUrl = process.env.VITE_SITE_URL;
  if (envUrl && envUrl.trim()) {
    const host = envUrl
      .replace(/^https?:\/\//i, "")
      .split(/[/?#]/)[0]
      .toLowerCase();
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
const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");

function loadEnv() {
  const env = {};
  // Variables d'environnement réelles (build Vercel) d'abord.
  for (const k of Object.keys(process.env)) env[k] = process.env[k];
  // Complément depuis .env si présent.
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
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const url = (loc, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${esc(SITE_URL + loc)}</loc>` +
  (lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "") +
  (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : "") +
  (priority ? `\n    <priority>${priority}</priority>` : "") +
  `\n  </url>`;

/** Pages principales du site (toutes les routes publiques indexables). */
const CORE_PAGES = [
  { loc: "/", lastmod: null, changefreq: "weekly", priority: "1.0" },
  { loc: "/categories", lastmod: null, changefreq: "weekly", priority: "0.8" },
  { loc: "/catalogue", lastmod: null, changefreq: "weekly", priority: "0.8" },
  { loc: "/catalogue/2026", lastmod: null, changefreq: "monthly", priority: "0.7" },
  { loc: "/catalogue/souss-droguerie-2026", lastmod: null, changefreq: "monthly", priority: "0.7" },
  { loc: "/catalogue/interactif", lastmod: null, changefreq: "weekly", priority: "0.8" },
  { loc: "/a-propos", lastmod: null, changefreq: "monthly", priority: "0.7" },
  { loc: "/commande-rapide", lastmod: null, changefreq: "monthly", priority: "0.7" },
  { loc: "/contact", lastmod: null, changefreq: "monthly", priority: "0.7" },
  { loc: "/politique-confidentialite", lastmod: null, changefreq: "yearly", priority: "0.4" },
  { loc: "/security", lastmod: null, changefreq: "yearly", priority: "0.4" },
];

/** Pages de catégories (`/categories?cat=…`) : mêmes valeurs que les cartes du site
 *  et le canonical des routes, encodées comme le router les génère. */
const CATEGORY_PAGES = [
  "Carrelage",
  "Marbre",
  "Peinture",
  "Ciment & Granulats",
  "Plâtre",
  "Électricité",
  "Plomberie",
  "Quincaillerie",
].map((cat) => ({
  loc: `/categories?cat=${encodeURIComponent(cat)}`,
  lastmod: null,
  changefreq: "weekly",
  priority: "0.7",
}));

const isoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY;

  let entries = [...CORE_PAGES, ...CATEGORY_PAGES].map((p) => ({
    loc: p.loc,
    lastmod: p.lastmod,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  if (!supabaseUrl || !key) {
    console.warn(
      "[sitemap] VITE_SUPABASE_URL / clé absentes : sitemap limité aux pages principales.",
    );
  } else {
    try {
      const { createClient } = createRequire(path.join(ROOT, "package.json"))(
        "@supabase/supabase-js",
      );
      const sb = createClient(supabaseUrl, key, { auth: { persistSession: false } });
      const { data, error } = await sb
        .from("products")
        .select("id, updated_at, created_at")
        .order("name");
      if (error) throw new Error(error.message);

      const productEntries = (data || []).map((p) => ({
        loc: `/product/${p.id}`,
        lastmod: isoDate(p.updated_at || p.created_at),
        changefreq: "monthly",
        priority: "0.6",
      }));
      entries = [...entries, ...productEntries];
      console.log(`[sitemap] ${productEntries.length} produits ajoutés.`);
    } catch (e) {
      console.warn(
        `[sitemap] Échec de la lecture des produits (${e.message}) : sitemap limité aux pages principales.`,
      );
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map((e) => url(e.loc, e.lastmod, e.changefreq, e.priority)).join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(OUT, xml, "utf8");
  console.log(`[sitemap] ${OUT} — ${entries.length} URLs.`);
}

main().catch((e) => {
  console.error("[sitemap] FAILED:", e.message);
  process.exit(1);
});
