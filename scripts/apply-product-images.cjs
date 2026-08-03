/**
 * Téléverse les photos produits d'un dossier et les relie dans Supabase.
 *
 *   node scripts/apply-product-images.cjs <dossier>            # essai à blanc
 *   node scripts/apply-product-images.cjs <dossier> --apply    # téléverse et met à jour
 *
 * Le dossier est celui de l'archive décompressée : des sous-dossiers par catégorie et un
 * `manifest.json` à la racine, chaque entrée portant `produit`, `categorie` et `fichier`.
 *
 * L'appariement se fait sur nom + catégorie, insensible à la casse et aux accents. Quand un
 * même couple existe en plusieurs exemplaires (produits identiques de dimensions
 * différentes), les fichiers sont distribués dans l'ordre — produits triés par id, fichiers
 * par nom — de sorte qu'une réexécution donne exactement le même résultat.
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

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function main() {
  const dir = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!dir || !fs.existsSync(dir)) {
    console.error("Usage: node scripts/apply-product-images.cjs <dossier-images> [--apply]");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));

  /** Une file de fichiers par couple nom+catégorie : les doublons se servent à la suite. */
  const queues = new Map();
  for (const entry of [...manifest].sort((a, b) => a.fichier.localeCompare(b.fichier))) {
    const key = `${norm(entry.produit)}|${norm(entry.categorie)}`;
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(entry);
  }

  const { data: products, error } = await sb
    .from("products")
    .select("id,name,category,image_url,images_urls")
    .order("id");
  if (error) throw new Error(error.message);

  const plan = [];
  const orphans = [];
  for (const p of products) {
    const queue = queues.get(`${norm(p.name)}|${norm(p.category)}`);
    const entry = queue && queue.length ? queue.shift() : null;
    if (!entry) {
      orphans.push(`${p.name} (${p.category})`);
      continue;
    }
    const file = path.join(dir, entry.fichier);
    if (!fs.existsSync(file)) {
      orphans.push(`${p.name} — fichier absent : ${entry.fichier}`);
      continue;
    }
    plan.push({ product: p, entry, file });
  }

  const leftovers = [...queues.values()].flat();

  console.log(`produits          : ${products.length}`);
  console.log(`images du dossier : ${manifest.length}`);
  console.log(`appariés          : ${plan.length}`);
  console.log(`sans image        : ${orphans.length}${orphans.length ? " → " + orphans.slice(0, 10).join(", ") : ""}`);
  console.log(`images inutilisées: ${leftovers.length}${leftovers.length ? " → " + leftovers.slice(0, 10).map((e) => e.fichier).join(", ") : ""}`);

  if (!apply) {
    console.log("\nAperçu :");
    for (const item of plan.slice(0, 5)) {
      console.log(`  ${item.product.name} [${item.product.category}] ← ${item.entry.fichier}`);
    }
    console.log("\nEssai à blanc — relancer avec --apply pour téléverser.");
    return;
  }

  let done = 0;
  for (const { product, entry, file } of plan) {
    const ext = path.extname(entry.fichier).toLowerCase();
    const dest = `products/catalogue/${slugify(product.name)}-${hash(product.id).toString(36).slice(0, 6)}${ext}`;

    const up = await sb.storage.from("product-images").upload(dest, fs.readFileSync(file), {
      contentType: MIME[ext] || "image/jpeg",
      upsert: true,
    });
    if (up.error) throw new Error(`upload ${product.name}: ${up.error.message}`);
    const url = sb.storage.from("product-images").getPublicUrl(dest).data.publicUrl;

    /** Les SVG générés étaient des bouche-trous : la photo les remplace. Toute autre image
     *  déjà en place est conservée en secondaire. */
    const previous = (product.images_urls || []).filter(
      (u) => typeof u === "string" && u.startsWith("http") && !u.includes("/generated/") && u !== url,
    );
    const upd = await sb
      .from("products")
      .update({ image_url: url, images_urls: [url, ...previous] })
      .eq("id", product.id);
    if (upd.error) throw new Error(`update ${product.name}: ${upd.error.message}`);

    done++;
    if (done % 25 === 0) console.log("  ...", done);
  }
  console.log(`\nphotos liées : ${done}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
