/**
 * Génère une image SVG par produit et la relie dans Supabase.
 *
 *   node scripts/generate-product-images.cjs            # essai à blanc
 *   node scripts/generate-product-images.cjs --apply    # téléverse et met à jour
 *
 * Chaque image est déterministe : même nom de produit = même image, donc le
 * script peut être rejoué sans créer de variantes. La couleur vient d'un mot-clé
 * du nom (Gris, Crema, Onyx Bleu...) ou, à défaut, de la catégorie ; les carreaux
 * sont dessinés au format réel porté par products.dimension.
 *
 * Lit SUPABASE_SERVICE_ROLE_KEY et VITE_SUPABASE_URL depuis .env.
 */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const ROOT = path.resolve(__dirname, "..");
const { createClient } = createRequire(path.join(ROOT, "package.json"))("@supabase/supabase-js");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/* ── deterministic randomness, so re-runs produce byte-identical images ── */
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ── colour cues read straight out of the product name ── */
const NAME_COLOURS = [
  [/gris fonc|gris\s*fonce/i, "#8d9095", "#6c6f75"],
  [/\bgris\b|\bgrey\b|\bgray\b/i, "#b9bcc2", "#9a9ea6"],
  [/\bnoir\b|\bnero\b|marquina/i, "#2f3136", "#1c1e22"],
  [/\bblanc\b|\bwhite\b|pure light|extra blanc/i, "#f2f1ee", "#dedcd6"],
  [/crema|créma|marfil|ivoire|cream/i, "#e6dcc8", "#d3c6ab"],
  [/beige|sable|travertin|golden|miel|taupe/i, "#d9c7a8", "#c3ad88"],
  [/perla|perlino|nacre/i, "#e0dad4", "#cac2ba"],
  [/bleu|blue|onyx bleu|azur/i, "#7b9ec4", "#5c82ad"],
  [/vert|green|jade|émeraude|emeraude|verda/i, "#7ba58c", "#5c8a70"],
  [/rouge|red|brique|terracotta/i, "#b4705c", "#96543f"],
  [/marron|brown|teka|roble|bois|park|parquet|chelsea|river/i, "#a97f56", "#8b6440"],
  [/calacata|calacatta|estatuario|statuario|carrara|opulus/i, "#eeece8", "#d8d5cf"],
  [/or\b|gold|apulia/i, "#c9a86a", "#ad8c4d"],
];

const CATEGORY_COLOURS = {
  "Céramique": ["#d8d2c8", "#bdb5a7"],
  "Ciment Colle & Mortiers": ["#b6b3ad", "#96938c"],
  "Béton Armé, Ciments, Agrégats": ["#a8a5a0", "#8a8782"],
  "Produits Préfabriqués": ["#b0aca4", "#918d85"],
  "Plâtres, Mono & Bicouche": ["#e5e2dc", "#cbc7bf"],
  "Plâtre": ["#e5e2dc", "#cbc7bf"],
  "Peinture & Décoration": ["#8fa9c4", "#6d8aa8"],
  "Peinture": ["#8fa9c4", "#6d8aa8"],
  "Sanitaire, Robinetterie, Plomberie": ["#9fb6c0", "#7d97a3"],
  "Plomberie": ["#9fb6c0", "#7d97a3"],
  "Métallurgie": ["#9aa1a8", "#7b838b"],
  "Fer à Béton, Treillis Soudé": ["#93999f", "#767d84"],
  "Énergie Solaire, Électricité": ["#d8b779", "#bd9a58"],
  "Électricité": ["#d8b779", "#bd9a58"],
  "Étanchéité, Isolation, Bitume": ["#7d7b78", "#5f5d5b"],
  "Marbre": ["#e7e4de", "#d0ccc4"],
  "Zellige": ["#6f9c96", "#537d77"],
  "Carrelage": ["#d8d2c8", "#bdb5a7"],
  "Sécurité au travail": ["#d9a441", "#bb8829"],
  "Quincaillerie": ["#9aa1a8", "#7b838b"],
  "Ciment & Granulats": ["#a8a5a0", "#8a8782"],
};

const colourFor = (name, category) => {
  for (const [re, a, b] of NAME_COLOURS) if (re.test(name)) return [a, b];
  if (CATEGORY_COLOURS[category]) return CATEGORY_COLOURS[category];
  const h = hash(category || name) % 360;
  return [`hsl(${h} 14% 78%)`, `hsl(${h} 16% 64%)`];
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const W = 800;
const H = 600;

function svgFor(p) {
  const [light, dark] = colourFor(p.name, p.category);
  const r = rng(hash(p.name + "|" + p.category));
  const isTile = !!p.dimension;

  // The swatch mirrors the real tile format; everything else gets a square sample.
  let aw, ah;
  if (isTile) {
    const [a, b] = p.dimension.split("x").map(Number);
    const ratio = a / b;
    const maxW = 560, maxH = 380;
    if (ratio >= maxW / maxH) { aw = maxW; ah = maxW / ratio; }
    else { ah = maxH; aw = maxH * ratio; }
  } else {
    aw = 380; ah = 380;
  }
  const ax = (W - aw) / 2;
  const ay = (H - 90 - ah) / 2 + 10;

  // Veining / grain: deterministic strokes seeded by the product name.
  const veins = [];
  const n = isTile ? 5 : 3;
  for (let i = 0; i < n; i++) {
    const y0 = ay + r() * ah;
    const y1 = ay + r() * ah;
    const cy = ay + r() * ah;
    const cx = ax + aw * (0.3 + r() * 0.4);
    veins.push(
      `<path d="M${ax.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(ax + aw).toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${i % 2 ? "#ffffff" : "#000000"}" stroke-opacity="${(0.05 + r() * 0.07).toFixed(3)}" stroke-width="${(1 + r() * 7).toFixed(1)}" stroke-linecap="round"/>`,
    );
  }

  const label = p.name.length > 30 ? p.name.slice(0, 29) + "…" : p.name;
  const meta = isTile ? p.dimension.replace("x", " × ") + " cm" : (p.unit || "");
  const id = hash(p.name).toString(36);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(p.name)}">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbfbfc"/><stop offset="100%" stop-color="#eeeef1"/>
    </linearGradient>
    <linearGradient id="mat${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <clipPath id="clip${id}"><rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="6"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg${id})"/>
  <rect x="${ax + 6}" y="${ay + 8}" width="${aw}" height="${ah}" rx="6" fill="#000" opacity="0.08"/>
  <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="6" fill="url(#mat${id})"/>
  <g clip-path="url(#clip${id})">${veins.join("")}</g>
  <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="6" fill="none" stroke="#000" stroke-opacity="0.10"/>
  <text x="40" y="${H - 42}" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#30313d">${esc(label)}</text>
  <text x="40" y="${H - 16}" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="2" fill="#7c7f8a">${esc((p.category || "").toUpperCase())}</text>
  ${meta ? `<text x="${W - 40}" y="${H - 42}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="1" fill="#5c5f6b">${esc(meta)}</text>` : ""}
</svg>`;
}

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

async function main() {
  const apply = process.argv[2] === "--apply";
  const { data: products, error } = await sb
    .from("products")
    .select("id,name,category,subcategory,dimension,unit,image_url,images_urls");
  if (error) throw new Error(error.message);
  console.log("products:", products.length);

  const used = new Set();
  let done = 0;
  for (const p of products) {
    let base = slugify(p.name) || "produit";
    let key = `${base}-${hash(p.id).toString(36).slice(0, 6)}`;
    if (used.has(key)) key += "-2";
    used.add(key);

    const svg = svgFor(p);
    const dest = `products/generated/${key}.svg`;

    if (!apply) {
      if (done < 3) fs.writeFileSync(path.join(__dirname, `sample-${done}.svg`), svg);
      done++;
      continue;
    }

    const up = await sb.storage.from("product-images").upload(dest, Buffer.from(svg, "utf8"), {
      contentType: "image/svg+xml",
      upsert: true,
    });
    if (up.error) throw new Error(`upload ${p.name}: ${up.error.message}`);
    const url = sb.storage.from("product-images").getPublicUrl(dest).data.publicUrl;

    // Keep any real photo as a secondary image; drop the dead /images/ paths.
    const previous = (p.images_urls || []).filter(
      (u) => typeof u === "string" && u.startsWith("http") && !u.includes("/generated/"),
    );
    const upd = await sb
      .from("products")
      .update({ image_url: url, images_urls: [url, ...previous] })
      .eq("id", p.id);
    if (upd.error) throw new Error(`update ${p.name}: ${upd.error.message}`);

    done++;
    if (done % 25 === 0) console.log("  ...", done);
  }
  console.log(apply ? `generated + linked: ${done}` : `dry run: ${done} images (3 samples written)`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
